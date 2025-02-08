/* ==================================================================================== */
/*  FICHIER          : eventListeners.js                                               */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.0                                                             */
/*  DESCRIPTION      : Attache les écouteurs d'événements aux éléments du DOM.         */
/* ==================================================================================== */

import domselectors from "../config/domSelectors.js";
import { handleSearch, handleFilterChange } from "./eventHandler.js";

/**
 * Initialise les écouteurs d'événements sur les éléments de la page.
 */
export function initEventListeners() {
    const selectors = domselectors();

    logEvent("INFO", "Attachement des écouteurs d'événements...");

    // Écouteur sur la barre de recherche
    selectors.search.input.addEventListener("input", handleSearch);
    selectors.search.form.addEventListener("submit", (event) => {
        event.preventDefault();
        handleSearch();
    });

    // Écouteurs sur les filtres
    selectors.filterDropdowns.ingredientDropdown.addEventListener("change", handleFilterChange);
    selectors.filterDropdowns.applianceDropdown.addEventListener("change", handleFilterChange);
    selectors.filterDropdowns.ustensilDropdown.addEventListener("change", handleFilterChange);

    logEvent("SUCCESS", "Écouteurs d'événements attachés.");
}
