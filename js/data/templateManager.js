/* ==================================================================================== */
/*  FICHIER          : templateManager.js                                              */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MAJ     : 12/02/2025                                                      */
/*  DESCRIPTION      : Gère l'affichage des recettes et optimise la gestion du DOM.    */
/* ==================================================================================== */

import { getAllRecipes } from "../data/dataManager.js";
import { RecipeFactory } from "../components/factory/recipeFactory.js";

/* ================================================================================ 
    FONCTIONS UTILITAIRES (Déclarées en dehors de la classe)
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
 * @param {HTMLElement} container - Le conteneur où afficher les recettes.
 * @param {Array} recipes - Liste des recettes à afficher.
 */
function renderRecipes(container, recipes) {
    const fragment = document.createDocumentFragment();

    recipes.forEach(recipeData => {
        try {
            const recipe = RecipeFactory(recipeData);

            if (!recipe || typeof recipe.generateCard !== "function") {
                console.error("❌ ERREUR : RecipeFactory a retourné une valeur invalide.", recipeData);
                return;
            }

            const recipeCard = recipe.generateCard();

            if (!(recipeCard instanceof HTMLElement)) {
                console.error("❌ ERREUR : generateCard() n'a pas retourné un élément valide.", recipeData);
                return;
            }

            fragment.appendChild(recipeCard);
        } catch (error) {
            console.error("❌ ERREUR lors de la génération de la recette :", error.message, recipeData);
        }
    });

    container.innerHTML = ""; // Efface uniquement après construction du fragment
    container.appendChild(fragment);
}


/**
 * 
 * Change la classe du conteneur pour basculer entre Grille / Liste.
 * @param {HTMLElement} container - Conteneur des recettes.
 * @param {string} mode - Mode d'affichage ("grid" ou "list").
 */
function updateViewMode(container, mode) {
    container.classList.toggle("list-view", mode === "list");
    console.log(`Mode d'affichage changé : ${mode}`);
}

/* ================================================================================ 
    CLASSE TemplateManager - Gère l'affichage des recettes
================================================================================ */
class TemplateManager {
    /**
     * Initialise le TemplateManager avec un mode d'affichage par défaut.
     */
    constructor() {
        this.viewMode = "grid"; // Mode par défaut (grille)
        this.recipeContainer = document.querySelector("#recipes-list"); // Conteneur des recettes
    }

    /**
     * Affiche toutes les recettes disponibles dans le conteneur spécifié.
     * @param {string} containerSelector - Sélecteur du conteneur où afficher les recettes.
     * @returns {Promise<void>} - Aucune valeur retournée, mais met à jour le DOM.
     */

    async displayAllRecipes(containerSelector) {
        try {
            const container = document.querySelector(containerSelector);
            if (!container) {
                throw new Error(`ERREUR : Le conteneur ${containerSelector} est introuvable.`);
            }

            showLoadingMessage(container); // Affichage du message de chargement

            const recipes = await getAllRecipes();

            if (!Array.isArray(recipes)) {
                console.error("❌ ERREUR : getAllRecipes() n'a pas retourné un tableau.", recipes);
                showNoRecipesMessage(container);
                return;
            }

            if (recipes.length === 0) {
                showNoRecipesMessage(container);
                return;
            }

            renderRecipes(container, recipes); // Affichage des recettes
        } catch (error) {
            console.error(" ERREUR - TemplateManager :", error.message);
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
