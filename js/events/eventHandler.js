/* ==================================================================================== */
/*  FICHIER          : eventHandler.js                                                 */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.2                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes */
/* ==================================================================================== */

import { searchRecipesLoop } from "../components/search.js";
import { getAllRecipes, fetchFilterOptions } from "../data/dataManager.js";
import domSelectors from "../config/domSelectors.js";
import { logEvent } from "../utils/utils.js";

/* ================================================================================ 
    GESTION DE L'ÉVÉNEMENT DE RECHERCHE 
================================================================================ */

/**
 * Gère la recherche de recettes lorsqu'un utilisateur saisit du texte.
 */
export async function handleSearch() {
    try {
        const query = domSelectors.searchInput.value.trim();

        if (query.length < 3) {
            logEvent("INFO", "🔍 Recherche ignorée : moins de 3 caractères.");
            return;
        }

        logEvent("INFO", `🔍 Recherche en cours : "${query}"`);
        const results = await searchRecipesLoop(query);
        displayResults(results);
        logEvent("SUCCESS", `✅ ${results.length} résultats trouvés.`);

    } catch (error) {
        logEvent("ERROR", "🚨 Erreur lors de la recherche.", { error: error.message });
    }
}

/* ================================================================================ 
    AFFICHAGE DES RÉSULTATS 
================================================================================ */

/**
 * Affiche les résultats des recettes dans le DOM.
 * @param {Array} results - Liste des recettes filtrées.
 */
export function displayResults(results) {
    domSelectors.recipesContainer.innerHTML = "";

    if (results.length === 0) {
        domSelectors.recipesContainer.innerHTML = `<p class="no-results">Aucune recette trouvée.</p>`;
        logEvent("WARNING", "⚠️ Aucun résultat pour cette recherche.");
        return;
    }

    results.forEach((recipe) => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `<h2>${recipe.name}</h2><p>${recipe.description}</p>`;
        domSelectors.recipesContainer.appendChild(card);
    });
}

/* ================================================================================ 
    GESTION DES FILTRES 
================================================================================ */

/**
 * Gère les changements dans les menus déroulants de filtres.
 */
export async function handleFilterChange(event) {
    try {
        const {filterType} = event.target.dataset; // Exemple : "ingredient", "appliance", "ustensil"
        const selectedValue = event.target.value;

        logEvent("INFO", `📂 Filtre modifié : ${filterType} = ${selectedValue}`);

        const recipes = await getAllRecipes();
        const filteredRecipes = recipes.filter(recipe =>
            recipe[filterType].includes(selectedValue)
        );

        displayResults(filteredRecipes);
        logEvent("SUCCESS", `✅ ${filteredRecipes.length} recettes trouvées après filtrage.`);
    } catch (error) {
        logEvent("ERROR", "🚨 Erreur lors du filtrage.", { error: error.message });
    }
}

/**
 * Remplit dynamiquement les listes de filtres.
 */
export async function populateFilters() {
    try {
        logEvent("INFO", "🔄 Chargement des options de filtre...");
        const filters = await fetchFilterOptions();

        updateFilterList("ingredient-list", filters.ingredients);
        updateFilterList("ustensil-list", filters.ustensils);
        updateFilterList("appliance-list", filters.appliances);

        logEvent("SUCCESS", "✅ Options de filtre chargées avec succès.");
    } catch (error) {
        logEvent("ERROR", "🚨 Erreur lors du chargement des filtres.", { error: error.message });
    }
}

/* ================================================================================ 
    MISE À JOUR DES FILTRES DANS LE DOM 
================================================================================ */

/**
 * Met à jour une liste de filtres dans le DOM.
 * @param {string} listId - ID du `<ul>` correspondant.
 * @param {Array} options - Liste des options à insérer.
 */
function updateFilterList(listId, options) {
    const listElement = document.getElementById(listId);
    if (!listElement) {
        logEvent("ERROR", `⚠️ Impossible de trouver l'élément ${listId}`);
        return;
    }

    listElement.innerHTML = ""; // Vide la liste avant d'ajouter les options

    options.forEach(option => {
        const li = document.createElement("li");
        li.textContent = option;
        li.classList.add("filter-option");
        li.setAttribute("tabindex", "0"); // Rend cliquable avec Tab
        li.addEventListener("click", () => {
            logEvent("INFO", `🟢 Filtre sélectionné : ${option}`);
        });

        listElement.appendChild(li);
    });

    logEvent("SUCCESS", `✅ Liste ${listId} mise à jour avec ${options.length} éléments.`);
}

/* ================================================================================ 
    LANCEMENT AU CHARGEMENT DU DOM 
================================================================================ */

document.addEventListener("DOMContentLoaded", populateFilters);
