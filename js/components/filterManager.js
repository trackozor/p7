/* ====================================================================================
/*  FICHIER          : filterManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gère les filtres et l'affichage dynamique des recettes.
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import {  fetchFilterOptions, searchRecipes, clearSearchCache } from "../data/dataManager.js";
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
        logEvent("info", "initFilters : Début de l'initialisation des filtres.");

        // Attendre que le conteneur des filtres soit chargé
        const filtersContainer = await waitForElement("#filters .filter-dropdowns", 3000);
        if (!filtersContainer) {
            logEvent("error", "initFilters : Conteneur des filtres introuvable.");
            throw new Error("Le conteneur des filtres (#filters .filter-dropdowns) est introuvable.");
        }

        // Récupération des options de filtres depuis le cache
        const filterData = fetchFilterOptions();
        if (!filterData || !filterData.ingredients || !filterData.appliances || !filterData.ustensils) {
            logEvent("warn", "initFilters : Aucune donnée de filtre disponible.");
            return;
        }

        // Vérifier si les filtres sont vides
        if (
            filterData.ingredients.length === 0 &&
            filterData.appliances.length === 0 &&
            filterData.ustensils.length === 0
        ) {
            logEvent("warn", "initFilters : Aucun filtre disponible, l'affichage est annulé.");
            return;
        }

        logEvent("info", "initFilters : Chargement des dropdowns...");

        // Nettoyer le conteneur et préparer un fragment pour optimiser le DOM
        filtersContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        // Création et insertion des dropdowns dynamiquement
        ["ingredients", "appliances", "ustensils"].forEach(filterType => {
            if (filterData[filterType]?.length > 0) {
                const dropdown = createFilterSection(
                    filterType.charAt(0).toUpperCase() + filterType.slice(1), // Mise en forme du titre
                    filterType,
                    new Set(filterData[filterType]) // Évite les doublons
                );
                fragment.appendChild(dropdown);
            }
        });

        // Insérer les dropdowns optimisés dans le DOM
        filtersContainer.appendChild(fragment);

        logEvent("success", "initFilters : Dropdowns générés et insérés avec succès.");
    } catch (error) {
        logEvent("error", "initFilters : Erreur lors de l'affichage des filtres.", { error: error.message });
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
        // Vérification des paramètres
        if (!filterType || !filterValue) {
            logEvent("error", "handleFilterSelection : Paramètres invalides.");
            throw new Error("Les paramètres filterType et filterValue sont obligatoires.");
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
export function updateFilters() {
    try {
        logEvent("info", "updateFilters : Début de la mise à jour des dropdowns...");

       

        // Récupération des recettes filtrées
        const filteredRecipes = searchRecipes([
            ...Array.from(activeFilters.ingredients),
            ...Array.from(activeFilters.appliances),
            ...Array.from(activeFilters.ustensils)
        ]);

        if (!filteredRecipes || filteredRecipes.length === 0) {
            logEvent("warn", "updateFilters : Aucune recette trouvée, désactivation des dropdowns.");
            Object.values(filterContainers).forEach(container => container.classList.add("disabled"));
            return;
        }

        // Création d'un nouvel ensemble de filtres dynamiques
        const newFilterData = {
            ingredients: new Set(),
            appliances: new Set(),
            ustensils: new Set()
        };

        // Mise à jour des ensembles de filtres en fonction des recettes trouvées
        filteredRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => newFilterData.ingredients.add(ing.ingredient));
            newFilterData.appliances.add(recipe.appliance);
            recipe.ustensils.forEach(ust => newFilterData.ustensils.add(ust));
        });

        // Mise à jour des dropdowns uniquement si les données ont changé
        Object.entries(filterContainers).forEach(([filterType, container]) => {
            const dropdownList = container?.querySelector("ul");
            if (!dropdownList) {
                logEvent("warn", `updateFilters : Impossible de trouver la liste des options pour "${filterType}".`);
                return;
            }

            // Vérifier si la mise à jour est nécessaire pour éviter un re-render inutile
            const previousFilterCount = dropdownList.dataset.lastFilterCount || "0";
            if (previousFilterCount === String(newFilterData[filterType].size)) {
                logEvent("info", `updateFilters : Aucun changement détecté pour "${filterType}", mise à jour annulée.`);
                return;
            }
            dropdownList.dataset.lastFilterCount = String(newFilterData[filterType].size);

            // Mise à jour du dropdown
            dropdownList.innerHTML = "";
            const fragment = document.createDocumentFragment();

            newFilterData[filterType].forEach(option => {
                const listItem = document.createElement("li");
                listItem.classList.add("filter-option");
                listItem.textContent = option;
                listItem.dataset.filter = filterType;
                fragment.appendChild(listItem);
            });

            dropdownList.appendChild(fragment);
        });

        logEvent("success", "updateFilters : Mise à jour terminée.");
    } catch (error) {
        logEvent("error", "updateFilters : Erreur lors de la mise à jour des dropdowns.", { error: error.message });
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
