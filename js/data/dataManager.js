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
    INITIALISATION DU CACHE
   ==================================================================================== */

/** Objet global stockant les recettes après la première récupération */
export const recipesData = { recipes: null };

/** Cache des recettes pour un accès rapide */
const recipeCache = new Map();

/** Cache de recherche pour éviter les recherches répétitives */
const searchCache = new Map();
const SEARCH_CACHE_LIMIT = 50;

/** Index des recettes pour optimiser la recherche */
const recipeIndex = new Map();

/* ------------------------------- */
/*  Initialisation du cache  */
/* ------------------------------- */
/**
 * Initialise le cache des recettes et vérifie la validité des données.
 * 
 * - Vérifie que `recipe` est un tableau valide.
 * - Stocke les recettes en mémoire pour un accès rapide.
 * - Remplit le cache des recettes en indexant chaque recette par son ID.
 * - Ajoute des logs détaillés pour suivre chaque étape du processus.
 *
 * @returns {void} Ne retourne rien, initialise le cache des recettes.
 */
function initializeCache() {
    try {
        logEvent("test_start_search", "initializeCache : Début de l'initialisation du cache des recettes.");

        // Vérification que `recipe` est un tableau valide et non vide
        if (!Array.isArray(recipe) || recipe.length === 0) {
            logEvent("warning", "initializeCache : Aucune recette trouvée, initialisation d'un cache vide.");
            recipesData.recipes = []; // Stocke un tableau vide pour éviter les erreurs
            return;
        }

        // Stockage des recettes en mémoire pour un accès rapide
        recipesData.recipes = recipe;
        logEvent("info", `initializeCache : Stockage de ${recipe.length} recettes en mémoire.`);

        // Remplit le cache des recettes en indexant chaque recette par son ID
        recipe.forEach(r => recipeCache.set(r.id, r));
        logEvent("test_end_search", "initializeCache : Cache des recettes rempli avec succès.");

    } catch (error) {
        // Capture et journalisation des erreurs en cas d'échec
        logEvent("error", "initializeCache : Erreur lors de l'initialisation du cache.", { error: error.message });
    }
}

/* ------------------------------- */
/*  Construction de l'index de recherche  */
/* ------------------------------- */
/**
 * Construit un index des recettes pour accélérer la recherche par mots-clés.
 *
 * - Récupère toutes les recettes en mémoire.
 * - Normalise le nom de chaque recette pour uniformiser la recherche.
 * - Stocke les recettes indexées dans une `Map` pour un accès rapide.
 * - Efface l'ancien index avant de le reconstruire pour éviter les doublons.
 * - Ajoute des logs détaillés pour suivre le processus d'indexation.
 *
 * @returns {void} Ne retourne rien, met à jour l'index de recherche.
 */
function buildRecipeIndex() {
    try {
        logEvent("info", "buildRecipeIndex : Démarrage de la construction de l'index de recherche.");

        // Récupération de toutes les recettes stockées en mémoire
        const allRecipes = getAllRecipes();

        // Vérification que des recettes sont bien disponibles avant d'indexer
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            logEvent("warning", "buildRecipeIndex : Aucune recette disponible, index non généré.");
            return;
        }

        // Réinitialisation de l'index pour éviter les doublons
        recipeIndex.clear();
        logEvent("info", "buildRecipeIndex : Ancien index effacé, début du remplissage.");

        // Indexation de chaque recette en utilisant un nom normalisé
        allRecipes.forEach(recipe => {
            const normalizedName = normalizeText(recipe.name);
            recipeIndex.set(normalizedName, recipe);
        });

        // Log de confirmation avec le nombre total d'entrées indexées
        logEvent("success", `buildRecipeIndex : Indexation terminée avec ${recipeIndex.size} recettes.`);

    } catch (error) {
        // Capture et journalisation des erreurs en cas d'échec de l'indexation
        logEvent("error", "buildRecipeIndex : Erreur lors de l'indexation des recettes.", { error: error.message });
    }
}

// Initialisation du cache et de l'index
initializeCache();
buildRecipeIndex();

/* ====================================================================================
    GESTION DES RECETTES ET DU CACHE
==================================================================================== */

/* ====================================================================================
    RÉCUPÉRATION DES RECETTES
==================================================================================== */
/**
 * Récupère toutes les recettes stockées en mémoire.
 *
 * - Vérifie si des recettes sont disponibles avant de les retourner.
 * - Retourne un tableau vide si aucune recette n'est stockée pour éviter les erreurs.
 * - Ajoute des logs pour suivre les accès aux données en mémoire.
 *
 * @returns {Array<Object>} Liste des recettes stockées ou un tableau vide si aucune recette n'est disponible.
 */
export function getAllRecipes() {
    try {
        logEvent("test_start_search", "getAllRecipes : Récupération des recettes en mémoire.");

        // Vérification de la disponibilité des recettes
        if (!Array.isArray(recipesData.recipes) || recipesData.recipes.length === 0) {
            logEvent("warn", "getAllRecipes : Aucune recette disponible en mémoire.");
            return [];
        }

        // Retourne les recettes stockées
        logEvent("test_end_search", `getAllRecipes : ${recipesData.recipes.length} recettes récupérées.`);
        return recipesData.recipes;
    } catch (error) {
        // Capture et journalisation des erreurs en cas de problème d'accès aux données
        logEvent("error", "getAllRecipes : Erreur lors de la récupération des recettes.", { error: error.message });
        return [];
    }
}

/* ====================================================================================
    RECHERCHE D'UNE RECETTE PAR ID
==================================================================================== */
/**
 * Recherche une recette par son identifiant unique.
 *
 * - Vérifie si l'ID fourni est valide avant d'effectuer la recherche.
 * - Utilise le cache des recettes (`recipeCache`) pour un accès rapide.
 * - Retourne `null` si aucune recette ne correspond à l'ID fourni.
 * - Ajoute des logs détaillés pour suivre chaque étape du processus.
 *
 * @param {number} id - Identifiant unique de la recette recherchée.
 * @returns {Object|null} La recette trouvée ou `null` si inexistante.
 */
export function getRecipeById(id) {
    try {
        logEvent("info", `getRecipeById : Recherche de la recette avec ID ${id} en cours.`);

        // Vérification que l'ID est bien un nombre valide
        if (typeof id !== "number" || isNaN(id) || id <= 0) {
            logEvent("error", `getRecipeById : ID invalide fourni (${id}). Recherche annulée.`);
            return null;
        }

        // Vérifie si la recette est présente dans le cache
        if (recipeCache.has(id)) {
            logEvent("success", `getRecipeById : Recette trouvée pour l'ID ${id}.`);
            return recipeCache.get(id);
        }

        // Log si aucune recette ne correspond à l'ID fourni
        logEvent("warn", `getRecipeById : Aucune recette trouvée pour l'ID ${id}.`);
        return null;
    } catch (error) {
        // Capture et journalisation des erreurs en cas d'échec
        logEvent("error", `getRecipeById : Erreur lors de la récupération de la recette ID ${id}.`, { error: error.message });
        return null;
    }
}

/* ====================================================================================
    MISE À JOUR DU CACHE DES RECETTES
==================================================================================== */
/**
 * Met à jour le cache des recettes après une modification.
 *
 * - Vérifie si `newRecipes` est bien un tableau avant de procéder à la mise à jour.
 * - Vérifie si `newRecipes` contient au moins une recette avant d’écraser l'ancien cache.
 * - Vide complètement l'ancien cache avant d'insérer les nouvelles recettes.
 * - Met à jour l'index des recettes pour assurer une recherche rapide.
 * - Ajoute des logs détaillés pour suivre chaque étape.
 *
 * @param {Array<Object>} newRecipes - Nouvelles recettes à stocker dans le cache.
 * @returns {void} Ne retourne rien, met à jour le cache et l'index des recettes.
 */
export function updateRecipeCache(newRecipes) {
    try {
        logEvent("info", "updateRecipeCache : Début de la mise à jour du cache.");

        // Vérification que `newRecipes` est un tableau valide
        if (!Array.isArray(newRecipes)) {
            logEvent("error", "updateRecipeCache : Données invalides reçues, mise à jour annulée.");
            return;
        }

        // Vérification si `newRecipes` contient des données avant mise à jour
        if (newRecipes.length === 0) {
            logEvent("warn", "updateRecipeCache : Tableau de recettes vide, aucun changement appliqué.");
            return;
        }

        logEvent("info", `updateRecipeCache : Mise à jour du cache avec ${newRecipes.length} nouvelles recettes.`);

        // Mise à jour du stockage en mémoire
        recipesData.recipes = newRecipes;

        // Suppression de l'ancien cache
        recipeCache.clear();
        logEvent("info", "updateRecipeCache : Cache vidé avant insertion des nouvelles recettes.");

        // Ajout des nouvelles recettes dans le cache avec indexation par ID
        newRecipes.forEach(recipe => recipeCache.set(recipe.id, recipe));

        logEvent("info", `updateRecipeCache : ${recipeCache.size} recettes stockées dans le cache.`);

        // Mise à jour de l'index des recettes pour la recherche
        buildRecipeIndex();

        logEvent("success", "updateRecipeCache : Mise à jour du cache et de l'index des recettes terminée.");
    } catch (error) {
        // Capture et journalisation des erreurs en cas de problème
        logEvent("error", "updateRecipeCache : Erreur lors de la mise à jour du cache des recettes.", { error: error.message });
    }
}
/* ====================================================================================
    RECHERCHE DE RECETTES PAR MOT-CLÉ
   ==================================================================================== */
/**
 * Effectue une recherche de recettes selon un mot-clé.
 * @param {string} keyword - Terme recherché.
 * @returns {Array<Object>}
 */
export function searchRecipes(keyword) {
    try {
        logEvent("test_start", `searchRecipes : Recherche pour '${keyword}'`);

        if (!keyword || typeof keyword !== "string" || keyword.trim().length < 3) {
            logEvent("warn", "searchRecipes : Mot-clé vide ou trop court, affichage de toutes les recettes.");
            return getAllRecipes();
        }

        const normalizedKeyword = normalizeText(keyword.trim());

        if (searchCache.has(normalizedKeyword)) {
            logEvent("info", `searchRecipes : Cache utilisé pour '${normalizedKeyword}'.`);
            return searchCache.get(normalizedKeyword);
        }

        const filteredRecipes = getAllRecipes().filter(recipe =>
            normalizeText(recipe.name).includes(normalizedKeyword) ||
            normalizeText(recipe.description).includes(normalizedKeyword) ||
            recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(normalizedKeyword))
        );

        if (searchCache.size >= SEARCH_CACHE_LIMIT) {
            const firstKey = searchCache.keys().next().value;
            searchCache.delete(firstKey);
            logEvent("info", `searchRecipes : Cache nettoyé, suppression de '${firstKey}'.`);
        }

        searchCache.set(normalizedKeyword, filteredRecipes);
        logEvent("success", `searchRecipes : ${filteredRecipes.length} résultats trouvés.`);
        return filteredRecipes;
    } catch (error) {
        logEvent("error", "searchRecipes : Erreur de recherche.", { error: error.message });
        return [];
    }
}

/* ====================================================================================
    RÉINITIALISATION DU CACHE DE RECHERCHE
   ==================================================================================== */

/**
 * Vide complètement le cache de recherche.
 * @returns {void}
 */
export function clearSearchCache() {
    try {
        const cacheSize = searchCache.size;
        if (cacheSize === 0) {
            logEvent("info", "clearSearchCache : Cache déjà vide.");
            return;
        }

        searchCache.clear();
        logEvent("success", `clearSearchCache : Cache vidé (${cacheSize} entrées supprimées).`);
    } catch (error) {
        logEvent("error", "clearSearchCache : Erreur lors de la suppression.", { error: error.message });
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

