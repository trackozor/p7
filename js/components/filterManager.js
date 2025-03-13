/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DESCRIPTION      : Gère les filtres et l'affichage dynamique des recettes.         */
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import { fetchFilterOptions } from "../data/dataManager.js";
import { logEvent, waitForElement, removeDuplicates } from "../utils/utils.js";
import { removeTag , handleFilterSelection, handleResetButton } from "../events/eventHandler.js"
import { Search } from "./search/search.js";
import { safeQuerySelector } from "../config/domSelectors.js";
import { removeSelectedOption, restoreRemovedOption } from "./dropdownManager.js";
import { normalizeText } from "../utils/normalize.js";

/* ==================================================================================== */
/*  VARIABLES GLOBALES ET ÉTAT DES FILTRES                                             */
/* ==================================================================================== */
export let activeFilters = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set()
};
let displayedTags = new Map();
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

/* ==================================================================================== */
/*               GESTION DE LA RÉINITIALISATION DES FILTRES                            */
/* ==================================================================================== */
/**
 * Supprime tous les tags sélectionnés et met à jour l'affichage.
 */
export function resetAllTags() {
    logEvent("info", "resetAllTags : Suppression de tous les filtres actifs.");

    Object.keys(activeFilters).forEach(filterType => {
        activeFilters[filterType].clear();
    });

    updateTagDisplay();
    updateFilters();
    Search("", {}); // Relance la recherche sans filtre

    logEvent("success", "resetAllTags : Tous les filtres ont été supprimés.");
}

/* ==================================================================================== */
/*               GESTION DE L'AFFICHAGE DES TAGS                                        */
/* ==================================================================================== */
/**
 * Met à jour dynamiquement l'affichage des tags sous les dropdowns.
 * - Ne gère que l'affichage des tags (sans le bouton de réinitialisation).
 * - Appelle `handleResetButton()` si au moins 2 tags sont actifs.
 *
 * @returns {void} Ne retourne rien, met à jour l'affichage des tags dans le DOM.
 */
export function updateTagDisplay() {
    try {
        logEvent("info", "updateTagDisplay : Vérification et mise à jour des tags...");

        const tagsContainer = safeQuerySelector("#selected-filters");
        if (!tagsContainer) {
            logEvent("error", "updateTagDisplay : Conteneur des tags introuvable.");
            return;
        }

        const newTags = new Map();
        let totalTags = 0;

        //  Mise à jour du cache au lieu de tout supprimer
        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                const tagKey = `${filterType}-${filterValue}`;

                // Si le tag est déjà affiché, on le garde
                if (displayedTags.has(tagKey)) {
                    newTags.set(tagKey, displayedTags.get(tagKey));
                } else {
                    //  Création d'un nouveau tag
                    const tagElement = document.createElement("span");
                    tagElement.classList.add("filter-tag");
                    tagElement.textContent = filterValue;
                    tagElement.dataset.filterType = filterType;

                    //  Icône pour supprimer le tag
                    const removeIcon = document.createElement("i");
                    removeIcon.classList.add("fas", "fa-times");
                    removeIcon.setAttribute("role", "button");
                    removeIcon.addEventListener("click", () => {
                        removeTag(filterType, filterValue);
                        updateFilters(); // Mise à jour des dropdowns
                        updateTagDisplay(); // Rafraîchit l'affichage des tags
                    });

                    tagElement.appendChild(removeIcon);
                    newTags.set(tagKey, tagElement);
                }
                totalTags++;
            });
        });

        //  On vide uniquement ce qui doit être mis à jour (meilleure perf)
        tagsContainer.innerHTML = "";
        newTags.forEach(tag => tagsContainer.appendChild(tag));

        //  Gestion du bouton de réinitialisation dès 2 tags affichés
            handleResetButton(totalTags, tagsContainer);

        // Mise à jour du cache
        displayedTags = newTags;

        //  Lance la recherche avec les nouveaux filtres actifs
        Search("", activeFilters);

        logEvent("success", "updateTagDisplay : Tags mis à jour avec succès.");

    } catch (error) {
        logEvent("error", "updateTagDisplay : Erreur lors de la mise à jour des tags.", { error: error.message });
    }
}




