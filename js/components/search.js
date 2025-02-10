/* ==================================================================================== */
/*  FICHIER          : search.js                                                       */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                             */
/*  DATE DE CRÉATION : 10/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 11/02/2025                                                      */
/*  DESCRIPTION      : Gestion de la recherche de recettes avec filtres avancés.      */
/*                     - Recherche avec une boucle `for` et avec `.filter()`.         */
/*                     - Prise en compte des filtres actifs (ingrédients, ustensiles).*/
/*                     - Mise à jour dynamique des options disponibles.               */
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";
import { getAllRecipes } from "../data/dataManager.js";
import { normalizeText } from "../utils/normalize.js";

/* ====================================================================================
    STOCKAGE DES FILTRES SÉLECTIONNÉS
==================================================================================== */
/**
 * Stocke les filtres sélectionnés par l'utilisateur.
 * - Utilisation de `Set` pour éviter les doublons et optimiser la recherche.
 */
let selectedFilters = {
    ingredients: new Set(),
    ustensils: new Set(),
    appliances: new Set()
};

/* ====================================================================================
    RECHERCHE UTILISANT UNE BOUCLE `for`
==================================================================================== */

/**
 * Recherche des recettes en parcourant la liste avec une boucle `for`.
 * 
 * - Vérifie si la recherche est pertinente (3 caractères minimum ou filtres actifs).
 * - Compare la requête avec le nom, les ingrédients et la description de la recette.
 * - Applique les filtres avancés sélectionnés par l'utilisateur.
 *
 * @param {string} query - Texte recherché.
 * @returns {Array} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesLoop(query) {
    try {
        if (!isValidSearch(query)) {
            return [];
        }

        logEvent("info", `Recherche (Loop) pour "${query}"`);
        const normalizedQuery = normalizeText(query);
        const recipes = await getAllRecipes();
        const results = [];

        for (let recipe of recipes) {
            if (matchesSearchCriteria(recipe, normalizedQuery, query) || matchFilters(recipe)) {
                results.push(recipe);
            }
        }

        logEvent("success", `${results.length} résultats trouvés.`);
        updateFilters(results);
        return results;
    } catch (error) {
        logEvent("error", "Erreur lors de la recherche (Loop)", { error: error.message });
        return [];
    }
}

/* ====================================================================================
    RECHERCHE UTILISANT `.filter()`
==================================================================================== */
/**
 * Recherche des recettes en utilisant la méthode `filter()`.
 *
 * - Vérifie si la recherche est pertinente (au moins 3 caractères ou filtres actifs).
 * - Normalise la requête pour éviter les problèmes d'accentuation et de casse.
 * - Compare la requête avec le nom, les ingrédients et la description de la recette.
 * - Applique les filtres avancés (ingrédients, ustensiles, appareils) si sélectionnés.
 * - Enregistre chaque étape de l'exécution avec `logEvent()`.
 *
 * @param {string} query - Texte recherché par l'utilisateur.
 * @returns {Array} Liste des recettes correspondant aux critères.
 */
export async function searchRecipesFunctional(query) {
    try {
        // 1. Vérifie si la recherche est valide (au moins 3 caractères ou filtres actifs)
        if (!isValidSearch(query)) {
            return []; // Retourne un tableau vide si la recherche est ignorée
        }

        // 2. Journalisation de la recherche
        logEvent("info", `searchRecipesFunctional : Début de la recherche pour "${query}"`);

        // 3. Normalisation de la requête utilisateur pour assurer une recherche insensible à la casse et aux accents
        const normalizedQuery = normalizeText(query);

        // 4. Récupération de toutes les recettes disponibles
        const recipes = await getAllRecipes();

        // 5. Filtrage des recettes en fonction de la recherche et des filtres actifs
        const results = recipes.filter(recipe =>
            matchesSearchCriteria(recipe, normalizedQuery, query) || matchFilters(recipe)
        );

        // 6. Journalisation du nombre de résultats trouvés
        logEvent("success", `searchRecipesFunctional : ${results.length} résultats trouvés.`);

        // 7. Mise à jour dynamique des options de filtres en fonction des résultats obtenus
        updateFilters(results);

        // 8. Retourne la liste des recettes filtrées
        return results;
    } catch (error) {
        // 9. Gestion des erreurs et journalisation
        logEvent("error", "searchRecipesFunctional : Erreur lors de la recherche", { error: error.message });
        return [];
    }
}


/* ====================================================================================
    VALIDATION DES RECHERCHES ET FILTRES
==================================================================================== */

/*------------------------------------------------------------------------------------------------*/
/* Vérifie si une recherche est valide en fonction de la longueur du texte et des filtres actifs.
/*------------------------------------------------------------------------------------------------*/

/** - Une recherche est exécutée si :
 *   - La requête contient **au moins 3 caractères**.
 *   - OU au moins **un filtre est activé** (ingrédient, ustensile, appareil).
 * - Évite les requêtes inutiles et optimise les performances.
 * - Journalise les décisions avec `logEvent()`.
 *
 * @param {string} query - Texte recherché par l'utilisateur.
 * @returns {boolean} `true` si la recherche doit être exécutée, sinon `false`.
 */
function isValidSearch(query) {
    try {
        // 1. Vérification de la présence des filtres actifs
        const hasActiveFilters = selectedFilters.ingredients.size > 0 ||
                                selectedFilters.ustensils.size > 0 ||
                                selectedFilters.appliances.size > 0;

        // 2. Vérification si la requête est inférieure à 3 caractères et qu'aucun filtre n'est actif
        if (query.length < 3 && !hasActiveFilters) {
            logEvent("info", "isValidSearch : Recherche ignorée (moins de 3 caractères et aucun filtre actif).");
            return false; // Empêche la recherche inutile
        }

        // 3. Recherche valide : journalisation de l'exécution
        logEvent("info", "isValidSearch : Recherche valide, exécution autorisée.");
        return true;
    } catch (error) {
        // 4. Gestion des erreurs pour éviter les plantages
        logEvent("error", "isValidSearch : Erreur lors de la validation de la recherche", { error: error.message });
        return false;
    }
}


/**--------------------------------------------------------------------------*/
/* Vérifie si une recette correspond aux critères de recherche textuelle.
/*---------------------------------------------------------------------------*/

/**  - Compare le texte recherché avec :
 *   - **Le nom de la recette**.
 *   - **Les ingrédients** (via un `.some()` pour parcourir le tableau).
 *   - **La description** de la recette.
 * - Utilise une recherche insensible à la casse et aux accents grâce à `normalizeText()`.
 * - N'exécute la comparaison que si la requête fait **au moins 3 caractères**.
 * - Optimise les performances en évitant des comparaisons inutiles.
 *
 * @param {Object} recipe - Objet contenant les informations de la recette.
 * @param {string} normalizedQuery - Texte recherché après normalisation (minuscules, sans accents).
 * @param {string} query - Texte brut saisi par l'utilisateur.
 * @returns {boolean} `true` si la recette correspond aux critères, sinon `false`.
 */
function matchesSearchCriteria(recipe, normalizedQuery, query) {
    try {
        // 1. Vérification que la recherche contient au moins 3 caractères
        if (query.length < 3) {
            logEvent("info", "matchesSearchCriteria : Recherche ignorée (moins de 3 caractères).");
            return false;
        }

        // 2. Vérifie si le **nom de la recette** contient le texte recherché
        const nameMatch = normalizeText(recipe.name).includes(normalizedQuery);

        // 3. Vérifie si **au moins un ingrédient** correspond à la recherche
        const ingredientMatch = recipe.ingredients.some(ingredient => 
            normalizeText(ingredient.ingredient).includes(normalizedQuery)
        );

        // 4. Vérifie si la **description** de la recette contient le texte recherché
        const descriptionMatch = normalizeText(recipe.description).includes(normalizedQuery);

        // 5. Retourne `true` si au moins une des conditions est remplie
        return nameMatch || ingredientMatch || descriptionMatch;
        
    } catch (error) {
        // 6. Gestion des erreurs pour éviter les plantages
        logEvent("error", "matchesSearchCriteria : Erreur lors de la comparaison des critères", { error: error.message });
        return false;
    }
}


/**--------------------------------------------------------------------------*/
/* Vérifie si une recette correspond aux filtres sélectionnés.
/*---------------------------------------------------------------------------*/
/** 
 * - Vérifie la présence des ingrédients sélectionnés** en utilisant `every()`
 *   pour s'assurer que tous les ingrédients sélectionnés sont dans la recette.
 * - Vérifie la présence des ustensiles sélectionnés** en utilisant `every()`
 *   pour comparer chaque ustensile de la recette avec les filtres actifs.
 * - Vérifie l'appareil de la recette** en s'assurant qu'il correspond au filtre sélectionné.
 * - Utilise `normalizeText()` pour comparer les valeurs en ignorant la casse et les accents.
 *
 * @param {Object} recipe - Objet représentant une recette avec ses ingrédients, ustensiles et appareil.
 * @returns {boolean} `true` si la recette correspond aux filtres actifs, sinon `false`.
 */
function matchFilters(recipe) {
    try {
        // 1. Vérification si des filtres sont actifs, sinon toutes les recettes sont valides
        if (!selectedFilters || Object.values(selectedFilters).every(set => set.size === 0)) {
            logEvent("info", "matchFilters : Aucun filtre actif, toutes les recettes sont valides.");
            return true; 
        }

        // 2. Vérifie si **tous** les ingrédients sélectionnés sont présents dans la recette
        const hasIngredients = selectedFilters.ingredients.size === 0 || 
            [...selectedFilters.ingredients].every(tag =>
                recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(tag))
            );

        // 3. Vérifie si **tous** les ustensiles sélectionnés sont présents dans la recette
        const hasUstensils = selectedFilters.ustensils.size === 0 || 
            [...selectedFilters.ustensils].every(tag =>
                recipe.ustensils.some(ust => normalizeText(ust).includes(tag))
            );

        // 4. Vérifie si l'appareil utilisé dans la recette correspond au filtre sélectionné
        const hasAppliances = selectedFilters.appliances.size === 0 ||
            selectedFilters.appliances.has(normalizeText(recipe.appliance));

        // 5. La recette est valide seulement si **toutes les conditions sont remplies**
        const isValid = hasIngredients && hasUstensils && hasAppliances;

        // 6. Journalisation du résultat
        logEvent("info", `matchFilters : ${isValid ? "Recette valide" : "Recette exclue"} pour les filtres actifs.`);

        return isValid;
    } catch (error) {
        logEvent("error", "matchFilters : Erreur lors du filtrage des recettes.", { error: error.message });
        return false;
    }
}

/* ====================================================================================
    MISE À JOUR DES FILTRES APRÈS UNE RECHERCHE
==================================================================================== */
/**
 * Met à jour dynamiquement les options de filtres après une recherche.
 *
 * - Analyse les résultats et extrait les ingrédients, ustensiles et appareils uniques.
 * - Compare les nouvelles valeurs avec les filtres déjà sélectionnés.
 * - Supprime les filtres qui ne sont plus valides après la recherche.
 * - Utilise des `Set()` pour garantir des valeurs uniques et optimiser la performance.
 * - Journalise chaque étape pour le suivi et le débogage.
 *
 * @param {Array} results - Liste des recettes après filtrage.
 */
function updateFilters(results) {
    try {
        // 1. Vérification de l'entrée
        if (!Array.isArray(results)) {
            logEvent("error", "updateFilters : Résultats invalides fournis.", { results });
            return;
        }

        logEvent("info", `updateFilters : Mise à jour des filtres basée sur ${results.length} recettes.`);

        // 2. Création de nouveaux ensembles pour stocker les valeurs uniques des filtres mis à jour
        const updatedFilters = {
            ingredients: new Set(),
            ustensils: new Set(),
            appliances: new Set()
        };

        // 3. Extraction des valeurs uniques des résultats de recherche
        results.forEach(recipe => {
            if (recipe.ingredients) {
                recipe.ingredients.forEach(ing => updatedFilters.ingredients.add(normalizeText(ing.ingredient)));
            }
            if (recipe.ustensils) {
                recipe.ustensils.forEach(ust => updatedFilters.ustensils.add(normalizeText(ust)));
            }
            if (recipe.appliance) {
                updatedFilters.appliances.add(normalizeText(recipe.appliance));
            }
        });

        // 4. Suppression des filtres sélectionnés qui ne sont plus valides après filtrage
        selectedFilters.ingredients = new Set([...selectedFilters.ingredients]
            .filter(tag => updatedFilters.ingredients.has(tag)));

        selectedFilters.ustensils = new Set([...selectedFilters.ustensils]
            .filter(tag => updatedFilters.ustensils.has(tag)));

        selectedFilters.appliances = new Set([...selectedFilters.appliances]
            .filter(tag => updatedFilters.appliances.has(tag)));

        logEvent("success", `updateFilters : Filtres mis à jour - Ingrédients: ${selectedFilters.ingredients.size}, Ustensiles: ${selectedFilters.ustensils.size}, Appareils: ${selectedFilters.appliances.size}`);

    } catch (error) {
        logEvent("error", "updateFilters : Erreur lors de la mise à jour des filtres.", { error: error.message });
    }
}
