/* ==================================================================================== */
/*  FICHIER          : dataManager.js                                                   */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.3                                                              */
/*  DESCRIPTION      : Gère la récupération et la recherche de recettes avec cache.    */
/* ==================================================================================== */

import { recipe } from "../data/recipe1.js"; // Import direct des recettes JS
import { logEvent } from "../utils/utils.js"; // Gestion des logs

class DataManager {
    constructor() {
        /** @type {Array<Object>} Cache interne des recettes */
        this.cache = recipe;
    }

    /**
     * Retourne toutes les recettes stockées.
     * @returns {Array<Object>} Liste des recettes.
     */
    getAllRecipes() {
        try {
            logEvent("SUCCESS", "Récupération de toutes les recettes réussie.", { total: this.cache.length });
            return this.cache;
        } catch (error) {
            logEvent("ERROR", "Impossible de récupérer les recettes.", { error: error.message });
            return [];
        }
    }

    /**
     * Recherche une recette par son identifiant unique.
     * @param {number} id - Identifiant de la recette.
     * @returns {Object|null} La recette trouvée ou `null` si inexistante.
     */
    getRecipeById(id) {
        try {
            const recipe = this.cache.find(recipe => recipe.id === id) || null;
            recipe
                ? logEvent("SUCCESS", ` Recette trouvée : ${recipe.name}`, { id })
                : logEvent("WARNING", " Aucune recette trouvée avec cet ID.", { id });
            return recipe;
        } catch (error) {
            logEvent("ERROR", ` Erreur lors de la récupération de la recette ID ${id}`, { error: error.message });
            return null;
        }
    }

    /**
     * Recherche des recettes contenant un mot-clé.
     * @param {string} keyword - Mot-clé à rechercher.
     * @returns {Array<Object>} Liste des recettes correspondantes.
     */
    searchRecipes(keyword) {
        try {
            if (!keyword.trim()) {
                logEvent("INFO", "🔍 Aucun mot-clé fourni, retour de toutes les recettes.");
                return this.getAllRecipes();
            }

            const filteredRecipes = this.cache.filter(recipe =>
                this.filterRecipeByKeyword(keyword, recipe)
            );

            logEvent("SUCCESS", ` ${filteredRecipes.length} recettes trouvées pour "${keyword}".`);
            return filteredRecipes;
        } catch (error) {
            logEvent("ERROR", ` Erreur lors de la recherche pour '${keyword}'`, { error: error.message });
            return [];
        }
    }

    /**
     * Vérifie si une recette contient un mot-clé.
     * @param {string} keyword - Mot-clé.
     * @param {Object} recipe - Recette à analyser.
     * @returns {boolean} `true` si correspondance, sinon `false`.
     */
    filterRecipeByKeyword(keyword, recipe) {
        const lowerKeyword = keyword.toLowerCase();
        return (
            recipe.name.toLowerCase().includes(lowerKeyword) ||
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(lowerKeyword))
        );
    }
}
/**
 * Retourne les ingrédients, appareils et ustensiles uniques pour les filtres.
 * @returns {Object} { ingredients, appliances, ustensils }
 */
export async function fetchFilterOptions() {
    try {
        const recipes = await getAllRecipes();

        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const ustensilsSet = new Set();

        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => ingredientsSet.add(ing.ingredient.toLowerCase()));
            appliancesSet.add(recipe.appliance.toLowerCase());
            recipe.ustensils.forEach(ust => ustensilsSet.add(ust.toLowerCase()));
        });

        return {
            ingredients: [...ingredientsSet].sort(),
            appliances: [...appliancesSet].sort(),
            ustensils: [...ustensilsSet].sort()
        };
    } catch (error) {
        logEvent("ERROR", " Erreur lors du chargement des filtres.", { error: error.message });
        return { ingredients: [], appliances: [], ustensils: [] };
    }
}

/* EXPORTATION */
export const dataManager = new DataManager();
export const getAllRecipes = () => dataManager.getAllRecipes();
export const searchRecipes = (keyword) => dataManager.searchRecipes(keyword);
