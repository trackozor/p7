/* ====================================================================================
/*  FICHIER          : filterManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 1.1
/*  DESCRIPTION      : Gère la logique des filtres, la mise à jour dynamique des options
/*                    et l'affichage des recettes en fonction des filtres sélectionnés.
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import { fetchFilterOptions, searchRecipes, clearSearchCache } from "../data/dataManager.js";
import {  logEvent, waitForElement } from "../utils/utils.js";

/* ====================================================================================
/*                            VARIABLES GLOBALES ET ÉTAT DES FILTRES
/* ==================================================================================== */

let activeFilters = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set()
};

const filterContainers = {}; // Stocke les éléments DOM des dropdowns

/* ====================================================================================
/*                               INITIALISATION DES FILTRES
/* ==================================================================================== */


export async function initFilters() {
    try {
        logEvent("info", "Initialisation des filtres...");

        // Assurer que le conteneur existe bien dans le DOM
        const filtersContainer = await waitForElement("#filters", 3000);

        if (!filtersContainer) {
            logEvent("error", "initFilters : Le conteneur des filtres est introuvable.");
            return;
        }

        // Récupérer les données des filtres
        const filterData = await fetchFilterOptions();

        if (!filterData || !filterData.ingredients || !filterData.appliances || !filterData.ustensils) {
            logEvent("error", "initFilters : Données de filtres invalides ou absentes.");
            return;
        }

        // Définition des types de filtres
        const filterTypes = [
            { title: "Ingrédients", type: "ingredients", data: filterData.ingredients },
            { title: "Appareils", type: "appliances", data: filterData.appliances },
            { title: "Ustensiles", type: "ustensils", data: filterData.ustensils }
        ];

        // Nettoyer le conteneur des filtres avant d'ajouter de nouveaux éléments
        filtersContainer.innerHTML = "";

        // Utilisation d'un fragment pour améliorer les performances
        const fragment = document.createDocumentFragment();

        // Création et ajout des dropdowns dans le fragment
        filterTypes.forEach(({ title, type, data }) => {
            const dropdown = createFilterSection(title, type, new Set(data));
            fragment.appendChild(dropdown);
        });

        // Ajout final des filtres au DOM
        filtersContainer.appendChild(fragment);

        logEvent("success", "initFilters : Filtres générés avec succès.");
    } catch (error) {
        logEvent("error", "initFilters : Erreur lors de l'initialisation des filtres.", { error: error.message });
    }
}

/* ====================================================================================
/*                           GESTION DES SÉLECTIONS DANS LES DROPDOWNS
/* ==================================================================================== */

export function handleFilterSelection(filterType, filterValue) {
    if (!filterType || !filterValue) {
        logEvent("error", "handleFilterSelection : Paramètres invalides.");
        return;
    }

    activeFilters[filterType].add(filterValue);

    updateTagDisplay();
    updateFilters();
    updateRecipeDisplay();
}

export function removeTag(filterType, filterValue) {
    if (!filterType || !filterValue) {
        logEvent("error", "removeTag : Paramètres invalides.");
        return;
    }

    activeFilters[filterType].delete(filterValue);
    updateTagDisplay();
    updateFilters();
    updateRecipeDisplay();
}

function updateTagDisplay() {
    const tagsContainer = document.getElementById("selected-filters");

    if (!tagsContainer) {
        logEvent("error", "updateTagDisplay : Le conteneur des tags est introuvable.");
        return;
    }

    tagsContainer.innerHTML = "";

    Object.keys(activeFilters).forEach(filterType => {
        activeFilters[filterType].forEach(filterValue => {
            const tagElement = document.createElement("span");
            tagElement.classList.add("filter-tag");
            tagElement.textContent = filterValue;
            tagElement.dataset.filterType = filterType;

            const removeIcon = document.createElement("i");
            removeIcon.classList.add("fas", "fa-times");
            removeIcon.addEventListener("click", () => removeTag(filterType, filterValue));

            tagElement.appendChild(removeIcon);
            tagsContainer.appendChild(tagElement);
        });
    });

    logEvent("info", "updateTagDisplay : Tags mis à jour.");
}

/* ====================================================================================
/*                  MISE À JOUR DES DROPDOWNS EN FONCTION DES SÉLECTIONS
/* ==================================================================================== */

export function updateFilters() {
    logEvent("info", "Mise à jour des autres dropdowns...");
    const filteredRecipes = searchRecipes([
        ...Array.from(activeFilters.ingredients),
        ...Array.from(activeFilters.appliances),
        ...Array.from(activeFilters.ustensils)
    ]);

    const newFilterData = {
        ingredients: new Set(),
        appliances: new Set(),
        ustensils: new Set()
    };

    filteredRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => newFilterData.ingredients.add(ing.ingredient));
        newFilterData.appliances.add(recipe.appliance);
        recipe.ustensils.forEach(ust => newFilterData.ustensils.add(ust));
    });

    Object.keys(filterContainers).forEach(filterType => {
        const dropdownList = filterContainers[filterType].querySelector("ul");
        if (!dropdownList) {
          return;
        }

        dropdownList.innerHTML = "";
        newFilterData[filterType].forEach(option => {
            const listItem = document.createElement("li");
            listItem.classList.add("filter-option");
            listItem.textContent = option;
            listItem.dataset.filter = filterType;
            dropdownList.appendChild(listItem);
        });
    });

    logEvent("success", "updateFilters : Mise à jour terminée.");
}

/* ====================================================================================
/*                   RÉINITIALISATION ET MISE À JOUR DES RECETTES
/* ==================================================================================== */

export function resetFilters() {
    activeFilters = {
        ingredients: new Set(),
        appliances: new Set(),
        ustensils: new Set()
    };
    updateTagDisplay();
    updateFilters();
    updateRecipeDisplay();
    clearSearchCache();
    logEvent("success", "resetFilters : Tous les filtres ont été réinitialisés.");
}

export function updateRecipeDisplay() {
    const filteredRecipes = searchRecipes([
        ...Array.from(activeFilters.ingredients),
        ...Array.from(activeFilters.appliances),
        ...Array.from(activeFilters.ustensils)
    ]);
    const recipeContainer = document.getElementById("recipes");

    if (!recipeContainer) {
        logEvent("error", "updateRecipeDisplay : Conteneur des recettes introuvable.");
        return;
    }

    recipeContainer.innerHTML = filteredRecipes.length ? filteredRecipes.map(recipe => `
        <div class="recipe-card">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
        </div>
    `).join("") : "<p>Aucune recette trouvée.</p>";

    logEvent("info", `updateRecipeDisplay : ${filteredRecipes.length} recettes affichées.`);
}
