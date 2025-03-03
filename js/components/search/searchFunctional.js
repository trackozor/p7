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
import { matchesSearchCriteria, matchFilters } from "./search.js";

/* ====================================================================================
/*                     RECHERCHE DES RECETTES AVEC PROGRAMMATION FONCTIONNELLE
/* ==================================================================================== */
/**
 * Recherche des recettes en utilisant `.filter()`.
 *
 * - Normalise la requête avant de comparer les données.
 * - Vérifie que la recherche contient au moins 3 caractères.
 * - Applique les critères de recherche et met à jour les filtres.
 *
 * @param {string} query - Texte recherché.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesFunctional(query) {
    try {
        logEvent("info", `searchRecipesFunctional : Début de la recherche pour '${query}'.`);

        // Vérifie si la requête est valide
        if (!query || typeof query !== "string" || query.trim().length < 3) {
            logEvent("warning", "searchRecipesFunctional : Requête trop courte, minimum 3 caractères requis.");
            return [];
        }

        // Normalisation de la requête pour éviter les différences de casse et d'accents
        const normalizedQuery = normalizeText(query.trim());

        // Récupération de toutes les recettes en base de données
        const recipes = await getAllRecipes();

        // Vérifie que la base de données contient bien des recettes
        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("error", "searchRecipesFunctional : Aucune recette disponible en base de données.");
            return [];
        }

        // Application des critères de recherche et des filtres actifs
        const results = recipes.filter(recipe =>
            matchesSearchCriteria(recipe, normalizedQuery) || matchFilters(recipe)
        );

        logEvent("success", `searchRecipesFunctional : ${results.length} recette(s) trouvée(s) pour '${query}'.`);

        // Mise à jour des filtres disponibles après la recherche
        updateFilters(results);

        return results;
    } catch (error) {
        logEvent("error", "searchRecipesFunctional : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}
