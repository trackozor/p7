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
import { safeQuerySelector } from "../config/domSelectors.js";

let recipeCounts ={};
export let filters = {};

/* ====================================================================================
/*  SCROLL INFINI POUR LES DROPDOWNS
/* ==================================================================================== */

/**
 * Attache le scroll infini aux listes des filtres.
 * - Charge dynamiquement des éléments lorsqu'on atteint le bas de la liste.
 * - Empêche le chargement si tous les éléments sont déjà affichés.
 * - Utilise un `threshold` pour ne pas charger trop tôt.
 */
export function attachScrollEvents() {
    const threshold = 20; // Pixels avant d'atteindre le bas de la liste pour déclencher le chargement

    ["ingredients", "appliances", "utensils"].forEach(filterType => {
        const listContainer = safeQuerySelector(`#${filterType}-list`);
        if (!listContainer) {
            return;
        }

        listContainer.addEventListener("scroll", debounce(() => {
            if (listContainer.scrollTop + listContainer.clientHeight >= listContainer.scrollHeight - threshold) {
                loadMoreItems(filterType);
            }
        }, 150));
    });

    logEvent("info", "Événements de scroll infini attachés aux filtres.");
}

/**
 * Charge dynamiquement plus d'éléments dans un dropdown lorsqu'on scrolle.
 * - Récupère les nouveaux éléments depuis `recipeCounts`.
 * - Ajoute progressivement des éléments sans effacer ceux existants.
 *
 * @param {string} filterType - Type de filtre (`ingredients`, `appliances`, `utensils`).
 */
function loadMoreItems(filterType) {
    const listContainer = safeQuerySelector(`#${filterType}-list`);
    if (!listContainer) {
        return;
    }

    const currentItems = listContainer.children.length;
    const totalItems = Object.keys(recipeCounts[filterType]).length;

    if (currentItems >= totalItems) {
        return;
    } // Arrête le chargement si tous les éléments sont affichés

    const additionalItems = Object.entries(recipeCounts[filterType]).slice(currentItems, currentItems + 5);

    additionalItems.forEach(([key, count]) => {
        const listItem = document.createElement("li");
        listItem.classList.add("filter-option");
        listItem.textContent = `${key} (${count})`;
        listContainer.appendChild(listItem);
    });

    logEvent("success", `Chargement de ${additionalItems.length} nouveaux éléments dans ${filterType}`);
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
        attachFilterListeners(filters);

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
        logEvent("info", "attachFilterListeners : Démarrage de l'attachement des écouteurs aux filtres.");

        // Vérification initiale des paramètres
        if (!filters || typeof filters !== "object") {
            logEvent("error", "attachFilterListeners : Paramètre `filters` invalide ou non défini.");
            throw new Error("attachFilterListeners : `filters` doit être un objet contenant les filtres.");
        }

        // Boucle sur les types de filtres
        ["ingredients", "appliances", "ustensils"].forEach(filterType => {
            try {
                // Vérification que le filtre existe dans l'objet `filters`
                if (!filters[filterType]) {
                    logEvent("error", `attachFilterListeners : Filtre "${filterType}" introuvable.`);
                    throw new Error(`attachFilterListeners : Filtre "${filterType}" non défini.`);
                }

                const { button, dropdown, list } = filters[filterType];

                // Vérification que chaque élément est bien défini
                if (!button || !dropdown || !list) {
                    logEvent("error", `attachFilterListeners : Élément(s) manquant(s) pour "${filterType}".`, { button, dropdown, list });
                    throw new Error(`attachFilterListeners : Bouton, dropdown ou liste non trouvé(s) pour "${filterType}".`);
                }

                logEvent("success", `attachFilterListeners : Vérifications complètes pour "${filterType}".`);

                // Gestion des événements pour afficher/masquer le dropdown
                button.addEventListener("click", () => {
                    try {
                        toggleDropdown(dropdown);
                        logEvent("success", `attachFilterListeners : Dropdown "${filterType}" ouvert/fermé.`);
                    } catch (error) {
                        logEvent("error", `attachFilterListeners : Erreur lors de l'ouverture du dropdown "${filterType}".`, { error: error.message });
                    }
                });

                // Gestion de la sélection d'un élément dans la liste des filtres
                list.addEventListener("click", (event) => {
                    try {
                        handleFilterChange(event);
                        logEvent("success", `attachFilterListeners : Sélection de "${event.target.textContent}" dans "${filterType}".`);
                    } catch (error) {
                        logEvent("error", `attachFilterListeners : Erreur lors de la sélection dans la liste "${filterType}".`, { error: error.message });
                    }
                });

                logEvent("info", `attachFilterListeners : Écouteurs attachés pour "${filterType}".`);

            } catch (error) {
                logEvent("critical", `attachFilterListeners : Problème rencontré avec "${filterType}".`, { error: error.message });
            }
        });

        logEvent("test_end", "attachFilterListeners : Tous les écouteurs ont été attachés avec succès.");

    } catch (error) {
        logEvent("critical", "attachFilterListeners : Erreur critique lors de l'ajout des écouteurs.", { error: error.message });
    }
}

