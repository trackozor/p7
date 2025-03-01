/* ====================================================================================
/*  FICHIER          : dataManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.5
/*  DESCRIPTION      : Gère la récupération et la recherche de recettes avec cache optimisé.
/* ==================================================================================== */

import { recipe } from "../data/recipe.js";
import { logEvent } from "../utils/utils.js";
import { normalizeText } from "../utils/normalize.js"; 

/* ====================================================================================
/*                                INITIALISATION DU CACHE                              */
/* ==================================================================================== */

/** Objet global pour stocker les recettes après la première récupération */
export const recipesData = {
    recipes: null
};

/** Cache des recettes pour l'accès rapide par ID */
const recipeCache = new Map();

/** Cache temporaire pour les recherches */
const searchCache = new Map();
const SEARCH_CACHE_LIMIT = 50;

/** Index des recettes pour accélérer la recherche */
const recipeIndex = new Map();

/**
 * Vérification et initialisation du cache
 */
function initializeCache() {
    if (!Array.isArray(recipe) || recipe.length === 0) {
        logEvent("warning", "DataManager : Aucun élément chargé dans le cache des recettes.");
        recipesData.recipes = [];
        return;
    }

    recipesData.recipes = recipe;
    recipe.forEach(r => recipeCache.set(r.id, r));

    logEvent("success", `DataManager : ${recipe.length} recettes chargées avec succès.`);
}

/**
 * Construit un index des recettes pour accélérer la recherche.
 */
function buildRecipeIndex() {
    const allRecipes = getAllRecipes();
    recipeIndex.clear();

    allRecipes.forEach(recipe => {
        const normalizedName = normalizeText(recipe.name);
        recipeIndex.set(normalizedName, recipe);
    });

    logEvent("success", "buildRecipeIndex : Index de recherche construit.");
}

// Initialisation immédiate au chargement du module
initializeCache();
buildRecipeIndex();

/* ====================================================================================
/*                          RÉCUPÉRATION DE TOUTES LES RECETTES                         */
/* ==================================================================================== */

/**
 * Retourne toutes les recettes stockées (réutilisation optimisée).
 * @returns {Array<Object>} Liste des recettes stockées.
 */
export function getAllRecipes() {
    return recipesData.recipes || [];
}

/* ====================================================================================
/*               MISE À JOUR DU CACHE DES RECETTES (AJOUT / SUPPRESSION)               */
/* ==================================================================================== */

/**
 * Met à jour le cache des recettes après ajout ou suppression.
 * @param {Array<Object>} newRecipes - Nouveau tableau de recettes.
 */
export function updateRecipeCache(newRecipes) {
    recipesData.recipes = newRecipes;
    recipeCache.clear();
    newRecipes.forEach(recipe => recipeCache.set(recipe.id, recipe));
    buildRecipeIndex(); // Reconstruit l'index pour une recherche optimisée
    logEvent("success", "updateRecipeCache : Cache mis à jour avec les nouvelles recettes.");
}

/* ====================================================================================
/*                        RECHERCHE PAR IDENTIFIANT UNIQUE (ID)                         */
/* ==================================================================================== */

/**
 * Recherche une recette par son identifiant unique.
 * @param {number} id - Identifiant de la recette.
 * @returns {Object|null} La recette trouvée ou `null` si inexistante.
 */
export function getRecipeById(id) {
    try {
        if (recipeCache.has(id)) {
            return recipeCache.get(id);
        }
        return null;
    } catch (error) {
        logEvent("error", `getRecipeById : Erreur lors de la récupération de la recette ID ${id}`, { error: error.message });
        return null;
    }
}

/* ====================================================================================
/*                            RECHERCHE DE RECETTES PAR MOT-CLÉ                         */
/* ==================================================================================== */

/**
 * Recherche des recettes contenant un mot-clé (titre, description, ingrédients).
 * @param {string} keyword - Mot-clé à rechercher.
 * @returns {Array<Object>} Liste des recettes correspondantes.
 */
export function searchRecipes(keyword) {
    try {
        if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
            return getAllRecipes();
        }

        const normalizedKeyword = normalizeText(keyword).trim();

        if (searchCache.has(normalizedKeyword)) {
            return searchCache.get(normalizedKeyword);
        }

        const keywordsArray = normalizedKeyword.split(" ");
        const filteredRecipes = [];

        for (let [name, recipe] of recipeIndex) {
            const normalizedDescription = normalizeText(recipe.description || "");
            const normalizedIngredients = recipe.ingredients.map(ing => normalizeText(ing.ingredient)).join(" ");

            if (
                keywordsArray.every(word => name.includes(word) || 
                                            normalizedDescription.includes(word) || 
                                            normalizedIngredients.includes(word))
            ) {
                filteredRecipes.push(recipe);
            }
        }

        if (searchCache.size >= SEARCH_CACHE_LIMIT) {
            searchCache.delete(searchCache.keys().next().value);
        }

        searchCache.set(normalizedKeyword, filteredRecipes);
        return filteredRecipes;
    } catch (error) {
        logEvent("error", `searchRecipes : Erreur lors de la recherche pour '${keyword}'`, { error: error.message });
        return [];
    }
}

/* ====================================================================================
/*                        RÉINITIALISATION DU CACHE DE RECHERCHE                        */
/* ==================================================================================== */

/**
 * Vide complètement le cache de recherche.
 */
export function clearSearchCache() {
    searchCache.clear();
    logEvent("info", "clearSearchCache : Cache de recherche vidé.");
}

/* ====================================================================================
/*                        EXTRACTION DES OPTIONS DE FILTRAGE                            */
/* ==================================================================================== */



export function fetchFilterOptions() {
    try {
        logEvent("info", "fetchFilterOptions : Début du chargement des filtres.");

        // Vérifier si getAllRecipes() fonctionne correctement
        const allRecipes = getAllRecipes();
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            logEvent("warn", "fetchFilterOptions : Aucune recette disponible.");
            return { ingredients: [], appliances: [], ustensils: [] };
        }

        // Vérifier que normalizeText existe
        if (typeof normalizeText !== "function") {
            throw new Error("fetchFilterOptions : La fonction normalizeText() est introuvable.");
        }

        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const ustensilsSet = new Set();

        allRecipes.forEach(({ ingredients, appliance, ustensils }) => {
            // Vérification et ajout des ingrédients
            if (Array.isArray(ingredients)) {
                ingredients.forEach(ing => {
                    if (ing?.ingredient) {
                        ingredientsSet.add(normalizeText(ing.ingredient));
                    }
                });
            }

            // Vérification et ajout des appareils
            if (typeof appliance === "string" && appliance.trim()) {
                appliancesSet.add(normalizeText(appliance));
            }

            // Vérification et ajout des ustensiles
            if (Array.isArray(ustensils)) {
                ustensils.forEach(ust => {
                    if (typeof ust === "string" && ust.trim()) {
                        ustensilsSet.add(normalizeText(ust));
                    }
                });
            }
        });

        const result = {
            ingredients: [...ingredientsSet].sort(),
            appliances: [...appliancesSet].sort(),
            ustensils: [...ustensilsSet].sort()
        };

        logEvent("success", "fetchFilterOptions : Filtres chargés avec succès.", result);
        return result;
    } catch (error) {
        logEvent("error", "fetchFilterOptions : Erreur lors du chargement des filtres.", { error: error.message });
        return { ingredients: [], appliances: [], ustensils: [] };
    }
}


/* ====================================================================================
/*                            EXPORTATION DES FONCTIONS                                */
/* ==================================================================================== */

export function dataManager() {
    return {
        getAllRecipes,
        getRecipeById,
        searchRecipes,
        updateRecipeCache,
        fetchFilterOptions,
        clearSearchCache
    };
}
