/* ==================================================================================== */
/*  FICHIER          : eventListener.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.4                                                             */
/*  DATE DE CRÉATION : 12/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 26/02/2025                                                      */
/*  DESCRIPTION      : Gestion des écouteurs d'événements pour la recherche et les    */
/*                     filtres interactifs.                                           */
/*                                                                                     */
/*  - Attache dynamiquement les écouteurs après génération des filtres.               */
/*  - Surveille le DOM pour s'assurer que les dropdowns existent avant de les écouter.*/
/*  - Gère les erreurs avec `logEvent()` pour assurer un suivi clair.                  */
/* ==================================================================================== */

import { logEvent, debounce } from "../utils/utils.js";
import domSelectors from "../config/domSelectors.js";
import { handleSearch, handleFilterChange } from "./eventHandler.js";
import { waitForElement } from "../config/domSelectors.js";


/* ====================================================================================
/*  INITIALISATION DES ÉCOUTEURS D'ÉVÉNEMENTS
/* ==================================================================================== */

/**
 * Initialise les écouteurs après que les filtres ont été générés.
 */
export function initEventListeners() {
    try {
        logEvent("info", "Initialisation des écouteurs d'événements...");

        // Attacher les événements de recherche
        attachSearchListeners(domSelectors.search);

        // Attendre la génération des filtres avant d'attacher les événements
        waitForFiltersToBeReady()
            .then(() => {
                attachFilterListeners();
                logEvent("success", " Écouteurs des filtres attachés avec succès.");
            })
            .catch(error => logEvent("error", " Erreur lors de l'initialisation des filtres.", { error: error.message }));
        
        logEvent("success", " Tous les écouteurs de recherche et filtres sont en cours d'attachement.");
    } catch (error) {
        logEvent("error", " Erreur critique lors de l'initialisation des événements.", { error: error.message });
    }
}

/* ====================================================================================
/*  OBSERVATION DU DOM POUR LES FILTRES
/* ==================================================================================== */

/**
 * Attend que les filtres soient générés dans le DOM avant d'attacher les écouteurs.
 * 
 * @returns {Promise<void>} Promesse résolue lorsque les filtres existent dans le DOM.
 */
function waitForFiltersToBeReady() {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(() => {
            const ingredients = document.querySelector("#ingredient-list");
            const appliances = document.querySelector("#appliance-list");
            const ustensils = document.querySelector("#ustensil-list");

            if (ingredients && appliances && ustensils) {
                observer.disconnect(); // Arrête l'observation
                resolve();
            }
        });

        // Observe les mutations dans le conteneur des filtres
        const filtersContainer = document.querySelector("#filters");
        if (filtersContainer) {
            observer.observe(filtersContainer, { childList: true, subtree: true });
        } else {
            reject(new Error("Impossible de trouver le conteneur des filtres dans le DOM."));
        }
    });
}

/* ====================================================================================
/*  BARRE DE RECHERCHE
/* ==================================================================================== */

/**
 * Attache les écouteurs d'événements à la barre de recherche.
 *
 * - Attache un événement `input` sur le champ de recherche pour une recherche dynamique.
 * - Empêche le rechargement de la page lors de la soumission du formulaire.
 * - L'événement `submit` sur le formulaire déclenche la recherche.
 *
 * @param {Object} searchSelectors - Sélecteurs DOM de la barre de recherche.
 */
export async function attachSearchListeners(searchSelectors) {
    try {
        logEvent("info", "attachSearchListeners : Vérification des éléments DOM...");

        // Attente des éléments s'ils sont chargés dynamiquement
        const form = searchSelectors.form || await waitForElement(".search-bar");
        const input = searchSelectors.input || await waitForElement("#search");

        if (!form || !input) {
            throw new Error("attachSearchListeners : Élément(s) de la recherche introuvable(s).");
        }

        logEvent("success", "✅ attachSearchListeners : Éléments de la recherche trouvés, attachement des écouteurs...");

        // Attache l'événement `input` pour exécuter la recherche au fil de la saisie
        input.addEventListener("input", debounce(handleSearch, 300));

        // Empêche le rechargement de la page et déclenche la recherche lors du `submit`
        form.addEventListener("submit", event => {
            event.preventDefault();
            handleSearch();
        });

        logEvent("success", "✅ attachSearchListeners : Écouteurs attachés à la barre de recherche.");
    } catch (error) {
        logEvent("error", "🚨 attachSearchListeners : Erreur lors de l'ajout des écouteurs.", { error: error.message });
    }
}


/* ====================================================================================
/*  FILTRES DE SÉLECTION
/* ==================================================================================== */

/**
 * Ajoute les écouteurs pour les filtres de sélection **après leur génération**.
 */
export function attachFilterListeners() {
    try {
        logEvent("info", "🔄 Attachement des écouteurs aux filtres...");

        // Boucle sur chaque type de filtre
        ["ingredients", "appliances", "ustensils"].forEach(filterType => {
            try {
                // Sélectionne directement les éléments du DOM
                const dropdown = document.querySelector(`#${filterType}-list`);
                const button = document.querySelector(`[data-filter="${filterType}"]`);

                if (!button || !dropdown) {
                    throw new Error(`attachFilterListeners : Élément(s) manquant(s) pour "${filterType}".`);
                }

                logEvent("success", `✅ Filtre "${filterType}" trouvé.`);

                // Gestion des événements pour afficher/masquer le dropdown
                button.addEventListener("click", () => toggleDropdown(dropdown));

                // Gestion des événements pour la sélection dans la liste des filtres
                dropdown.addEventListener("click", event => handleFilterChange(event));

            } catch (error) {
                logEvent("error", `attachFilterListeners : Problème avec "${filterType}".`, { error: error.message });
            }
        });

        logEvent("test_end", "🎯 Tous les écouteurs de filtres attachés avec succès.");

    } catch (error) {
        logEvent("critical", "attachFilterListeners : Erreur critique.", { error: error.message });
    }
}

/**
 * Affiche ou masque un dropdown.
 *
 * - Ferme tous les autres dropdowns avant d'afficher celui sélectionné.
 * - Ajoute ou retire la classe `hidden` pour basculer l'affichage.
 */
function toggleDropdown(dropdown) {
    try {
        document.querySelectorAll(".filter-dropdown").forEach(drop => {
            if (drop !== dropdown) {
                drop.classList.add("hidden");
            }
        });

        dropdown.classList.toggle("hidden");
        logEvent("info", `📂 toggleDropdown : Affichage du dropdown.`);

    } catch (error) {
        logEvent("error", "toggleDropdown : Erreur lors de l'affichage du dropdown.", { error: error.message });
    }
}
