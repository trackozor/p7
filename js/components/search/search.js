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
import { logEvent,displayErrorMessage } from "../../utils/utils.js";
import { updateRecipes } from "./displayResults.js";
import { normalizeText } from "../../utils/normalize.js";
import { getAllRecipes } from "../../data/dataManager.js";


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
        logEvent("test_start", ` Début de la recherche (query="${query}", filters=${JSON.stringify(filtersArray)})`);

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

        // ✅ Affichage d'un message si aucune recette n'est trouvée
        if (results.length === 0) {
            displayErrorMessage("Aucune recette trouvée pour cette recherche.");
        }

        logEvent("info", `Search : ${results.length} recette(s) trouvée(s).`);
        updateRecipes(results);

        logEvent("test_end", "🏁 Search : Recherche terminée avec succès.");
        return results;

    } catch (error) {
        logEvent("error", "Erreur lors de la recherche.", { error: error.message });

        // ✅ Affichage d'une erreur si un problème technique survient
        displayErrorMessage("Une erreur est survenue lors de la recherche.");
        
        return [];
    }
}

/* ====================================================================================
/*             EXÉCUTION DE LA RECHERCHE SELON LE MODE ACTIF
/* ==================================================================================== */
/**
 * Exécute la recherche en fonction du mode actif sélectionné.
 * - Utilise une recherche basée sur des boucles (`native`) ou sur `filter()` (`functional`).
 * - Retourne une liste de recettes correspondant à la requête.
 *
 * @async
 * @param {string} query - Texte recherché par l'utilisateur.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères de recherche.
 */
async function executeSearch(query) {
    return searchMode === "native" ? searchRecipesLoopNative(query) : searchRecipesFunctional(query);
}

/* ====================================================================================
/*                  CHANGEMENT DU MODE DE RECHERCHE
/* ==================================================================================== */
/**
 * Change dynamiquement la méthode de recherche utilisée.
 * - Vérifie que le mode est valide avant d'appliquer le changement.
 * - Relance une recherche si une requête est déjà en cours et contient au moins 3 caractères.
 *
 * @param {string} mode - Mode de recherche à activer, "native" (boucles for) ou "functional" (filter()).
 * @param {string} [query=""] - Requête en cours (si existante).
 * @returns {void} Ne retourne rien, met à jour le mode de recherche et relance la recherche si nécessaire.
 */
export function setSearchMode(mode, query = "") {
    // Vérification que le mode est bien valide
    if (mode !== "native" && mode !== "functional") {
        logEvent("error", "setSearchMode : Mode invalide, utilisez 'native' ou 'functional'.");
        return;
    }

    // Mise à jour du mode de recherche
    searchMode = mode;
    logEvent("success", `setSearchMode : Mode de recherche changé en "${mode}"`);

    // Si une requête est en cours et a au moins 3 caractères, relancer la recherche
    if (query.length >= 3) {
        Search(query);
    }
}

/** ====================================================================================
*                        RECHERCHE PAR TEXTE
* ==================================================================================== */
/**
 * Effectue une recherche basée uniquement sur le texte saisi par l'utilisateur.
 * - Exécute la recherche selon le mode actif ("native" ou "functional").
 * - Filtre les recettes en fonction des critères de correspondance.
 *
 * @async
 * @param {string} query - Texte recherché par l'utilisateur.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères de recherche.
 */
async function searchByQuery(query) {
    logEvent("info", `searchByQuery : Recherche pour "${query}".`);

    // Exécute la recherche en fonction du mode actif (boucles for ou filter())
    let recipes = await executeSearch(query);

    // Filtre les recettes en fonction des critères de recherche
    return recipes.filter(recipe => matchesSearchCriteria(recipe, query));
}

/* ====================================================================================
/*                        RECHERCHE PAR TAGS SEULS
/* ==================================================================================== */
/**
 * Effectue une recherche en filtrant uniquement par les tags sélectionnés.
 * - Récupère toutes les recettes disponibles.
 * - Applique un filtrage basé sur les tags actifs.
 *
 * @async
 * @param {Object} activeTags - Objet contenant les filtres actifs (ingredients, appliances, ustensils).
 * @returns {Promise<Array>} Liste des recettes correspondant aux tags sélectionnés.
 */
async function searchByTags(activeTags) {
    logEvent("info", `searchByTags : Filtrage avec tags ${JSON.stringify(activeTags)}`);

    // Récupère toutes les recettes disponibles et filtre celles qui correspondent aux tags actifs
    return getAllRecipes().filter(recipe => matchFilters(recipe, activeTags));
}

/* ====================================================================================
/*                   RECHERCHE COMBINÉE (TEXTE + TAGS)
/* ==================================================================================== */
/**
 * Effectue une recherche combinée en filtrant à la fois par texte et par tags sélectionnés.
 * - Exécute une recherche textuelle sur les recettes disponibles.
 * - Filtre ensuite les résultats en fonction des tags actifs.
 *
 * @async
 * @param {string} query - Requête de recherche saisie par l'utilisateur.
 * @param {Object} activeTags - Objet contenant les filtres actifs (ingredients, appliances, ustensils).
 * @returns {Promise<Array>} Liste des recettes correspondant à la recherche combinée.
 */
async function searchCombined(query, activeTags) {
    logEvent("info", `searchCombined : Recherche "${query}" avec tags ${JSON.stringify(activeTags)}`);

    // Exécute la recherche textuelle pour récupérer une première liste de résultats
    let results = await executeSearch(query);

    // Applique un filtrage supplémentaire basé sur les tags actifs
    return results.filter(recipe => matchesSearchCriteria(recipe, query) && matchFilters(recipe, activeTags));
}

/* ====================================================================================
/*                   FILTRAGE DES RECETTES SELON LES TAGS
/* ==================================================================================== */
/**
 * Vérifie si une recette correspond aux filtres actifs (tags sélectionnés).
 * 
 * - Vérifie que tous les ingrédients sélectionnés sont dans la recette.
 * - Vérifie que l’appareil sélectionné correspond.
 * - Vérifie que tous les ustensiles sélectionnés sont présents dans la recette.
 * - Utilise `normalizeText` pour éviter les erreurs liées à la casse et aux accents.
 *
 * @param {Object} recipe - Objet représentant une recette.
 * @returns {boolean} `true` si la recette correspond aux filtres actifs, sinon `false`.
 */
export function matchFilters(recipe) {
    try {
        // Vérifie si la recette est définie avant de continuer
        if (!recipe) {
            logEvent("error", "matchFilters : Recette non définie.");
            return false;
        }

        logEvent("info", `matchFilters : Vérification des tags pour la recette "${recipe.name}"`);

        // Récupère les tags actifs sélectionnés dans l'interface utilisateur
        const activeTags = {
            ingredients: Array.from(document.querySelectorAll('.filter-tag[data-filter-type="ingredients"]'))
                .map(tag => normalizeText(tag.textContent.trim())),
            appliances: Array.from(document.querySelectorAll('.filter-tag[data-filter-type="appliances"]'))
                .map(tag => normalizeText(tag.textContent.trim())),
            ustensils: Array.from(document.querySelectorAll('.filter-tag[data-filter-type="ustensils"]'))
                .map(tag => normalizeText(tag.textContent.trim()))
        };

        logEvent("info", `matchFilters : Tags actifs détectés : ${JSON.stringify(activeTags)}`);

        // Vérifie si tous les ingrédients sélectionnés sont présents dans la recette
        const ingredientsMatch = activeTags.ingredients.every(taggedIngredient =>
            recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(taggedIngredient))
        );

        // Vérifie si l’appareil sélectionné correspond à celui de la recette
        const applianceMatch = !activeTags.appliances.length || activeTags.appliances.includes(normalizeText(recipe.appliance));

        // Vérifie si tous les ustensiles sélectionnés sont présents dans la recette
        const ustensilsMatch = activeTags.ustensils.every(taggedUstensil =>
            recipe.ustensils.some(ust => normalizeText(ust).includes(taggedUstensil))
        );

        // Retourne `true` uniquement si tous les critères sont remplis
        const isMatch = ingredientsMatch && applianceMatch && ustensilsMatch;
        logEvent("success", `matchFilters : Résultat pour "${recipe.name}" → ${isMatch ? "Match" : "Non-match"}`);

        return isMatch;

    } catch (error) {
        logEvent("error", "matchFilters : Erreur lors de la vérification des filtres.", { error: error.message });
        return false;
    }
}

/* ==================================================================================== */
/*                      VÉRIFICATION DES CRITÈRES DE RECHERCHE                          */
/* ==================================================================================== */
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
        // Vérifie si la recette est un objet valide
        if (!recipe || typeof recipe !== "object") {
            logEvent("error", "matchesSearchCriteria : Recette invalide.");
            return false;
        }

        // Vérifie si la requête est une chaîne de caractères valide
        if (!query || typeof query !== "string") {
            logEvent("error", "matchesSearchCriteria : Requête invalide.");
            return false;
        }

        logEvent("info", `matchesSearchCriteria : Vérification de la recette "${recipe.name}" avec la requête '${query}'`);

        // Normalise la requête pour éviter les erreurs de casse et d’accents
        const normalizedQuery = normalizeText(query);

        // Vérifie si le nom de la recette correspond à la requête
        const nameMatch = normalizeText(recipe.name).includes(normalizedQuery);

        // Vérifie si un des ingrédients de la recette correspond à la requête
        const ingredientMatch = recipe.ingredients.some(ing => 
            normalizeText(ing.ingredient).includes(normalizedQuery)
        );

        // Vérifie si l’appareil utilisé dans la recette correspond à la requête
        const applianceMatch = normalizeText(recipe.appliance).includes(normalizedQuery);

        // Vérifie si un des ustensiles utilisés dans la recette correspond à la requête
        const ustensilMatch = recipe.ustensils.some(ust => 
            normalizeText(ust).includes(normalizedQuery)
        );

        // Retourne `true` si l'un des critères de recherche est validé
        const isMatch = nameMatch || ingredientMatch || applianceMatch || ustensilMatch;

        logEvent("success", `matchesSearchCriteria : Résultat pour "${recipe.name}" → ${isMatch ? "Match" : "Non-match"}`);

        return isMatch;
    } catch (error) {
        logEvent("error", "matchesSearchCriteria : Erreur inattendue.", { error: error.message });
        return false;
    }
}

