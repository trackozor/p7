/* ====================================================================================
/*  FICHIER          : dataManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 3.0
/*  DESCRIPTION      : Gère la récupération et la recherche de recettes avec cache optimisé.
/* ==================================================================================== */

import { recipe } from "../data/recipe.js";
import { logEvent } from "../utils/utils.js";
import { normalizeText } from "../utils/normalize.js";

/* ====================================================================================
/*                               INITIALISATION DU CACHE
/* ==================================================================================== */
/* ------------------------------- */
/*  Définition des structures de stockage  */
/* ------------------------------- */

/** Objet global pour stocker les recettes après la première récupération */
export const recipesData = {
    recipes: null
};

/** Cache des recettes pour un accès rapide par ID */
const recipeCache = new Map();

/** Cache temporaire pour optimiser la recherche */
const searchCache = new Map();
const SEARCH_CACHE_LIMIT = 50;

/** Index des recettes pour accélérer la recherche par mots-clés */
const recipeIndex = new Map();

/* ------------------------------- */
/*  Initialisation du cache de recettes  */
/* ------------------------------- */
/**
 * Initialise le cache avec les recettes chargées.
 * Vérifie la validité des données avant de les stocker pour éviter des erreurs.
 *
 * @returns {void} Ne retourne rien, initialise la mémoire des recettes.
 */
function initializeCache() {
    try {
        // Vérifie si les recettes sont valides et non vides
        if (!Array.isArray(recipe) || recipe.length === 0) {
            logEvent("warning", "initializeCache : Aucune recette chargée.");
            recipesData.recipes = [];
            return;
        }

        logEvent("info", `initializeCache : Chargement de ${recipe.length} recettes dans le cache.`);

        // Stocke les recettes dans la structure globale
        recipesData.recipes = recipe;

        // Remplit le cache des recettes pour un accès rapide via ID
        recipe.forEach(r => recipeCache.set(r.id, r));

        logEvent("success", "initializeCache : Cache des recettes initialisé avec succès.");
    } catch (error) {
        logEvent("error", "initializeCache : Erreur lors de l'initialisation du cache.", { error: error.message });
    }
}

/* ------------------------------- */
/*  Construction de l'index de recherche  */
/* ------------------------------- */
/**
 * Construit un index des recettes pour accélérer la recherche par mots-clés.
 * Chaque recette est indexée par son nom normalisé afin de permettre des recherches optimisées.
 *
 * @returns {void} Ne retourne rien, génère l'index de recherche.
 */
function buildRecipeIndex() {
    try {
        logEvent("info", "buildRecipeIndex : Construction de l'index des recettes...");

        // Récupère toutes les recettes en mémoire
        const allRecipes = getAllRecipes();
        
        // Réinitialise l'index avant de le reconstruire
        recipeIndex.clear();

        // Parcourt chaque recette et indexe son nom pour la recherche rapide
        allRecipes.forEach(recipe => {
            const normalizedName = normalizeText(recipe.name);
            recipeIndex.set(normalizedName, recipe);
        });

        logEvent("success", "buildRecipeIndex : Index de recherche construit avec succès.");
    } catch (error) {
        logEvent("error", "buildRecipeIndex : Erreur lors de la création de l'index.", { error: error.message });
    }
}

/* ------------------------------- */
/*  Exécution des fonctions d'initialisation  */
/* ------------------------------- */
// Charge le cache des recettes dès le chargement du module
initializeCache();
// Construit l'index de recherche dès l'initialisation
buildRecipeIndex();

/* ====================================================================================
/*                          GESTION DES RECETTES ET DU CACHE
/* ==================================================================================== */
/* ------------------------------- */
/*  Récupération de toutes les recettes  */
/* ------------------------------- */
/**
 * Retourne toutes les recettes stockées en mémoire.
 * Si aucune recette n'est disponible, retourne un tableau vide.
 *
 * @returns {Array<Object>} Liste des recettes stockées.
 */
export function getAllRecipes() {
    logEvent("info", "getAllRecipes : Récupération des recettes en cache.");
    return recipesData.recipes || [];
}

/* ------------------------------- */
/*  Mise à jour du cache des recettes  */
/* ------------------------------- */
/**
 * Met à jour le cache des recettes après ajout ou suppression.
 * Cette fonction vide l'ancien cache et stocke les nouvelles recettes.
 *
 * @param {Array<Object>} newRecipes - Nouveau tableau de recettes.
 * @returns {void} Ne retourne rien, met à jour le cache des recettes.
 */
export function updateRecipeCache(newRecipes) {
    try {
        // Vérifie que newRecipes est un tableau valide
        if (!Array.isArray(newRecipes)) {
            logEvent("error", "updateRecipeCache : Données invalides, mise à jour annulée.");
            return;
        }

        logEvent("info", `updateRecipeCache : Mise à jour du cache avec ${newRecipes.length} nouvelles recettes.`);

        // Mise à jour du stockage des recettes
        recipesData.recipes = newRecipes;

        // Réinitialisation du cache des recettes
        recipeCache.clear();

        // Ajout des nouvelles recettes dans le cache
        newRecipes.forEach(recipe => recipeCache.set(recipe.id, recipe));

        // Reconstruction de l'index de recherche pour optimiser les futures recherches
        buildRecipeIndex();

        logEvent("success", "updateRecipeCache : Cache des recettes mis à jour avec succès.");
    } catch (error) {
        logEvent("error", "updateRecipeCache : Erreur lors de la mise à jour du cache des recettes.", { error: error.message });
    }
}

/* ------------------------------- */
/*  Recherche de recette par ID  */
/* ------------------------------- */
/**
 * Recherche une recette par son identifiant unique.
 * Cette fonction permet un accès rapide aux recettes stockées en cache.
 *
 * @param {number} id - Identifiant unique de la recette.
 * @returns {Object|null} La recette trouvée ou `null` si inexistante.
 */
export function getRecipeById(id) {
    try {
        // Vérifie si l'ID est présent dans le cache des recettes
        if (recipeCache.has(id)) {
            logEvent("info", `getRecipeById : Recette ID ${id} trouvée dans le cache.`);
            return recipeCache.get(id);
        }

        logEvent("warn", `getRecipeById : Aucune recette trouvée pour l'ID ${id}.`);
        return null;
    } catch (error) {
        logEvent("error", `getRecipeById : Erreur lors de la récupération de la recette ID ${id}.`, { error: error.message });
        return null;
    }
}

/* ====================================================================================
/*                          RECHERCHE DE RECETTES PAR MOT-CLÉ
/* ==================================================================================== */
/**
 * Recherche des recettes contenant un mot-clé.
 * Cette fonction analyse le titre, la description et les ingrédients de chaque recette
 * pour retourner celles qui correspondent aux mots-clés fournis.
 *
 * @param {string} keyword - Mot-clé à rechercher.
 * @returns {Array<Object>} Liste des recettes correspondant aux critères.
 */
export function searchRecipes(keyword) {
    try {
        logEvent("info", `searchRecipes : Démarrage de la recherche pour '${keyword}'`);

        // Vérification de la validité du mot-clé avant de lancer la recherche
        if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
            logEvent("warn", "searchRecipes : Mot-clé vide ou invalide, retour de toutes les recettes.");
            return getAllRecipes();
        }

        // Normalisation du mot-clé pour éviter les différences de casse ou d'accents
        const normalizedKeyword = normalizeText(keyword).trim();

        // Vérification si la recherche a déjà été effectuée pour ce mot-clé
        if (searchCache.has(normalizedKeyword)) {
            logEvent("info", `searchRecipes : Résultats récupérés depuis le cache pour '${normalizedKeyword}'.`);
            return searchCache.get(normalizedKeyword);
        }

        // Séparation du mot-clé en plusieurs termes pour une recherche plus précise
        const keywordsArray = normalizedKeyword.split(" ");
        const filteredRecipes = [];

        // Parcours des recettes indexées pour rechercher des correspondances
        for (let [name, recipe] of recipeIndex) {
            const normalizedDescription = normalizeText(recipe.description || "");
            const normalizedIngredients = recipe.ingredients.map(ing => normalizeText(ing.ingredient)).join(" ");

            // Vérification si tous les mots-clés sont présents dans au moins un des champs analysés
            if (
                keywordsArray.every(word => name.includes(word) || 
                                            normalizedDescription.includes(word) || 
                                            normalizedIngredients.includes(word))
            ) {
                filteredRecipes.push(recipe);
            }
        }

        // Vérification de la taille du cache et suppression des anciennes entrées si nécessaire
        if (searchCache.size >= SEARCH_CACHE_LIMIT) {
            const firstKey = searchCache.keys().next().value;
            searchCache.delete(firstKey);
            logEvent("info", `searchRecipes : Suppression de la plus ancienne entrée du cache (${firstKey}).`);
        }

        // Enregistrement des résultats de la recherche dans le cache
        searchCache.set(normalizedKeyword, filteredRecipes);
        logEvent("success", `searchRecipes : ${filteredRecipes.length} résultats trouvés pour '${normalizedKeyword}'.`);

        return filteredRecipes;
    } catch (error) {
        logEvent("error", `searchRecipes : Erreur lors de la recherche pour '${keyword}'`, { error: error.message });
        return [];
    }
}

/* ====================================================================================
/*                           RÉINITIALISATION DU CACHE DE RECHERCHE
/* ==================================================================================== */
/**
 * Vide complètement le cache de recherche.
 * Cette fonction supprime toutes les entrées stockées dans `searchCache`,
 * garantissant ainsi que les futures recherches ne seront pas influencées par des données mises en cache.
 *
 * @returns {void} Ne retourne rien, mais efface toutes les données du cache de recherche.
 */
export function clearSearchCache() {
    try {
        // Vérifie si le cache contient des éléments avant de le vider
        const cacheSize = searchCache.size;
        
        if (cacheSize === 0) {
            logEvent("info", "clearSearchCache : Aucun élément à vider, le cache était déjà vide.");
            return;
        }

        // Suppression de toutes les entrées du cache
        searchCache.clear();
        logEvent("success", `clearSearchCache : Cache de recherche vidé (${cacheSize} entrées supprimées).`);
    } catch (error) {
        logEvent("error", "clearSearchCache : Erreur lors de la réinitialisation du cache de recherche.", { error: error.message });
    }
}

/* ====================================================================================
/*                        EXTRACTION DES OPTIONS DE FILTRAGE
/* ==================================================================================== */
/**
 * Extrait dynamiquement les options de filtre disponibles à partir des recettes chargées.
 * Cette fonction récupère les ingrédients, les appareils et les ustensiles uniques présents dans les recettes chargées.
 *
 * @returns {Object} Un objet contenant les listes triées des ingrédients, appareils et ustensiles disponibles.
 */
export function fetchFilterOptions() {
    try {
        logEvent("info", "fetchFilterOptions : Début du chargement des filtres.");

        // Récupération de toutes les recettes chargées
        const allRecipes = getAllRecipes();

        // Vérification si des recettes sont disponibles
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            logEvent("warn", "fetchFilterOptions : Aucune recette disponible.");
            return { ingredients: [], appliances: [], ustensils: [] };
        }

        // Vérification que la fonction normalizeText est bien définie
        if (typeof normalizeText !== "function") {
            throw new Error("fetchFilterOptions : La fonction normalizeText() est introuvable.");
        }

        // Initialisation des ensembles pour stocker les valeurs uniques des filtres
        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const ustensilsSet = new Set();

        // Parcours de toutes les recettes pour extraire les valeurs de filtres uniques
        allRecipes.forEach(({ ingredients, appliance, ustensils }) => {
            // Ajout des ingrédients au set (évite les doublons)
            if (Array.isArray(ingredients)) {
                ingredients.forEach(ing => {
                    if (ing?.ingredient) {
                        ingredientsSet.add(normalizeText(ing.ingredient));
                    }
                });
            }

            // Ajout des appareils au set
            if (typeof appliance === "string" && appliance.trim()) {
                appliancesSet.add(normalizeText(appliance));
            }

            // Ajout des ustensiles au set
            if (Array.isArray(ustensils)) {
                ustensils.forEach(ust => {
                    if (typeof ust === "string" && ust.trim()) {
                        ustensilsSet.add(normalizeText(ust));
                    }
                });
            }
        });

        // Transformation des sets en tableaux triés pour assurer un affichage structuré
        const result = {
            ingredients: [...ingredientsSet].sort(),
            appliances: [...appliancesSet].sort(),
            ustensils: [...ustensilsSet].sort()
        };

        logEvent("success", `fetchFilterOptions : ${result.ingredients.length} ingrédients, ${result.appliances.length} appareils et ${result.ustensils.length} ustensiles extraits.`);
        return result;
    } catch (error) {
        logEvent("error", "fetchFilterOptions : Erreur lors du chargement des filtres.", { error: error.message });
        return { ingredients: [], appliances: [], ustensils: [] };
    }
}

