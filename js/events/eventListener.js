import { logEvent } from "../utils/utils.js";
import domSelectors from "../config/domSelectors.js";
import { handleSearch, handleFilterChange } from "./eventHandler.js";

export function initEventListeners() {
    try {
        const selectors = domSelectors();

        logEvent("INFO", " Initialisation des écouteurs d'événements...");

        //  Écouteur de la barre de recherche
        if (selectors.search.input && selectors.search.form) {
            selectors.search.input.addEventListener("input", handleSearch);
            selectors.search.form.addEventListener("submit", (event) => {
                event.preventDefault();
                handleSearch();
            });
            logEvent("SUCCESS", "Écouteurs attachés à la barre de recherche.");
        } else {
            logEvent("ERROR", "Impossible de trouver les éléments de recherche.", { selectors });
        }

        // Écouteur des filtres
        const { ingredientDropdown, applianceDropdown, ustensilDropdown } = selectors.filterDropdowns;
        if (ingredientDropdown) {
          ingredientDropdown.addEventListener("change", handleFilterChange);
        }
        if (applianceDropdown) {
          applianceDropdown.addEventListener("change", handleFilterChange);
        }
        if (ustensilDropdown) {
          ustensilDropdown.addEventListener("change", handleFilterChange);
        }

        logEvent("SUCCESS", "Tous les écouteurs sont attachés avec succès.");

    } catch (error) {
        logEvent("ERROR", "Erreur critique lors de l'initialisation des événements.", { error: error.message });
    }
}
