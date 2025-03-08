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
/* ==================================================================================== */
/*  VARIABLES GLOBALES ET ÉTAT DES FILTRES                                             */
/* ==================================================================================== */
export let activeFilters = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set()
};

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
        // Début du processus d'initialisation des filtres
        logEvent("test_start_filter", "initFilters : Initialisation des filtres...");

        // Attente de la disponibilité du conteneur des filtres avec un délai de 3 secondes
        const filtersContainer = await waitForElement("#filters .filter-dropdowns", 3000);
        if (!filtersContainer) {
            logEvent("error", "initFilters : Conteneur des filtres introuvable.");
            return;
        }

        // Récupération des données des filtres (ingrédients, appareils, ustensiles)
        const filterData = fetchFilterOptions();
        if (!filterData || Object.values(filterData).every(arr => arr.length === 0)) {
            logEvent("warn", "initFilters : Aucun filtre disponible.");
            return;
        }

        // Nettoyage du conteneur des filtres avant insertion des nouvelles données
        filtersContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        // Boucle sur chaque type de filtre et création dynamique des sections correspondantes
        Object.entries(filterData).forEach(([filterType, values]) => {
            if (values.length > 0) {
                // Création et ajout de la section du filtre au fragment
                fragment.appendChild(createFilterSection(
                    filterType.charAt(0).toUpperCase() + filterType.slice(1), // Mise en forme du titre
                    filterType, // Identifiant du filtre
                    new Set(values) // Transformation en `Set` pour éviter les doublons
                ));
            }
        });

        // Ajout des sections de filtres au conteneur principal
        filtersContainer.appendChild(fragment);

        // Fin de l'initialisation avec un message de succès
        logEvent("success", "initFilters : Filtres chargés avec succès.");
    } catch (error) {
        // Gestion des erreurs lors de l'initialisation des filtres
        logEvent("error", "initFilters : Erreur", { error: error.message });
    }
}

/** ====================================================================================
 *  SUPPRESSION D'UNE OPTION DU DROPDOWN APRÈS SÉLECTION
 * ==================================================================================== */
/**
 * Supprime une option du dropdown une fois qu'elle a été sélectionnée.
 *
 * - Recherche le dropdown correspondant au `filterType`.
 * - Vérifie si le dropdown existe avant de continuer.
 * - Parcourt les éléments du dropdown pour trouver l'option correspondante.
 * - Supprime l'option si elle est trouvée pour éviter les doublons dans la liste.
 *
 * @param {string} filterType - Type de filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur de l'option à supprimer.
 */
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

    // ✅ Vérification du nombre de tags après suppression d'une option
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

/** ====================================================================================
 *  MISE À JOUR DE L'AFFICHAGE DES TAGS SÉLECTIONNÉS
 * ==================================================================================== */
/**
 * Met à jour dynamiquement l'affichage des tags sous les dropdowns.
 *
 * - Sélectionne le conteneur des tags (`#selected-filters`).
 * - Vérifie que le conteneur existe avant de modifier le DOM.
 * - Vide le contenu actuel pour éviter les doublons.
 * - Parcourt les filtres actifs et crée un élément de tag pour chaque valeur sélectionnée.
 * - Ajoute un bouton de suppression sur chaque tag pour permettre son retrait.
 * - Insère les tags mis à jour dans le DOM.
 */
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

        const tagsContainer = document.querySelector("#selected-filters");
        if (!tagsContainer) {
            logEvent("error", "updateTagDisplay : Conteneur des tags introuvable.");
            return;
        }

        // Nettoyage avant de recréer les tags
        tagsContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();
        let totalTags = 0; // Compteur du nombre de tags affichés

        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                const tagElement = document.createElement("span");
                tagElement.classList.add("filter-tag");
                tagElement.textContent = filterValue;
                tagElement.dataset.filterType = filterType;

                const removeIcon = document.createElement("i");
                removeIcon.classList.add("fas", "fa-times");
                removeIcon.setAttribute("role", "button");
                removeIcon.addEventListener("click", () => {
                    removeTag(filterType, filterValue);
                    updateTagDisplay(); // Réafficher les tags après suppression
                    updateFilters(); // Réactualiser les dropdowns après suppression
                });

                tagElement.appendChild(removeIcon);
                fragment.appendChild(tagElement);
                totalTags++;
            });
        });

        tagsContainer.appendChild(fragment);

        //  Vérifie si 2 tags ou plus sont actifs et gère le bouton
        handleResetButton(totalTags);

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
