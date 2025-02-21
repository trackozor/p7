/* ==================================================================================== */
/*  FICHIER          : searchRecipesLoopNative.js                                      */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                             */
/*  DATE DE CRÉATION : 10/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 11/02/2025                                                      */
/*  DESCRIPTION      : Recherche des recettes avec une boucle `for`                    */
/*                     - Parcours séquentiel des recettes stockées.                    */
/*                     - Vérification des filtres actifs avant ajout aux résultats.    */
/*                     - Normalisation des textes pour uniformiser la comparaison.     */
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../../data/dataManager.js";
import { normalizeText } from "../../utils/normalize.js";
import { updateFilters } from "../filterManager.js";

/*------------------------------------------------------------------*/
/*   Déclaration des filtres actifs                                */
/*------------------------------------------------------------------*/

// Stockage global des filtres actifs
let activeFilters = {
    ingredients: [],  // Ex: ["pomme", "chocolat"]
    appliances: [],   // Ex: ["four"]
    ustensils: []     // Ex: ["couteau", "mixeur"]
};

/*------------------------------------------------------------------*/
/*   Recherche avec une boucle `for`                               */
/*------------------------------------------------------------------*/

/**
 * Recherche des recettes en parcourant la liste avec une boucle `for`.
 *
 * - Normalise la requête avant de comparer les données.
 * - Applique les critères de recherche et met à jour les filtres actifs.
 *
 * @param {string} query - Texte recherché.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesLoopNative(query) {
    try {
        if (!query || query.trim().length < 3) {
            logEvent("warning", "searchRecipesLoopNative : Requête trop courte, minimum 3 caractères requis.");
            return [];
        }

        logEvent("info", `Recherche avec boucles natives pour : "${query}"`);

        const normalizedQuery = normalizeText(query.trim());
        const recipes = await getAllRecipes();

        if (!recipes || recipes.length === 0) {
            logEvent("error", "searchRecipesLoopNative : Aucune recette trouvée dans la base de données.");
            return [];
        }

        const results = [];

        for (const recipe of recipes) {
            if (matchesSearchCriteria(recipe, normalizedQuery) || matchFilters(recipe)) {
                results.push(recipe);
            }
        }

        logEvent("success", `searchRecipesLoopNative : ${results.length} recette(s) trouvée(s) pour "${query}".`);

        updateFilters(results);
        return results;
    } catch (error) {
        logEvent("error", "searchRecipesLoopNative : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

/*------------------------------------------------------------------*/
/*   Vérification des critères de recherche                        */
/*------------------------------------------------------------------*/

/**
 * Vérifie si une recette correspond aux critères de recherche.
 *
 * - Compare le texte de recherche avec le nom, la description et les ingrédients.
 * - Applique la normalisation des textes pour éviter les problèmes de casse et d'accents.
 *
 * @param {Object} recipe - La recette à tester.
 * @param {string} query - Texte normalisé de recherche.
 * @returns {boolean} True si la recette correspond, False sinon.
 */
export function matchesSearchCriteria(recipe, query) {
    if (!recipe || !query) {
        logEvent("warning", "matchesSearchCriteria : Recette ou requête non définie.");
        return false;
    }

    const normalizedName = normalizeText(recipe.name);
    const normalizedDescription = normalizeText(recipe.description);
    const normalizedIngredients = recipe.ingredients
        .map(ingredient => normalizeText(ingredient.ingredient))
        .join(" "); // Concatène tous les ingrédients en un seul texte

    return normalizedName.includes(query) ||
           normalizedDescription.includes(query) ||
           normalizedIngredients.includes(query);
}

/*------------------------------------------------------------------*/
/*   Vérification des filtres actifs                               */
/*------------------------------------------------------------------*/

/**
 * Vérifie si une recette correspond aux filtres actifs.
 *
 * - Vérifie les correspondances avec les ingrédients sélectionnés.
 * - Vérifie si l’appareil est le bon.
 * - Vérifie la présence des ustensiles requis.
 *
 * @param {Object} recipe - La recette à tester.
 * @returns {boolean} True si la recette passe les filtres, False sinon.
 */
export function matchFilters(recipe) {
    try {
        if (!recipe) {
            logEvent("error", "matchFilters : Recette non définie.");
            return false;
        }

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

        return ingredientsMatch && applianceMatch && ustensilsMatch;
    } catch (error) {
        logEvent("error", "matchFilters : Erreur lors de la vérification des filtres.", { error: error.message });
        return false;
    }
}
