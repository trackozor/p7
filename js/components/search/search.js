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

/** ==================================================================================== */
/*  FONCTION PRINCIPALE DE RECHERCHE                                                   */
/* ==================================================================================== */
/**
 * Exécute la recherche en fonction du mode sélectionné et de l'origine de l'appel.
 *
 * - Si la recherche vient de la barre (`searchBar`), elle nécessite au moins 3 caractères.
 * - Si elle vient des filtres (`filters`), elle s'exécute directement sans restriction.
 * - Applique la méthode de recherche (`native` ou `functional`).
 * - Met à jour l'affichage des recettes avec `updateRecipes()`.
 *
 * @param {string} query - Texte recherché par l'utilisateur.
 * @param {string} [searchType="default"] - Type de recherche ("searchBar" ou "filters").
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function Search(query = "", filtersArray = {}) {
    try {
        logEvent("test_start", `🔍 Début de la recherche (query="${query}", filters=${JSON.stringify(filtersArray)})`);

        const sanitizedQuery = query.trim().toLowerCase();
        const hasQuery = sanitizedQuery.length >= 3;
        const hasTags = filtersArray && Object.values(filtersArray).some(tags => tags.length > 0);

        let results = [];

        if (hasQuery && !hasTags) {
            logEvent("info", `Search : Recherche avec texte seul "${sanitizedQuery}".`);
            results = await searchByQuery(sanitizedQuery);
        } 
        else if (!hasQuery && hasTags) {
            logEvent("info", `Search : Recherche avec filtres seuls.`);
            results = await searchByTags(filtersArray);
        } 
        else if (hasQuery && hasTags) {
            logEvent("info", `Search : Recherche combinée avec texte "${sanitizedQuery}" et tags.`);
            results = await searchCombined(sanitizedQuery, filtersArray);
        } 
        else {
            logEvent("warn", "Search : Aucun critère spécifié, affichage de toutes les recettes.");
            results = getAllRecipes();
        }

        logEvent("info", `Search : ${results.length} recette(s) trouvée(s).`);
        updateRecipes(results);

        logEvent("test_end", "🏁 Search : Recherche terminée avec succès.");
        return results;

    } catch (error) {
        logEvent("error", "💥 Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

/** ==================================================================================== */
/**  EXÉCUTION DE LA RECHERCHE SELON LE MODE ACTIF                                      */
/** ==================================================================================== */
async function executeSearch(query) {
    return searchMode === "native" ? searchRecipesLoopNative(query) : searchRecipesFunctional(query);
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
/** ==================================================================================== */
/**  RECHERCHE PAR TEXTE                                                                */
/** ==================================================================================== */
async function searchByQuery(query) {
    logEvent("info", `searchByQuery : Recherche pour "${query}".`);
    let recipes = await executeSearch(query);
    return recipes.filter(recipe => matchesSearchCriteria(recipe, query));
}

/** ==================================================================================== */
/**  RECHERCHE PAR TAGS SEULS                                                           */
/** ==================================================================================== */
async function searchByTags(activeTags) {
    logEvent("info", `searchByTags : Filtrage avec tags ${JSON.stringify(activeTags)}`);
    return getAllRecipes().filter(recipe => matchFilters(recipe, activeTags));
}

/** ==================================================================================== */
/**  RECHERCHE COMBINÉE (TEXTE + TAGS)                                                  */
/** ==================================================================================== */
async function searchCombined(query, activeTags) {
    logEvent("info", `searchCombined : Recherche "${query}" avec tags ${JSON.stringify(activeTags)}`);
    let results = await executeSearch(query);
    return results.filter(recipe => matchesSearchCriteria(recipe, query) && matchFilters(recipe, activeTags));
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
/** ====================================================================================
 *  AJOUT DE `matchesSearchCriteria` POUR VÉRIFIER LES CRITÈRES DE RECHERCHE
 * ==================================================================================== */
/**
 * Vérifie si une recette correspond aux critères de recherche.
 *
 * - Vérifie si le nom de la recette contient la requête.
 * - Vérifie si un ingrédient, un appareil ou un ustensile correspond à la requête.
 * - Utilise `normalizeText()` pour éviter les erreurs de casse et d’accents.
 *
 * @param {Object} recipe - Objet représentant une recette.
 * @param {string} query - Texte recherché.
 * @returns {boolean} `true` si la recette correspond aux critères, sinon `false`.
 */
export function matchesSearchCriteria(recipe, query) {
    try {
        if (!recipe || typeof recipe !== "object") {
            logEvent("error", "matchesSearchCriteria : Recette invalide.");
            return false;
        }

        if (!query || typeof query !== "string") {
            logEvent("error", "matchesSearchCriteria : Requête invalide.");
            return false;
        }

        logEvent("info", `matchesSearchCriteria : Vérification de la recette "${recipe.name}" avec la requête '${query}'`);

        const normalizedQuery = normalizeText(query);

        // Vérifie si le nom de la recette correspond
        const nameMatch = normalizeText(recipe.name).includes(normalizedQuery);

        // Vérifie si un ingrédient correspond
        const ingredientMatch = recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(normalizedQuery));

        // Vérifie si l’appareil correspond
        const applianceMatch = normalizeText(recipe.appliance).includes(normalizedQuery);

        // Vérifie si un ustensile correspond
        const ustensilMatch = recipe.ustensils.some(ust => normalizeText(ust).includes(normalizedQuery));

        // Si l'un des critères correspond, retourne `true`
        const isMatch = nameMatch || ingredientMatch || applianceMatch || ustensilMatch;

        logEvent("success", `matchesSearchCriteria : Résultat pour "${recipe.name}" → ${isMatch ? "Match" : "Non-match"}`);

        return isMatch;
    } catch (error) {
        logEvent("error", "matchesSearchCriteria : Erreur inattendue.", { error: error.message });
        return false;
    }
}
