/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DESCRIPTION      : Gère les filtres et l'affichage dynamique des recettes.         */
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import { fetchFilterOptions } from "../data/dataManager.js";
import { logEvent, waitForElement } from "../utils/utils.js";
import { removeTag , handleFilterSelection, handleResetButton } from "../events/eventHandler.js"
import { Search } from "./search/search.js";
import { safeQuerySelector } from "../config/domSelectors.js"; 
import { displayFilteredRecipes } from "./search/displayResults.js";

/* ==================================================================================== */
/*  VARIABLES GLOBALES ET ÉTAT DES FILTRES                                             */
/* ==================================================================================== */
export let activeFilters = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set()
};
let displayedTags = new Map();
const filterContainers = {}; // Stocke les éléments DOM des dropdowns

/* ==================================================================================== */
/*  INITIALISATION DES FILTRES                                                         */
/* ==================================================================================== */
/**
 * Charge les options des filtres et les insère dynamiquement dans le DOM.
 *
 * - Récupère les options des filtres disponibles via `fetchFilterOptions()`.
 * - Vérifie que le conteneur des filtres est présent avant de le manipuler.
 * - Nettoie le conteneur existant avant d'insérer de nouveaux éléments.
 * - Génère dynamiquement les sections de filtres avec `createFilterSection()`.
 * - Insère les filtres dans le DOM pour permettre leur utilisation.
 * - Journalise chaque étape pour le suivi et la gestion des erreurs.
 *
 * @async
 * @returns {Promise<void>} Ne retourne rien, mais met à jour le DOM avec les filtres.
 */
export async function initFilters() {
    try {
        logEvent("test_start_filter", "initFilters : Initialisation des filtres...");

        const filtersContainer = await waitForElement("#filters .filter-dropdowns", 3000);
        if (!filtersContainer) {
            logEvent("error", "initFilters : Conteneur des filtres introuvable.");
            return;
        }

        //  Récupération des filtres sans doublons
        const rawFilterData = fetchFilterOptions();
        if (!rawFilterData || Object.values(rawFilterData).every(arr => arr.length === 0)) {
            logEvent("warn", "initFilters : Aucun filtre disponible.");
            return;
        }

        //  Set global pour s'assurer qu'un élément n'existe qu'une seule fois
        const uniqueItems = new Set();

        //  Nouvelle structure des filtres (sans doublons entre catégories)
        const filterData = {
            ingredients: new Set(),
            appliances: new Set(),
            ustensils: new Set()
        };

        //  Parcours des filtres et suppression des doublons entre catégories
        Object.entries(rawFilterData).forEach(([filterType, values]) => {
            values.forEach(value => {
                if (!uniqueItems.has(value)) {
                    uniqueItems.add(value); // Marque l'élément comme utilisé
                    filterData[filterType].add(value); // Ajoute l'élément à la bonne catégorie
                }
            });
        });

        //  Nettoyage et génération dynamique des filtres sans doublons
        filtersContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        Object.entries(filterData).forEach(([filterType, values]) => {
            if (values.size > 0) {
                fragment.appendChild(createFilterSection(
                    filterType.charAt(0).toUpperCase() + filterType.slice(1), 
                    filterType, 
                    values
                ));
            }
        });

        //  Ajout des filtres sans doublons dans le DOM
        filtersContainer.appendChild(fragment);

        logEvent("success", "initFilters : Filtres chargés sans doublons.");
    } catch (error) {
        logEvent("error", "initFilters : Erreur", { error: error.message });
    }
}


/* ==================================================================================== */
/*               SUPPRESSION D'UNE OPTION DANS LE DROPDOWN                             */
/* ==================================================================================== */
/**
 * Supprime une option du dropdown une fois sélectionnée.
 * - Vérifie si le bouton de réinitialisation doit être mis à jour.
 *
 * @param {string} filterType - Type de filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur du filtre sélectionné.
 */
export function removeSelectedOption(filterType, filterValue) {
    const dropdown = document.querySelector(`#${filterType} ul`);
    
    if (!dropdown) {
        return;
    }

    const option = [...dropdown.children].find(li => li.textContent === filterValue);

    if (option) {
        option.remove();
    }

    //  Vérification du nombre de tags après suppression d'une option
    const totalTags = Object.values(activeFilters).reduce((sum, set) => sum + set.size, 0);
    handleResetButton(totalTags);
}

/** ====================================================================================
 *  RÉINTRODUCTION D'UNE OPTION DANS LE DROPDOWN APRÈS SUPPRESSION D'UN TAG
 * ==================================================================================== */
/**
 * Réintroduit une option dans le dropdown après suppression d'un tag.
 *
 * - Sélectionne le dropdown correspondant au `filterType`.
 * - Vérifie si le dropdown existe avant d'ajouter l'option.
 * - Crée un nouvel élément `<li>` représentant l'option supprimée.
 * - Ajoute un écouteur d'événement pour permettre à l'utilisateur de la sélectionner à nouveau.
 * - Insère l'option réintroduite dans le dropdown.
 *
 * @param {string} filterType - Type de filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur de l'option à réintroduire.
 */
export function restoreRemovedOption(filterType, filterValue) {
    // Sélectionne le dropdown correspondant au type de filtre
    const dropdown = document.querySelector(`#${filterType} ul`);

    // Vérifie que le dropdown existe avant de procéder
    if (!dropdown) {
        return;
    }

    // Création d'un nouvel élément de liste pour réintroduire l'option
    const li = document.createElement("li");
    li.classList.add("filter-option");
    li.textContent = filterValue;

    // Ajoute un écouteur d'événement permettant de sélectionner l'option réintroduite
    li.addEventListener("click", () => handleFilterSelection(filterType, filterValue));

    // Ajoute l'élément à la fin du dropdown
    dropdown.appendChild(li);
}

/* ==================================================================================== */
/*               GESTION DE L'AFFICHAGE DES TAGS                                        */
/* ==================================================================================== */
/**
 * Met à jour dynamiquement l'affichage des tags sous les dropdowns.
 * - Ne gère que l'affichage des tags (sans le bouton de réinitialisation).
 * - Appelle `handleResetButton()` si au moins 2 tags sont actifs.
 *
 * @returns {void} Ne retourne rien, met à jour l'affichage des tags dans le DOM.
 */
export function updateTagDisplay() {
    try {
        logEvent("info", "updateTagDisplay : Vérification et mise à jour des tags...");

        const tagsContainer = safeQuerySelector("#selected-filters");
        if (!tagsContainer) {
            logEvent("error", "updateTagDisplay : Conteneur des tags introuvable.");
            return;
        }

        const newTags = new Map();
        let totalTags = 0;

        //  Mise à jour du cache au lieu de tout supprimer
        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                const tagKey = `${filterType}-${filterValue}`;

                // Si le tag est déjà affiché, on le garde
                if (displayedTags.has(tagKey)) {
                    newTags.set(tagKey, displayedTags.get(tagKey));
                } else {
                    //  Création d'un nouveau tag
                    const tagElement = document.createElement("span");
                    tagElement.classList.add("filter-tag");
                    tagElement.textContent = filterValue;
                    tagElement.dataset.filterType = filterType;

                    //  Icône pour supprimer le tag
                    const removeIcon = document.createElement("i");
                    removeIcon.classList.add("fas", "fa-times");
                    removeIcon.setAttribute("role", "button");
                    removeIcon.addEventListener("click", () => {
                        removeTag(filterType, filterValue);
                        updateFilters(); // Mise à jour des dropdowns
                        updateTagDisplay(); // Rafraîchit l'affichage des tags
                    });

                    tagElement.appendChild(removeIcon);
                    newTags.set(tagKey, tagElement);
                }
                totalTags++;
            });
        });

        //  On vide uniquement ce qui doit être mis à jour (meilleure perf)
        tagsContainer.innerHTML = "";
        newTags.forEach(tag => tagsContainer.appendChild(tag));

        //  Gestion du bouton de réinitialisation dès 2 tags affichés
            handleResetButton(totalTags, tagsContainer);

        // Mise à jour du cache
        displayedTags = newTags;

        //  Lance la recherche avec les nouveaux filtres actifs
        Search("", activeFilters);

        logEvent("success", "updateTagDisplay : Tags mis à jour avec succès.");

    } catch (error) {
        logEvent("error", "updateTagDisplay : Erreur lors de la mise à jour des tags.", { error: error.message });
    }
}

/* ==================================================================================== */
/*               GESTION DE LA RÉINITIALISATION DES FILTRES                            */
/* ==================================================================================== */
/**
 * Supprime tous les tags sélectionnés et met à jour l'affichage.
 */
export function resetAllTags() {
    logEvent("info", "resetAllTags : Suppression de tous les filtres actifs.");

    Object.keys(activeFilters).forEach(filterType => {
        activeFilters[filterType].clear();
    });

    updateTagDisplay();
    updateFilters();
    Search("", {}); // Relance la recherche sans filtre

    logEvent("success", "resetAllTags : Tous les filtres ont été supprimés.");
}

/** ====================================================================================
 *  MISE À JOUR DES OPTIONS DANS LES DROPDOWNS SELON LES RECETTES FILTRÉES
 * ==================================================================================== */
/**
 * Met à jour dynamiquement les options des dropdowns en fonction des recettes filtrées.
 *
 * - Récupère les nouvelles options disponibles après filtrage des recettes.
 * - Supprime les options qui ne sont plus pertinentes.
 * - Met à jour dynamiquement les dropdowns dans le DOM.
 * - Appelle `removeSelectedOption` pour exclure les options déjà sélectionnées.
 * - Appelle `restoreRemovedOption` pour réintégrer les options supprimées si nécessaire.
 *
 * @param {Array} filteredRecipes - Liste des recettes filtrées.
 */
export function updateFilters(filteredRecipes = []) {
    try {
        // Création d'un objet contenant des ensembles pour stocker les nouvelles options
        const newFilterData = {
            ingredients: new Set(),
            appliances: new Set(),
            ustensils: new Set()
        };

        // Parcourt les recettes filtrées pour extraire les options valides
        filteredRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => newFilterData.ingredients.add(ing.ingredient));
            newFilterData.appliances.add(recipe.appliance);
            recipe.ustensils.forEach(ust => newFilterData.ustensils.add(ust));
        });

        // Mise à jour des dropdowns dans le DOM
        Object.entries(filterContainers).forEach(([filterType, container]) => {
            const dropdownList = container?.querySelector("ul");

            // Vérifie si la liste du dropdown est disponible
            if (!dropdownList) {
                return;
            }

            // Nettoie la liste actuelle du dropdown
            dropdownList.innerHTML = "";
            const fragment = document.createDocumentFragment();

            // Trie et ajoute les nouvelles options dans le dropdown
            [...newFilterData[filterType]]
                .sort((a, b) => a.localeCompare(b))
                .forEach(option => {
                    const li = document.createElement("li");
                    li.classList.add("filter-option");
                    li.textContent = option;

                    // Ajoute un événement de sélection pour chaque option
                    li.addEventListener("click", () => {
                        handleFilterSelection(filterType, option);
                        removeSelectedOption(filterType, option); // Supprime l'option une fois sélectionnée
                    });

                    fragment.appendChild(li);
                });

            // Insère les nouvelles options dans le dropdown
            dropdownList.appendChild(fragment);
        });

        // Réintégrer les options supprimées si elles ne sont plus sélectionnées
        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                restoreRemovedOption(filterType, filterValue);
            });
        });

        logEvent("success", "updateFiltersDropdown : Mise à jour des dropdowns terminée.");
    } catch (error) {
        logEvent("error", "updateFiltersDropdown : Erreur lors de la mise à jour des options.", { error: error.message });
    }
}


