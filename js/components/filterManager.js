/** ====================================================================================
 *  FICHIER          : filterManager.js
 *  AUTEUR           : Trackozor
 *  VERSION          : 3.0
 *  DESCRIPTION      : Gestion avancée des filtres avec mise à jour dynamique.
 * ==================================================================================== */

import { dataManager } from "../data/dataManager.js";
import { logEvent, debounce } from "../utils/utils.js";
import { normalizeText } from "../utils/normalize.js";
import { createFilterSection } from "./factory/dropdownFactory.js";
import { safeQuerySelector } from "../config/domSelectors.js";
import {attachFilterListeners} from "../events/eventListener.js";

/** ====================================================================================
 *  VARIABLES GLOBALES
 * ==================================================================================== */


let allRecipes = [];

/** ====================================================================================
 *  INITIALISATION DES FILTRES
 * ==================================================================================== */

/**
 * Initialise les filtres avec gestion des erreurs et logs avancés.
 */
export async function initFilters() {
    try {
        logEvent("test_start", "initFilters : Démarrage...");

        // Récupération des recettes
        allRecipes = dataManager.getAllRecipes();
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            throw new Error("Aucune recette disponible.");
        }

        logEvent("success", `initFilters : ${allRecipes.length} recettes chargées.`);

        // Création des dropdowns et stockage des références
        const ingredientsFilter = createFilterSection("#filters", "Ingrédients", "ingredients", new Set());
        const appliancesFilter = createFilterSection("#filters", "Appareils", "appliances", new Set());
        const ustensilsFilter = createFilterSection("#filters", "Ustensiles", "ustensils", new Set());

        // Vérification que les filtres sont bien créés
        if (!ingredientsFilter || !appliancesFilter || !ustensilsFilter) {
            throw new Error("initFilters : Impossible de générer certains filtres.");
        }

        // Regroupement des filtres
        const filters = {
            ingredients: ingredientsFilter,
            appliances: appliancesFilter,
            ustensils: ustensilsFilter
        };

        //  Vérification avant d'attacher les écouteurs
        console.log(" Vérification des filtres :", filters);

        //  Appel de `attachFilterListeners(filters)` seulement si tout est bien créé
        attachFilterListeners(filters);

        logEvent("test_end", "initFilters : Dropdowns générés et écouteurs attachés.");

    } catch (error) {
        logEvent("error", "initFilters : Erreur lors de l'initialisation.", { error: error.message });
    }
}

/** ====================================================================================
 *  MISE À JOUR DES FILTRES DYNAMIQUES ET AFFICHAGE
 * ==================================================================================== */

/**
 * Met à jour dynamiquement les filtres affichés et l'interface utilisateur.
 */
export const updateFilters = debounce((results) => {
    try {
        logEvent("test_start", `updateFilters : Démarrage de la mise à jour des filtres avec ${results.length} recettes.`);

        // Vérification initiale des données
        if (!Array.isArray(results) || results.length === 0) {
            throw new Error("updateFilters : Aucun résultat valide fourni.");
        }

        // Initialisation des nouvelles structures de filtres
        let updatedFilters = {
            ingredients: new Map(),
            appliances: new Map(),
            ustensils: new Map()
        };

        results.forEach(recipe => {
            try {
                // Vérification que la recette est valide
                if (!recipe || typeof recipe !== "object") {
                    throw new Error("updateFilters : Recette invalide détectée.");
                }

                // Traitement des ingrédients
                if (Array.isArray(recipe.ingredients)) {
                    recipe.ingredients.forEach(ing => {
                        try {
                            if (!ing || typeof ing.ingredient !== "string") {
                                throw new Error(`updateFilters : Ingrédient invalide trouvé dans la recette "${recipe.name}".`);
                            }
                            const key = normalizeText(ing.ingredient);
                            updatedFilters.ingredients.set(key, (updatedFilters.ingredients.get(key) || 0) + 1);
                        } catch (error) {
                            logEvent("error", error.message, { ingredient: ing, recipe });
                        }
                    });
                }

                // Traitement des appareils
                if (recipe.appliance && typeof recipe.appliance === "string") {
                    const key = normalizeText(recipe.appliance);
                    updatedFilters.appliances.set(key, (updatedFilters.appliances.get(key) || 0) + 1);
                } else {
                    logEvent("warning", `updateFilters : Appareil manquant ou invalide pour la recette "${recipe.name}".`);
                }

                // Traitement des ustensiles
                if (Array.isArray(recipe.ustensils)) {
                    recipe.ustensils.forEach(ust => {
                        try {
                            if (!ust || typeof ust !== "string") {
                                throw new Error(`updateFilters : Ustensile invalide trouvé dans la recette "${recipe.name}".`);
                            }
                            const key = normalizeText(ust);
                            updatedFilters.ustensils.set(key, (updatedFilters.ustensils.get(key) || 0) + 1);
                        } catch (error) {
                            logEvent("error", error.message, { ustensil: ust, recipe });
                        }
                    });
                }

            } catch (error) {
                logEvent("error", error.message, { recipe });
            }
        });

        // Vérification finale des filtres générés
        if (!updatedFilters.ingredients || !updatedFilters.appliances || !updatedFilters.ustensils) {
            throw new Error("updateFilters : `updatedFilters` est mal défini après traitement.");
        }

        logEvent("success", "updateFilters : Filtres mis à jour avec succès.", { updatedFilters });

        // Mise à jour des dropdowns
        try {
            updateDropdowns(updatedFilters);
            logEvent("test_end", "updateFilters : Dropdowns mis à jour.");
        } catch (error) {
            logEvent("error", "updateFilters : Erreur lors de la mise à jour des dropdowns.", { error: error.message });
        }

    } catch (error) {
        logEvent("error", "updateFilters : Erreur globale lors de la mise à jour des filtres.", { error: error.message });
    }
}, 300);


/** ====================================================================================
 *  MISE À JOUR DE L'AFFICHAGE DES DROPDOWNS
 * ==================================================================================== */

/**
 * Met à jour l'affichage des dropdowns avec les nouveaux filtres disponibles.
 */
function updateDropdowns(updatedFilters) {
    try {
        if (!updatedFilters || typeof updatedFilters !== "object") {
            throw new Error("updateDropdowns : `updatedFilters` est undefined ou mal formaté.");
        }

        ["ingredients", "appliances", "ustensils"].forEach(type => {
            if (!updatedFilters[type]) {
                throw new Error(`updateDropdowns : '${type}' est undefined.`);
            }

            const listContainer = safeQuerySelector(`#${type}-list`);
            if (!listContainer) {
                throw new Error(`updateDropdowns : Conteneur introuvable pour ${type}`);
            }
            const fragment = document.createDocumentFragment();

            [...updatedFilters[type].entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([key, count]) => {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${key} (${count})`;
                    listItem.classList.add("filter-option");
                    listItem.addEventListener("click", () => handleFilterSelection(type, key));
                    fragment.appendChild(listItem);
                });

            listContainer.appendChild(fragment);
        });

        logEvent("success", "updateDropdowns : Interface mise à jour avec succès.");

    } catch (error) {
        logEvent("error", "updateDropdowns : Erreur de mise à jour.", { error: error.message });
    }
}


