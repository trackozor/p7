export function createRecipeCard(recipe) {
    return `
        <article class="recipe-card">
            <img src="assets/images/${recipe.image}" alt="${recipe.name}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <p class="recipe-time"><i class="fa fa-clock"></i> ${recipe.time} min</p>
                <ul class="recipe-ingredients">
                    ${recipe.ingredients.map(ing => `
                        <li><strong>${ing.ingredient}</strong> ${ing.quantity ? `: ${ing.quantity} ${ing.unit || ''}` : ''}</li>
                    `).join('')}
                </ul>
                <p class="recipe-description">${recipe.description}</p>
            </div>
        </article>
    `;
}
