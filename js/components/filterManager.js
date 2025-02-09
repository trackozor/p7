/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.0                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 08/02/2025                                                      */
/*  DESCRIPTION      : Gestion dynamique des filtres pour les recettes.                */
/*                     Gère les combobox et la barre de recherche.                     */
/* ==================================================================================== */
/*  FONCTIONNALITÉS :                                                               */
/*    Remplit dynamiquement les filtres (ingrédients, ustensiles, appareils).      */
/*    Filtrage en temps réel via la barre de recherche.                           */
/*    Applique les filtres sélectionnés pour afficher uniquement les recettes.    */
/*    Gestion des événements (changement de filtre, saisie dans la search bar).   */
/* ==================================================================================== */

import { dataManager } from "./dataManager.js";
import { templateManager } from "./templateManager.js";

class FilterManager {
    constructor() {
        this.filters = {
            searchKeyword: "",
            ingredient: "",
            appliance: "",
            ustensil: ""
        };
    }

    /* ================================================================================
    Récupère toutes les recettes et génère les options des combobox dynamiquement
    ================================================================================ */
    async  initFilters() {
        try {
            const recipes = await dataManager.getAllRecipes();

            // Extraire les listes uniques pour les combobox
            const ingredientsSet = new Set();
            const appliancesSet = new Set();
            const ustensilsSet = new Set();

            recipes.forEach(recipe => {
                recipe.ingredients.forEach(ing => ingredientsSet.add(ing.ingredient.toLowerCase()));
                appliancesSet.add(recipe.appliance.toLowerCase());
                recipe.ustensils.forEach(ust => ustensilsSet.add(ust.toLowerCase()));
            });

            // Remplissage des combobox avec les options uniques
            this.populateCombobox("#filter-ingredients", ingredientsSet);
            this.populateCombobox("#filter-appliances", appliancesSet);
            this.populateCombobox("#filter-ustensils", ustensilsSet);

            logEvent("SUCCESS", "Filtres initialisés avec succès.");

        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'initialisation des filtres.", { error: error.message });
        }
    }

    /* ================================================================================
    Ajoute les options aux combobox en évitant les doublons
    ================================================================================ */
    populateCombobox(selector, dataSet) {
        const combobox = document.querySelector(selector);
        if (!combobox) {
            console.error(` Combobox ${selector} introuvable.`);
            return;
        }

        combobox.innerHTML = `<option value="">Tous</option>`;
        dataSet.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item.charAt(0).toUpperCase() + item.slice(1); // Met la première lettre en majuscule
            combobox.appendChild(option);
        });
    }

    /* ================================================================================
    Gestion des événements pour la mise à jour des filtres
    ================================================================================ */
    setupEventListeners() {
        document.querySelector("#search-bar").addEventListener("input", (event) => {
            this.filters.searchKeyword = event.target.value.toLowerCase();
            this.applyFilters();
        });

        document.querySelector("#filter-ingredients").addEventListener("change", (event) => {
            this.filters.ingredient = event.target.value.toLowerCase();
            this.applyFilters();
        });

        document.querySelector("#filter-appliances").addEventListener("change", (event) => {
            this.filters.appliance = event.target.value.toLowerCase();
            this.applyFilters();
        });

        document.querySelector("#filter-ustensils").addEventListener("change", (event) => {
            this.filters.ustensil = event.target.value.toLowerCase();
            this.applyFilters();
        });
    }

    /* ================================================================================
    Applique les filtres pour mettre à jour l'affichage des recettes
    ================================================================================ */
    async applyFilters() {
        try {
            let recipes = await dataManager.getAllRecipes();

            // Filtrage par mot-clé (nom ou ingrédient)
            if (this.filters.searchKeyword) {
                recipes = recipes.filter(recipe =>
                    recipe.name.toLowerCase().includes(this.filters.searchKeyword) ||
                    recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(this.filters.searchKeyword))
                );
            }

            // Filtrage par ingrédient
            if (this.filters.ingredient) {
                recipes = recipes.filter(recipe =>
                    recipe.ingredients.some(ing => ing.ingredient.toLowerCase() === this.filters.ingredient)
                );
            }

            // Filtrage par appareil
            if (this.filters.appliance) {
                recipes = recipes.filter(recipe =>
                    recipe.appliance.toLowerCase() === this.filters.appliance
                );
            }

            // Filtrage par ustensile
            if (this.filters.ustensil) {
                recipes = recipes.filter(recipe =>
                    recipe.ustensils.some(ust => ust.toLowerCase() === this.filters.ustensil)
                );
            }

            // Mise à jour de l'affichage des recettes
            templateManager.displayAllRecipes("#recipe-container", recipes);

            logEvent("SUCCESS", `Filtres appliqués : ${recipes.length} recettes affichées.`);

        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'application des filtres.", { error: error.message });
        }
    }
}

/* ================================================================================
    EXPORT DU MODULE `FilterManager`
================================================================================ */
export const filterManager = new FilterManager();
