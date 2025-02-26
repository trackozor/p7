
/* ====================================================================================
/*  FICHIER          : dataManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.2
/*  DESCRIPTION      : Gère la récupération et la recherche de recettes avec cache optimisé.
/* ==================================================================================== */

import { recipe } from "../data/recipe.js"; 
import { logEvent } from "../utils/utils.js"; 
import { normalizeText } from "../utils/normalize.js"; // Pour uniformiser les recherches

/** Cache des recettes */
const cache = Array.isArray(recipe) ? recipe : [];
const recipeCache = new Map();
cache.forEach(r => recipeCache.set(r.id, r));

/**
 * Vérification initiale du cache
 */
function initializeCache() {
    if (cache.length === 0) {
        logEvent("warning", "DataManager : Aucun élément chargé dans le cache des recettes.");
    } else {
        logEvent("success", `DataManager : ${cache.length} recettes chargées avec succès.`);
    }
}
initializeCache(); // Appel immédiat pour charger le cache

/**
 * Retourne toutes les recettes stockées.
 * @returns {Array<Object>} Liste des recettes.
 */
export function getAllRecipes() {
    try {
        if (cache.length === 0) {
            logEvent("warning", "getAllRecipes : Aucun résultat trouvé.");
            return [];
        }
        logEvent("success", "Récupération des recettes réussie.", { total: cache.length });
        return cache;
    } catch (error) {
        logEvent("error", "getAllRecipes : Impossible de récupérer les recettes.", { error: error.message });
        return [];
    }
}

/**
 * Recherche une recette par son identifiant unique.
 * @param {number} id - Identifiant de la recette.
 * @returns {Object|null} La recette trouvée ou `null` si inexistante.
 */
export function getRecipeById(id) {
    try {
        if (recipeCache.has(id)) {
            logEvent("success", `Recette trouvée : ${recipeCache.get(id).name}`, { id });
            return recipeCache.get(id);
        } else {
            logEvent("warning", "getRecipeById : Aucune recette trouvée avec cet ID.", { id });
            return null;
        }
    } catch (error) {
        logEvent("error", `getRecipeById : Erreur lors de la récupération de la recette ID ${id}`, { error: error.message });
        return null;
    }
}

/**
 * Recherche des recettes contenant un mot-clé.
 * @param {string} keyword - Mot-clé à rechercher.
 * @returns {Array<Object>} Liste des recettes correspondantes.
 */
export function searchRecipes(keyword) {
    try {
        if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
            logEvent("info", "🔍 Aucun mot-clé fourni, retour de toutes les recettes.");
            return getAllRecipes(); // Correction de `this.getAllRecipes()`
        }

        const normalizedKeyword = normalizeText(keyword);
        const filteredRecipes = cache.filter(recipe =>
            filterRecipeByKeyword(normalizedKeyword, recipe)
        );

        logEvent("success", `${filteredRecipes.length} recettes trouvées pour "${keyword}".`);
        return filteredRecipes;
    } catch (error) {
        logEvent("error", `searchRecipes : Erreur lors de la recherche pour '${keyword}'`, { error: error.message });
        return [];
    }
}

/**
 * Vérifie si une recette contient un mot-clé.
 * @param {string} keyword - Mot-clé.
 * @param {Object} recipe - Recette à analyser.
 * @returns {boolean} `true` si correspondance, sinon `false`.
 */
function filterRecipeByKeyword(keyword, recipe) {
    if (!recipe || !recipe.name || !recipe.ingredients) {
        return false;
    }

    const normalizedName = normalizeText(recipe.name);
    return (
        normalizedName.includes(keyword) ||
        recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(keyword))
    );
}

/**
 * Retourne les ingrédients, appareils et ustensiles uniques pour les filtres.
 * @returns {Object} { ingredients, appliances, ustensils }
 */
export function fetchFilterOptions() {
    try {
        if (cache.length === 0) {
            logEvent("warning", "fetchFilterOptions : Aucune recette disponible pour extraire les filtres.");
            return { ingredients: [], appliances: [], ustensils: [] };
        }

        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const ustensilsSet = new Set();

        cache.forEach(({ ingredients, appliance, ustensils }) => {
            if (Array.isArray(ingredients)) {
                ingredients.forEach(ing => ingredientsSet.add(normalizeText(ing.ingredient)));
            }
            if (appliance) {
                appliancesSet.add(normalizeText(appliance));
            }
            if (Array.isArray(ustensils)) {
                ustensils.forEach(ust => ustensilsSet.add(normalizeText(ust)));
            }
        });

        const result = {
            ingredients: [...ingredientsSet].sort(),
            appliances: [...appliancesSet].sort(),
            ustensils: [...ustensilsSet].sort()
        };

        logEvent("success", "fetchFilterOptions : Options de filtres générées avec succès.", {
            ingredients: result.ingredients.length,
            appliances: result.appliances.length,
            ustensils: result.ustensils.length
        });

        return result;
    } catch (error) {
        logEvent("error", "fetchFilterOptions : Erreur lors du chargement des filtres.", { error: error.message });
        return { ingredients: [], appliances: [], ustensils: [] };
    }
}
export function dataManager () {
    initializeCache();

    return {
        getAllRecipes,
        getRecipeById,
        searchRecipes,
        fetchFilterOptions
    };
}