import { searchRecipesLoop } from "../components/search.js";
import { getAllRecipes } from "../data/dataManager.js";
import { fetchFilterOptions } from "../data/dataManager.js";
import domSelectors from "../config/domSelectors.js";

/**
 * Gère l'événement de recherche.
 */
export function setupSearchEvent() {
    domSelectors.searchInput.addEventListener("input", async () => {
        const query = domSelectors.searchInput.value.trim();
        if (query.length >= 3) {
            const results = await searchRecipesLoop(query);
            displayResults(results);
        }
    });
}

/**
 * Affiche les résultats des recettes dans le DOM.
 * @param {Array} results - Liste des recettes filtrées.
 */
function displayResults(results) {
    domSelectors.recipesContainer.innerHTML = "";
    results.forEach((recipe) => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `<h2>${recipe.name}</h2><p>${recipe.description}</p>`;
        domSelectors.recipesContainer.appendChild(card);
    });
}

/**
 * Active tous les écouteurs d'événements au chargement.
 */
export function initEventListeners() {
    setupSearchEvent();
    setupFilterEvents();
}

/**
 * Gère les événements des filtres.
 */
export function setupFilterEvents() {
    document.querySelectorAll(".filter-tag").forEach((button) => {
        button.addEventListener("click", async () => {
            const recipes = await getAllRecipes();
            const filteredRecipes = recipes.filter(recipe =>
                recipe.tags.includes(button.dataset.filter)
            );
            displayResults(filteredRecipes);
        });
    });
}

/**
 * Remplit dynamiquement les listes de filtres.
 */
async function populateFilters() {
    try {
        const filters = await fetchFilterOptions();
        updateFilterList("ingredient-list", filters.ingredients);
        updateFilterList("ustensil-list", filters.ustensils);
        updateFilterList("appliance-list", filters.appliances);
    } catch (error) {
        console.error("Erreur lors du chargement des filtres :", error);
    }
}

/**
 * Ajoute les options dans une liste `<ul>`.
 * @param {string} listId - ID du `<ul>`.
 * @param {Array} options - Liste des options à ajouter.
 */
function updateFilterList(listId, options) {
    const listElement = document.getElementById(listId);
    if (!listElement) {
      return;
    }

    listElement.innerHTML = ""; // Vide la liste avant d'ajouter les options

    options.forEach(option => {
        const li = document.createElement("li");
        li.textContent = option;
        li.classList.add("filter-option");
        li.setAttribute("tabindex", "0"); // Rend cliquable avec Tab
        li.addEventListener("click", () => {
            console.log(`Filtre sélectionné : ${option}`);
        });
        listElement.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", populateFilters);
