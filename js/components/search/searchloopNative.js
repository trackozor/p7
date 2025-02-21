import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../../data/dataManager.js";
import { normalizeText } from "../../utils/normalize.js";
import { updateFilters } from "../filterManager.js";


// Déclaration globale des filtres actifs
let activeFilters = {
    ingredients: [],  // Ex: ["pomme", "chocolat"]
    appliances: [],   // Ex: ["four"]
    ustensils: []     // Ex: ["couteau", "mixeur"]
};

/**
 * Recherche des recettes en parcourant la liste avec une boucle `for`
 *
 * @param {string} query - Texte recherché.
 * @returns {Array} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesLoopNative(query) {
    if (!query || query.length < 3) {
      return [];
    }

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

/**
 * Vérifie si une recette correspond aux critères de recherche.
 *
 * @param {Object} recipe - La recette à tester.
 * @param {string} query - Texte normalisé de recherche.
 * @returns {boolean} True si la recette correspond, False sinon.
 */
export function matchesSearchCriteria(recipe, query) {
    if (!recipe || !query) {
      return false;
    }

    // Normalisation des textes pour éviter les problèmes de casse et d'accents
    const normalizedName = normalizeText(recipe.name);
    const normalizedDescription = normalizeText(recipe.description);
    const normalizedIngredients = recipe.ingredients
        .map(ingredient => normalizeText(ingredient.ingredient))
        .join(" "); // Concatène tous les ingrédients en un seul texte

    // Vérification si le texte recherché est dans le nom, la description ou les ingrédients
    return normalizedName.includes(query) ||
           normalizedDescription.includes(query) ||
           normalizedIngredients.includes(query);
}
/**
 * Vérifie si une recette correspond aux filtres actifs.
 *
 * @param {Object} recipe - La recette à tester.
 * @returns {boolean} True si la recette passe les filtres, False sinon.
 */
export function matchFilters(recipe) {
    // Supposons que les filtres actifs sont stockés dans un objet global `activeFilters`
    const { ingredients, appliances, ustensils } = activeFilters;

    // Vérifie si tous les ingrédients sélectionnés sont dans la recette
    const ingredientsMatch = ingredients.every(filterIng =>
        recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(normalizeText(filterIng)))
    );

    // Vérifie si l'appareil sélectionné est le bon
    const applianceMatch = !appliances.length || appliances.includes(normalizeText(recipe.appliance));

    // Vérifie si tous les ustensiles sélectionnés sont dans la recette
    const ustensilsMatch = ustensils.every(filterUst =>
        recipe.ustensils.some(ust => normalizeText(ust).includes(normalizeText(filterUst)))
    );

    // La recette est valide seulement si elle correspond à **tous** les filtres actifs
    return ingredientsMatch && applianceMatch && ustensilsMatch;
}
