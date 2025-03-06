/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DESCRIPTION      : Gère les filtres et l'affichage dynamique des recettes.         */
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import { fetchFilterOptions } from "../data/dataManager.js";
import { logEvent, waitForElement } from "../utils/utils.js";
import { removeTag , handleFilterSelection} from "../events/eventHandler.js"
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
 * Charge les options des filtres et les insère dynamiquement dans le DOM.
 */
export async function initFilters() {
    try {
        logEvent("test_start_filter", "initFilters : Initialisation des filtres...");

        const filtersContainer = await waitForElement("#filters .filter-dropdowns", 3000);
        if (!filtersContainer) {
            logEvent("error", "initFilters : Conteneur des filtres introuvable.");
            return;
        }

        const filterData = fetchFilterOptions();
        if (!filterData || Object.values(filterData).every(arr => arr.length === 0)) {
            logEvent("warn", "initFilters : Aucun filtre disponible.");
            return;
        }

        filtersContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        Object.entries(filterData).forEach(([filterType, values]) => {
            if (values.length > 0) {
                fragment.appendChild(createFilterSection(
                    filterType.charAt(0).toUpperCase() + filterType.slice(1),
                    filterType,
                    new Set(values)
                ));
            }
        });

        filtersContainer.appendChild(fragment);
        logEvent("success", "initFilters : Filtres chargés avec succès.");
    } catch (error) {
        logEvent("error", "initFilters : Erreur", { error: error.message });
    }
}


/**
 * Supprime une option du dropdown une fois sélectionnée.
 */
export function removeSelectedOption(filterType, filterValue) {
    const dropdown = document.querySelector(`#${filterType} ul`);
    if (!dropdown) {
        return;
    }

    const option = [...dropdown.children].find(li => li.textContent === filterValue);
    if (option) {
        option.remove();
    }
}

/**
 * Réintroduit une option dans le dropdown après suppression d'un tag.
 */
export function restoreRemovedOption(filterType, filterValue) {
    const dropdown = document.querySelector(`#${filterType} ul`);
    if (!dropdown) {
        return;
    }

    const li = document.createElement("li");
    li.classList.add("filter-option");
    li.textContent = filterValue;
    li.addEventListener("click", () => handleFilterSelection(filterType, filterValue));

    dropdown.appendChild(li);
}

/* ==================================================================================== */
/*  MISE À JOUR DES TAGS ET DROPDOWNS                                                  */
/* ==================================================================================== */
export function updateTagDisplay() {
    try {
        const tagsContainer = document.querySelector("#selected-filters");
        if (!tagsContainer) {
            return;
        }

        tagsContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                const tagElement = document.createElement("span");
                tagElement.classList.add("filter-tag");
                tagElement.textContent = filterValue;
                tagElement.dataset.filterType = filterType;

                const removeIcon = document.createElement("i");
                removeIcon.classList.add("fas", "fa-times");
                removeIcon.setAttribute("role", "button");
                removeIcon.addEventListener("click", () => removeTag(filterType, filterValue));

                tagElement.appendChild(removeIcon);
                fragment.appendChild(tagElement);
            });
        });

        tagsContainer.appendChild(fragment);
    } catch (error) {
        logEvent("error", "updateTagDisplay : Erreur lors de la mise à jour des tags.", { error: error.message });
    }
}

/**
 * Met à jour dynamiquement les options des dropdowns.
 */
export function updateFilters(filteredRecipes = []) {
    try {
        const newFilterData = { ingredients: new Set(), appliances: new Set(), ustensils: new Set() };

        filteredRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => newFilterData.ingredients.add(ing.ingredient));
            newFilterData.appliances.add(recipe.appliance);
            recipe.ustensils.forEach(ust => newFilterData.ustensils.add(ust));
        });

        Object.entries(filterContainers).forEach(([filterType, container]) => {
            const dropdownList = container?.querySelector("ul");

            if (!dropdownList) {
                return;
            }

            dropdownList.innerHTML = "";
            const fragment = document.createDocumentFragment();

            [...newFilterData[filterType]]
                .sort((a, b) => a.localeCompare(b))
                .forEach(option => {
                    const li = document.createElement("li");
                    li.classList.add("filter-option");
                    li.textContent = option;
                    li.addEventListener("click", () => handleFilterSelection(filterType, option));
                    fragment.appendChild(li);
                });

            dropdownList.appendChild(fragment);
        });

        logEvent("success", "updateFiltersDropdown : Mise à jour des dropdowns terminée.");
    } catch (error) {
        logEvent("error", "updateFiltersDropdown : Erreur lors de la mise à jour des options.", { error: error.message });
    }
}
