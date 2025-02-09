import { logEvent } from "../utils/utils.js";
import { getAllRecipes } from "../data/dataManager.js"; 
import { normalizeText } from "../utils/normalize.js"; 

/**
 * Recherche avec une boucle `for`
 */
export async function searchRecipesLoop(query) {
    try {
        logEvent("INFO", ` Recherche (Loop) pour "${query}"`);
        const normalizedQuery = normalizeText(query);
        const recipes = await getAllRecipes();
        const results = [];

        for (let recipe of recipes) {
            if (
                normalizeText(recipe.name).includes(normalizedQuery) ||
                recipe.ingredients.some((ingredient) =>
                    normalizeText(ingredient.ingredient).includes(normalizedQuery)
                ) ||
                normalizeText(recipe.description).includes(normalizedQuery)
            ) {
                results.push(recipe);
            }
        }

        logEvent("SUCCESS", ` ${results.length} résultats trouvés.`);
        return results;
    } catch (error) {
        logEvent("ERROR", "Erreur lors de la recherche (Loop)", { error: error.message });
        return [];
    }
}

/**
 * Recherche avec `filter()`
 */
export async function searchRecipesFunctional(query) {
    try {
        logEvent("INFO", `Recherche (Functional) pour "${query}"`);
        const normalizedQuery = normalizeText(query);
        const recipes = await getAllRecipes();

        const results = recipes.filter(
            (recipe) =>
                normalizeText(recipe.name).includes(normalizedQuery) ||
                recipe.ingredients.some((ingredient) =>
                    normalizeText(ingredient.ingredient).includes(normalizedQuery)
                ) ||
                normalizeText(recipe.description).includes(normalizedQuery)
        );

        logEvent("SUCCESS", `${results.length} résultats trouvés.`);
        return results;
    } catch (error) {
        logEvent("ERROR", "Erreur lors de la recherche (Functional)", { error: error.message });
        return [];
    }
}
