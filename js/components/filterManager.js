/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.0                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                      */
/*  DESCRIPTION      : Gestion dynamique des filtres + Génération HTML.                */
/* ==================================================================================== */

import { dataManager } from "../data/dataManager.js";
import { templateManager } from "../data/templateManager.js";
import { logEvent } from "../utils/utils.js";

class FilterManager {
    constructor() {
        this.filters = {
            searchKeyword: "",
            ingredients: new Set(),
            appliances: new Set(),
            utensils: new Set()
        };
        this.allRecipes = [];
    }

    /* ================================================================================ 
    🔹 Initialisation des filtres (récupère les recettes et génère les éléments HTML)
    ================================================================================ */
   async initFilters() {
        try {
            this.allRecipes = await dataManager.getAllRecipes();
            if (!this.allRecipes.length) {
              throw new Error("Aucune recette trouvée.");
            }

            const ingredientsSet = new Set();
            const appliancesSet = new Set();
            const utensilsSet = new Set();

            this.allRecipes.forEach(recipe => {
                recipe.ingredients.forEach(ing => ingredientsSet.add(ing.ingredient.toLowerCase()));
                appliancesSet.add(recipe.appliance.toLowerCase());
                recipe.ustensils.forEach(ust => utensilsSet.add(ust.toLowerCase()));
            });

            this.createFilterSection("#filters", "Ingrédients", "ingredients", ingredientsSet);
            this.createFilterSection("#filters", "Appareils", "appliances", appliancesSet);
            this.createFilterSection("#filters", "Ustensiles", "utensils", utensilsSet);

            this.setupEventListeners();
            logEvent("SUCCESS", "Filtres initialisés avec succès.");
        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'initialisation des filtres.", { error: error.message });
        }
    }

    /* ================================================================================ 
    🔹 Génère dynamiquement les filtres sous forme de listes déroulantes 
    ================================================================================ */
    createFilterSection(parentSelector, title, filterType, dataSet) {
        const parent = document.querySelector(parentSelector);
        if (!parent) {
          return logEvent("ERROR", `Impossible de trouver le parent ${parentSelector}`);
        }

        const filterSection = document.createElement("details");
        filterSection.classList.add("filter");

        filterSection.innerHTML = `
            <summary>${title} ▼</summary>
            <input type="text" class="filter-search" placeholder="Rechercher..." data-filter="${filterType}">
            <ul class="filter-options" id="filter-${filterType}">
                ${Array.from(dataSet).map(item => `<li data-value="${item}">${item.charAt(0).toUpperCase() + item.slice(1)}</li>`).join("")}
            </ul>
        `;

        parent.appendChild(filterSection);

        // Ajout des événements pour filtrer la liste interne
        filterSection.querySelector(".filter-search").addEventListener("input", (e) => {
            this.filterList(e.target.value, `#filter-${filterType}`);
        });

        filterSection.querySelectorAll("li").forEach(item => {
            item.addEventListener("click", () => this.updateMultiFilter(filterType, item.dataset.value));
        });
    }

    /* ================================================================================ 
    🔹 Filtre dynamiquement la liste des options dans les dropdowns
    ================================================================================ */
    filterList(query, listSelector) {
        const items = document.querySelectorAll(`${listSelector} li`);
        items.forEach(item => {
            item.style.display = item.innerText.toLowerCase().includes(query.toLowerCase()) ? "block" : "none";
        });
    }

    /* ================================================================================ 
    🔹 Gère la sélection multi-filtre + affichage des tags dynamiques 
    ================================================================================ */
    updateMultiFilter(filterType, value) {
        if (!value) {
          return;
        }

        if (this.filters[filterType].has(value)) {
            this.filters[filterType].delete(value);
        } else {
            this.filters[filterType].add(value);
        }

        this.updateSelectedFilters();
        this.applyFilters();
    }

    /* ================================================================================ 
    🔹 Met à jour l'affichage des filtres sélectionnés sous forme de badges
    ================================================================================ */
    updateSelectedFilters() {
        const container = document.querySelector(".filter-tags");
        container.innerHTML = "";

        ["ingredients", "appliances", "utensils"].forEach(type => {
            this.filters[type].forEach(value => {
                const tag = document.createElement("span");
                tag.classList.add("filter-tag");
                tag.innerHTML = `${value.charAt(0).toUpperCase() + value.slice(1)} <button class="remove-filter">&times;</button>`;

                tag.querySelector(".remove-filter").addEventListener("click", () => {
                    this.filters[type].delete(value);
                    this.updateSelectedFilters();
                    this.applyFilters();
                });

                container.appendChild(tag);
            });
        });
    }

    /* ================================================================================ 
    🔹 Applique les filtres pour mettre à jour l'affichage des recettes 
    ================================================================================ */
    applyFilters() {
        try {
            let filteredRecipes = [...this.allRecipes];

            if (this.filters.searchKeyword) {
                filteredRecipes = filteredRecipes.filter(recipe =>
                    recipe.name.toLowerCase().includes(this.filters.searchKeyword) ||
                    recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(this.filters.searchKeyword))
                );
            }

            if (this.filters.ingredients.size) {
                filteredRecipes = filteredRecipes.filter(recipe =>
                    [...this.filters.ingredients].every(filterIng =>
                        recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === filterIng)
                    )
                );
            }

            if (this.filters.appliances.size) {
                filteredRecipes = filteredRecipes.filter(recipe =>
                    this.filters.appliances.has(recipe.appliance.toLowerCase())
                );
            }

            if (this.filters.utensils.size) {
                filteredRecipes = filteredRecipes.filter(recipe =>
                    [...this.filters.utensils].every(filterUt =>
                        recipe.ustensils.some(ust => ust.toLowerCase() === filterUt)
                    )
                );
            }

            templateManager.displayAllRecipes("#recipe-container", filteredRecipes);
            logEvent("SUCCESS", `Filtres appliqués : ${filteredRecipes.length} recettes affichées.`);
        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'application des filtres.", { error: error.message });
        }
    }
}

/* ================================================================================ 
    EXPORT DU MODULE `FilterManager`
================================================================================ */
export const filterManager = new FilterManager();
