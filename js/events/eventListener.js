/* ==================================================================================== */
/*  FICHIER          : eventListeners.js                                               */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.1                                                             */
/*  DERNIÈRE MODIF.  : 10/02/2025                                                      */
/*  DESCRIPTION      : Attache les écouteurs d'événements aux éléments du DOM.         */
/*                     Gère les interactions avec la barre de recherche et les filtres. */
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";  // Import de la fonction de logs
import domSelectors from "../config/domSelectors.js"; // Import des sélecteurs DOM
import { handleSearch, handleFilterChange } from "./eventHandler.js"; // Gestionnaires d'événements

/**
 * Initialise les écouteurs d'événements sur les éléments de la page.
 * Attache les handlers pour la recherche et les filtres.
 */
export function initEventListeners() {
    try {
        // Récupération des éléments DOM
        const selectors = domSelectors();

        logEvent("INFO", "🔄 Initialisation des écouteurs d'événements...");

        /* ================================================================================ 
            🔍 ÉCOUTEURS DE LA BARRE DE RECHERCHE
        ================================================================================ */

        if (selectors.search.input && selectors.search.form) {
            selectors.search.input.addEventListener("input", handleSearch);
            selectors.search.form.addEventListener("submit", (event) => {
                event.preventDefault(); // Empêche le rechargement de la page
                handleSearch();
            });
            logEvent("SUCCESS", "✅ Écouteurs attachés à la barre de recherche.");
        } else {
            logEvent("ERROR", "❌ Impossible de trouver les éléments de recherche.", { selectors });
        }

        /* ================================================================================ 
            🎛️ ÉCOUTEURS DES FILTRES DYNAMIQUES
        ================================================================================ */

        if (selectors.filterDropdowns) {
            const { ingredientDropdown, applianceDropdown, ustensilDropdown } = selectors.filterDropdowns;

            // Vérification et ajout des écouteurs sur chaque filtre
            if (ingredientDropdown) {
                ingredientDropdown.addEventListener("change", handleFilterChange);
                logEvent("SUCCESS", "✅ Écouteur ajouté au filtre 'Ingrédients'.");
            } else {
                logEvent("ERROR", "⚠️ Élément DOM 'ingredientDropdown' introuvable.");
            }

            if (applianceDropdown) {
                applianceDropdown.addEventListener("change", handleFilterChange);
                logEvent("SUCCESS", "✅ Écouteur ajouté au filtre 'Appareils'.");
            } else {
                logEvent("ERROR", "⚠️ Élément DOM 'applianceDropdown' introuvable.");
            }

            if (ustensilDropdown) {
                ustensilDropdown.addEventListener("change", handleFilterChange);
                logEvent("SUCCESS", "✅ Écouteur ajouté au filtre 'Ustensiles'.");
            } else {
                logEvent("ERROR", "⚠️ Élément DOM 'ustensilDropdown' introuvable.");
            }

        } else {
            logEvent("ERROR", "❌ Impossible de récupérer les filtres dropdowns.", { selectors });
        }

        logEvent("SUCCESS", "🎉 Tous les écouteurs d'événements sont attachés avec succès.");
        
    } catch (error) {
        logEvent("ERROR", "🚨 Erreur critique lors de l'initialisation des écouteurs d'événements.", { error: error.message });
    }
}
