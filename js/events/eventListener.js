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

import { logEvent, debounce } from "../utils/utils.js";
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
        const selectors = domSelectors;

        logEvent("info", "Initialisation des écouteurs d'événements...");

        // Ajout des écouteurs pour la barre de recherche
        attachSearchListeners(selectors.search);

        // Ajout des écouteurs pour les filtres
        attachFilterListeners(selectors.filters);

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
export function attachSearchListeners(searchSelectors) {
    try {
        // Vérification des sélecteurs
        if (!searchSelectors) {
            logEvent("error", "attachSearchListeners : Aucun sélecteur fourni.");
            return;
        }

        const { form, input, button } = searchSelectors;

        if (!form || !input || !button) {
            logEvent("error", "attachSearchListeners : Élément(s) de la recherche manquant(s).", { form, input, button });
            return;
        }

        // Attache l'événement uniquement sur l'input
        input.addEventListener("input", debounce(handleSearch, 300)); 

        // Empêche le rechargement de la page lors de la soumission du formulaire
        form.addEventListener("submit", event => {
            event.preventDefault();
            handleSearch();
        });

        // Écouteur sur le bouton de recherche
        button.addEventListener("submit", (event) => {
            event.preventDefault(); // Empêche l'action par défaut du bouton
            try {
                const query = input.value.trim();
                
                // Mode "benchmark"
                if (query === "/benchmark" || query === "!benchmark") {
                    logEvent("info", "Commande Benchmark détectée. Affichage de la modale.");
                    requestAdminAccess();
                } else {
                    logEvent("info", `Recherche normale déclenchée : ${query}`);
                    triggerNormalSearch(query);
                }
            } catch (error) {
                logEvent("error", "Erreur lors de la détection du mode Benchmark.", { error: error.message });
            }
        });

        logEvent("success", "attachSearchListeners : Écouteurs attachés à la barre de recherche.");
    } catch (error) {
        logEvent("error", "attachSearchListeners : Erreur lors de l'ajout des écouteurs.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Filtres de sélection
/*----------------------------------------------------------------*/

/**
 * Ajoute les écouteurs pour les filtres de sélection.
 *
 * - Attache un événement `click` pour ouvrir/fermer le dropdown.
 * - Vérifie l'existence de chaque filtre avant d'ajouter un écouteur.
 *
 * @param {Object} filterSelectors - Sélecteurs DOM des filtres.
 */
export function attachFilterListeners(filters) {
    try {
        // Vérification des sélecteurs
        if (!filters) {
            logEvent("error", "attachFilterListeners : Aucun sélecteur de filtre fourni.");
            return;
        }

        const { ingredients, appliances, utensils } = filters;

        if (!ingredients || !appliances || !utensils) {
            logEvent("error", "attachFilterListeners : Certains filtres sont manquants.", { ingredients, appliances, utensils });
            return;
        }

        // Ajout des événements d'ouverture/fermeture pour chaque dropdown
        if (ingredients.button && ingredients.dropdown) {
            ingredients.button.addEventListener("click", () => toggleDropdown(ingredients.dropdown));
            logEvent("info", "Écouteur attaché au bouton des ingrédients.");
        }

        if (appliances.button && appliances.dropdown) {
            appliances.button.addEventListener("click", () => toggleDropdown(appliances.dropdown));
            logEvent("info", "Écouteur attaché au bouton des appareils.");
        }

        if (utensils.button && utensils.dropdown) {
            utensils.button.addEventListener("click", () => toggleDropdown(utensils.dropdown));
            logEvent("info", "Écouteur attaché au bouton des ustensiles.");
        }

        // Ajout des événements de sélection dans les listes de filtres
        if (ingredients.list) {
            ingredients.list.addEventListener("click", handleFilterChange);
            logEvent("info", "Écouteur attaché à la liste des ingrédients.");
        }

        if (appliances.list) {
            appliances.list.addEventListener("click", handleFilterChange);
            logEvent("info", "Écouteur attaché à la liste des appareils.");
        }

        if (utensils.list) {
            utensils.list.addEventListener("click", handleFilterChange);
            logEvent("info", "Écouteur attaché à la liste des ustensiles.");
        }

        logEvent("success", "attachFilterListeners : Écouteurs attachés aux filtres.");
    } catch (error) {
        logEvent("error", "attachFilterListeners : Erreur lors de l'ajout des écouteurs.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Toggle Dropdown
/*----------------------------------------------------------------*/

/**
 * Affiche ou masque un dropdown.
 *
 * - Ferme tous les autres dropdowns avant d'afficher celui sélectionné.
 * - Ajoute ou retire la classe `hidden` pour basculer l'affichage.
 *
 * @param {HTMLElement} dropdown - Le dropdown à afficher ou masquer.
 */
function toggleDropdown(dropdown) {
    try {
        if (!dropdown) {
            logEvent("error", "toggleDropdown : Aucun dropdown fourni.");
            return;
        }

        // Masque tous les dropdowns ouverts
        document.querySelectorAll(".filter-dropdown").forEach(drop => {
            if (drop !== dropdown) {
                drop.classList.add("hidden");
            }
        });

        // Bascule l'affichage du dropdown sélectionné
        dropdown.classList.toggle("hidden");

        logEvent("info", `toggleDropdown : Affichage du dropdown ${dropdown.dataset.filter}.`);
    } catch (error) {
        logEvent("error", "toggleDropdown : Erreur lors de l'affichage du dropdown.", { error: error.message });
    }
}
