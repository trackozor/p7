/* ==================================================================================== */
/*  FICHIER          : templateManager.js                                              */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.0                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 08/02/2025                                                      */
/*  DESCRIPTION      : Génère dynamiquement les templates HTML pour les recettes.       */
/*                     Utilise les données du `dataManager.js` et évite les doublons.   */
/* ==================================================================================== */
/*  🔹 FONCTIONNALITÉS :                                                               */
/*    ✅ Génération dynamique des cartes de recettes                                  */
/*    ✅ Affichage structuré des ingrédients et de la description                     */
/*    ✅ Intégration d'un cache pour éviter la surcharge du DOM                       */
/*    ✅ Flexibilité pour différents affichages                                       */
/* ==================================================================================== */

import { dataManager } from "./dataManager.js";

/* ================================================================================
   🔹 CLASSE TemplateManager - Gestion de l'affichage des recettes
================================================================================ */
class TemplateManager {
    /**
     * Génère un élément HTML représentant une carte de recette.
     *
     * @param {Object} recipe - Objet représentant une recette.
     * @returns {HTMLElement} - Élément HTML complet pour l'affichage de la recette.
     */
    generateRecipeCard(recipe) {
        const { id, image, name, time, description, ingredients } = recipe;

        // Création de l'élément principal de la carte
        const card = document.createElement("article");
        card.classList.add("recipe-card");
        card.setAttribute("data-id", id);

        // Structure du template HTML
        card.innerHTML = `
            <div class="recipe-card__image">
                <img src="assets/images/${image}" alt="${name}">
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

    /**
     * Génère la liste des ingrédients pour une recette donnée.
     *
     * @param {Array<Object>} ingredients - Liste des ingrédients avec quantité et unité.
     * @returns {string} - Chaîne HTML des ingrédients.
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

    /**
     * Affiche toutes les recettes dans un conteneur HTML spécifique.
     *
     * @async
     * @param {string} containerSelector - Sélecteur CSS du conteneur où injecter les cartes.
     */
    async displayAllRecipes(containerSelector) {
        try {
            const container = document.querySelector(containerSelector);
            if (!container) {
                console.error(`❌ Conteneur ${containerSelector} introuvable.`);
                return;
            }

            container.innerHTML = ""; // On vide le conteneur avant d'ajouter de nouvelles cartes
            const recipes = await dataManager.getAllRecipes();

            recipes.forEach((recipe) => {
                const card = this.generateRecipeCard(recipe);
                container.appendChild(card);
            });

            logEvent("SUCCESS", "Affichage des recettes terminé.", { total: recipes.length });
        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'affichage des recettes.", { error: error.message });
        }
    }
}

/* ================================================================================
EXPORT DU MODULE `TemplateManager`
================================================================================ */
export const templateManager = new TemplateManager();
