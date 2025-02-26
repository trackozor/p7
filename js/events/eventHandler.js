/* ==================================================================================== */
/*  FICHIER          : eventHandler.js                                                 */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.4                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 25/02/2025                                                       */
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes */
/*                     - Recherche dynamique des recettes.                             */
/*                     - Filtrage des résultats par ingrédients, ustensiles, appareils.*/
/*                     - Mise à jour automatique des filtres dans l'interface.         */
/* ==================================================================================== */

import { searchRecipesLoopNative } from "../components/search/searchloopNative.js";
import { getAllRecipes, fetchFilterOptions } from "../data/dataManager.js";
import domSelectors from "../config/domSelectors.js";
import { logEvent } from "../utils/utils.js";


/* ================================================================================ 
    GESTION DE L'ÉVÉNEMENT DE RECHERCHE 
================================================================================ */

/**
 * Gère la recherche de recettes lorsqu'un utilisateur saisit du texte.
 */
export async function handleSearch() {
    try {
        if (!domSelectors || !domSelectors.search || !domSelectors.search.input) {
            logEvent("error", "handleSearch : Élément input de recherche introuvable.");
            return;
        }

        const searchInput = domSelectors.search.input;
        const query = searchInput.value.trim();

               if (query.length < 3) {
            logEvent("info", "handleSearch : Recherche ignorée (moins de 3 caractères).");
            return;
        }

        logEvent("info", `handleSearch : Recherche en cours pour "${query}"...`);
        const results = await searchRecipesLoopNative(query);

        if (!Array.isArray(results)) {
            logEvent("error", "handleSearch : Résultat de recherche invalide.", { results });
            return;
        }

        displayResults(results);
        logEvent("success", `handleSearch : ${results.length} résultats trouvés.`);
    } catch (error) {
        logEvent("error", "handleSearch : Erreur lors de la recherche.", { error: error.message });
    }
}

/* ================================================================================ 
    GESTION DES FILTRES 
================================================================================ */

/**
 * Gère les changements dans les menus déroulants de filtres.
 */
export async function handleFilterChange(event) {
    try {
        if (!event || !event.target) {
            logEvent("error", "handleFilterChange : Événement ou cible invalide.");
            return;
        }

        const { filterType } = event.target.dataset;
        const selectedValue = event.target.value.trim();

        logEvent("info", `handleFilterChange : Filtre appliqué - ${filterType} = ${selectedValue}`);

        const recipes = getAllRecipes();
        const filteredRecipes = filterRecipesByType(recipes, filterType, selectedValue);

        displayResults(filteredRecipes);
        logEvent("success", `handleFilterChange : ${filteredRecipes.length} recettes affichées après filtrage.`);
    } catch (error) {
        logEvent("error", "handleFilterChange : Erreur lors du filtrage.", { error: error.message });
    }
}

/**
 * Récupère les recettes filtrées en fonction du type de filtre appliqué.
 */
function filterRecipesByType(recipes, filterType, selectedValue) {
    return recipes.filter(recipe => {
        switch (filterType) {
            case "ingredient":
                return recipe.ingredients.some(ing => ing.ingredient.includes(selectedValue));
            case "appliance":
                return recipe.appliance.includes(selectedValue);
            case "ustensil":
                return recipe.ustensils.some(ust => ust.includes(selectedValue));
            default:
                return true;
        }
    });
}

/* ================================================================================ 
    MISE À JOUR DES FILTRES DANS LE DOM 
================================================================================ */

/**
 * Remplit dynamiquement les listes de filtres avec les options disponibles.
 */
export async function populateFilters() {
    try {
        logEvent("info", "populateFilters : Chargement des options de filtres...");
        const filterData = await fetchFilterOptions();

        updateFilterList("#ingredient-list", filterData.ingredients);
        updateFilterList("#appliance-list", filterData.appliances);
        updateFilterList("#ustensil-list", filterData.ustensils);

        logEvent("success", "populateFilters : Filtres mis à jour avec succès.");
    } catch (error) {
        logEvent("error", "populateFilters : Erreur lors du chargement des filtres.", { error: error.message });
    }
}

/**
 * Met à jour dynamiquement une liste de filtres avec un affichage limité et un défilement.
 */
export async function updateFilterList(listId, options, maxVisible = 10) {
    try {
        const listElement = document.querySelector(listId);

        if (!listElement) {
            logEvent("error", `updateFilterList : Liste introuvable (${listId}).`);
            return;
        }

        listElement.innerHTML = "";
        const visibleItems = options.slice(0, maxVisible);
        visibleItems.forEach(option => {
            const listItem = document.createElement("li");
            listItem.textContent = option;
            listItem.classList.add("filter-option");
            listItem.addEventListener("click", (e) => handleFilterSelection(e, option));
            listElement.appendChild(listItem);
        });

        if (options.length > maxVisible) {
            const toggleButton = document.createElement("button");
            toggleButton.textContent = "Voir plus";
            toggleButton.addEventListener("click", () => {
                listElement.innerHTML = "";
                options.forEach(option => {
                    const listItem = document.createElement("li");
                    listItem.textContent = option;
                    listItem.classList.add("filter-option");
                    listItem.addEventListener("click", (e) => handleFilterSelection(e, option));
                    listElement.appendChild(listItem);
                });
                toggleButton.remove();
            });
            listElement.appendChild(toggleButton);
        }
    } catch (error) {
        logEvent("error", "updateFilterList : Erreur lors de la mise à jour de la liste.", { error: error.message });
    }
}

/**
 * Affiche les résultats des recettes filtrées.
 */
export function displayResults(recipes) {
    try {
        const resultsContainer = document.querySelector("#recipes-container");
        if (!resultsContainer) {
            logEvent("error", "displayResults : Conteneur de résultats introuvable.");
            return;
        }

        resultsContainer.innerHTML = "";
        recipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-card");
            recipeCard.innerHTML = `<h3>${recipe.name}</h3><p>${recipe.description}</p>`;
            resultsContainer.appendChild(recipeCard);
        });

        logEvent("success", `displayResults : ${recipes.length} recettes affichées.`);
    } catch (error) {
        logEvent("error", "displayResults : Erreur lors de l'affichage des résultats.", { error: error.message });
    }
}

/* ================================================================================ 
    LANCEMENT AUTOMATIQUE AU CHARGEMENT DU DOM 
================================================================================ */

document.addEventListener("DOMContentLoaded", populateFilters);




/**
 * Sélectionne une option de filtre et met à jour les résultats.
 */
export function handleFilterSelection(filterType, selectedValue) {
    logEvent("info", `handleFilterSelection : Sélection de filtre - ${filterType}: ${selectedValue}`);
    
    const recipes = getAllRecipes();
    const filteredRecipes = filterRecipesByType(recipes, filterType, selectedValue);

    displayResults(filteredRecipes);
}




/* ================================================================================ 
    LANCEMENT AUTOMATIQUE AU CHARGEMENT DU DOM 
================================================================================ */

document.addEventListener("DOMContentLoaded", populateFilters);

