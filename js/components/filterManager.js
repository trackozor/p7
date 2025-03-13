/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DESCRIPTION      : Gère les filtres et l'affichage dynamique des recettes.         */
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import { fetchFilterOptions } from "../data/dataManager.js";
import { logEvent, waitForElement, removeDuplicates } from "../utils/utils.js";
import { removeSelectedOption, restoreRemovedOption } from "./dropdownManager.js";
import { normalizeText } from "../utils/normalize.js";
import { handleFilterSelection } from "../events/eventHandler.js";

/* ==================================================================================== */
/*  VARIABLES GLOBALES ET ÉTAT DES FILTRES                                             */
/* ==================================================================================== */

export let activeFilters = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set()
};


const filterContainers = {}; // Stocke les éléments DOM des dropdowns

/* ==================================================================================== */
/*  INITIALISATION DES FILTRES                                                         */
/* ==================================================================================== */
/**
 * Initialise les filtres de recherche et les insère dans le DOM.
 *
 * - Attend la disponibilité du conteneur des filtres avant d'agir.
 * - Récupère les options de filtres via `fetchFilterOptions()`.
 * - Supprime les doublons en utilisant `removeDuplicates()`.
 * - Normalise les noms de filtres avec `normalizeText()`.
 * - Génère dynamiquement les sections de filtres avec `createFilterSection()`.
 * - Insère les sections filtrées dans le DOM.
 * - Journalise chaque étape pour faciliter le débogage.
 *
 * @async
 * @returns {Promise<void>} Ne retourne rien mais met à jour l'affichage des filtres dans le DOM.
 */
export async function initFilters() {
    // Enregistre le début de l'initialisation des filtres pour le suivi
    logEvent("test_start_filter", "Init des filtres...");

    // Attend la présence du conteneur des filtres dans le DOM
    const filtersContainer = await waitForElement("#filters .filter-dropdowns", 3000);
    if (!filtersContainer) {
        logEvent("error", "Aucun conteneur de filtres trouvé.");
        return;
    }

    // Récupération des options de filtres (ingrédients, appareils, ustensiles)
    const rawData = fetchFilterOptions();
    if (!rawData || Object.values(rawData).every(arr => arr.length === 0)) {
        logEvent("warn", "Aucun filtre disponible.");
        return;
    }

    // Suppression des doublons dans les filtres
    const filterData = removeDuplicates(rawData);
    
    // Vide le conteneur des filtres avant d'insérer de nouvelles options
    filtersContainer.innerHTML = "";

    // Création d'un fragment pour optimiser les manipulations DOM
    const fragment = document.createDocumentFragment();

    // Boucle sur chaque catégorie de filtres (ingrédients, appareils, ustensiles)
    Object.entries(filterData).forEach(([type, values]) => {
        if (values.size) {
            // Utilisation de normalizeText() au lieu de capitalize()
            fragment.appendChild(createFilterSection(normalizeText(type), type, values));
        }
    });

    // Insère les sections filtrées dans le conteneur principal des filtres
    filtersContainer.appendChild(fragment);

    // Journalisation de la fin de l'initialisation des filtres
    logEvent("success", "Filtres chargés.");
}

/** ====================================================================================
 *  MISE À JOUR DES FILTRES
 * ==================================================================================== */
/**
 * Met à jour dynamiquement les options des dropdowns en fonction des recettes filtrées.
 *
 * - Récupère les nouvelles options disponibles après filtrage des recettes.
 * - Supprime les options qui ne sont plus pertinentes.
 * - Met à jour dynamiquement les dropdowns dans le DOM.
 * - Appelle `removeSelectedOption` pour exclure les options déjà sélectionnées.
 * - Appelle `restoreRemovedOption` pour réintégrer les options supprimées si nécessaire.
 *
 * @param {Array} filteredRecipes - Liste des recettes filtrées.
 */
export function updateFilters(filteredRecipes = []) {
    try {
        // Création d'un objet contenant des ensembles pour stocker les nouvelles options
        const newFilterData = {
            ingredients: new Set(),
            appliances: new Set(),
            ustensils: new Set()
        };

        // Parcourt les recettes filtrées pour extraire les options valides
        filteredRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => newFilterData.ingredients.add(ing.ingredient));
            newFilterData.appliances.add(recipe.appliance);
            recipe.ustensils.forEach(ust => newFilterData.ustensils.add(ust));
        });

        // Mise à jour des dropdowns dans le DOM
        Object.entries(filterContainers).forEach(([filterType, container]) => {
            const dropdownList = container?.querySelector("ul");

            // Vérifie si la liste du dropdown est disponible
            if (!dropdownList) {
                return;
            }

            // Nettoie la liste actuelle du dropdown
            dropdownList.innerHTML = "";
            const fragment = document.createDocumentFragment();

            // Trie et ajoute les nouvelles options dans le dropdown
            [...newFilterData[filterType]]
                .sort((a, b) => a.localeCompare(b))
                .forEach(option => {
                    const li = document.createElement("li");
                    li.classList.add("filter-option");
                    li.textContent = option;

                    // Ajoute un événement de sélection pour chaque option
                    li.addEventListener("click", () => {
                        handleFilterSelection(filterType, option);
                        removeSelectedOption(filterType, option); // Supprime l'option une fois sélectionnée
                    });

                    fragment.appendChild(li);
                });

            // Insère les nouvelles options dans le dropdown
            dropdownList.appendChild(fragment);
        });

        // Réintégrer les options supprimées si elles ne sont plus sélectionnées
        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                restoreRemovedOption(filterType, filterValue);
            });
        });

        logEvent("success", "updateFiltersDropdown : Mise à jour des dropdowns terminée.");
    } catch (error) {
        logEvent("error", "updateFiltersDropdown : Erreur lors de la mise à jour des options.", { error: error.message });
    }
}






