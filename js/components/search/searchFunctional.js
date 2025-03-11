/* ====================================================================================
/*  FICHIER          : searchFunctional.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 10/02/2025
/*  DERNIÈRE MODIF.  : 11/02/2025
/*  DESCRIPTION      : Recherche des recettes en utilisant `.filter()`
/*                     - Normalisation du texte pour éviter les différences de casse.
/*                     - Application des critères de recherche et de filtres.
/*                     - Mise à jour dynamique des filtres après la recherche.
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../../data/dataManager.js";
import { normalizeText } from "../../utils/normalize.js";
import { updateFilters } from "../filterManager.js";
import {  matchFilters } from "./search.js";

/* ====================================================================================
/*                     RECHERCHE DES RECETTES AVEC PROGRAMMATION FONCTIONNELLE
/* ==================================================================================== */

/**
 * Recherche des recettes en mode fonctionnel avec `.filter()`.
 * - Supprime les redondances dans la normalisation des textes.
 * - Regroupe les vérifications en une seule boucle pour réduire les parcours.
 * 
 * @param {string} query - Texte recherché.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesFunctional(query) {
    try {
        if (!query || typeof query !== "string" || query.trim().length < 3) {
            logEvent("warning", "searchRecipesFunctional : Requête trop courte, minimum 3 caractères requis.");
            return [];
        }

        logEvent("info", `searchRecipesFunctional : Début de la recherche pour '${query}'.`);

        // Normalisation unique de la requête
        const normalizedQuery = normalizeText(query.trim());

        // Récupération des recettes
        const recipes = await getAllRecipes();
        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("error", "searchRecipesFunctional : Aucune recette disponible.");
            return [];
        }

        // 🔥 Optimisation : Regroupement des vérifications en une seule boucle `.filter()`
        const results = recipes.filter(recipe => {
            const normalizedRecipeName = normalizeText(recipe.name);
            return normalizedRecipeName.includes(normalizedQuery) || matchFilters(recipe);
        });

        logEvent("success", `searchRecipesFunctional : ${results.length} recette(s) trouvée(s) pour '${query}'.`);

        // Mise à jour des filtres après la recherche
        updateFilters(results);

        return results;
    } catch (error) {
        logEvent("error", "searchRecipesFunctional : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}