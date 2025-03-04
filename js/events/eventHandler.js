/* ====================================================================================
/*  FICHIER          : eventHandler.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes.
/* ==================================================================================== */

import { logEvent, debounce } from "../utils/utils.js";
import { handleFilterSelection , removeTag } from "../components/filterManager.js";
import { trapFocus } from "../utils/accessibility.js";
import { KEY_CODES } from "../config/constants.js";
import { Search } from "../components/search/search.js"; 

/* ====================================================================================
/*                            GESTION DE LA RECHERCHE
/* ==================================================================================== */
/**
 * Gère la recherche en appliquant une temporisation (`debounce`).
 *
 * - Vérifie que l'élément de recherche existe dans le DOM.
 * - Nettoie et normalise la requête utilisateur.
 * - Déclenche `Search()` uniquement si la requête contient au moins 3 caractères.
 * - Utilise un délai de 300ms pour éviter les appels excessifs.
 *
 * @returns {void} Ne retourne rien, mais déclenche la recherche avec `Search()`.
 */
export const handleSearch = debounce(async function () {
    try {
        logEvent("test_start", "handleSearch : Début de la recherche...");

        // Sélection de l'élément de saisie de recherche
        const searchInput = document.querySelector("#search");

        // Vérification que l'élément existe dans le DOM
        if (!searchInput) {
            logEvent("error", "handleSearch : Élément input de recherche introuvable.");
            return;
        }

        // Récupération et nettoyage de la requête utilisateur
        const query = searchInput.value.trim().toLowerCase(); // Mise en minuscule et suppression des espaces inutiles

        // Vérification de la longueur minimale de la requête
        if (query.length < 3) {
            logEvent("warn", "handleSearch : La requête est trop courte, minimum 3 caractères.");
            return;
        }

        logEvent("info", `handleSearch : Recherche en cours pour '${query}'.`);

        // Déclenchement de la recherche avec la requête normalisée
        Search(query);

        logEvent("success", "handleSearch : Recherche exécutée avec succès.");
        logEvent("test_end", "handleSearch : Fin du processus.");
    } catch (error) {
        logEvent("error", "handleSearch : Erreur lors de la recherche.", { error: error.message });
    }
}, 300);

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
    handleSearch();
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
export function handleDropdownClick(event, button) {
    event.stopPropagation();

    const dropdownContainer = button.nextElementSibling;
    const allDropdowns = document.querySelectorAll(".dropdown-container");

    if (!dropdownContainer) {
        logEvent("error", "handleDropdownClick : Aucun conteneur de dropdown trouvé.");
        return;
    }

    // Fermer tous les autres dropdowns
    allDropdowns.forEach(drop => {
        if (drop !== dropdownContainer) {
            drop.classList.remove("active");
        }
    });

    // Basculer l'état du dropdown
    dropdownContainer.classList.toggle("active");

    if (dropdownContainer.classList.contains("active")) {
        // Activer le trap focus dans le dropdown ouvert
        trapFocus(dropdownContainer);
    }

    logEvent("info", `handleDropdownClick : Dropdown "${button.dataset.filter}" ${dropdownContainer.classList.contains("active") ? "ouvert" : "fermé"}.`);
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

