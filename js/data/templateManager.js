/* ====================================================================================
/*  FICHIER          : templateManager.js                                              */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.4                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MAJ     : 26/02/2025                                                      */
/*  DESCRIPTION      : Gère l'affichage des recettes et optimise la gestion du DOM.    */
/* ==================================================================================== */

import { getAllRecipes } from "../data/dataManager.js";
import { RecipeFactory } from "../components/factory/recipeFactory.js";
import { logEvent } from "../utils/utils.js";

/* ================================================================================ 
    FONCTIONS UTILITAIRES
================================================================================ */

/**
 * Affiche un message de chargement dans un conteneur.
 * @param {HTMLElement} container - Le conteneur où afficher le message.
 */
function showLoadingMessage(container) {
    container.innerHTML = `<p class="loading">Chargement des recettes...</p>`;
}

/**
 * Affiche un message lorsque aucune recette n'est trouvée.
 * @param {HTMLElement} container - Le conteneur où afficher le message.
 */
function showNoRecipesMessage(container) {
    container.innerHTML = `<p class="no-recipes">Aucune recette trouvée.</p>`;
}

/**
 * Génère et insère toutes les recettes dans un conteneur donné.
 * Utilise un cache pour éviter de recréer des cartes déjà affichées.
 * @param {HTMLElement} container - Le conteneur où afficher les recettes.
 * @param {Array} recipes - Liste des recettes à afficher.
 * @param {Map} cardCache - Cache des cartes pour éviter les re-rendus inutiles.
 */
function renderRecipes(container, recipes, cardCache) {
    const fragment = document.createDocumentFragment();

    recipes.forEach(recipeData => {
        try {
            if (cardCache.has(recipeData.id)) {
                fragment.appendChild(cardCache.get(recipeData.id)); // Utiliser le cache
            } else {
                const recipe = RecipeFactory(recipeData);

                if (!recipe || typeof recipe.generateCard !== "function") {
                    logEvent("error", "RecipeFactory a retourné une valeur invalide.", { recipeData });
                    return;
                }

                const recipeCard = recipe.generateCard();

                if (!(recipeCard instanceof HTMLElement)) {
                    logEvent("error", "generateCard() n'a pas retourné un élément valide.", { recipeData });
                    return;
                }

                cardCache.set(recipeData.id, recipeCard); // Ajouter au cache
                fragment.appendChild(recipeCard);
            }
        } catch (error) {
            logEvent("error", "Erreur lors de la génération de la recette.", { error: error.message, recipeData });
        }
    });

    container.innerHTML = ""; 
    container.appendChild(fragment);
}

/**
 * Change la classe du conteneur pour basculer entre Grille / Liste.
 * @param {HTMLElement} container - Conteneur des recettes.
 * @param {string} mode - Mode d'affichage ("grid" ou "list").
 */
function updateViewMode(container, mode) {
    if (!container.classList.contains(mode)) {
        container.classList.toggle("list-view", mode === "list");
        logEvent("info", `Mode d'affichage changé : ${mode}`);
    }
}

/* ================================================================================ 
    CLASSE TemplateManager
================================================================================ */
class TemplateManager {
    /**
     * Initialise le TemplateManager avec un mode d'affichage par défaut et un cache.
     */
    constructor() {
        this.viewMode = "grid"; // Mode par défaut
        this.recipeContainer = document.querySelector("#recipes-list"); // Conteneur des recettes
        this.cardCache = new Map(); // Cache pour éviter les recréations inutiles
    }

    /**
     * Affiche toutes les recettes disponibles et retourne le nombre de recettes affichées.
     * @param {string} containerSelector - Sélecteur du conteneur où afficher les recettes.
     * @returns {Promise<number>} - Nombre de recettes affichées.
     */
    async displayAllRecipes(containerSelector) {
        try {
            const container = document.querySelector(containerSelector);
            if (!container) {
                throw new Error(`Le conteneur ${containerSelector} est introuvable.`);
            }

            showLoadingMessage(container);

            const recipes = await getAllRecipes();

            if (!Array.isArray(recipes)) {
                logEvent("error", "getAllRecipes() n'a pas retourné un tableau.", { recipes });
                showNoRecipesMessage(container);
                return 0;
            }

            if (recipes.length === 0) {
                showNoRecipesMessage(container);
                return 0;
            }

            renderRecipes(container, recipes, this.cardCache);

            return recipes.length;
        } catch (error) {
            logEvent("error", "Erreur lors de l'affichage des recettes.", { error: error.message });
            return 0;
        }
    }

    /**
     * Bascule entre le mode "Grille" et "Liste".
     */
    toggleViewMode() {
        this.viewMode = this.viewMode === "grid" ? "list" : "grid";
        updateViewMode(this.recipeContainer, this.viewMode);
    }
}

/* ================================================================================ 
    EXPORT DU MODULE 
================================================================================ */
export const templateManager = new TemplateManager();
