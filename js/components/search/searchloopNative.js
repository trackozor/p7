import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../../data/dataManager.js";
import { normalizeText } from "../../utils/normalize.js";
import { updateFilters } from "../filterManager.js";

/**
 * Recherche des recettes en parcourant la liste avec une boucle `for`
 *
 * @param {string} query - Texte recherché.
 * @returns {Array} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesLoopNative(query) {
    if (!query || query.length < 3) return [];

    logEvent("info", `Recherche avec boucles natives pour "${query}"`);

    const normalizedQuery = normalizeText(query);
    const recipes = await getAllRecipes();
    const results = [];

    for (let i = 0; i < recipes.length; i++) {
        if (matchesSearchCriteria(recipes[i], normalizedQuery) || matchFilters(recipes[i])) {
            results.push(recipes[i]);
        }
    }

    updateFilters(results);
    return results;
}
