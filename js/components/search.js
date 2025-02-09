import { logEvent } from "../utils/utils.js";
import { getAllRecipes } from "../data/dataManager.js"; 
import { normalizeText } from "../utils/normalize.js"; 

/**
 * Recherche avec une boucle `for`
 */
export async function searchRecipesLoop(query) {
    try {
        logEvent("INFO", ` Recherche (Loop) pour "${query}"`);
        const normalizedQuery = normalizeText(query);
        const recipes = await getAllRecipes();
        const results = [];

        for (let recipe of recipes) {
            if (
                normalizeText(recipe.name).includes(normalizedQuery) ||
                recipe.ingredients.some((ingredient) =>
                    normalizeText(ingredient.ingredient).includes(normalizedQuery)
                ) ||
                normalizeText(recipe.description).includes(normalizedQuery)
            ) {
                results.push(recipe);
            }
        }

        logEvent("SUCCESS", ` ${results.length} résultats trouvés.`);
        return results;
    } catch (error) {
        logEvent("ERROR", "Erreur lors de la recherche (Loop)", { error: error.message });
        return [];
    }
}

/**
 * Recherche avec `filter()`
 */
export async function searchRecipesFunctional(query) {
    try {
        logEvent("INFO", `Recherche (Functional) pour "${query}"`);
        const normalizedQuery = normalizeText(query);
        const recipes = await getAllRecipes();

        const results = recipes.filter(
            (recipe) =>
                normalizeText(recipe.name).includes(normalizedQuery) ||
                recipe.ingredients.some((ingredient) =>
                    normalizeText(ingredient.ingredient).includes(normalizedQuery)
                ) ||
                normalizeText(recipe.description).includes(normalizedQuery)
        );

        logEvent("SUCCESS", `${results.length} résultats trouvés.`);
        return results;
    } catch (error) {
        logEvent("ERROR", "Erreur lors de la recherche (Functional)", { error: error.message });
        return [];
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const filterContainer = document.querySelector(".filter-tags"); // Zone où les filtres sont affichés
    const filterButtons = document.querySelectorAll(".filter-button"); // Tous les boutons dropdown

    // Stockage des filtres sélectionnés pour éviter les doublons
    let selectedFilters = new Set();

    // Événement sur chaque bouton dropdown
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filterType = button.dataset.filter; // Récupère le type de filtre
            const selectedValue = prompt(`Ajoutez un ${filterType} :`); // Simule une sélection (remplace par un menu dynamique)

            if (selectedValue && !selectedFilters.has(selectedValue)) {
                selectedFilters.add(selectedValue);
                addFilterTag(selectedValue);
            }
        });
    });

    // Fonction pour ajouter un badge de filtre
    function addFilterTag(value) {
        const tag = document.createElement("span");
        tag.classList.add("filter-tag");
        tag.innerHTML = `${value} <button class="remove-filter">&times;</button>`;

        // Ajoute le badge au conteneur
        filterContainer.appendChild(tag);

        // Événement pour supprimer le filtre au clic sur le bouton "X"
        tag.querySelector(".remove-filter").addEventListener("click", () => {
            tag.remove(); // Supprime le badge du DOM
            selectedFilters.delete(value); // Supprime le filtre du Set
        });
    }
});
