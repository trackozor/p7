/* ==================================================================================== */
/*  FICHIER          : tagManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DESCRIPTION      :        */
/* ==================================================================================== */

import { logEvent} from "../utils/utils.js";
import { updateFilters } from "../components/filterManager.js";
import { Search } from "../components/search/search.js";
import { safeQuerySelector } from "../config/domSelectors.js";
import { activeFilters } from "../components/filterManager.js";
import {restoreRemovedOption} from "../components/dropdownManager.js";
import { updateRecipes } from "./search/displayResults.js";
import { getAllRecipes } from "../data/dataManager.js";
import { handleResetButton } from "../events/eventHandler.js";
export let totalTags = 0;

/**================================================================================
 * GESTION DES TAGS
 * =================================================================================*/
/**
 * Met à jour dynamiquement l'affichage des tags sous les dropdowns.
 *
 * - Vérifie la présence du conteneur des tags.
 * - Met à jour les tags actifs sans recharger toute la liste.
 * - Gère la suppression des tags et met à jour la recherche.
 */
export function updateTagDisplay() {
    logEvent("info", "updateTagDisplay : Mise à jour des tags...");

    const tagsContainer = safeQuerySelector("#selected-filters");
    if (!tagsContainer) {
        logEvent("error", "updateTagDisplay : Conteneur des tags introuvable.");
        return;
    }

    const fragment = document.createDocumentFragment();
    
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
                updateTagDisplay(); // Met à jour l'affichage après suppression
                updateFilters(); // Rafraîchit les dropdowns
            });

            tagElement.appendChild(removeIcon);
            fragment.appendChild(tagElement);
            totalTags++;
        });
    });

    tagsContainer.innerHTML = "";
    tagsContainer.appendChild(fragment);
    handleResetButton();
    logEvent("success", "updateTagDisplay : Tags mis à jour.");
}

/** ====================================================================================
 *  SUPPRESSION D' UN TAG LORS DU CLIQUE SUR LE BOUTON DE FERMETURE
 * ==================================================================================== */
/**
 * Supprime un filtre actif et met à jour l'affichage.
 *
 * @param {string} filterType - Type du filtre à supprimer (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur du filtre à supprimer.
 */
/**
 * Supprime un filtre actif et met à jour dynamiquement l'affichage.
 *
 * - Supprime le filtre sélectionné de `activeFilters`.
 * - Met à jour l'affichage des tags et du dropdown correspondant.
 * - Relance la recherche avec les filtres restants.
 * - Si aucun filtre n'est actif après suppression, restaure l'affichage initial.
 *
 * @param {string} filterType - Type de filtre à supprimer (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur spécifique du filtre à supprimer.
 */
export function removeTag(filterType, filterValue) {
    try {
        logEvent("info", `removeTag : Suppression du filtre '${filterValue}' (${filterType}).`);

        // Vérifie que le filtre est bien actif avant de le supprimer
        if (!activeFilters[filterType].has(filterValue)) {
            logEvent("warn", `removeTag : Le filtre '${filterValue}' (${filterType}) n'est pas actif.`);
            return;
        }

        // Suppression du filtre actif
        activeFilters[filterType].delete(filterValue);

        // Mise à jour de l'affichage des tags et réintégration de l'option dans le dropdown
        updateTagDisplay();
        restoreRemovedOption(filterType, filterValue);

        // Conversion de l'état des filtres actifs en tableaux
        const filtersArray = {
            ingredients: Array.from(activeFilters["ingredients"]),
            appliances: Array.from(activeFilters["appliances"]),
            ustensils: Array.from(activeFilters["ustensils"])
        };

        // Vérifie s'il reste des filtres actifs
        const hasActiveFilters = filtersArray.ingredients.length > 0 || 
                                filtersArray.appliances.length > 0 || 
                                filtersArray.ustensils.length > 0;

        if (hasActiveFilters) {
            // Relance la recherche avec les filtres restants
            Search("", filtersArray);
        } else {
            logEvent("info", "removeTag : Tous les filtres supprimés, restauration de l'affichage initial.");

            // Si aucun filtre n'est actif, affiche toutes les recettes initiales
            updateRecipes(getAllRecipes()); 
        }

    } catch (error) {
        logEvent("error", "removeTag : Erreur lors de la suppression du filtre.", { error: error.message });
    }
}


/**====================================================================================
 * REINITIALISATION  DES TAGS
 * ====================================================================================*/
/**
 * Supprime tous les tags sélectionnés et met à jour l'affichage.
 */
export function resetAllTags() {
    logEvent("info", "resetAllTags : Suppression de tous les tags.");

    Object.keys(activeFilters).forEach(filterType => {
        activeFilters[filterType].clear();
    });

    updateTagDisplay();
    updateFilters();
    updateRecipes(getAllRecipes());

    logEvent("success", "resetAllTags : Tous les tags ont été supprimés.");
}
