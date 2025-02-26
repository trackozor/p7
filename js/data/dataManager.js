/* ====================================================================================
/*  FICHIER          : dataManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.3
/*  DESCRIPTION      : Gère la récupération et la recherche de recettes avec cache optimisé.
/* ==================================================================================== */

import { recipe } from "../data/recipe.js"; 
import { logEvent } from "../utils/utils.js"; 
import { normalizeText } from "../utils/normalize.js"; // Pour uniformiser les recherches

/* ==================================================================================== */
/*                                INITIALISATION DU CACHE                              */
/* ==================================================================================== */

/** Objet global pour stocker les recettes après la première récupération */
export const recipesData = {
    recipes: null // `null` signifie que les recettes n'ont pas encore été chargées
};

/** Cache des recettes pour l'accès rapide par ID */
const recipeCache = new Map();

/**
 * Vérification et initialisation du cache
 */
function initializeCache() {
    if (!Array.isArray(recipe) || recipe.length === 0) {
        logEvent("warning", "DataManager : Aucun élément chargé dans le cache des recettes.");
        recipesData.recipes = []; // Évite de relancer l'opération
        return;
    }

    recipesData.recipes = recipe; // Stocke toutes les recettes au premier chargement
    recipe.forEach(r => recipeCache.set(r.id, r));

    logEvent("success", `DataManager : ${recipe.length} recettes chargées avec succès.`);
}

// Initialisation immédiate au chargement du module
initializeCache();

/* ==================================================================================== */
/*                          RÉCUPÉRATION DE TOUTES LES RECETTES                         */
/* ==================================================================================== */

/**
 * Retourne toutes les recettes stockées (réutilisation optimisée).
 * @returns {Array<Object>} Liste des recettes stockées.
 */
export function getAllRecipes() {
    return recipesData.recipes || [];
}

/* ==================================================================================== */
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

/* ==================================================================================== */
/*                            RECHERCHE DE RECETTES PAR MOT-CLÉ                         */
/* ==================================================================================== */

/**
 * Recherche des recettes contenant un mot-clé.
 * @param {string} keyword - Mot-clé à rechercher.
 * @returns {Array<Object>} Liste des recettes correspondantes.
 */
export function searchRecipes(keyword) {
    try {
        if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
            logEvent("info", " Aucun mot-clé fourni, retour de toutes les recettes.");
            return getAllRecipes(); // Utilisation directe du cache
        }

        const normalizedKeyword = normalizeText(keyword);
        const filteredRecipes = getAllRecipes().filter(recipe =>
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

/* ==================================================================================== */
/*                        EXTRACTION DES OPTIONS DE FILTRAGE                            */
/* ==================================================================================== */

/**
 * Retourne les ingrédients, appareils et ustensiles uniques pour les filtres.
 * @returns {Object} { ingredients, appliances, ustensils }
 */
export function fetchFilterOptions() {
    try {
        const allRecipes = getAllRecipes(); // Réutilise le cache optimisé

        if (allRecipes.length === 0) {
            logEvent("warning", "fetchFilterOptions : Aucune recette disponible pour extraire les filtres.");
            return { ingredients: [], appliances: [], ustensils: [] };
        }

        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const ustensilsSet = new Set();

        allRecipes.forEach(({ ingredients, appliance, ustensils }) => {
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

/* ==================================================================================== */
/*                            EXPORTATION DES FONCTIONS                                */
/* ==================================================================================== */

/**
 * Fournit un objet avec toutes les méthodes pour gérer les recettes.
 * @returns {Object} Contient les méthodes pour gérer les recettes.
 */
export function dataManager() {
    return {
        getAllRecipes,
        getRecipeById,
        searchRecipes,
        fetchFilterOptions
    };
}
