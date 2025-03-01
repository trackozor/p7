/* ====================================================================================
/*  FICHIER          : eventListener.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 1.5
/*  DESCRIPTION      : Gestion des écouteurs d'événements pour la recherche et les filtres.
/* ==================================================================================== */

import { logEvent, debounce } from "../utils/utils.js";
import { safeQuerySelectorAll, waitForElement } from "../config/domSelectors.js";
import { handleSearch, handleDropdownClick, handleFilterSelection } from "./eventHandler.js";

/* ====================================================================================
/*  BARRE DE RECHERCHE
/* ==================================================================================== */

export async function attachSearchListeners(searchSelectors) {
    try {
        logEvent("info", "attachSearchListeners : Vérification des éléments DOM...");

        const form = searchSelectors.form || await waitForElement(".search-bar");
        const input = searchSelectors.input || await waitForElement("#search");

        if (!form || !input) {
            throw new Error("attachSearchListeners : Élément(s) de la recherche introuvable(s).");
        }

        logEvent("success", "attachSearchListeners : Éléments trouvés, attachement des écouteurs...");

        input.addEventListener("input", debounce(handleSearch, 300));
        form.addEventListener("submit", event => {
            event.preventDefault();
            handleSearch();
        });

        logEvent("success", "attachSearchListeners : Écouteurs attachés.");
    } catch (error) {
        logEvent("error", "attachSearchListeners : Erreur lors de l'ajout des écouteurs.", { error: error.message });
    }
}

/* ====================================================================================
/*  ATTACHEMENT DES ÉVÉNEMENTS AUX DROPDOWNS
/* ==================================================================================== */

export function attachFilterEvents() {
    logEvent("info", "Attachement des événements aux dropdowns...");

    const dropdownButtons = safeQuerySelectorAll(".filter-button");
    const dropdownOptions = safeQuerySelectorAll(".filter-option");

    if (!dropdownButtons.length) {
        logEvent("warn", "Aucun bouton de filtre trouvé.");
        return;
    }

    dropdownButtons.forEach(button => {
        button.addEventListener("click", (event) => handleDropdownClick(event, button));
    });

    dropdownOptions.forEach(option => {
        option.addEventListener("click", (event) => handleFilterSelection(event, option));
    });

    logEvent("success", "attachFilterEvents : Événements attachés aux dropdowns.");
}

/* ====================================================================================
/*  INITIALISATION GLOBALE DES ÉVÉNEMENTS
/* ==================================================================================== */

export function initEventListeners() {
    attachFilterEvents();
    attachSearchListeners({ form: document.querySelector(".search-bar"), input: document.querySelector("#search") });
    logEvent("success", "initEventListeners : Tous les événements attachés.");
}
