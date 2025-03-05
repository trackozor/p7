/* ====================================================================================
/*  FICHIER          : eventHandler.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes.
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";
import { updateTagDisplay, activeFilters } from "../components/filterManager.js";
import { trapFocus } from "../utils/accessibility.js";
import { KEY_CODES } from "../config/constants.js";
import { Search } from "../components/search/search.js"; 
import { handleBarSearch } from "../components/searchBarManager.js";

/* ====================================================================================
/*                            GESTION DE LA RECHERCHE
/* ==================================================================================== */


/* ====================================================================================
/*                            GESTION Du formulaire de la recherche
/* ==================================================================================== */
/**
 * Gère l'événement de soumission du formulaire de recherche.
 * Empêche le rechargement de la page et déclenche la recherche via `handleSearch()`.
 *
 * @param {Event} event - Événement déclenché lors de la soumission du formulaire.
 * @returns {void} Ne retourne rien, empêche le rechargement et exécute la recherche.
 */
export function handleSearchWrapper(event) {
    // Empêche le rechargement de la page lors de la soumission du formulaire
    event.preventDefault();

    // Déclenche la fonction de recherche
    handleBarSearch();
}
/* ====================================================================================
/*                 GESTION DE L'OUVERTURE ET FERMETURE DES DROPDOWNS
/* ==================================================================================== */
/**
 * Gère l'ouverture d'un dropdown et active le piégeage du focus.
 *
 * @param {Event} event - Événement du clic sur le bouton de dropdown.
 * @param {HTMLElement} button - Bouton de dropdown cliqué.
 */
/**
 * Gère l'ouverture d'un dropdown et active le piégeage du focus.
 *
 * @param {Event} event - Événement du clic sur le bouton de dropdown.
 */
export function handleDropdownClick(event) {
    event.stopPropagation();
    const button = event.currentTarget; // Récupère le bouton cliqué
    const {filterType} = button.dataset; // Correction ici, utiliser "filterType"

    if (!filterType) {
        logEvent("error", "handleDropdownClick : Le bouton cliqué ne contient pas de dataset.filterType.");
        console.error("handleDropdownClick : Problème de dataset :", button);
        return;
    }

    const dropdownContainer = button.nextElementSibling; // Sélectionne le container du dropdown
    const allDropdowns = document.querySelectorAll(".dropdown-container");

    if (!dropdownContainer) {
        logEvent("error", `handleDropdownClick : Aucun conteneur de dropdown trouvé pour "${filterType}".`);
        return;
    }

    // Fermer tous les autres dropdowns avant d'en ouvrir un
    allDropdowns.forEach(drop => {
        if (drop !== dropdownContainer) {
            drop.classList.remove("active");
        }
    });

    // Basculer l'état du dropdown
    dropdownContainer.classList.toggle("active");

    if (dropdownContainer.classList.contains("active")) {
        trapFocus(dropdownContainer);
    }

    logEvent("info", `handleDropdownClick : Dropdown "${filterType}" ${dropdownContainer.classList.contains("active") ? "ouvert" : "fermé"}.`);
}

/* ====================================================================================
/*                   WRAPPERS POUR ÉVITER LES DOUBLONS D'ÉVÉNEMENTS
/* ==================================================================================== */

/* ------------------------------- */
/*  WRAPPER : Gestion des Dropdowns  */
/* ------------------------------- */
/**
 * Wrapper pour la gestion du clic sur un bouton de dropdown.
 * Permet d'éviter les doublons d'événements en s'assurant que la cible est correcte.
 *
 * @param {Event} event - L'événement du clic.
 */
export function handleDropdownClickWrapper(event) {
    handleDropdownClick(event, event.currentTarget);
}

/* ------------------------------- */
/*  WRAPPER : Sélection des Filtres  */
/* ------------------------------- */
/**
 * Wrapper pour la gestion du clic sur une option de dropdown.
 * Permet d'éviter les doublons d'événements en ciblant précisément l'option cliquée.
 *
 * @param {Event} event - L'événement du clic.
 */
export function handleFilterSelectionWrapper(event) {
    console.log(" Événement reçu dans handleFilterSelectionWrapper :", event);

    let {target} = event;

    // Vérifie que l'utilisateur clique bien sur un élément `<li>`, sinon remonte dans le DOM
    while (target && !target.classList.contains("filter-option")) {
        target = target.parentElement;
    }

    // Vérification de la validité de l'élément
    if (!target || !target.dataset.filterType || !target.textContent.trim()) {
        console.error("handleFilterSelectionWrapper : Élément cliqué invalide.", target);
        return;
    }

    const {filterType} = target.dataset; // Récupère le type de filtre correct
    const filterValue = target.textContent.trim();

    console.log(`handleFilterSelectionWrapper - Appel avec : { filterType: ${filterType}, filterValue: ${filterValue} }`);

    handleFilterSelection(filterType, filterValue);
}

/* ====================================================================================
/*               GESTION DE LA SUPPRESSION DES FILTRES (TAGS)
/* ==================================================================================== */
/**
 * Gère la suppression d'un tag de filtre lorsqu'on clique sur son bouton de fermeture.
 * Récupère dynamiquement l'élément du tag et supprime le filtre correspondant.
 *
 * @param {Event} event - L'événement déclenché par le clic sur le bouton de suppression du tag.
 */
export function handleTagRemovalWrapper(event) {
    // Récupération du tag parent depuis l'élément cliqué (le bouton "X")
    const tagElement = event.currentTarget.closest(".filter-tag");

    if (!tagElement) {
        logEvent("warn", "handleTagRemovalWrapper : Aucun tag trouvé pour la suppression.");
        return;
    }

    // Extraction des données du tag
    const { filterType } = tagElement.dataset;
    const filterValue = tagElement.textContent.trim();

    if (!filterType || !filterValue) {
        logEvent("error", "handleTagRemovalWrapper : Paramètres invalides.");
        return;
    }

    logEvent("info", `handleTagRemovalWrapper : Suppression du tag "${filterValue}" (${filterType}).`);

    // Suppression du filtre correspondant et mise à jour de l'affichage
    removeTag(filterType, filterValue);
}

/**
 * Gère les interactions clavier pour la navigation et l'accessibilité.
 * - Tabulation : Maintient le focus dans les dropdowns et modales.
 * - Échap : Ferme les dropdowns ouverts.
 * - Entrée / Espace : Active les filtres ou déclenche des actions.
 *
 * @param {KeyboardEvent} event - Événement clavier déclenché.
 */
export function handleKeyboardNavigation(event) {
    const {activeElement} = document;

    // Gestion de la touche Échap pour fermer les dropdowns actifs
    if (event.key === KEY_CODES.ESCAPE) {
        const openDropdowns = document.querySelectorAll(".dropdown-container.active");
        openDropdowns.forEach(dropdown => dropdown.classList.remove("active"));
        logEvent("info", "handleKeyboardNavigation : Fermeture des dropdowns avec ESC.");
    }

    // Gestion de la touche Tab pour restreindre le focus
    if (event.key === KEY_CODES.TAB) {
        const openDropdown = document.querySelector(".dropdown-container.active");
        if (openDropdown) {
            trapFocus(openDropdown);
            logEvent("info", "handleKeyboardNavigation : Focus piégé dans un dropdown.");
        }
    }

    // Gestion de la touche Entrée pour sélectionner une option de filtre
    if ((event.key === KEY_CODES.ENTER || event.key === KEY_CODES.SPACE) && activeElement.classList.contains("filter-option")) {
        activeElement.click(); // Simule un clic sur l'option
        logEvent("success", `handleKeyboardNavigation : Option sélectionnée "${activeElement.textContent}".`);
    }
}

/* ====================================================================================
/*                        GESTION DES FILTRES SÉLECTIONNÉS (TAGS)
/* ==================================================================================== */
/*--------------- */
/* Ajout         */
/*---------------*/

export function handleFilterSelection(filterType, filterValue) {
    try {
        if (!filterType || !filterValue) {
            logEvent("warn", "handleFilterSelection : Paramètres invalides.");
            return;
        }

        // Vérifier si le filtre est déjà actif pour éviter les doublons
        if (activeFilters[filterType].has(filterValue)) {
            logEvent("info", `handleFilterSelection : '${filterValue}' déjà actif, pas d'ajout.`);
            return;
        }

        logEvent("info", `handleFilterSelection : Ajout du tag '${filterValue}' (${filterType}).`);
        activeFilters[filterType].add(filterValue);

        updateTagDisplay();

        // ✅ Récupérer l'état des filtres sous forme de tableau
        const filtersArray = {
            ingredients: Array.from(activeFilters["ingredients"]),
            appliances: Array.from(activeFilters["appliances"]),
            ustensils: Array.from(activeFilters["ustensils"])
        };

        logEvent("debug", "Filtres actifs après ajout :", filtersArray);

        // ✅ Vérification avant d’appeler Search() (éviter les appels inutiles)
        if (filtersArray.ingredients.length > 0 || filtersArray.appliances.length > 0 || filtersArray.ustensils.length > 0) {
            Search("", "filters", filtersArray);
        }

    } catch (error) {
        logEvent("error", "handleFilterSelection : Erreur lors de l'ajout du filtre.", { error: error.message });
    }
}

/*--------------- */
/* Retrait        */
/*--------------- */
/**
 * Supprime un filtre sélectionné et met à jour l'affichage et les résultats.
 * - Vérifie si le filtre existe avant suppression.
 * - Met à jour les tags et les options des dropdowns.
 *
 * @param {string} filterType - Type de filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur du filtre à supprimer.
 */
export function removeTag(filterType, filterValue) {
    try {
        if (!activeFilters[filterType].has(filterValue)) {
            return;
        }

        logEvent("info", `removeTag : Suppression de '${filterValue}' (${filterType}).`);
        activeFilters[filterType].delete(filterValue);

        updateTagDisplay();  // mise à jour affichage des tags
        Search();     // Relance de la recherche pour mise à jour
    } catch (error) {
        logEvent("error", "removeTag : Erreur lors de la suppression du filtre.", { error: error.message });
    }
}