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

import { searchRecipesLoop } from "../components/search.js";
import { getAllRecipes, fetchFilterOptions } from "../data/dataManager.js";
import domSelectors from "../config/domSelectors.js";
import { logEvent } from "../utils/utils.js";

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
        // 1. Vérifie que l'objet `domSelectors` et `searchInput` existent avant d'exécuter la recherche.
        if (!domSelectors || !domSelectors.searchInput) {
            logEvent("error", "handleSearch : Élément input de recherche introuvable.");
            return; // Stoppe l'exécution si l'élément est manquant.
        }

        // 2. Récupère et nettoie la saisie de l'utilisateur (trim enlève les espaces inutiles).
        const query = domSelectors.searchInput.value.trim();

        // 3. Vérifie que l'utilisateur a saisi au moins 3 caractères avant de lancer la recherche.
        if (query.length < 3) {
            logEvent("info", "handleSearch : Recherche ignorée (moins de 3 caractères).");
            return; // Évite les requêtes inutiles si la saisie est trop courte.
        }

        // 4. Affiche un message indiquant que la recherche est en cours.
        logEvent("info", `handleSearch : Recherche en cours pour "${query}"...`);

        // 5. Appelle la fonction `searchRecipesLoop()` pour récupérer les résultats en fonction du texte saisi.
        const results = await searchRecipesLoop(query);

        // 6. Vérifie que les résultats obtenus sont bien un tableau avant de les afficher.
        if (!Array.isArray(results)) {
            logEvent("error", "handleSearch : Résultat de recherche invalide.", { results });
            return; // Stoppe l'exécution si les résultats ne sont pas valides.
        }

        // 7. Met à jour l'affichage avec les résultats obtenus.
        displayResults(results);

        // 8. Affiche un message de succès avec le nombre de résultats trouvés.
        logEvent("success", `handleSearch : ${results.length} résultats trouvés.`);

    } catch (error) {
        // Capture et journalise toute erreur survenue lors de la recherche.
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
export function attachModalEvents(passwordInput, validateBtn, cancelBtn, callback, modal) {
    try {
        // Vérifie la présence des éléments requis avant d'attacher les événements
        if (!passwordInput || !validateBtn || !cancelBtn || !modal) {
            logEvent("error", "attachModalEvents : Un ou plusieurs éléments sont manquants.", {
                passwordInput,
                validateBtn,
                cancelBtn,
                modal
            });
            return;
        }

        // Ajout des écouteurs d'événements
        validateBtn.addEventListener("click", () => handleValidation(passwordInput, callback, modal));
        cancelBtn.addEventListener("click", () => handleClose(modal));
        passwordInput.addEventListener("keydown", (event) => handleEnterKey(event, passwordInput, callback, modal));

        // Ajoute une méthode pour nettoyer les événements à la fermeture
        modal.cleanup = () => detachModalEvents(passwordInput, validateBtn, cancelBtn, modal);

        logEvent("success", "Écouteurs attachés à la modale avec succès.");
    } catch (error) {
        logEvent("error", "Erreur lors de l'attachement des événements à la modale.", { error: error.message });
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
export function handleValidation(passwordInput, callback, modal) {
    try {
        // Vérifie que `passwordInput` est bien un élément `<input>` HTML
        if (!(passwordInput instanceof HTMLInputElement)) {
            logEvent("error", "handleValidation : Champ de saisie du mot de passe invalide.");
            throw new Error("Le champ de saisie du mot de passe est invalide ou inexistant.");
        }

        // Vérifie que `callback` est bien une fonction exécutable
        if (typeof callback !== "function") {
            logEvent("error", "handleValidation : Callback invalide ou non fourni.");
            throw new Error("Un callback valide est requis pour la validation du mot de passe.");
        }

        // Vérifie que `modal` est bien un élément HTML valide
        if (!(modal instanceof HTMLElement)) {
            logEvent("error", "handleValidation : Élément modal invalide.");
            throw new Error("L'élément modal fourni est invalide.");
        }

        // Exécute la validation du mot de passe avec `verifyPassword`
        verifyPassword(passwordInput.value, callback, modal);

    } catch (error) {
        // Capture l'erreur et l'enregistre pour le suivi
        logEvent("critical", "Erreur critique dans handleValidation", { message: error.message });

        // Relance l'exception pour permettre un traitement en amont si nécessaire
        throw error;
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
export function handleClose(modal) {
    try {
        // Vérifie que `modal` est bien un élément HTML valide avant d'exécuter la fermeture
        if (!(modal instanceof HTMLElement)) {
            logEvent("error", "handleClose : Élément modal invalide ou non fourni.");
            throw new Error("L'élément modal fourni est invalide ou inexistant.");
        }

        // Appelle `closeModal` pour gérer la fermeture proprement
        closeModal(modal);

    } catch (error) {
        // Capture l'erreur et l'enregistre pour le suivi
        logEvent("critical", "Erreur critique dans handleClose", { message: error.message });

        // Relance l'exception pour permettre un traitement en amont si nécessaire
        throw error;
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
export function handleEnterKey(event, passwordInput, callback, modal) {
    try {
        // Vérifie la validité des paramètres avant toute exécution
        validateEnterKeyParameters(event, passwordInput, callback, modal);

        // Vérifie si la touche pressée est bien "Enter"
        if (event.key === "Enter") {
            // Exécute la validation du mot de passe
            handleValidation(passwordInput, callback, modal);
        }
    } catch (error) {
        // Capture l'erreur et l'enregistre pour le suivi
        logEvent("critical", "Erreur critique dans handleEnterKey", { message: error.message });

        // Relance l'exception pour permettre un traitement en amont si nécessaire
        throw error;
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
export function validateEnterKeyParameters(event, passwordInput, callback, modal) {
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

    // Vérifie que `callback` est bien une fonction exécutable
    if (typeof callback !== "function") {
        logEvent("error", "validateEnterKeyParameters : Callback invalide ou non fourni.");
        throw new Error("Un callback valide est requis pour la validation du mot de passe.");
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
export function displayResults(results) {
    try {
        // 1. Vérifie que l'objet `domSelectors` et `recipesContainer` existent avant de modifier le DOM.
        if (!domSelectors || !domSelectors.recipesContainer) {
            logEvent("error", "displayResults : Conteneur des recettes introuvable.");
            return; // Stoppe l'exécution si l'élément est manquant.
        }

        // 2. Nettoie le conteneur avant d'ajouter les nouveaux résultats.
        domSelectors.recipesContainer.innerHTML = "";

        // 3. Vérifie si la liste des résultats est vide ou invalide.
        if (!Array.isArray(results) || results.length === 0) {
            domSelectors.recipesContainer.innerHTML = `<p class="no-results">Aucune recette trouvée.</p>`;
            logEvent("warning", "displayResults : Aucun résultat pour cette recherche.");
            return; // Stoppe l'affichage si aucun résultat.
        }

        logEvent("info", `displayResults : Génération de ${results.length} cartes de recettes.`);

        // 4. Crée un `DocumentFragment` pour optimiser l'ajout des éléments au DOM.
        const fragment = document.createDocumentFragment();

        // 5. Génère les cartes des recettes et les ajoute au fragment.
        results.forEach((recipe) => {
            const card = createRecipeCard(recipe);
            fragment.appendChild(card);
        });

        // 6. Ajoute toutes les cartes en une seule opération pour éviter les ralentissements.
        domSelectors.recipesContainer.appendChild(fragment);

        logEvent("success", `displayResults : ${results.length} recettes affichées.`);
    } catch (error) {
        // 7. Capture et journalise toute erreur survenue lors de l'affichage des résultats.
        logEvent("error", "displayResults : Erreur lors de l'affichage des résultats.", { error: error.message });
    }
}


/*----------------------------------------------------------------
/*   Création de la carte de recette
/*--------------------------------------------------------------- */

/**
 * Crée une carte de recette complète avec un design optimisé.
 *
 * - Affiche une image, un titre, une description et les ingrédients.
 * - Ajoute des classes CSS 
 * - Sécurise les données affichées avec `sanitizeText()`.
 *
 * @param {Object} recipe - Objet représentant une recette.
 * @returns {HTMLElement} Élément DOM complet représentant la carte de recette.
 */
function createRecipeCard(recipe) {
    // 1. Vérifie si `recipe` est un objet valide avant de générer la carte
    if (!recipe || typeof recipe !== "object") {
        logEvent("error", "createRecipeCard : Données de recette invalides.", { recipe });
        return document.createElement("div"); // Évite les erreurs en retour d’un élément vide
    }

    // 2. Création de l'élément principal de la carte
    const card = document.createElement("article");
    card.classList.add("recipe-card");

    // 3. Sécurisation des données affichées
    const sanitizedTitle = sanitizeText(recipe.name);
    const sanitizedDescription = sanitizeText(recipe.description);
    const sanitizedTime = sanitizeText(recipe.time);
    const sanitizedImage = sanitizeText(recipe.image);

    // 4. Génération de la structure HTML complète de la carte
    card.innerHTML = `
        <div class="recipe-card__image">
            <img src="${sanitizedImage}" alt="Photo de ${sanitizedTitle}" loading="lazy">
            <span class="recipe-card__time">${sanitizedTime} min</span>
        </div>
        
        <div class="recipe-card__content">
            <h2 class="recipe-card__title">${sanitizedTitle}</h2>
            <p class="recipe-card__description">${sanitizedDescription}</p>
            
            <ul class="recipe-card__ingredients">
                ${recipe.ingredients.map(ingredient => `
                    <li class="ingredient">
                        <strong>${sanitizeText(ingredient.ingredient)}</strong>
                        ${ingredient.quantity ? `: ${sanitizeText(ingredient.quantity)}` : ""}
                        ${ingredient.unit ? sanitizeText(ingredient.unit) : ""}
                    </li>
                `).join("")}
            </ul>
        </div>
    `;

    return card;
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
        const recipes = await getAllRecipes();

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


/*----------------------------------------------------------------
/*   Filtrage des recettes par types
/*----------------------------------------------------------------*/

/**
 * Filtre les recettes selon un critère spécifique (ingrédient, appareil, ustensile).
 *
 * - Utilise une comparaison insensible à la casse et aux accents.
 * - Vérifie que le champ filtré est bien présent dans la recette.
 *
 * @param {Array} recipes - Liste complète des recettes.
 * @param {string} filterType - Type de filtre appliqué ("ingredient", "appliance", "ustensil").
 * @param {string} selectedValue - Valeur du filtre sélectionné.
 * @returns {Array} Recettes filtrées correspondant au critère.
 */
function filterRecipesByType(recipes, filterType, selectedValue) {
    try {
        // 1. Vérifie que `recipes` est un tableau valide contenant au moins une recette.
        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("warning", "filterRecipesByType : Aucune recette à filtrer.");
            return []; // Retourne un tableau vide si `recipes` est invalide.
        }

        // 2. Vérifie que `filterType` et `selectedValue` sont bien définis et de type string.
        if (typeof filterType !== "string" || typeof selectedValue !== "string") {
            logEvent("error", "filterRecipesByType : Paramètres invalides.", { filterType, selectedValue });
            return [];
        }

        // 3. Normalise la valeur du filtre pour éviter les différences de casse et d’accents.
        const normalizedValue = normalizeText(selectedValue);

        // 4. Applique le filtrage selon le type spécifié.
        return recipes.filter(recipe => {
            // 4.1 Filtrage par ingrédient : vérifie si un des ingrédients contient la valeur recherchée.
            if (filterType === "ingredient" && Array.isArray(recipe.ingredients)) {
                return recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(normalizedValue));
            }

            // 4.2 Filtrage par appareil : compare l'appareil de la recette avec la valeur recherchée.
            if (filterType === "appliance" && recipe.appliance) {
                return normalizeText(recipe.appliance) === normalizedValue;
            }

            // 4.3 Filtrage par ustensile : vérifie si un des ustensiles contient la valeur recherchée.
            if (filterType === "ustensil" && Array.isArray(recipe.ustensils)) {
                return recipe.ustensils.some(ust => normalizeText(ust).includes(normalizedValue));
            }

            return false; // Aucune correspondance trouvée.
        });

    } catch (error) {
        // 5. Capture et journalise toute erreur survenue pendant le filtrage.
        logEvent("error", "filterRecipesByType : Erreur lors du filtrage des recettes.", { error: error.message });
        return []; // Retourne un tableau vide en cas d'erreur pour éviter un crash.
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
function updateFilterList(listId, options) {
    try {
        // 1. Vérifie que `listId` est bien une chaîne de caractères valide.
        if (!listId || typeof listId !== "string") {
            logEvent("error", "updateFilterList : ID de liste invalide.", { listId });
            return; // Stoppe l'exécution si l'ID est incorrect.
        }

        // 2. Vérifie que `options` est un tableau non vide avant d’aller plus loin.
        if (!Array.isArray(options) || options.length === 0) {
            logEvent("warning", `updateFilterList : Aucune option fournie pour ${listId}.`);
            return; // Évite d’effacer une liste existante pour rien.
        }

        // 3. Sélectionne l'élément DOM correspondant à l’ID fourni.
        const listElement = document.getElementById(listId);
        if (!listElement) {
            logEvent("error", `updateFilterList : Élément DOM introuvable (${listId}).`);
            return; // Stoppe l'exécution si l’élément n’existe pas.
        }

        // 4. Nettoie le contenu existant de la liste pour éviter les doublons.
        listElement.innerHTML = "";

        // 5. Utilise un `DocumentFragment` pour améliorer la performance lors de l'ajout d'éléments.
        const fragment = document.createDocumentFragment();

        // 6. Boucle sur chaque option pour créer un élément `<li>`.
        options.forEach(option => {
            const li = document.createElement("li");
            li.textContent = sanitizeText(option); // Sécurise le texte contre les injections.
            li.classList.add("filter-option");
            li.setAttribute("tabindex", "0"); // Permet la navigation clavier.

            // 7. Ajoute un écouteur d'événements pour journaliser les sélections.
            li.addEventListener("click", () => logEvent("info", `Filtre sélectionné : ${option}`));

            // 8. Ajoute l'élément `<li>` au `DocumentFragment`.
            fragment.appendChild(li);
        });

        // 9. Ajoute tous les éléments optimisés dans le DOM en une seule opération.
        listElement.appendChild(fragment);

        // 10. Journalise le succès de l'opération avec le nombre d'éléments ajoutés.
        logEvent("success", `updateFilterList : Liste ${listId} mise à jour avec ${options.length} éléments.`);

    } catch (error) {
        // 11. Capture et journalise toute erreur lors de la mise à jour des filtres.
        logEvent("error", "updateFilterList : Erreur lors de la mise à jour des filtres.", { error: error.message });
    }
}


/* ================================================================================ 
    LANCEMENT AU CHARGEMENT DU DOM 
================================================================================ */

document.addEventListener("DOMContentLoaded", populateFilters);
