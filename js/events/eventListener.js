/* ==================================================================================== */
/*  FICHIER          : eventListener.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                             */
/*  DATE DE CRÉATION : 12/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 12/02/2025                                                      */
/*  DESCRIPTION      : Gestion des écouteurs d'événements pour la recherche et les    */
/*                     filtres interactifs.                                           */
/*                                                                                     */
/*  - Initialise les événements pour la barre de recherche et les filtres.            */
/*  - Vérifie l'existence des éléments avant d'attacher les événements.               */
/*  - Gère les erreurs avec `logEvent()` pour assurer un suivi clair.                  */
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";
import domSelectors from "../config/domSelectors.js";
import { handleSearch, handleFilterChange } from "./eventHandler.js";

/*------------------------------------------------------------------
/*   Initialisation des écouteurs d'événements
/*------------------------------------------------------------------*/

/**
 * Initialise les écouteurs d'événements pour la recherche et les filtres.
 *
 * - Attache les événements sur la barre de recherche et les filtres.
 * - Vérifie si les éléments DOM existent avant d'ajouter les événements.
 * - Gère les erreurs avec `logEvent()` pour suivre l'état des écouteurs.
 */
export function initEventListeners() {
    try {
        const selectors = domSelectors();

        logEvent("info", "Initialisation des écouteurs d'événements...");

        // Ajout des écouteurs pour la barre de recherche
        attachSearchListeners(selectors.search);

        // Ajout des écouteurs pour les filtres
        attachFilterListeners(selectors.filterDropdowns);

        logEvent("success", "Tous les écouteurs d'événements ont été attachés avec succès.");
    } catch (error) {
        logEvent("error", "Erreur critique lors de l'initialisation des événements.", { error: error.message });
    }
}
/*----------------------------------------------------------------
/*   Barre de recherche
/*----------------------------------------------------------------*/

/**
 * Ajoute les écouteurs pour la barre de recherche.
 *
 * - Attache l'événement `input` pour la recherche dynamique.
 * - Empêche le rechargement de la page lors de la soumission du formulaire.
 *
 * @param {Object} searchSelectors - Sélecteurs DOM de la barre de recherche.
 */
function attachSearchListeners(searchSelectors) {
    try {
        if (!searchSelectors || !searchSelectors.input || !searchSelectors.form) {
            logEvent("error", "Impossible de trouver les éléments de recherche.", { searchSelectors });
            return;
        }

        searchSelectors.input.addEventListener("input", handleSearch);
        searchSelectors.form.addEventListener("submit", (event) => {
            event.preventDefault();
            handleSearch();
        });

        logEvent("success", "Écouteurs attachés à la barre de recherche.");
    } catch (error) {
        logEvent("error", "Erreur lors de l'ajout des écouteurs à la barre de recherche.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Filtres de sélection
/*----------------------------------------------------------------*/

/**
 * Ajoute les écouteurs pour les filtres de sélection.
 *
 * - Attache l'événement `change` aux filtres disponibles.
 * - Vérifie l'existence de chaque filtre avant d'ajouter un écouteur.
 *
 * @param {Object} filterSelectors - Sélecteurs DOM des filtres.
 */
function attachFilterListeners(filterSelectors) {
    try {
        if (!filterSelectors) {
            logEvent("error", "Impossible de trouver les filtres de sélection.", { filterSelectors });
            return;
        }

        const { ingredientDropdown, applianceDropdown, ustensilDropdown } = filterSelectors;

        if (ingredientDropdown) {
            ingredientDropdown.addEventListener("change", handleFilterChange);
            logEvent("info", "Écouteur attaché au filtre des ingrédients.");
        } else {
            logEvent("warning", "Filtre des ingrédients introuvable, écouteur non ajouté.");
        }

        if (applianceDropdown) {
            applianceDropdown.addEventListener("change", handleFilterChange);
            logEvent("info", "Écouteur attaché au filtre des appareils.");
        } else {
            logEvent("warning", "Filtre des appareils introuvable, écouteur non ajouté.");
        }

        if (ustensilDropdown) {
            ustensilDropdown.addEventListener("change", handleFilterChange);
            logEvent("info", "Écouteur attaché au filtre des ustensiles.");
        } else {
            logEvent("warning", "Filtre des ustensiles introuvable, écouteur non ajouté.");
        }
    } catch (error) {
        logEvent("error", "Erreur lors de l'ajout des écouteurs aux filtres.", { error: error.message });
    }
}
