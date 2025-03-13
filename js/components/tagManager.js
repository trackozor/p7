/* ==================================================================================== */
/*  FICHIER          : tagManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DESCRIPTION      :        */
/* ==================================================================================== */

import { logEvent} from "../utils/utils.js";
import { removeTag } from "../events/eventHandler.js";
import { updateFilters } from "../components/filterManager.js";
import { Search } from "../components/search/search.js";
import { safeQuerySelector } from "../config/domSelectors.js";
import { activeFilters } from "../components/filterManager.js";

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

    logEvent("success", "updateTagDisplay : Tags mis à jour.");
}

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
    Search("", {}); // Relance la recherche sans filtre

    logEvent("success", "resetAllTags : Tous les tags ont été supprimés.");
}
