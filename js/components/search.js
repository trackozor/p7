import { logEvent } from "../utils/utils.js";
import { getAllRecipes } from "../data/dataManager.js";
import { normalizeText } from "../utils/normalize.js";

// Stockage des filtres sélectionnés
let selectedFilters = {
    ingredients: new Set(),
    ustensils: new Set(),
    appliances: new Set()
};

/**
 * Recherche avec une boucle `for` (corrigée)
 */
export async function searchRecipesLoop(query) {
    try {
        if (query.length < 3 && selectedFilters.ingredients.size === 0 
            && selectedFilters.ustensils.size === 0 && selectedFilters.appliances.size === 0) {
            logEvent("INFO", "Recherche ignorée : Moins de 3 caractères sans filtres.");
            return [];
        }

        logEvent("INFO", `Recherche (Loop) pour "${query}"`);
        const normalizedQuery = normalizeText(query);
        const recipes = await getAllRecipes();
        const results = [];

        for (let recipe of recipes) {
            if (
                (query.length >= 3 &&
                    (normalizeText(recipe.name).includes(normalizedQuery) ||
                     recipe.ingredients.some((ingredient) =>
                         normalizeText(ingredient.ingredient).includes(normalizedQuery)
                     ) ||
                     normalizeText(recipe.description).includes(normalizedQuery))) ||
                matchFilters(recipe)
            ) {
                results.push(recipe);
            }
        }

        logEvent("SUCCESS", `${results.length} résultats trouvés.`);
        updateFilters(results);
        return results;
    } catch (error) {
        logEvent("ERROR", "Erreur lors de la recherche (Loop)", { error: error.message });
        return [];
    }
}

/**
 * Recherche avec `filter()` (corrigée)
 */
export async function searchRecipesFunctional(query) {
    try {
        if (query.length < 3 && selectedFilters.ingredients.size === 0 
            && selectedFilters.ustensils.size === 0 && selectedFilters.appliances.size === 0) {
            logEvent("INFO", "Recherche ignorée : Moins de 3 caractères sans filtres.");
            return [];
        }

        logEvent("INFO", `Recherche (Functional) pour "${query}"`);
        const normalizedQuery = normalizeText(query);
        const recipes = await getAllRecipes();

        const results = recipes.filter(
            (recipe) =>
                (query.length >= 3 &&
                    (normalizeText(recipe.name).includes(normalizedQuery) ||
                     recipe.ingredients.some((ingredient) =>
                         normalizeText(ingredient.ingredient).includes(normalizedQuery)
                     ) ||
                     normalizeText(recipe.description).includes(normalizedQuery))) ||
                matchFilters(recipe)
        );

        logEvent("SUCCESS", `${results.length} résultats trouvés.`);
        updateFilters(results);
        return results;
    } catch (error) {
        logEvent("ERROR", "Erreur lors de la recherche (Functional)", { error: error.message });
        return [];
    }
}

/**
 * Vérifie si une recette correspond aux filtres avancés
 */
function matchFilters(recipe) {
    const hasIngredients = selectedFilters.ingredients.size === 0 ||
        [...selectedFilters.ingredients].every(tag =>
            recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(tag))
        );

    const hasUstensils = selectedFilters.ustensils.size === 0 ||
        [...selectedFilters.ustensils].every(tag =>
            recipe.ustensils.some(ust => normalizeText(ust).includes(tag))
        );

    const hasAppliances = selectedFilters.appliances.size === 0 ||
        selectedFilters.appliances.has(normalizeText(recipe.appliance));

    return hasIngredients && hasUstensils && hasAppliances;
}

/**
 * Met à jour les options disponibles après filtrage
 */
function updateFilters(results) {
    const updatedFilters = {
        ingredients: new Set(),
        ustensils: new Set(),
        appliances: new Set()
    };

    results.forEach(recipe => {
        recipe.ingredients.forEach(ing => updatedFilters.ingredients.add(normalizeText(ing.ingredient)));
        recipe.ustensils.forEach(ust => updatedFilters.ustensils.add(normalizeText(ust)));
        updatedFilters.appliances.add(normalizeText(recipe.appliance));
    });

    // Mise à jour des filtres dynamiques
    selectedFilters.ingredients = new Set([...selectedFilters.ingredients].filter(tag => updatedFilters.ingredients.has(tag)));
    selectedFilters.ustensils = new Set([...selectedFilters.ustensils].filter(tag => updatedFilters.ustensils.has(tag)));
    selectedFilters.appliances = new Set([...selectedFilters.appliances].filter(tag => updatedFilters.appliances.has(tag)));
}

document.addEventListener("DOMContentLoaded", () => {
    const filterContainer = document.querySelector(".filter-tags");
    const filterButtons = document.querySelectorAll(".filter-button");

    // Gestion des tags de filtres
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filterType = button.dataset.filter;
            const selectedValue = prompt(`Ajoutez un ${filterType} :`);

            if (selectedValue && !selectedFilters[filterType].has(selectedValue)) {
                selectedFilters[filterType].add(selectedValue);
                addFilterTag(filterType, selectedValue);
                searchRecipesFunctional(""); // Met à jour les résultats
            }
        });
    });

    function addFilterTag(type, value) {
        const tag = document.createElement("span");
        tag.classList.add("filter-tag");
        tag.innerHTML = `${value} <button class="remove-filter">&times;</button>`;
        filterContainer.appendChild(tag);

        tag.querySelector(".remove-filter").addEventListener("click", () => {
            tag.remove();
            selectedFilters[type].delete(value);
            searchRecipesFunctional("");
        });
    }
});
