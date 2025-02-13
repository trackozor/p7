/* ==================================================================================== */
/*  FICHIER          : sortManager.js                                                  */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.1                                                             */
/*  DATE DE CRÉATION : 10/02/2025                                                      */
/*  DESCRIPTION      : Gère le tri dynamique des recettes sans classe                  */
/* ==================================================================================== */

import { templateManager } from "../../data/templateManager.js";
import { logEvent } from "../../utils/utils.js";

/* ==================================================================================== */
/*  Fonction : getSortedRecipes                                                        */
/* ==================================================================================== */
/**
 * Trie les recettes en fonction du type de tri choisi.
 *
 * - Ne modifie pas l'original, retourne une nouvelle liste triée.
 * - Utilise `localeCompare()` pour un tri alphabétique.
 * - Trie aussi par temps et nombre d'ingrédients.
 *
 * @param {Array} recipes - Liste des recettes à trier.
 * @param {string} sortType - Type de tri choisi (`A-Z`, `Z-A`, `time-asc`, `time-desc`, etc.).
 * @returns {Array} - Nouvelle liste triée des recettes.
 */
export function getSortedRecipes(recipes, sortType) {
    if (!Array.isArray(recipes) || recipes.length === 0) {
        logEvent("WARNING", "getSortedRecipes : Aucune recette à trier.");
        return [];
    }

    // Copie des recettes pour ne pas modifier l'original
    const sortedRecipes = [...recipes];

    // ==============================
    // Appliquer le type de tri
    // ==============================

    switch (sortType) {
        case "A-Z":
            sortedRecipes.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "Z-A":
            sortedRecipes.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "time-asc":
            sortedRecipes.sort((a, b) => a.time - b.time);
            break;
        case "time-desc":
            sortedRecipes.sort((a, b) => b.time - a.time);
            break;
        case "ingredients-asc":
            sortedRecipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
            break;
        case "ingredients-desc":
            sortedRecipes.sort((a, b) => b.ingredients.length - a.ingredients.length);
            break;
        default:
            logEvent("INFO", "getSortedRecipes : Tri par défaut (non modifié).");
            break;
    }

    logEvent("SUCCESS", `getSortedRecipes : Tri appliqué - ${sortType}`);
    return sortedRecipes;
}

/* ==================================================================================== */
/*  Fonction : applySort                                                               */
/* ==================================================================================== */
/**
 * Applique un tri aux recettes et met à jour l'affichage.
 *
 * - Récupère la liste triée via `getSortedRecipes()`.
 * - Affiche les recettes triées via `templateManager.displayAllRecipes()`.
 *
 * @param {Array} recipes - Liste des recettes à trier et afficher.
 * @param {string} sortType - Type de tri choisi.
 */
export function applySort(recipes, sortType) {
    if (!Array.isArray(recipes) || recipes.length === 0) {
        logEvent("WARNING", "applySort : Aucune recette à afficher après tri.");
        return;
    }

    // Tri des recettes
    const sortedRecipes = getSortedRecipes(recipes, sortType);

    // Mise à jour de l'affichage
    templateManager.displayAllRecipes("#recipes-container", sortedRecipes);
}
