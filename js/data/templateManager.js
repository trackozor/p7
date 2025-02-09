/* ==================================================================================== */
/*  FICHIER          : templateManager.js                                              */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.1                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                      */
/*  DESCRIPTION      : Gère l'affichage des recettes et optimise la gestion du DOM.    */
/* ==================================================================================== */
/*  🔹 AMÉLIORATIONS :                                                                */
/*    ✅ Mise en cache des recettes déjà chargées                                     */
/*    ✅ Ajout d'un mode "Grille / Liste" pour l'affichage                           */
/*    ✅ Animation de chargement                                                     */
/* ==================================================================================== */

import { dataManager } from "./dataManager.js";

/* ================================================================================ 
   🔹 CLASSE TemplateManager - Gestion des templates des recettes 
================================================================================ */
class TemplateManager {
    constructor() {
        this.cache = null; // Cache pour stocker les recettes après le premier chargement
        this.viewMode = "grid"; // Par défaut, affichage en mode "Grille"
    }

    /* ================================================================================ 
    GÉNÉRATION D'UNE CARTE DE RECETTE
    ================================================================================ */
    
    /**
     * Génère dynamiquement une carte HTML pour une recette.
     * @param {Object} recipe - Objet contenant les détails de la recette.
     * @returns {HTMLElement} - Élément `article` contenant la carte de recette.
     */
    generateRecipeCard(recipe) {
        const { id, image, name, time, description, ingredients } = recipe;

        const card = document.createElement("article");
        card.classList.add("recipe-card", `view-${this.viewMode}`); // Ajout de la classe pour le mode d'affichage
        card.setAttribute("data-id", id);

        card.innerHTML = `
            <div class="recipe-card__image">
                <img src="../assets/images/${image}" alt="${name}">
                <span class="recipe-card__time">${time}min</span>
            </div>
            <div class="recipe-card__content">
                <h3 class="recipe-card__title">${name}</h3>
                <h4 class="recipe-card__section">Recette</h4>
                <p class="recipe-card__description">${description}</p>
                <h4 class="recipe-card__section">Ingrédients</h4>
                <ul class="recipe-card__ingredients">
                    ${this.generateIngredientsList(ingredients)}
                </ul>
            </div>
        `;

        return card;
    }

    /* ================================================================================ 
    GÉNÉRATION DE LA LISTE DES INGRÉDIENTS
    ================================================================================ */

    /**
     * Génère la liste des ingrédients pour une recette.
     * @param {Array<Object>} ingredients - Liste des ingrédients.
     * @returns {string} - Chaîne HTML avec les ingrédients formatés.
     */
    generateIngredientsList(ingredients) {
        return ingredients
            .map(
                (ing) => `
                <li class="recipe-card__ingredient">
                    <span class="recipe-card__ingredient-name">${ing.ingredient}</span> 
                    ${ing.quantity ? `- <span class="recipe-card__ingredient-quantity">${ing.quantity} ${ing.unit || ""}</span>` : ""}
                </li>`
            )
            .join("");
    }

    /* ================================================================================ 
    AFFICHAGE DES RECETTES DANS LE DOM
    ================================================================================ */

    /**
     * Affiche toutes les recettes dans un conteneur spécifique.
     * @param {string} containerSelector - Sélecteur CSS du conteneur.
     */
    async displayAllRecipes(containerSelector) {
        try {
            const container = document.querySelector(containerSelector);
            if (!container) {
                console.error(`Conteneur ${containerSelector} introuvable.`);
                return;
            }

            container.innerHTML = `<p class="loading">Chargement des recettes...</p>`; // Animation de chargement
            
            // Utilisation du cache si possible
            if (!this.cache) {
                this.cache = dataManager.getAllRecipes();
            }

            // Vérification si aucune recette trouvée
            if (this.cache.length === 0) {
                container.innerHTML = `<p class="no-recipes">Aucune recette trouvée.</p>`;
                return;
            }

            // Nettoyage du conteneur après chargement
            container.innerHTML = "";

            this.cache.forEach((recipe) => {
                const card = this.generateRecipeCard(recipe);
                container.appendChild(card);
            });

            logEvent("SUCCESS", `Affichage de ${this.cache.length} recettes dans ${containerSelector}`);
        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'affichage des recettes.", { error: error.message });
        }
    }

    /* ================================================================================ 
    CHANGEMENT DE MODE (GRILLE / LISTE)
    ================================================================================ */

    /**
     * Bascule entre le mode "Grille" et "Liste" et met à jour l'affichage.
     */
    toggleViewMode() {
        this.viewMode = this.viewMode === "grid" ? "list" : "grid";
        document.querySelectorAll(".recipe-card").forEach((card) => {
            card.classList.toggle("view-list");
            card.classList.toggle("view-grid");
        });

        logEvent("INFO", `Mode d'affichage changé : ${this.viewMode}`);
    }
}

/* ================================================================================ 
    EXPORT DU MODULE `TemplateManager`
================================================================================ */
export const templateManager = new TemplateManager();
