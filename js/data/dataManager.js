/* ====================================================================================
 *  FICHIER          : dataManager.js
 *  AUTEUR           : Trackozor
 *  VERSION          : 3.1
 *  DESCRIPTION      : Gère la récupération et la recherche de recettes avec cache optimisé.
 * ==================================================================================== */

import { recipe } from "../data/recipe.js";
import { logEvent } from "../utils/utils.js";
import { normalizeText } from "../utils/normalize.js";

/* ====================================================================================
 *  INITIALISATION DU CACHE
 * ==================================================================================== */

/** Objet global stockant les recettes après la première récupération */
export const recipesData = { recipes: null };

/** Cache des recettes pour un accès rapide */
const recipeCache = new Map();

/** Cache de recherche avec gestion des fréquences */
const searchCache = new Map();
const SEARCH_CACHE_LIMIT = 50;

/** Index des recettes pour optimiser la recherche */
const recipeIndex = new Map();

/**
 * Initialise le cache des recettes et vérifie la validité des données.
 *
 * @returns {void} Ne retourne rien, initialise le cache des recettes.
 */
function initializeCache() {
    try {
        logEvent("test_start_search", "initializeCache : Début de l'initialisation du cache des recettes.");

        if (!Array.isArray(recipe) || recipe.length === 0) {
            logEvent("warning", "initializeCache : Aucune recette trouvée, initialisation d'un cache vide.");
            recipesData.recipes = [];
            return;
        }

        recipesData.recipes = recipe;
        recipe.forEach(r => recipeCache.set(r.id, r));

        logEvent("test_end_search", "initializeCache : Cache des recettes rempli avec succès.");
    } catch (error) {
        logEvent("error", "initializeCache : Erreur lors de l'initialisation du cache.", { error: error.message });
    }
}

/**
 * Construit un index des recettes pour accélérer la recherche par mots-clés.
 *
 * @returns {void} Ne retourne rien, met à jour l'index de recherche.
 */
function buildRecipeIndex() {
    try {
        logEvent("test_start_search", "buildRecipeIndex : Démarrage de la construction de l'index de recherche.");

        const allRecipes = getAllRecipes();
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            logEvent("warning", "buildRecipeIndex : Aucune recette disponible, index non généré.");
            return;
        }

        recipeIndex.clear();

        allRecipes.forEach(recipe => {
            const normalizedName = normalizeText(recipe.name);
            recipeIndex.set(normalizedName, recipe);
        });

        logEvent("test_end_search", `buildRecipeIndex : Indexation terminée avec ${recipeIndex.size} recettes.`);
    } catch (error) {
        logEvent("error", "buildRecipeIndex : Erreur lors de l'indexation des recettes.", { error: error.message });
    }
}

// Initialisation du cache et de l'index
initializeCache();
buildRecipeIndex();

/* ====================================================================================
 *  GESTION DU CACHE DE RECHERCHE 
 * ==================================================================================== */

/**
 * Met à jour le cache des recettes après une modification.
 *
 * @param {Array<Object>} newRecipes - Nouvelles recettes à stocker dans le cache.
 * @returns {void} Ne retourne rien, met à jour le cache et l'index des recettes.
 */
export function updateRecipeCache(newRecipes) {
    try {
        logEvent("info", "updateRecipeCache : Démarrage de la mise à jour du cache des recettes.");

        if (!Array.isArray(newRecipes) || newRecipes.length === 0) {
            logEvent("warn", "updateRecipeCache : Données invalides ou vides, mise à jour annulée.");
            return;
        }

        recipesData.recipes = newRecipes;
        recipeCache.clear();
        newRecipes.forEach(recipe => recipeCache.set(recipe.id, recipe));

        buildRecipeIndex();
        logEvent("success", "updateRecipeCache : Mise à jour du cache et de l'index des recettes terminée avec succès.");
    } catch (error) {
        logEvent("error", "updateRecipeCache : Erreur lors de la mise à jour du cache des recettes.", { error: error.message });
    }
}

/**
 * Vide complètement le cache de recherche.
 *
 * @returns {void} Ne retourne rien.
 */
export function clearSearchCache() {
    try {
        if (searchCache.size === 0) {
            logEvent("info", "clearSearchCache : Cache déjà vide.");
            return;
        }

        searchCache.clear();
        logEvent("success", `clearSearchCache : Cache vidé avec succès.`);
    } catch (error) {
        logEvent("error", "clearSearchCache : Erreur lors de la suppression du cache de recherche.", { error: error.message });
    }
}

/* ====================================================================================
 *  GESTION DES RECETTES 
 * ==================================================================================== */

/**
 * Récupère toutes les recettes stockées en mémoire.
 *
 * @returns {Array<Object>} Liste des recettes stockées ou un tableau vide.
 */
export function getAllRecipes() {
    try {
        return Array.isArray(recipesData.recipes) ? recipesData.recipes : [];
    } catch (error) {
        logEvent("error", "getAllRecipes : Erreur lors de la récupération des recettes.", { error: error.message });
        return [];
    }
}

/**
 * Effectue une recherche de recettes selon un mot-clé.
 *
 * @param {string} keyword - Terme recherché.
 * @param {boolean} isFilterSearch - Indique si la recherche provient des filtres.
 * @returns {Array<Object>} Résultats filtrés.
 */
export function searchRecipes(keyword, isFilterSearch = false) {
    try {
        if (!keyword || typeof keyword !== "string" || (keyword.trim().length < 3 && !isFilterSearch)) {
            return getAllRecipes();
        }

        const normalizedKeyword = normalizeText(keyword.trim());

        if (searchCache.has(normalizedKeyword)) {
            searchCache.get(normalizedKeyword).hits++;
            return searchCache.get(normalizedKeyword).result;
        }

        const filteredRecipes = getAllRecipes().filter(recipe =>
            normalizeText(recipe.name).includes(normalizedKeyword) ||
            normalizeText(recipe.description).includes(normalizedKeyword) ||
            recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(normalizedKeyword))
        );

        if (searchCache.size >= SEARCH_CACHE_LIMIT) {
            const leastUsedKey = [...searchCache.entries()].reduce((a, b) => (a[1].hits < b[1].hits ? a : b))[0];
            searchCache.delete(leastUsedKey);
        }

        searchCache.set(normalizedKeyword, { result: filteredRecipes, hits: 1 });
        return filteredRecipes;
    } catch (error) {
        logEvent("error", "searchRecipes : Erreur de recherche.", { error: error.message });
        return [];
    }
}

/**
 * Extrait dynamiquement les options de filtre disponibles.
 *
 * @returns {Object} Contient trois listes triées : `ingredients`, `appliances`, `ustensils`.
 */
export function fetchFilterOptions() {
    try {
        const allRecipes = getAllRecipes();
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            return { ingredients: [], appliances: [], ustensils: [] };
        }

        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const ustensilsSet = new Set();

        allRecipes.forEach(({ ingredients, appliance, ustensils }) => {
            ingredients?.forEach(ing => ingredientsSet.add(normalizeText(ing.ingredient)));
            if (appliance) {
              appliancesSet.add(normalizeText(appliance));
            }
            ustensils?.forEach(ust => ustensilsSet.add(normalizeText(ust)));
        });

        return {
            ingredients: [...ingredientsSet].sort(),
            appliances: [...appliancesSet].sort(),
            ustensils: [...ustensilsSet].sort()
        };
    } catch (error) {
        logEvent("error", "fetchFilterOptions : Erreur lors du chargement des filtres.", { error: error.message });
        return { ingredients: [], appliances: [], ustensils: [] };
    }
}
