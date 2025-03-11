/* ==================================================================================== */
/*  FICHIER          : searchRecipesLoopNative.js                                      */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                             */
/*  DATE DE CRÉATION : 10/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 11/02/2025                                                      */
/*  DESCRIPTION      : Recherche des recettes avec une boucle `for`                    */
/*                     - Parcours séquentiel des recettes stockées.                    */
/*                     - Vérification des filtres actifs avant ajout aux résultats.    */
/*                     - Normalisation des textes pour uniformiser la comparaison.     */
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../../data/dataManager.js";
import { normalizeText } from "../../utils/normalize.js";
import { updateFilters } from "../filterManager.js";
import { matchesSearchCriteria, matchFilters } from "./search.js"; 


/* ==================================================================================== */
/*    Recherche avec une boucle `for`                                                 */
/* ==================================================================================== */
/**
 * Effectue une recherche parmi les recettes en utilisant des boucles `for` au lieu de méthodes fonctionnelles.
 *
 * Cette implémentation se veut optimisée pour comparer les performances avec la version fonctionnelle.
 * 
 * @async
 * @function searchRecipesLoopNative
 * @param {string} query - La chaîne de texte saisie par l'utilisateur pour la recherche.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères de recherche.
 */
export async function searchRecipesLoopNative(query) {
    try {
        if (!query || query.trim().length < 3) {
            logEvent("warning", "searchRecipesLoopNative : Requête trop courte, minimum 3 caractères requis.");
            return [];
        }

        logEvent("info", `Recherche avec boucles natives pour : "${query}"`);

        const normalizedQuery = normalizeText(query.trim());
        const recipes = getAllRecipes();

        if (!recipes || recipes.length === 0) {
            logEvent("error", "searchRecipesLoopNative : Aucune recette trouvée dans la base de données.");
            return [];
        }

        let results = [];
        let mappedResults = []; // Regroupe extraction des noms et filtrage en une seule boucle
        for (let i = 0; i < recipes.length; i++) {
            if (matchesSearchCriteria(recipes[i], normalizedQuery) || matchFilters(recipes[i])) {
                results.push(recipes[i]);
                mappedResults.push(recipes[i].name);
            }
        }

        logEvent("success", `searchRecipesLoopNative : ${results.length} recette(s) trouvée(s) pour "${query}".`);

        for (let i = 0; i < results.length; i++) {
            updateFilters(results[i]); 
        }

        return results;
    } catch (error) {
        logEvent("error", "searchRecipesLoopNative : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

