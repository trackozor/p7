/* ==================================================================================== */
/*  FICHIER          : dataManager.js                                                   */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.2                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Gère le chargement, la mise en cache et la recherche des recettes */
/*                     en utilisant un système de logs avancé et une gestion robuste des */
/*                     erreurs.                                                         */
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";

class DataManager {
    /**
     * Initialise la gestion des données avec une mise en cache.
     */
    constructor() {
        /** @type {Array<Object>|null} Stocke les recettes après chargement */
        this.cache = null;
    }

    /**
     * Charge les recettes depuis le fichier JSON et les stocke en cache.
     * @async
     * @returns {Promise<Array<Object>>} Un tableau d'objets contenant toutes les recettes.
     * @throws {Error} En cas d'échec du chargement des données.
     */
    async loadRecipes() {
        if (!this.cache) {
            try {
                logEvent("INFO", "🔄 Chargement des recettes depuis le fichier JSON...");

                const response = await fetch("../data/recipes.json");
                if (!response.ok) throw new Error(`❌ Erreur HTTP : ${response.status}`);

                this.cache = await response.json();
                logEvent("SUCCESS", "✅ Données chargées et stockées en cache.", { total: this.cache.length });

            } catch (error) {
                logEvent("ERROR", "🚨 Échec du chargement des recettes.", { error: error.message });
                throw error;
            }
        }
        return this.cache;
    }

    /**
     * Récupère toutes les recettes disponibles.
     * @async
     * @returns {Promise<Array<Object>>} Une liste complète des recettes.
     */
    async getAllRecipes() {
        try {
            const recipes = await this.loadRecipes();
            logEvent("SUCCESS", "📋 Récupération de toutes les recettes réussie.", { total: recipes.length });
            return recipes;
        } catch (error) {
            logEvent("ERROR", "❌ Impossible de récupérer les recettes.", { error: error.message });
            return [];
        }
    }

    /**
     * Recherche une recette par son identifiant.
     * @async
     * @param {number} id - Identifiant unique de la recette.
     * @returns {Promise<Object|null>} La recette trouvée ou `null` si non trouvée.
     */
    async getRecipeById(id) {
        try {
            const recipes = await this.loadRecipes();
            const recipe = recipes.find(recipe => recipe.id === id) || null;

            if (recipe) {
                logEvent("SUCCESS", `🔍 Recette trouvée : ${recipe.name}`, { id });
            } else {
                logEvent("WARNING", "⚠️ Aucune recette trouvée avec cet ID.", { id });
            }
            return recipe;

        } catch (error) {
            logEvent("ERROR", `🚨 Erreur lors de la récupération de la recette ID ${id}`, { error: error.message });
            return null;
        }
    }

    /**
     * Recherche des recettes contenant un mot-clé.
     * @async
     * @param {string} keyword - Mot-clé à rechercher.
     * @returns {Promise<Array<Object>>} Liste des recettes correspondant au mot-clé.
     */
    async searchRecipes(keyword) {
        try {
            if (!keyword.trim()) {
                logEvent("INFO", "🔍 Aucun mot-clé fourni, retour de toutes les recettes.");
                return this.getAllRecipes();
            }

            const recipes = await this.loadRecipes();
            const filteredRecipes = recipes.filter(recipe => this.filterRecipeByKeyword(keyword, recipe));

            logEvent("SUCCESS", `🔍 Recherche terminée : ${filteredRecipes.length} recettes trouvées.`, { keyword });
            return filteredRecipes;

        } catch (error) {
            logEvent("ERROR", `❌ Erreur lors de la recherche de recettes pour '${keyword}'`, { error: error.message });
            return [];
        }
    }

    /**
     * Vérifie si une recette contient le mot-clé.
     * @param {string} keyword - Mot-clé à rechercher.
     * @param {Object} recipe - Objet représentant une recette.
     * @returns {boolean} `true` si la recette correspond, sinon `false`.
     */
    filterRecipeByKeyword(keyword, recipe) {
        const lowerKeyword = keyword.toLowerCase();
        return (
            recipe.name.toLowerCase().includes(lowerKeyword) ||
            recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(lowerKeyword))
        );
    }
}

/* Exportation */
export const dataManager = new DataManager();
export const loadRecipes = () => dataManager.loadRecipes();
export const getAllRecipes = () => dataManager.getAllRecipes();
