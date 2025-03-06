/** ====================================================================================
 *  FICHIER          : recipeFactory.js
 *  AUTEUR           : Trackozor
 *  VERSION          : 2.0
 *  DESCRIPTION      : Génère dynamiquement l'affichage des recettes.
 *                    - Génère des cartes HTML pour chaque recette.
 *                    - Affiche les ingrédients et les détails des recettes.
 * ==================================================================================== */

/** ====================================================================================
 *  FACTORY POUR CRÉATION DES RECETTES
 * ==================================================================================== */
/**
 * Factory permettant de générer dynamiquement une recette sous forme de carte HTML.
 *
 * @param {Object} recipeData - Données de la recette.
 * @param {number} recipeData.id - Identifiant unique de la recette.
 * @param {string} recipeData.name - Nom de la recette.
 * @param {string} recipeData.image - Nom de l'image associée à la recette.
 * @param {number} recipeData.time - Temps de préparation en minutes.
 * @param {string} recipeData.description - Description de la recette.
 * @param {Array} recipeData.ingredients - Liste des ingrédients avec leur quantité et unité.
 * @returns {Object} Un objet contenant les méthodes pour générer la carte HTML.
 */
export function RecipeFactory(recipeData) {
    return {
        id: recipeData.id,
        name: recipeData.name,
        image: recipeData.image,
        time: recipeData.time,
        description: recipeData.description,
        ingredients: recipeData.ingredients,

        /** ====================================================================================
         *  GÉNÉRATION DE LA CARTE HTML
         * ==================================================================================== */

        /**
         * Génère dynamiquement une carte HTML représentant la recette.
         * 
         * - Structure l'affichage des informations principales.
         * - Affiche les ingrédients, la description et l'image associée.
         * - Utilise `generateIngredientsList()` pour afficher les ingrédients.
         *
         * @returns {HTMLElement} Élément HTML représentant la carte de recette.
         */
        generateCard() {
            // Création de l'élément article représentant la carte de recette.
            const card = document.createElement("article");
            card.classList.add("recipe-card");
            card.setAttribute("data-id", this.id);

            // Structure HTML de la carte.
            card.innerHTML = `
                <figure class="recipe-card__image">
                    <img src="../assets/webp/${this.image}" alt="${this.name}" class="recipe-card__img" loading="lazy">
                    <figcaption class="recipe-card__time">${this.time} min</figcaption>
                </figure>

                <div class="recipe-card__content">
                    <header class="recipe-card__header">
                        <h3 class="recipe-card__title">${this.name}</h3>
                    </header>

                    <section class="recipe-card__details">
                        <h4 class="recipe-card__section">Recette</h4>
                        <p class="recipe-card__description">${this.description}</p>
                    </section>

                    <section class="recipe-card__ingredients-container">
                        <h4 class="recipe-card__section__ingredients">Ingrédients</h4>
                        <ul class="recipe-card__ingredients">
                            ${this.generateIngredientsList()}
                        </ul>
                    </section>
                </div>
            `;

            return card;
        },

        /** ====================================================================================
         *  GÉNÉRATION DE LA LISTE DES INGRÉDIENTS
         * ==================================================================================== */
        /**
         * Génère dynamiquement la liste des ingrédients sous forme de balises `<li>`.
         *
         * - Affiche le nom de l'ingrédient.
         * - Affiche la quantité et l'unité si disponibles.
         *
         * @returns {string} Chaîne HTML contenant les éléments `<li>` des ingrédients.
         */
        generateIngredientsList() {
            return this.ingredients
                .map(ing => `
                    <li class="recipe-card__ingredient">
                        <span class="recipe-card__ingredient-name">${ing.ingredient}</span>
                        ${ing.quantity ? ` <span class="recipe-card__ingredient-quantity">${ing.quantity} ${ing.unit || ""}</span>` : ""}
                    </li>
                `)
                .join("");
        }
    };
}

