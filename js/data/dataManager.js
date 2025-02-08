/* ==================================================================================== */
/*  FICHIER          : dataManager.js                                                   */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.0                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 08/02/2025                                                       */
/*  DESCRIPTION      : Gère le chargement, la mise en cache et la recherche des recettes */
/*                     en utilisant un système de logs avancé et une gestion robuste des */
/*                     erreurs.                                                         */
/* ==================================================================================== */
/*   FONCTIONNALITÉS :                                                                */
/*    Chargement et mise en cache des recettes depuis un fichier JSON               */
/*    Récupération de toutes les recettes                                          */
/*    Recherche d'une recette par son identifiant                                  */
/*    Filtrage des recettes par mot-clé                                           */
/*    Gestion des erreurs et retour sécurisé des données                          */
/*    Enregistrement des événements et erreurs via `logEvent()`                   */
/* ==================================================================================== */
import { logEvent } from "../utils/utils.js";

class DataManager {
    
    /* ================================================================================
    CONSTRUCTEUR - Initialise le cache des recettes
    ================================================================================ */
    
    /**
     * Initialise la gestion des données avec une mise en cache.
     * Le cache permet d'éviter de recharger les recettes à chaque appel.
     */
    constructor() {
        /** @type {Array<Object>|null} Stocke les recettes en mémoire après chargement. */
        this.cache = null;
    }

    /* ================================================================================
    CHARGEMENT DES RECETTES - Depuis un fichier JSON et stockage en cache
    ================================================================================ */

    /**
     * Charge les recettes depuis le fichier JSON et les stocke en cache.
     * Si les recettes sont déjà en cache, elles sont retournées immédiatement.
     *
     * @async
     * @returns {Promise<Array<Object>>} Un tableau d'objets contenant toutes les recettes.
     * @throws {Error} En cas d'échec du chargement des données.
     */
    async loadRecipes() {
        if (!this.cache) {
            try {
                logEvent("INFO", "Début du chargement des recettes depuis le fichier JSON...");

                const response = await fetch('/recipes.json');

                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }

                this.cache = await response.json();

                logEvent("SUCCESS", "Données chargées et stockées en cache.", { total: this.cache.length });

            } catch (error) {
                logEvent("ERROR", "Échec du chargement des recettes.", { error: error.message });
                throw error;
            }
        }

        return this.cache;
    }

    /* ================================================================================
    RÉCUPÉRATION DE TOUTES LES RECETTES
    ================================================================================ */

    /**
     * Récupère toutes les recettes disponibles.
     *
     * @async
     * @returns {Promise<Array<Object>>} Une liste complète de toutes les recettes.
     */
    async getAllRecipes() {
        try {
            const recipes = await this.loadRecipes();

            logEvent("SUCCESS", "Récupération de toutes les recettes réussie.", { total: recipes.length });

            return recipes;

        } catch (error) {
            logEvent("ERROR", "Impossible de récupérer les recettes.", { error: error.message });
            return [];
        }
    }

    /* ================================================================================
    RECHERCHE D'UNE RECETTE PAR IDENTIFIANT
    ================================================================================ */

    /**
     * Recherche une recette par son identifiant unique.
     *
     * @async
     * @param {number} id - Identifiant unique de la recette à récupérer.
     * @returns {Promise<Object|null>} La recette trouvée ou `null` si elle n'existe pas.
     */
    async getRecipeById(id) {
        try {
            const recipes = await this.loadRecipes();
            const recipe = recipes.find(recipe => recipe.id === id) || null;

            if (recipe) {
                logEvent("SUCCESS", `Recette trouvée : ${recipe.name}`, { id });
            } else {
                logEvent("WARNING", "Aucune recette trouvée avec cet ID.", { id });
            }

            return recipe;

        } catch (error) {
            logEvent("ERROR", `Erreur lors de la récupération de la recette ID ${id}`, { error: error.message });
            return null;
        }
    }

    /* ================================================================================
    RECHERCHE DES RECETTES PAR MOT-CLÉ
    ================================================================================ */

    /**
     * Recherche des recettes contenant un mot-clé dans leur nom ou ingrédients.
     *
     * @async
     * @param {string} keyword - Mot-clé à rechercher.
     * @returns {Promise<Array<Object>>} Liste des recettes correspondant au mot-clé.
     */
    async searchRecipes(keyword) {
        try {
            if (!keyword.trim()) {
                logEvent("INFO", "Aucun mot-clé fourni, retour de toutes les recettes.");
                return this.getAllRecipes();
            }

            const recipes = await this.loadRecipes();
            const filteredRecipes = recipes.filter(recipe => filterRecipeByKeyword(keyword, recipe));

            logEvent("SUCCESS", `Recherche terminée : ${filteredRecipes.length} recettes trouvées.`, { keyword });

            return filteredRecipes;

        } catch (error) {
            logEvent("ERROR", `Erreur lors de la recherche de recettes pour '${keyword}'`, { error: error.message });
            return [];
        }
    }
}

/* ================================================================================
FILTRAGE DES RECETTES PAR MOT-CLÉ 
================================================================================ */

/**
 * Vérifie si une recette contient le mot-clé dans son nom ou ses ingrédients.
 *
 * @param {string} keyword - Mot-clé à rechercher.
 * @param {Object} recipe - Objet représentant une recette.
 * @returns {boolean} `true` si la recette correspond au mot-clé, sinon `false`.
 */
function filterRecipeByKeyword(keyword, recipe) {
    const lowerKeyword = keyword.toLowerCase();

    return (
        recipe.name.toLowerCase().includes(lowerKeyword) ||
        recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(lowerKeyword))
    );
}

/* ================================================================================
    EXPORT DU MODULE `dataManager`
================================================================================ */

// Exportation d'une instance unique du gestionnaire de recettes
export const dataManager = new DataManager();
