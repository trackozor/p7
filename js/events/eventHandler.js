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
import {requestAdminAccess} from "../main.js";
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
 * Attache les événements de validation et d'annulation à la modale.
 *
 * - Vérifie la présence des éléments avant d'attacher les événements.
 * - Associe la validation au bouton de confirmation et à la touche "Enter".
 * - Ajoute un mécanisme de nettoyage des événements lors de la fermeture de la modale.
 *
 * @param {HTMLElement} passwordInput - Champ de saisie du mot de passe.
 * @param {HTMLElement} validateBtn - Bouton de validation.
 * @param {HTMLElement} cancelBtn - Bouton d'annulation.
 * @param {function} callback - Fonction exécutée après validation du mot de passe.
 * @param {HTMLElement} modal - Élément DOM contenant la modale.
 */
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

        // ✅ Ajout des écouteurs d'événements
        validateBtn.addEventListener("click", () => handleValidation(passwordInput, modal));
        cancelBtn.addEventListener("click", () => handleClose(modal));
        passwordInput.addEventListener("keydown", (event) => handleEnterKey(event, passwordInput, modal));

        // ✅ Ajoute un gestionnaire de fermeture avec "Échap"
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                logEvent("info", "🚪 Fermeture de la modale via la touche Échap.");
                handleClose(modal);
            }
        }, { once: true });

        // ✅ Ajoute une méthode pour nettoyer les événements à la fermeture
        modal.cleanup = () => detachModalEvents(passwordInput, validateBtn, cancelBtn, modal);

        logEvent("success", "🎉 attachModalEvents : Événements attachés avec succès.");
    } catch (error) {
        logEvent("error", "❌ attachModalEvents : Erreur lors de l'attachement des événements à la modale.", { error: error.message });
    }
}


// ==========================================================
// Gestion de la Validation du Mot de Passe
// ==========================================================

/**
 * Vérifie le mot de passe et exécute le callback si valide.
 *
 * - Vérifie que `passwordInput` est un champ de saisie valide.
 * - Vérifie que `callback` est bien une fonction exécutable.
 * - Vérifie que `modal` est un élément HTML valide.
 * - Appelle `verifyPassword` pour exécuter la validation.
 * - Capture et logue les erreurs en cas de problème.
 *
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {function} callback - Fonction exécutée après validation.
 * @param {HTMLElement} modal - Élément DOM de la modale.
 * @throws {Error} Si l'un des paramètres est invalide.
 */
/**
 * Vérifie le mot de passe et ferme la modale si correct.
 *
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {HTMLElement} modal - Élément de la modale.
 */
function handleValidation(passwordInput, modal) {
    const enteredPassword = passwordInput.value.trim();
    logEvent("info", `🔑 Mot de passe saisi : ${enteredPassword}`);

    if (enteredPassword === "admin123") { // 🔐 Remplace ici par ton mot de passe réel
        logEvent("success", "✅ Mot de passe correct, accès autorisé.");
        alert("Accès autorisé !");
        handleClose(modal);
        enableBenchmarkMode(); // 🚀 Active le mode Benchmark si nécessaire
    } else {
        logEvent("error", "❌ Mot de passe incorrect.");
        alert("Mot de passe incorrect. Réessayez.");
        passwordInput.value = "";
        passwordInput.focus();
    }
}



// ==========================================================
// Gestion de la Fermeture de la Modale
// ==========================================================

/**
 * Ferme la modale après vérification de sa validité.
 *
 * - Vérifie que `modal` est bien un élément HTML valide.
 * - Appelle la fonction `closeModal` pour fermer proprement la modale.
 * - Capture et logue les erreurs si l'élément est invalide.
 *
 * @param {HTMLElement} modal - Élément DOM de la modale.
 * @throws {Error} Si l'élément modal est invalide ou inexistant.
 */
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
            logEvent("success", "🎯 Modale supprimée du DOM.");
        }, 300);
    }
}


// ==========================================================
// Gestion de la Validation par la Touche "Enter"
// ==========================================================

/**
 * Détecte l'appui sur la touche "Enter" et déclenche la validation du mot de passe.
 *
 * - Vérifie si la touche pressée est "Enter".
 * - Exécute la fonction de validation si la condition est remplie.
 * - Gère les erreurs en cas de paramètres invalides.
 *
 * @param {KeyboardEvent} event - Événement de clavier.
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {function} callback - Fonction exécutée après validation.
 * @param {HTMLElement} modal - Élément DOM de la modale.
 * @throws {Error} Si l'un des paramètres est invalide.
 */
/**
 * Gère la validation avec la touche "Entrée".
 *
 * @param {KeyboardEvent} event - Événement de touche.
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @param {HTMLElement} modal - Élément de la modale.
 */
function handleEnterKey(event, passwordInput, modal) {
    if (event.key === "Enter") {
        logEvent("info", "🔄 Validation du mot de passe via la touche Entrée.");
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
/*==================================================================
/*
/*  Cette fonction détache proprement tous les événements liés à la modale.
/*  Elle est utilisée avant la suppression pour éviter les fuites mémoire.
/*  Vérifie si un gestionnaire de nettoyage existe avant d'exécuter la suppression.
/*
/*-------------------------------------------------------------------*/

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

/**
 * Affiche les résultats des recettes dans le DOM.
 *
 * - Vérifie la présence du conteneur de résultats avant d'ajouter du contenu.
 * - Affiche un message "Aucune recette trouvée" si la liste est vide.
 * - Utilise un `DocumentFragment` pour optimiser l'insertion des éléments.
 * - Nettoie et sécurise les données affichées pour éviter les injections.
 *
 * @param {Array} results - Liste des recettes filtrées.
 */
export async function displayResults(results) {
    try {
        // Attendre que le conteneur soit disponible dans le DOM
        const recipesContainer = await waitForElement("#recipes-container");

        if (!recipesContainer) {
            logEvent("error", "displayResult : Conteneur des recettes introuvable.");
            return; // Stoppe l'exécution si l'élément est manquant
        }

        // Nettoyage du conteneur avant d'afficher les nouveaux résultats
        recipesContainer.innerHTML = "";

        // Si aucun résultat, afficher un message
        if (!Array.isArray(results) || results.length === 0) {
            recipesContainer.innerHTML = `<p class="no-results">Aucune recette trouvée.</p>`;
            logEvent("warning", "displayResults : Aucun résultat trouvé.");
            return;
        }

        logEvent("info", `displayResults : Affichage de ${results.length} recettes.`);

        // Utilisation d'un DocumentFragment pour optimiser l'ajout des éléments
        const fragment = document.createDocumentFragment();

        results.forEach((recipe) => {
            const card = RecipeFactory(recipe);
            fragment.appendChild(card);
        });

        recipesContainer.appendChild(fragment);

        logEvent("success", `displayResults : ${results.length} recettes affichées.`);
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

        // 3. Vérifie que le filtre et la valeur sélectionnée sont bien définis.
        if (!filterType || !selectedValue) {
            logEvent("warning", "handleFilterChange : Filtre ou valeur sélectionnée manquante.");
            return; // Stoppe l'exécution si une des valeurs est absente.
        }

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
export async function populateFilters() {
    try {
        // 1. Journalise le début du chargement des filtres.
        logEvent("info", "populateFilters : Chargement des options de filtre...");

        // 2. Récupère les options de filtre disponibles (ingrédients, ustensiles, appareils).
        const filters = await fetchFilterOptions();

        // 3. Vérifie que `filters` est bien un objet contenant des données exploitables.
        if (!filters || typeof filters !== "object") {
            logEvent("error", "populateFilters : Données de filtre invalides ou absentes.", { filters });
            return; // Stoppe l'exécution si les données ne sont pas valides.
        }

        // 4. Initialisation d'un compteur pour suivre le nombre de listes mises à jour.
        let updatedLists = 0;

        // 5. Vérifie et met à jour la liste des ingrédients si des données sont disponibles.
        if (Array.isArray(filters.ingredients) && filters.ingredients.length > 0) {
            updateFilterList("ingredient-list", filters.ingredients);
            updatedLists++; // Incrémente le compteur.
        } else {
            logEvent("warning", "populateFilters : Aucun ingrédient disponible pour les filtres.");
        }

        // 6. Vérifie et met à jour la liste des ustensiles si des données sont disponibles.
        if (Array.isArray(filters.ustensils) && filters.ustensils.length > 0) {
            updateFilterList("ustensil-list", filters.ustensils);
            updatedLists++; // Incrémente le compteur.
        } else {
            logEvent("warning", "populateFilters : Aucun ustensile disponible pour les filtres.");
        }

        // 7. Vérifie et met à jour la liste des appareils si des données sont disponibles.
        if (Array.isArray(filters.appliances) && filters.appliances.length > 0) {
            updateFilterList("appliance-list", filters.appliances);
            updatedLists++; // Incrémente le compteur.
        } else {
            logEvent("warning", "populateFilters : Aucun appareil disponible pour les filtres.");
        }

        // 8. Vérifie si au moins une liste de filtres a été mise à jour.
        if (updatedLists > 0) {
            logEvent("success", `populateFilters : Filtres mis à jour (${updatedLists} catégories).`);
        } else {
            logEvent("warning", "populateFilters : Aucun filtre disponible.");
        }
    } catch (error) {
        // 9. Capture et journalise toute erreur survenue lors du chargement des filtres.
        logEvent("error", "populateFilters : Erreur lors du chargement des filtres.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Mise à jour dynamique des listes de filtres
/*----------------------------------------------------------------*/

/**
 * Met à jour dynamiquement une liste de filtres dans le DOM.
 *
 * - Vide la liste avant d'ajouter les nouvelles options.
 * - Utilise un `DocumentFragment` pour optimiser les performances.
 * - Applique une validation stricte pour éviter toute erreur.
 * - Ajoute un `logEvent()` détaillé pour suivre chaque étape.
 *
 * @param {string} listId - ID du `<ul>` correspondant.
 * @param {Array} options - Liste des options à insérer.
 */
export function updateFilterList(listId, options) {
    try {
        // 1. Vérification de la validité de `listId`
        if (!listId || typeof listId !== "string") {
            logEvent("error", "updateFilterList : ID de liste invalide.", { listId });
            return;
        }

        // 2. Vérification de la validité des options
        if (!Array.isArray(options) || options.length === 0) {
            logEvent("warning", `updateFilterList : Aucune option fournie pour ${listId}.`);
            return;
        }

        // 3. Sélection de l'élément DOM correspondant
        const listElement = document.getElementById(listId);
        if (!listElement) {
            logEvent("error", `updateFilterList : Élément DOM introuvable (${listId}).`);
            return;
        }

        // 4. Nettoie la liste existante
        listElement.innerHTML = "";

        // 5. Utilisation d'un `DocumentFragment` pour éviter de trop manipuler le DOM
        const fragment = document.createDocumentFragment();

        

        // 8. Journalise le succès
        logEvent("success", `updateFilterList : Liste ${listId} mise à jour avec ${options.length} éléments.`);

    } catch (error) {
        logEvent("error", "updateFilterList : Erreur lors de la mise à jour des filtres.", { error: error.message });
    }
}




/* ================================================================================ 
    LANCEMENT AU CHARGEMENT DU DOM 
================================================================================ */

document.addEventListener("DOMContentLoaded", populateFilters);
