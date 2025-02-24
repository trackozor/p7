/* ====================================================================================
/*  FICHIER          : dataManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gère la récupération et la recherche de recettes avec cache optimisé.
/* ==================================================================================== */

import { recipe } from "../data/recipe.js"; 
import { logEvent } from "../utils/utils.js"; 
import { normalizeText } from "../utils/normalize.js"; // Pour uniformiser les recherches

class DataManager {
    constructor() {
        /** @type {Array<Object>} Cache interne des recettes */
        this.cache = recipe;

        /** @type {Map<number, Object>} Cache des recettes indexées par ID */
        this.recipeCache = new Map();
        recipe.forEach(r => this.recipeCache.set(r.id, r));
    }

    /**
     * Retourne toutes les recettes stockées.
     * @returns {Array<Object>} Liste des recettes.
     */
    getAllRecipes() {
        try {
            logEvent("success", "Récupération des recettes réussie.", { total: this.cache.length });
            return this.cache;
        } catch (error) {
            logEvent("error", "Impossible de récupérer les recettes.", { error: error.message });
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
            if (this.recipeCache.has(id)) {
                logEvent("success", `Recette trouvée : ${this.recipeCache.get(id).name}`, { id });
                return this.recipeCache.get(id);
            } else {
                logEvent("warning", "Aucune recette trouvée avec cet ID.", { id });
                return null;
            }
        } catch (error) {
            logEvent("error", `Erreur lors de la récupération de la recette ID ${id}`, { error: error.message });
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
                logEvent("info", "🔍 Aucun mot-clé fourni, retour de toutes les recettes.");
                return this.getAllRecipes();
            }

            const normalizedKeyword = normalizeText(keyword);

            const filteredRecipes = this.cache.filter(recipe =>
                this.filterRecipeByKeyword(normalizedKeyword, recipe)
            );

            logEvent("success", `${filteredRecipes.length} recettes trouvées pour "${keyword}".`);
            return filteredRecipes;
        } catch (error) {
            logEvent("error", `Erreur lors de la recherche pour '${keyword}'`, { error: error.message });
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
        const normalizedName = normalizeText(recipe.name);
        return (
            normalizedName.includes(keyword) ||
            recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(keyword))
        );
    }
}

/**
 * Retourne les ingrédients, appareils et ustensiles uniques pour les filtres.
 * @returns {Object} { ingredients, appliances, ustensils }
 */
export function fetchFilterOptions() {
    try {
        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const ustensilsSet = new Set();

        recipe.forEach(({ ingredients, appliance, ustensils }) => {
            ingredients.forEach(ing => ingredientsSet.add(normalizeText(ing.ingredient)));
            appliancesSet.add(normalizeText(appliance));
            ustensils.forEach(ust => ustensilsSet.add(normalizeText(ust)));
        });

        return {
            ingredients: [...ingredientsSet].sort(),
            appliances: [...appliancesSet].sort(),
            ustensils: [...ustensilsSet].sort()
        };
    } catch (error) {
        logEvent("error", "Erreur lors du chargement des filtres.", { error: error.message });
        return { ingredients: [], appliances: [], ustensils: [] };
    }
}

/* EXPORTATION */
export const dataManager = new DataManager();
export const getAllRecipes = () => dataManager.getAllRecipes();
export const searchRecipes = (keyword) => dataManager.searchRecipes(keyword);
