/* ==================================================================================== */
/*  FICHIER          : search.js                                                       */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.4                                                             */
/*  DESCRIPTION      : Gestion du système de recherche avancé.                         */
/*                     - Sélection entre une recherche "native" et "fonctionnelle".    */
/*                     - Vérification et normalisation de la requête.                  */
/*                     - Journalisation détaillée des actions.                         */
/* ==================================================================================== */

import { searchRecipesFunctional } from "./searchFunctional.js";
import { searchRecipesLoopNative } from "./searchloopNative.js"; 
import { logEvent } from "../../utils/utils.js";
import { updateRecipes } from "./displayResults.js";
import { normalizeText } from "../../utils/normalize.js";

/* ==================================================================================== */
/*  MODES DE RECHERCHE                                                                 */
/* ==================================================================================== */
// Le mode actif peut être "native" (boucles for) ou "functional" (filter()).
let searchMode = "functional"; 

/* ==================================================================================== */
/*  FONCTION PRINCIPALE DE RECHERCHE                                                   */
/* ==================================================================================== */
/**
 * Exécute la recherche avec le mode défini.
 *
 * - Normalise la requête pour éviter les erreurs.
 * - Vérifie que la requête a une longueur valide.
 * - Sélectionne le bon mode de recherche (`native` ou `functional`).
 * - Passe les résultats à `updateRecipes()` pour l'affichage.
 *
 * @param {string} query - Texte recherché par l'utilisateur.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function Search(query) {
    try {
        logEvent("test_start", `Search : Début de la recherche avec mode "${searchMode}"`);

        // Vérification et nettoyage de la requête utilisateur
        const sanitizedQuery = query.trim().toLowerCase();

        if (sanitizedQuery.length < 3) {
            logEvent("warn", "Search : Requête trop courte (minimum 3 caractères).");
            updateRecipes([]); // Réinitialise l'affichage si la requête est invalide
            return [];
        }

        let results = [];

        // Sélection du mode de recherche
        if (searchMode === "native") {
            results = await searchRecipesLoopNative(sanitizedQuery);
        } else {
            results = await searchRecipesFunctional(sanitizedQuery);
        }

        logEvent("info", `Search : ${results.length} recette(s) trouvée(s) pour "${sanitizedQuery}"`);

        // Mise à jour de la galerie avec les nouvelles recettes
        updateRecipes(results);

        logEvent("test_end", "Search : Recherche terminée.");
        return results;
    } catch (error) {
        logEvent("error", "Search : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

/* ==================================================================================== */
/*  CHANGEMENT DU MODE DE RECHERCHE                                                    */
/* ==================================================================================== */
/**
 * Change dynamiquement la méthode de recherche utilisée.
 *
 * - Vérifie que le mode est valide avant d'appliquer le changement.
 * - Relance une recherche si une requête est déjà en cours.
 *
 * @param {string} mode - "native" ou "functional".
 * @param {string} [query=""] - Requête en cours (si existante).
 */
export function setSearchMode(mode, query = "") {
    if (mode !== "native" && mode !== "functional") {
        logEvent("error", "setSearchMode : Mode invalide, utilisez 'native' ou 'functional'.");
        return;
    }

    searchMode = mode;
    logEvent("success", `setSearchMode : Mode de recherche changé en "${mode}"`);

    // Si une requête est déjà en cours et contient au moins 3 caractères, relancer la recherche
    if (query.length >= 3) {
        Search(query);
    }
}

/* ==================================================================================== */
/*  FILTRAGE DES RECETTES SELON LES TAGS                                              */
/* ==================================================================================== */
/**
 * Vérifie si une recette correspond aux filtres actifs (tags sélectionnés).
 *
 * - Vérifie que tous les ingrédients tagués sont dans la recette.
 * - Vérifie que l’appareil tagué correspond.
 * - Vérifie que tous les ustensiles tagués sont dans la recette.
 * - Utilise `normalizeText` pour éviter les erreurs de casse et d’accents.
 *
 * @param {Object} recipe - La recette à tester.
 * @returns {boolean} True si la recette correspond aux tags sélectionnés, False sinon.
 */
export function matchFilters(recipe) {
    try {
        if (!recipe) {
            logEvent("error", "matchFilters : Recette non définie.");
            return false;
        }

        logEvent("info", `matchFilters : Vérification des tags pour la recette "${recipe.name}"`);

        // Récupération des tags actifs sélectionnés dans l'interface utilisateur
        const activeTags = {
            ingredients: Array.from(document.querySelectorAll('.filter-tag[data-filter-type="ingredients"]'))
                .map(tag => normalizeText(tag.textContent.trim())),
            appliances: Array.from(document.querySelectorAll('.filter-tag[data-filter-type="appliances"]'))
                .map(tag => normalizeText(tag.textContent.trim())),
            ustensils: Array.from(document.querySelectorAll('.filter-tag[data-filter-type="ustensils"]'))
                .map(tag => normalizeText(tag.textContent.trim()))
        };

        logEvent("info", `matchFilters : Tags actifs détectés : ${JSON.stringify(activeTags)}`);

        // Vérification des ingrédients (tous les ingrédients tagués doivent être présents dans la recette)
        const ingredientsMatch = activeTags.ingredients.every(taggedIngredient =>
            recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(taggedIngredient))
        );

        // Vérification de l’appareil (si un appareil est tagué, il doit correspondre)
        const applianceMatch = !activeTags.appliances.length || activeTags.appliances.includes(normalizeText(recipe.appliance));

        // Vérification des ustensiles (tous les ustensiles tagués doivent être dans la recette)
        const ustensilsMatch = activeTags.ustensils.every(taggedUstensil =>
            recipe.ustensils.some(ust => normalizeText(ust).includes(taggedUstensil))
        );

        // Retourne vrai si tous les critères sont validés
        const isMatch = ingredientsMatch && applianceMatch && ustensilsMatch;
        logEvent("success", `matchFilters : Résultat pour "${recipe.name}" → ${isMatch ? "Match" : "Non-match"}`);

        return isMatch;

    } catch (error) {
        logEvent("error", "matchFilters : Erreur lors de la vérification des filtres.", { error: error.message });
        return false;
    }
}
