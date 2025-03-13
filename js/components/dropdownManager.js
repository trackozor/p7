/* ==================================================================================== */
/*  FICHIER          : dropdownManager.js                                              */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.0                                                             */
/*  DESCRIPTION      : Gère les interactions avec les dropdowns.                       */
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";
import { handleFilterSelection } from "../events/eventHandler.js";

/* ==================================================================================== */
/*             SUPPRESSION D'UNE OPTION DANS LE DROPDOWN                              */
/* ==================================================================================== */
/**
 * Supprime une option du dropdown une fois sélectionnée.
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

    logEvent("info", `removeSelectedOption : Option '${filterValue}' supprimée de '${filterType}'`);
}

/* ==================================================================================== */
/*             RÉINTRODUCTION D'UNE OPTION DANS LE DROPDOWN                            */
/* ==================================================================================== */
/**
 * Réintroduit une option dans le dropdown après suppression d'un tag.
 *
 * @param {string} filterType - Type de filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur du filtre à réintroduire.
 */
export function restoreRemovedOption(filterType, filterValue) {
    const dropdown = document.querySelector(`#${filterType} ul`);
    if (!dropdown) {
        return;
    }

    const li = document.createElement("li");
    li.classList.add("filter-option");
    li.textContent = filterValue;
    li.addEventListener("click", () => handleFilterSelection(filterType, filterValue));

    dropdown.appendChild(li);
    logEvent("info", `restoreRemovedOption : Option '${filterValue}' réintroduite dans '${filterType}'`);
}
