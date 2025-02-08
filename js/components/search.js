/* ==================================================================================== */
/*  FICHIER          : search.js                                                       */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.2                                                              */
/*  DATE DE CRÉATION : 09/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Gère la recherche de recettes par mot-clé avec 2 méthodes :      */
/*                     - `searchRecipesLoop` (boucle for, approche itérative)           */
/*                     - `searchRecipesFunctional` (méthode fonctionnelle, `filter`)   */
/* ==================================================================================== */
/*  FONCTIONNALITÉS :                                                                */
/*     Recherche optimisée des recettes par titre, description et ingrédients       */
/*     Deux approches : itérative et fonctionnelle                                 */
/*     Gestion robuste des erreurs                                                 */
/*     Logs détaillés pour le suivi des performances                               */
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";
import { loadRecipes } from "../data/dataManager.js"; // 
import { normalizeText } from "../utils/normalize.js";  // Normalisation


/* ================================================================================ 
  MÉTHODE 1 : RECHERCHE PAR BOUCLE `FOR`
  Itératif : Parcours les recettes une par une pour trouver des correspondances.
================================================================================ */

export async function searchRecipesLoop(query) {
    try {
        logEvent("INFO", ` Recherche (Loop) en cours pour : "${query}"`);

        const normalizedQuery = normalizeText(query);
        const recipes = await loadRecipes(); // Récupère les recettes dynamiquement
        const results = [];

        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];

            if (
                normalizeText(recipe.name).includes(normalizedQuery) ||
                recipe.ingredients.some((ingredient) =>
                    normalizeText(ingredient.ingredient).includes(normalizedQuery)
                ) ||
                normalizeText(recipe.description).includes(normalizedQuery)
            ) {
                results.push(recipe);
            }
        }

        logEvent("SUCCESS", ` Recherche (Loop) terminée : ${results.length} résultats trouvés.`);
        return results;

    } catch (error) {
        logEvent("ERROR", " Erreur lors de la recherche (Loop)", { error: error.message });
        return [];
    }
}

/* ================================================================================ 
  MÉTHODE 2 : RECHERCHE FONCTIONNELLE (`filter`)
  Approche plus concise et performante avec `Array.filter()`
================================================================================ */

export async function searchRecipesFunctional(query) {
    try {
        logEvent("INFO", ` Recherche (Functional) en cours pour : "${query}"`);

        const normalizedQuery = normalizeText(query);
        const recipes = await loadRecipes(); // Récupère les recettes dynamiquement

        const results = recipes.filter(
            (recipe) =>
                normalizeText(recipe.name).includes(normalizedQuery) ||
                recipe.ingredients.some((ingredient) =>
                    normalizeText(ingredient.ingredient).includes(normalizedQuery)
                ) ||
                normalizeText(recipe.description).includes(normalizedQuery)
        );

        logEvent("SUCCESS", `Recherche (Functional) terminée : ${results.length} résultats trouvés.`);
        return results;

    } catch (error) {
        logEvent("ERROR", "Erreur lors de la recherche (Functional)", { error: error.message });
        return [];
    }
}
