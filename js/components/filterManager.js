/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                      */
/*  DESCRIPTION      : Gestion dynamique des filtres + Génération HTML améliorée.      */
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
    Initialisation des filtres (récupère les recettes et génère les éléments HTML)
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

            logEvent("success", " Filtres générés avec succès.");
        } catch (error) {
            logEvent("error", " Erreur lors de l'initialisation des filtres.", { error: error.message });
        }
    }

    /* ================================================================================ 
    🔹 Génère dynamiquement les filtres sous forme de dropdown avec recherche et scroll 
    ================================================================================ */
    createFilterSection(parentSelector, title, filterType, dataSet) {
        const parent = document.querySelector(parentSelector);
        if (!parent) {
            return logEvent("error", ` Impossible de trouver ${parentSelector}`);
        }

        //  Conteneur du filtre
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");

        //  Bouton principal du filtre
        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filter = filterType;
        filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`;

        //  Liste déroulante avec scroll
        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("filter-dropdown", "hidden");
        dropdownContainer.dataset.filter = filterType;

        // Champ de recherche
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.classList.add("filter-search");
        searchInput.placeholder = `Rechercher ${title.toLowerCase()}...`;

        // Liste des options
        const listContainer = document.createElement("ul");
        listContainer.classList.add("filter-options");
        listContainer.style.maxHeight = "250px"; // 🌟 Limite la hauteur pour scroll
        listContainer.style.overflowY = "auto";

        // Ajout des éléments dans la liste
        Array.from(dataSet).forEach((item) => {
            const listItem = document.createElement("li");
            listItem.dataset.value = item;
            listItem.textContent = item.charAt(0).toUpperCase() + item.slice(1);
            listItem.addEventListener("click", () => this.updateMultiFilter(filterType, item));
            listContainer.appendChild(listItem);
        });

        //  Ajout des éléments au DOM
        dropdownContainer.appendChild(searchInput);
        dropdownContainer.appendChild(listContainer);
        filterContainer.appendChild(filterButton);
        filterContainer.appendChild(dropdownContainer);
        parent.appendChild(filterContainer);

        // Gestion des événements
        this.setupDropdownEvents(filterButton, dropdownContainer, searchInput, listContainer, filterType);
    }

    /* ================================================================================ 
    Gère les interactions avec les dropdowns 
    ================================================================================ */
    setupDropdownEvents(filterButton, dropdownContainer, searchInput, listContainer, filterType) {
        // 🔹 Toggle ouverture/fermeture du dropdown
        filterButton.addEventListener("click", () => {
            dropdownContainer.classList.toggle("hidden");
        });

        // 🔹 Ferme le dropdown si on clique en dehors
        document.addEventListener("click", (event) => {
            if (!filterButton.contains(event.target) && !dropdownContainer.contains(event.target)) {
                dropdownContainer.classList.add("hidden");
            }
        });

        // 🔹 Filtrage en temps réel des options
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            listContainer.querySelectorAll("li").forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(query) ? "block" : "none";
            });
        });
    }

    /* ================================================================================ 
    Gère la sélection multi-filtre + affichage des tags dynamiques 
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
    Met à jour l'affichage des filtres sélectionnés sous forme de badges
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
    Applique les filtres pour mettre à jour l'affichage des recettes 
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

            ["ingredients", "appliances", "utensils"].forEach(type => {
                if (this.filters[type].size) {
                    filteredRecipes = filteredRecipes.filter(recipe =>
                        [...this.filters[type]].every(filterVal =>
                            recipe[type]?.some(el => el.toLowerCase() === filterVal)
                        )
                    );
                }
            });

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
