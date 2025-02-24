/* ==================================================================================== */
/*  FICHIER          : eventHandler.js                                                 */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 12/02/2025                                                       */
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes */
/*                     - Recherche dynamique des recettes.                             */
/*                     - Filtrage des résultats par ingrédients, ustensiles, appareils.*/
/*                     - Mise à jour automatique des filtres dans l'interface.         */
/* ==================================================================================== */

import { searchRecipesLoopNative } from "../components/search/searchloopnative.js";
import { getAllRecipes, fetchFilterOptions } from "../data/dataManager.js";
import domSelectors from "../config/domSelectors.js";
import { logEvent } from "../utils/utils.js";
import {requestAdminAccess, triggerNormalSearch} from "../main.js";
import { waitForElement } from "../utils/utils.js";
import { RecipeFactory } from "../components/factory/recipeFactory.js";
import { searchRecipesFunctional } from "../components/search/searchFunctional.js";
import {sanitizeText } from "../utils/utils.js";


/* ==================================================================================== */
/*  GESTION DES DROPDOWNS                                                              */
/* ==================================================================================== */

/**
     * Ajoute les événements d'affichage et de fermeture des dropdowns.
     *
     * - Ouvre/ferme le dropdown au clic sur le bouton associé.
     * - Ferme automatiquement le dropdown si l'utilisateur clique ailleurs.
     * - Utilise la délégation d'événements pour optimiser la gestion des événements globaux.
     *
     * @param {HTMLElement} filterButton - Bouton permettant d'afficher le dropdown.
     * @param {HTMLElement} dropdownContainer - Conteneur du menu déroulant.
     */
export function setupDropdownEvents(filterButton, dropdownContainer) {
    try {
            if (!(filterButton instanceof HTMLElement) || !(dropdownContainer instanceof HTMLElement)) {
                logEvent("error", "setupDropdownEvents : Paramètres invalides.", { filterButton, dropdownContainer });
                return;
            }

            // Gestion de l'ouverture/fermeture du dropdown au clic sur le bouton
            filterButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Empêche la fermeture immédiate
                const isOpen = !dropdownContainer.classList.contains("hidden");
                document.querySelectorAll(".filter-dropdown").forEach(drop => drop.classList.add("hidden"));
                if (!isOpen) {
                    dropdownContainer.classList.remove("hidden");
                    logEvent("info", "setupDropdownEvents : Dropdown ouvert.");
                } else {
                    logEvent("info", "setupDropdownEvents : Dropdown fermé.");
                }
            });

            // Gestion de la fermeture du dropdown si l'utilisateur clique en dehors
            document.addEventListener("click", (event) => {
                if (!filterButton.contains(event.target) && !dropdownContainer.contains(event.target) && !dropdownContainer.classList.contains("hidden")) {
                    dropdownContainer.classList.add("hidden");
                    logEvent("info", "setupDropdownEvents : Dropdown fermé en cliquant à l'extérieur.");
                }
            });

            logEvent("success", "setupDropdownEvents : Événements du dropdown configurés.");
    } catch (error) {
        logEvent("error", "setupDropdownEvents : Erreur lors de la configuration des événements.", { error: error.message });
    }
}

/* ================================================================================ 
    GESTION DE L'ÉVÉNEMENT DE RECHERCHE 
================================================================================ */

/**
 * Gère la recherche de recettes lorsqu'un utilisateur saisit du texte.
 *
 * - Vérifie la présence de l'élément de recherche dans le DOM.
 * - Ignore la recherche si la saisie contient moins de 3 caractères.
 * - Exécute une recherche et affiche les résultats mis à jour.
 * - Utilise `logEvent()` pour suivre chaque étape et détecter les erreurs.
 */
export async function handleSearch() {
    try {
        // Vérifie que `domSelectors.search` est défini et contient `input`
        if (!domSelectors || !domSelectors.search || !domSelectors.search.input) {
            logEvent("error", "handleSearch : Élément input de recherche introuvable.");
            return;
        }

        // Récupère l'élément de saisie correctement
        const searchInput = domSelectors.search.input; 
        try {
            const query = searchInput.value.trim();

            if (query === "/benchmark" || query === "!benchmark") {
                logEvent("info", "Commande Benchmark détectée. Affichage de la modale.");
                requestAdminAccess();
            } else {
                logEvent("info", `Recherche normale déclenchée : ${query}`);
                triggerNormalSearch(query);
            }
        } catch (error) {
            logEvent("error", "Erreur lors de la détection du mode Benchmark", { error: error.message });
        }
        // Vérifie que l'élément input existe réellement dans le DOM
        if (!searchInput) {
            logEvent("error", "handleSearch : Élément input non trouvé dans le DOM.");
            return;
        }

        // Récupère la valeur et la nettoie (trim enlève les espaces inutiles)
        const query = searchInput.value.trim();

        // Vérifie que l'utilisateur a saisi au moins 3 caractères
        if (query.length < 3) {
            logEvent("info", "handleSearch : Recherche ignorée (moins de 3 caractères).");
            return; 
        }

        // Log que la recherche commence
        logEvent("info", `handleSearch : Recherche en cours pour "${query}"...`);

        // Récupère les résultats de la recherche
        const results = await searchRecipesLoopNative(query);

        // Vérifie que les résultats sont bien un tableau
        if (!Array.isArray(results)) {
            logEvent("error", "handleSearch : Résultat de recherche invalide.", { results });
            return; 
        }

        // Affiche les résultats trouvés
        displayResults(results);

        // Log du succès avec le nombre de résultats
        logEvent("success", `handleSearch : ${results.length} résultats trouvés.`);

    } catch (error) {
        logEvent("error", "handleSearch : Erreur lors de la recherche.", { error: error.message });
    }
}

/*================================================================
 *    Gestion des événements pour la modale du mot de passe
/*===============================================================*/

/**
 * Attache les événements à la modale de mot de passe.
 *
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {HTMLButtonElement} validateBtn - Bouton de validation.
 * @param {HTMLButtonElement} cancelBtn - Bouton d'annulation.
 * @param {HTMLElement} modal - Élément de la modale.
 */
export function attachModalEvents(passwordInput, validateBtn, cancelBtn, modal) {
    try {
        logEvent("info", "🔄 attachModalEvents : Attachement des événements à la modale...");

        // Vérifie la présence des éléments requis
        if (!passwordInput || !validateBtn || !cancelBtn || !modal) {
            logEvent("error", "❌ attachModalEvents : Un ou plusieurs éléments sont manquants.", {
                passwordInput,
                validateBtn,
                cancelBtn,
                modal
            });
            return;
        }

        //  Ajout des écouteurs d'événements
        validateBtn.addEventListener("click", () => handleValidation(passwordInput, modal));
        cancelBtn.addEventListener("click", () => handleClose(modal));
        passwordInput.addEventListener("keydown", (event) => handleEnterKey(event, passwordInput, modal));

        //  Ajoute un gestionnaire de fermeture avec "Échap"
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                logEvent("info", "🚪 Fermeture de la modale via la touche Échap.");
                handleClose(modal);
            }
        }, { once: true });

        //  Ajoute une méthode pour nettoyer les événements à la fermeture
        modal.cleanup = () => detachModalEvents(passwordInput, validateBtn, cancelBtn, modal);

        logEvent("success", " attachModalEvents : Événements attachés avec succès.");
    } catch (error) {
        logEvent("error", " attachModalEvents : Erreur lors de l'attachement des événements à la modale.", { error: error.message });
    }
}


// ==========================================================
// Gestion de la Validation du Mot de Passe
// ==========================================================

/**
 * Vérifie le mot de passe et ferme la modale si correct.
 *
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {HTMLElement} modal - Élément de la modale.
 */
function handleValidation(passwordInput, modal) {
    const enteredPassword = passwordInput.value.trim();
    logEvent("info", ` Mot de passe saisi : ${enteredPassword}`);

    if (enteredPassword === "admin123") { //  Remplace ici par ton mot de passe réel
        logEvent("success", " Mot de passe correct, accès autorisé.");
        alert("Accès autorisé !");
        handleClose(modal);
        enableBenchmarkMode(); //  Active le mode Benchmark si nécessaire
    } else {
        logEvent("error", " Mot de passe incorrect.");
        alert("Mot de passe incorrect. Réessayez.");
        passwordInput.value = "";
        passwordInput.focus();
    }
}



// ==========================================================
// Gestion de la Fermeture de la Modale
// ==========================================================

/**
 * Ferme la modale proprement et nettoie les événements.
 *
 * @param {HTMLElement} modal - Élément de la modale.
 */
function handleClose(modal) {
    if (modal) {
        logEvent("info", "🚪 Fermeture de la modale.");
        modal.classList.remove("active");

        setTimeout(() => {
            modal.remove();
            logEvent("success", " Modale supprimée du DOM.");
        }, 300);
    }
}


// ==========================================================
// Gestion de la Validation par la Touche "Enter"
// ==========================================================

/**
 * Gère la validation avec la touche "Entrée".
 *
 * @param {KeyboardEvent} event - Événement de touche.
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {HTMLElement} modal - Élément de la modale.
 */
function handleEnterKey(event, passwordInput, modal) {
    if (event.key === "Enter") {
        logEvent("info", " Validation du mot de passe via la touche Entrée.");
        handleValidation(passwordInput, modal);
    }
}



// ==========================================================
// Validation des Paramètres de handleEnterKey
// ==========================================================

/**
 * Vérifie la validité des paramètres fournis à `handleEnterKey`.
 *
 * - Vérifie que l'événement est bien un `KeyboardEvent`.
 * - Vérifie que `passwordInput` est un champ de saisie valide.
 * - Vérifie que `callback` est une fonction.
 * - Vérifie que `modal` est un élément HTML valide.
 * - Enregistre une erreur et lève une exception en cas de non-conformité.
 *
 * @param {KeyboardEvent} event - Événement de clavier.
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {function} callback - Fonction exécutée après validation.
 * @param {HTMLElement} modal - Élément DOM de la modale.
 * @throws {Error} Si l'un des paramètres est invalide.
 */
export function validateEnterKeyParameters(event, passwordInput, modal) {
    // Vérifie que `event` est un événement de clavier valide
    if (!(event instanceof KeyboardEvent)) {
        logEvent("error", "validateEnterKeyParameters : Événement clavier invalide.");
        throw new Error("L'événement fourni doit être un `KeyboardEvent`.");
    }

    // Vérifie que `passwordInput` est un champ de saisie HTML valide
    if (!(passwordInput instanceof HTMLInputElement)) {
        logEvent("error", "validateEnterKeyParameters : Champ de saisie du mot de passe invalide.");
        throw new Error("Le champ de saisie du mot de passe est invalide ou inexistant.");
    }


    // Vérifie que `modal` est bien un élément HTML valide
    if (!(modal instanceof HTMLElement)) {
        logEvent("error", "validateEnterKeyParameters : Élément modal invalide.");
        throw new Error("L'élément modal fourni est invalide.");
    }
}



/**==================================================================
/*  Nettoyage des Événements de la Modale 
/*==================================================================*/

/** 
 * Détache les événements de la modale pour éviter les fuites mémoire.
 *
 * - Vérifie si un gestionnaire de nettoyage (`cleanup`) est défini.
 * - Exécute le gestionnaire pour retirer les écouteurs d'événements.
 * - Ajoute un log en cas d'absence de gestionnaire pour le suivi.
 */
export function detachModalEvents(passwordInput, validateBtn, cancelBtn, modal) {
    try {
        // Vérifie que tous les éléments requis sont des objets DOM valides
        if (!(passwordInput instanceof HTMLInputElement)) {
            logEvent("error", "detachModalEvents : Champ de saisie du mot de passe invalide.");
            throw new Error("Le champ de saisie du mot de passe est invalide ou inexistant.");
        }

        if (!(validateBtn instanceof HTMLElement)) {
            logEvent("error", "detachModalEvents : Bouton de validation invalide.");
            throw new Error("Le bouton de validation est invalide ou inexistant.");
        }

        if (!(cancelBtn instanceof HTMLElement)) {
            logEvent("error", "detachModalEvents : Bouton d'annulation invalide.");
            throw new Error("Le bouton d'annulation est invalide ou inexistant.");
        }

        if (!(modal instanceof HTMLElement)) {
            logEvent("error", "detachModalEvents : Élément modal invalide.");
            throw new Error("L'élément modal fourni est invalide.");
        }

        // Suppression des écouteurs d'événements attachés
        validateBtn.removeEventListener("click", handleValidation);
        cancelBtn.removeEventListener("click", handleClose);
        passwordInput.removeEventListener("keydown", handleEnterKey);

        logEvent("info", "Événements de la modale détachés avec succès.");

    } catch (error) {
        // Capture et log l'erreur pour faciliter le débogage
        logEvent("critical", "Erreur critique lors du détachement des événements de la modale", { message: error.message });
        throw error;
    }
}


/* ================================================================================ 
    AFFICHAGE DES RÉSULTATS 
================================================================================ */

let cachedFilters = {
    ingredients: [],
    appliances: [],
    ustensils: []
};

/**
 * Met à jour et affiche les résultats de recherche ainsi que les filtres.
 * 
 * - Génère une liste complète des filtres dès le chargement et la stocke en cache.
 * - Affiche uniquement un nombre limité d'options dans les filtres (scrollable).
 * - Ajoute une option "Voir plus / Voir moins" pour dérouler toute la liste.
 *
 * @param {Array} recipes - Liste des recettes filtrées.
 */
export async function displayResults(recipes) {
    try {
        let resultsContainer = document.querySelector("#recipe-container");

        if (!resultsContainer) {
            logEvent("warning", "displayResults : Attente du conteneur des recettes...");
            resultsContainer = await waitForElement("#recipe-container");
        }

        if (!resultsContainer) {
            logEvent("error", "displayResults : Conteneur DOM introuvable.");
            return;
        }

        resultsContainer.innerHTML = ""; // Nettoyage des résultats

        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("warning", "displayResults : Aucune recette trouvée.");
            resultsContainer.innerHTML = `<p class="no-results">Aucune recette ne correspond à votre recherche.</p>`;
            return;
        }

        logEvent("info", `displayResults : Affichage de ${recipes.length} recettes.`);

        const fragment = document.createDocumentFragment();

        recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            if (!(recipeCard instanceof HTMLElement)) {
                logEvent("error", `displayResults : Élément invalide pour la recette ${recipe.name}.`);
                return;
            }
            fragment.appendChild(recipeCard);
        });

        resultsContainer.appendChild(fragment);

        logEvent("success", `displayResults : ${recipes.length} recettes affichées.`);
    } catch (error) {
        logEvent("error", "displayResults : Erreur lors de l'affichage des résultats.", { error: error.message });
    }
}


/* ================================================================================ 
    GESTION DES FILTRES 
================================================================================ */

/*----------------------------------------------------------------
/*   Gestion des événements de filtres
/*--------------------------------------------------------------- */
/**
 * Gère les changements dans les menus déroulants de filtres.
 *
 * - Vérifie que l'événement contient bien une valeur sélectionnée.
 * - Récupère toutes les recettes et applique un filtrage dynamique.
 * - Met à jour l'affichage des résultats et journalise les actions.
 *
 * @param {Event} event - Événement déclenché par le changement de sélection.
 */
export async function handleFilterChange(event) {
    try {
        // 1. Vérifie que l'événement est valide et contient bien une cible (élément déclencheur).
        if (!event || !event.target) {
            logEvent("error", "handleFilterChange : Événement ou cible invalide.");
            return; // Stoppe l'exécution si l'événement est mal formé.
        }

        // 2. Récupère le type de filtre appliqué (ex: "ingredient", "appliance", "ustensil").
        const { filterType } = event.target.dataset;
        const selectedValue = event.target.value.trim(); // Nettoie la valeur sélectionnée.

        logEvent("info", `handleFilterChange : Filtre appliqué - ${filterType} = ${selectedValue}`);

        // 4. Récupère toutes les recettes pour appliquer un filtrage dynamique.
        const recipes =  getAllRecipes();

        // 5. Applique le filtre en fonction du type et de la valeur sélectionnée.
        const filteredRecipes = filterRecipesByType(recipes, filterType, selectedValue);

        // 6. Met à jour l'affichage des résultats avec les recettes filtrées.
        displayResults(filteredRecipes);

        // 7. Journalise le nombre de résultats trouvés après application du filtre.
        logEvent("success", `handleFilterChange : ${filteredRecipes.length} recettes affichées après filtrage.`);
    } catch (error) {
        // 8. Capture et journalise toute erreur survenue lors du filtrage.
        logEvent("error", "handleFilterChange : Erreur lors du filtrage.", { error: error.message });
    }
}

/* ================================================================================ 
    MISE À JOUR DES FILTRES DANS LE DOM 
================================================================================ */

/*----------------------------------------------------------------
/*   Remplissage des listes de filtres
/*----------------------------------------------------------------*/
/**
 * Remplit dynamiquement les listes de filtres.
 *
 * - Récupère les options de filtres via `fetchFilterOptions()`.
 * - Met à jour les listes des filtres dans le DOM.
 * - Vérifie si chaque catégorie contient des données avant de les afficher.
 */
export async function populateFilters(filters) {
    
}


/*----------------------------------------------------------------
/*   Mise à jour dynamique des listes de filtres
/*----------------------------------------------------------------*/

/**
 * Met à jour dynamiquement une liste de filtres avec un affichage limité et un défilement.
 *
 * - Vérifie si l'élément existe avant d'attendre (`waitForElement`).
 * - Affiche seulement un nombre limité d'options (scrollable).
 * - Ajoute un bouton "Voir plus / Voir moins" pour étendre la liste.
 *
 * @param {string} listId - ID du `<ul>` où insérer les options.
 * @param {Array} options - Liste complète des options à insérer.
 * @param {number} maxVisible - Nombre d'éléments visibles avant le "Voir plus".
 */
export async function updateFilterList(listId, options, maxVisible = 10) {
}

/* ================================================================================ 
    LANCEMENT AU CHARGEMENT DU DOM 
================================================================================ */

document.addEventListener("DOMContentLoaded", populateFilters);
