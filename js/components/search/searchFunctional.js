/* ==================================================================================== */
/*  FICHIER          : searchFunctional.js                                             */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                             */
/*  DATE DE CRÉATION : 10/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 11/02/2025                                                      */
/*  DESCRIPTION      : Recherche des recettes en utilisant `.filter()`                 */
/*                     - Normalisation du texte pour éviter les différences de casse.  */
/*                     - Application des critères de recherche et de filtres.         */
/*                     - Mise à jour dynamique des filtres après la recherche.        */
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../../data/dataManager.js";
import { normalizeText } from "../../utils/normalize.js";
import { updateFilters } from "../filterManager.js";

/*------------------------------------------------------------------*/
/*   Recherche des recettes avec programmation fonctionnelle       */
/*------------------------------------------------------------------*/

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
        if (!query || query.trim().length < 3) {
            logEvent("warning", "searchRecipesFunctional : Requête trop courte, minimum 3 caractères requis.");
            return [];
        }

        logEvent("info", `Recherche fonctionnelle en cours pour : "${query}"`);

        const normalizedQuery = normalizeText(query.trim());
        const recipes = await getAllRecipes();

        if (!recipes || recipes.length === 0) {
            logEvent("error", "searchRecipesFunctional : Aucune recette trouvée dans la base de données.");
            return [];
        }

        // Filtrage des recettes selon la recherche
        const results = recipes.filter(recipe =>
            matchesSearchCriteria(recipe, normalizedQuery) || matchFilters(recipe)
        );

        logEvent("success", `searchRecipesFunctional : ${results.length} recette(s) trouvée(s) pour "${query}".`);

        // Mise à jour des filtres disponibles après la recherche
        updateFilters(results);
        return results;
    } catch (error) {
        logEvent("error", "searchRecipesFunctional : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}
