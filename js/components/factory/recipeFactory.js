export function RecipeFactory(recipeData) {
    return {
        id: recipeData.id,
        name: recipeData.name,
        image: recipeData.image,
        time: recipeData.time,
        description: recipeData.description,
        ingredients: recipeData.ingredients,

        //  Générer la carte HTML
        generateCard() {
            const card = document.createElement("article");
            card.classList.add("recipe-card");
            card.setAttribute("data-id", this.id);

            card.innerHTML = `
                <figure class="recipe-card__image">
                    <img src="../assets/images/${this.image}" alt="${this.name}" class="recipe-card__img" loading="lazy">
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

        //  Générer la liste des ingrédients
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
