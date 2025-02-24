/* ====================================================================================
/*  FICHIER          : filterManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.8
/*  DESCRIPTION      : Gestion avancée et optimisée des filtres avec scroll infini.
/* ==================================================================================== */

import { dataManager } from "../data/dataManager.js";
import { templateManager } from "../data/templateManager.js";
import { logEvent, debounce } from "../utils/utils.js";
import { normalizeText } from "../utils/normalize.js";
import { createFilterSection } from "./factory/dropdownFactory.js";
import { displayResults } from "../events/eventHandler.js";
import { waitForElement } from "../utils/utils.js";
import { safeQuerySelector } from "../config/domSelectors.js";
import { attachScrollEvents } from "../events/eventListener.js";

/* ====================================================================================
/*  VARIABLES GLOBALES
/* ==================================================================================== */

let selectedFilters = {
    searchKeyword: "",
    ingredients: new Set(),
    appliances: new Set(),
    utensils: new Set()
};

let allRecipes = [];
let recipeCounts = {
    ingredients: {},
    appliances: {},
    utensils: {}
};

/* ====================================================================================
/*  INITIALISATION DES FILTRES
/* ==================================================================================== */

/**
 * Initialise les filtres :
 * 1. Génère les dropdowns.
 * 2. Charge les recettes et applique les filtres.
 * 3. Associe chaque élément de liste aux valeurs de la base de données.
 * 4. Active le scroll infini.
 */
export async function initFilters() {
    try {
        const startTime = performance.now();
        logEvent("test_start", "initFilters : Début de l'initialisation des filtres...");

        //  Chargement des recettes
        logEvent("info", "initFilters : Chargement des recettes depuis dataManager...");
        allRecipes = await dataManager.getAllRecipes();
        
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            logEvent("error", "initFilters : Aucune recette disponible. Vérifiez `dataManager.getAllRecipes()`.");
            throw new Error("Aucune recette disponible.");
        }

        logEvent("success", `initFilters : ${allRecipes.length} recettes chargées.`);

        //  Création des dropdowns 
        logEvent("info", "initFilters : Création des dropdowns...");
        createFilterSection("#filters", "Ingrédients", "ingredients", new Set());
        createFilterSection("#filters", "Appareils", "appliances", new Set());
        createFilterSection("#filters", "Ustensiles", "ustensils", new Set());

        logEvent("success", "initFilters : Tous les dropdowns sont prêts.");

        //  Génération des données de filtres APRÈS avoir vérifié que tout est prêt
        logEvent("test_start", "initFilters : Début de la génération des filtres...");
        generateFilterData();
        logEvent("test_end", `initFilters : Fin de l'initialisation des filtres. Temps total `);

    } catch (error) {
        logEvent("error", "Échec de l'initialisation des filtres.", { error: error.message });
    }
}


/* ====================================================================================
/*  GÉNÉRATION DES FILTRES
/* ==================================================================================== */

/**
 * Génère les ensembles uniques de filtres et stocke les comptes de recettes.
 */
function generateFilterData() {
    try {
        logEvent("info", "Génération des filtres...");

        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            logEvent("error", "generateFilterData : allRecipes est vide ou non défini.");
            return;
        }

        const ingredientsMap = new Map();
        const appliancesMap = new Map();
        const ustensilsMap = new Map();

        allRecipes.forEach(recipe => {
            if (!recipe || typeof recipe !== "object") {
                logEvent("warning", "generateFilterData : Recette invalide détectée.", { recipe });
                return;
            }

            if (Array.isArray(recipe.ingredients)) {
                recipe.ingredients.forEach(ing => {
                    if (ing && ing.ingredient) {
                        const key = normalizeText(ing.ingredient);
                        ingredientsMap.set(key, (ingredientsMap.get(key) || 0) + 1);
                    }
                });
            } else {
                logEvent("warning", `generateFilterData : ingredients est manquant pour ${recipe.name || "une recette inconnue"}`);
            }

            if (typeof recipe.appliance === "string") {
                const applianceKey = normalizeText(recipe.appliance);
                appliancesMap.set(applianceKey, (appliancesMap.get(applianceKey) || 0) + 1);
            } else {
                logEvent("warning", `generateFilterData : appliance est manquant pour ${recipe.name || "une recette inconnue"}`);
            }

            if (Array.isArray(recipe.ustensils)) {
                recipe.ustensils.forEach(ust => {
                    if (ust) {
                        const key = normalizeText(ust);
                        ustensilsMap.set(key, (ustensilsMap.get(key) || 0) + 1);
                    }
                });
            } else {
                logEvent("warning", `generateFilterData : utensils est manquant pour ${recipe.name || "une recette inconnue"}`);
            }
        });

        recipeCounts.ingredients = Object.fromEntries([...ingredientsMap.entries()].sort((a, b) => b[1] - a[1]));
        recipeCounts.appliances = Object.fromEntries([...appliancesMap.entries()].sort((a, b) => b[1] - a[1]));
        recipeCounts.ustensils = Object.fromEntries([...ustensilsMap.entries()].sort((a, b) => b[1] - a[1]));

        updateDropdowns();
        logEvent("success", "generateFilterData : Filtres générés et stockés en cache.");
    } catch (error) {
        logEvent("error", "generateFilterData : Erreur lors de la génération des filtres.", { error: error.message });
    }
}



/* ====================================================================================
/*  MISE À JOUR DES FILTRES
/* ==================================================================================== */

/**
 * Met à jour dynamiquement les filtres en fonction des résultats affichés.
 */
export const updateFilters = debounce((results) => {
    try {
        if (!Array.isArray(results) || results.length === 0) {
            logEvent("warning", "updateFilters : Aucun résultat valide.");
            return;
        }

        logEvent("info", `updateFilters : Mise à jour des filtres avec ${results.length} recettes.`);

        let updatedFilters = {
            ingredients: new Set(),
            appliances: new Set(),
            ustensils: new Set()
        };

        results.forEach(recipe => {
            recipe.ingredients?.forEach(ing => updatedFilters.ingredients.add(normalizeText(ing.ingredient)));
            recipe.ustensils?.forEach(ust => updatedFilters.ustensils.add(normalizeText(ust)));
            if (recipe.appliance) updatedFilters.appliances.add(normalizeText(recipe.appliance));
        });

        selectedFilters.ingredients.forEach(tag => {
            if (!updatedFilters.ingredients.has(tag)) selectedFilters.ingredients.delete(tag);
        });

        selectedFilters.ustensils.forEach(tag => {
            if (!updatedFilters.ustensils.has(tag)) selectedFilters.ustensils.delete(tag);
        });

        selectedFilters.appliances.forEach(tag => {
            if (!updatedFilters.appliances.has(tag)) {
              selectedFilters.appliances.delete(tag);
            }
        });

        logEvent("success", "updateFilters : Filtres mis à jour avec succès.");
    } catch (error) {
        logEvent("error", "updateFilters : Erreur lors de la mise à jour des filtres.", { error: error.message });
    }
}, 300);

/**
 * Filtre dynamiquement les options du dropdown en fonction de la saisie utilisateur.
 * 
 * @param {HTMLInputElement} searchInput - Champ de recherche du dropdown.
 * @param {HTMLElement} listContainer - Conteneur de la liste d'options.
 */
export function filterDropdownOptions(searchInput, listContainer) {
    try {
        if (!(searchInput instanceof HTMLInputElement) || !(listContainer instanceof HTMLElement)) {
            logEvent("error", "filterDropdownOptions : Paramètres invalides.", { searchInput, listContainer });
            return;
        }

        const query = normalizeText(searchInput.value.trim());
        let matchesFound = 0;

        [...listContainer.children].forEach(item => {
            const matches = normalizeText(item.textContent).includes(query);
            item.style.display = matches ? "block" : "none";
            if (matches) matchesFound++;
        });

        logEvent("success", `filterDropdownOptions : ${matchesFound} résultats affichés.`);
    } catch (error) {
        logEvent("error", "filterDropdownOptions : Erreur lors du filtrage des options.", { error: error.message });
    }
}
/**
 * Met à jour dynamiquement les options des menus déroulants de filtres.
 *
 * - Vide la liste actuelle.
 * - Ajoute les nouvelles options triées.
 * - Limite l'affichage à un certain nombre d'éléments pour éviter la surcharge.
 *
 * @param {string} filterType - Type de filtre à mettre à jour (ex: "ingredients", "appliances", "utensils").
 * @param {Object} data - Objet contenant les options disponibles sous forme { clé: compteur }.
 * @param {number} maxVisible - Nombre maximum d'options visibles sans dérouler (par défaut: 10).
 */
function updateDropdowns(filterType, data, maxVisible = 10) {
    try {
        logEvent("info", `updateDropdown : Mise à jour du filtre ${filterType}`);



        if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
            logEvent("warning", `updateDropdown : Aucune donnée à afficher pour ${filterType}`);
            return;
        }

        logEvent("info", `updateDropdown : Ajout de ${Object.keys(data).length} éléments pour ${filterType}`);

        // Création d'un fragment pour optimiser l'ajout au DOM
        const fragment = document.createDocumentFragment();

        // Ajout des options visibles
        Object.entries(data).slice(0, maxVisible).forEach(([key, count]) => {
            const listItem = document.createElement("li");
            listItem.classList.add("filter-option");
            listItem.textContent = `${key} (${count})`;

            // Ajoute un event listener pour filtrer au clic
            listItem.addEventListener("click", () => handleFilterSelection(filterType, key));

            fragment.appendChild(listItem);
        });

        listContainer.appendChild(fragment);

        logEvent("success", `updateDropdown : ${filterType} mis à jour avec succès.`);
    } catch (error) {
        logEvent("error", `updateDropdown : Erreur lors de la mise à jour du filtre ${filterType}.`, { error: error.message });
    }
}
