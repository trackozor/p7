import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../../data/dataManager.js";
import { normalizeText } from "../../utils/normalize.js";
import { updateFilters } from "../filterManager.js";

/**
 * Recherche des recettes en utilisant `.filter()`
 *
 * @param {string} query - Texte recherché.
 * @returns {Array} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesFunctional(query) {
    if (!query || query.length < 3) {
      return [];
    }

    logEvent("info", `Recherche avec programmation fonctionnelle pour "${query}"`);

    const normalizedQuery = normalizeText(query);
    const recipes = await getAllRecipes();

    const results = recipes.filter(recipe =>
        matchesSearchCriteria(recipe, normalizedQuery) || matchFilters(recipe)
    );

    updateFilters(results);
    return results;
}
