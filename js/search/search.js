import { normalizeText } from "./utils.js";
import { recipes } from "./data.js";

export function searchRecipesLoop(query) {
  const normalizedQuery = normalizeText(query);
  const results = [];

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    if (
      normalizeText(recipe.title).includes(normalizedQuery) ||
      recipe.ingredients.some((ingredient) =>
        normalizeText(ingredient).includes(normalizedQuery)
      ) ||
      normalizeText(recipe.description).includes(normalizedQuery)
    ) {
      results.push(recipe);
    }
  }

  return results;
}

export function searchRecipesFunctional(query) {
    const normalizedQuery = normalizeText(query);
  
    return recipes.filter(
      (recipe) =>
        normalizeText(recipe.title).includes(normalizedQuery) ||
        recipe.ingredients.some((ingredient) =>
          normalizeText(ingredient).includes(normalizedQuery)
        ) ||
        normalizeText(recipe.description).includes(normalizedQuery)
    );
  }
  