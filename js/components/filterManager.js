/* ====================================================================================
/*  FICHIER          : filterManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gère les filtres et l'affichage dynamique des recettes.
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import {  fetchFilterOptions, clearSearchCache } from "../data/dataManager.js";
import { logEvent, waitForElement } from "../utils/utils.js";


/* ====================================================================================
/*                            VARIABLES GLOBALES ET ÉTAT DES FILTRES
/* ==================================================================================== */

export let activeFilters = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set()
};

const filterContainers = {}; // Stocke les éléments DOM des dropdowns

/* ====================================================================================
/*                              INITIALISATION DES FILTRES
/* ==================================================================================== */
/**
 * Initialise les filtres en récupérant les options en cache et en les affichant dans le DOM.
 * Utilise un cache pour améliorer la performance et limiter les accès au DOM.
 *
 * @async
 * @returns {Promise<void>} Ne retourne rien, mais met à jour les dropdowns de filtres dans le DOM.
 * @throws {Error} Si une erreur se produit lors du chargement des filtres.
 */
export async function initFilters() {
    try {
        logEvent("test_start_filter", "initFilters : Début de l'initialisation des filtres.");
        
        const filtersContainer = await waitForElement("#filters .filter-dropdowns", 3000);
        if (!filtersContainer) {
            logEvent("error", "initFilters : Conteneur des filtres introuvable.");
            console.warn("⚠️ Alerte : Impossible de charger les filtres.");
            return;
        }

        const filterData = fetchFilterOptions();
        if (!filterData || !filterData.ingredients || !filterData.appliances || !filterData.ustensils) {
            logEvent("warn", "initFilters : Données de filtre manquantes.");
            return;
        }

        if (!Object.values(filterData).some(arr => arr.length > 0)) {
            logEvent("warn", "initFilters : Aucun filtre disponible, affichage annulé.");
            return;
        }

        filtersContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        ["ingredients", "appliances", "ustensils"].forEach(filterType => {
            if (filterData[filterType]?.length > 0) {
                fragment.appendChild(createFilterSection(
                    filterType.charAt(0).toUpperCase() + filterType.slice(1),
                    filterType,
                    new Set(filterData[filterType])
                ));
            }
        });

        filtersContainer.appendChild(fragment);
        logEvent("success", "initFilters : Filtres chargés avec succès.");
    } catch (error) {
        logEvent("error", "initFilters : Erreur", { error: error.message });
    }
}

/* ====================================================================================
/*                        GESTION DES FILTRES SÉLECTIONNÉS (TAGS)
/* ==================================================================================== */
/*--------------- */
/* Ajout         */
/*---------------*/
/**
 * Ajoute un filtre sélectionné et met à jour les dropdowns.
 * Empêche l'ajout de doublons et met à jour l'affichage.
 *
 * @param {string} filterType - Type de filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur sélectionnée.
 * @returns {void} Ne retourne rien, met à jour les filtres et l'affichage.
 */
export function handleFilterSelection(filterType, filterValue) {
    try {
        console.log("handleFilterSelection appelée avec :", { filterType, filterValue });

        // Vérification des paramètres
        if (!filterType || !filterValue) {
            logEvent("error", "handleFilterSelection : Paramètres invalides.");
            throw new Error("Les paramètres filterType et filterValue sont obligatoires.");
        }

        // Vérifier que activeFilters est défini
        if (typeof activeFilters === "undefined") {
            logEvent("error", "handleFilterSelection : activeFilters n'est pas défini.");
            throw new Error("activeFilters n'a pas été initialisé.");
        }

        console.log("État actuel de activeFilters :", activeFilters);

        // Vérifier si le type de filtre existe dans activeFilters
        if (!activeFilters[filterType]) {
            logEvent("error", `handleFilterSelection : Type de filtre "${filterType}" inconnu.`);
            console.log("Erreur : filterType inconnu dans activeFilters :", filterType);
            return;
        }

        logEvent("info", `handleFilterSelection : Tentative d'ajout de "${filterValue}" dans "${filterType}".`);

        // Vérifier si le filtre est déjà actif
        if (activeFilters[filterType].has(filterValue)) {
            logEvent("warn", `handleFilterSelection : Le filtre "${filterValue}" (${filterType}) est déjà actif.`);
            return;
        }

        // Ajouter le filtre sélectionné
        activeFilters[filterType].add(filterValue);

        logEvent("success", `handleFilterSelection : "${filterValue}" ajouté à "${filterType}".`);

        // Mise à jour de l'affichage
        updateTagDisplay();
        updateFilters();
    } catch (error) {
        logEvent("error", "handleFilterSelection : Erreur lors de l'ajout du filtre.", { error: error.message });
        console.error("Erreur détectée dans handleFilterSelection :", error);
    }
}


/*--------------- */
/* Retrait        */
/*--------------- */
/**
 * Supprime un filtre sélectionné et met à jour l'affichage.
 * Vérifie que le filtre existe avant de le supprimer.
 *
 * @param {string} filterType - Type de filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur à supprimer.
 * @returns {void} Ne retourne rien, met à jour les filtres et l'affichage.
 */
export function removeTag(filterType, filterValue) {
    try {
        // Vérification des paramètres
        if (!filterType || !filterValue) {
            logEvent("error", "removeTag : Paramètres invalides.");
            throw new Error("Les paramètres filterType et filterValue sont obligatoires.");
        }

        logEvent("info", `removeTag : Tentative de suppression de "${filterValue}" dans "${filterType}".`);

        // Vérifier si le filtre existe avant suppression
        if (!activeFilters[filterType].has(filterValue)) {
            logEvent("warn", `removeTag : Le filtre "${filterValue}" (${filterType}) n'est pas actif.`);
            return;
        }

        // Supprimer le filtre
        activeFilters[filterType].delete(filterValue);
        logEvent("success", `removeTag : "${filterValue}" supprimé de "${filterType}".`);

        // Mise à jour de l'affichage
        updateTagDisplay();
        updateFilters();
    } catch (error) {
        logEvent("error", "removeTag : Erreur lors de la suppression du filtre.", { error: error.message });
    }
}

/*-----------------*/
/* Mise à jour tag */
/*-----------------*/
/**
 * Met à jour dynamiquement l'affichage des tags sous les dropdowns.
 * Vérifie la présence du conteneur et optimise l'ajout des éléments.
 *
 * @async
 * @returns {Promise<void>} Ne retourne rien, met à jour l'affichage des tags dans le DOM.
 * @throws {Error} Si le conteneur des tags est introuvable.
 */
export function updateTagDisplay() {
    try {
        logEvent("info", "updateTagDisplay : Vérification et mise à jour des tags...");

        const tagsContainer = document.querySelector("#selected-filters");
        if (!tagsContainer) {
            logEvent("error", "updateTagDisplay : Conteneur des tags introuvable.");
            return;
        }

        // Nettoyage avant de recréer les tags
        tagsContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                const tagElement = document.createElement("span");
                tagElement.classList.add("filter-tag");
                tagElement.textContent = filterValue;
                tagElement.dataset.filterType = filterType;

                const removeIcon = document.createElement("i");
                removeIcon.classList.add("fas", "fa-times");
                removeIcon.setAttribute("aria-label", `Supprimer le filtre ${filterValue}`);
                removeIcon.setAttribute("role", "button");
                removeIcon.addEventListener("click", () => {
                    removeTag(filterType, filterValue);
                    updateTagDisplay(); // Réafficher les tags après suppression
                    updateFilters(); // Réactualiser les dropdowns après suppression
                });

                tagElement.appendChild(removeIcon);
                fragment.appendChild(tagElement);
            });
        });

        tagsContainer.appendChild(fragment);
        logEvent("success", "updateTagDisplay : Tags mis à jour avec succès.");
    } catch (error) {
        logEvent("error", "updateTagDisplay : Erreur lors de la mise à jour des tags.", { error: error.message });
    }
}

/*-----------------*/
/* Mise à jour liste*/
/*-----------------*/
/**
 * Met à jour dynamiquement les options des dropdowns en fonction des filtres actifs.
 * Vérifie si une mise à jour est nécessaire avant de modifier le DOM.
 *
 * @returns {void} Ne retourne rien, met à jour les options des dropdowns.
 */

export function updateFilters(filteredRecipes) {
    try {
        logEvent("info", "updateFiltersDropdown : Mise à jour des options des dropdowns.");

        const newFilterData = {
            ingredients: new Set(),
            appliances: new Set(),
            ustensils: new Set()
        };

        // Remplit les ensembles dynamiques avec les nouvelles valeurs extraites des recettes filtrées
        filteredRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => newFilterData.ingredients.add(ing.ingredient));
            newFilterData.appliances.add(recipe.appliance);
            recipe.ustensils.forEach(ust => newFilterData.ustensils.add(ust));
        });

        // Mise à jour des dropdowns uniquement si nécessaire
        Object.entries(filterContainers).forEach(([filterType, container]) => {
            const dropdownList = container?.querySelector("ul");
            if (!dropdownList) {
                return;
            }

            dropdownList.innerHTML = ""; // Nettoyage du dropdown avant mise à jour
            const fragment = document.createDocumentFragment();

            [...newFilterData[filterType]]
                .sort((a, b) => a.localeCompare(b)) // Tri alphabétique
                .forEach(option => {
                    const li = document.createElement("li");
                    li.classList.add("filter-option");
                    li.textContent = option;
                    li.addEventListener("click", () => handleFilterSelection(filterType, option));
                    fragment.appendChild(li);
                });

            dropdownList.appendChild(fragment);
        });

        logEvent("success", "updateFiltersDropdown : Mise à jour des dropdowns terminée.");
    } catch (error) {
        logEvent("error", "updateFiltersDropdown : Erreur lors de la mise à jour des options.", { error: error.message });
    }
}
/* ====================================================================================
/*                   RÉINITIALISATION DES FILTRES
/* ==================================================================================== */
/**
 * Réinitialise tous les filtres et met à jour l'affichage.
 * Vide les filtres actifs, met à jour les dropdowns et vide le cache de recherche.
 *
 * @returns {void} Ne retourne rien, met à jour les filtres et l'affichage.
 */
export function resetFilters() {
    try {
        logEvent("info", "resetFilters : Réinitialisation des filtres...");

        // Vérifier si `activeFilters` existe
        if (!activeFilters) {
            logEvent("error", "resetFilters : L'objet activeFilters est introuvable.");
            throw new Error("L'objet activeFilters est introuvable.");
        }

        // Réinitialiser les filtres actifs
        activeFilters.ingredients.clear();
        activeFilters.appliances.clear();
        activeFilters.ustensils.clear();

        logEvent("success", "resetFilters : Tous les filtres actifs ont été supprimés.");

        // Mise à jour de l'affichage
        updateTagDisplay();
        updateFilters();

        // Nettoyage du cache de recherche
        clearSearchCache();
        logEvent("success", "resetFilters : Cache de recherche vidé.");

    } catch (error) {
        logEvent("error", "resetFilters : Erreur lors de la réinitialisation des filtres.", { error: error.message });
    }
}
