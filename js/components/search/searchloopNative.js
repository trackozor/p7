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


/*===================================================================*/
/*   Recherche avec une boucle `for`                               */
/*===================================================================*/
/**
 * Recherche des recettes en parcourant la liste avec une boucle `for`.
 *
 * - Normalise la requête avant de comparer les données.
 * - Applique les critères de recherche et met à jour les filtres actifs.
 *
 * @param {string} query - Texte recherché.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
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

        const results = [];

        for (const recipe of recipes) {
            if (matchesSearchCriteria(recipe, normalizedQuery) || matchFilters(recipe)) {
                results.push(recipe);
            }
        }

        logEvent("success", `searchRecipesLoopNative : ${results.length} recette(s) trouvée(s) pour "${query}".`);

        updateFilters(results);
        return results;
    } catch (error) {
        logEvent("error", "searchRecipesLoopNative : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

