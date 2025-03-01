/* ====================================================================================
/*  FICHIER          : eventHandler.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 1.5
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes.
/* ==================================================================================== */

import { logEvent, debounce } from "../utils/utils.js";
import { KEY_CODES } from "../config/constants.js";
import { handleFilterSelection as applyFilterSelection, removeTag, updateFilters, updateRecipeDisplay } from "../components/filterManager.js";

/* ====================================================================================
/*  GESTION DE L’ÉVÉNEMENT DE RECHERCHE
/* ==================================================================================== */

export const handleSearch = debounce(async function () {
    try {
        logEvent("test_start", "handleSearch : Début de la recherche.");

        const searchInput = document.querySelector("#search");
        if (!searchInput) {
            throw new Error("handleSearch : Élément input de recherche introuvable.");
        }

        const query = searchInput.value.trim();
        if (query.length < 3) {
            return;
        }

        logEvent("info", `handleSearch : Recherche de "${query}".`);

        updateFilters();
        updateRecipeDisplay();

        logEvent("test_end", "handleSearch : Recherche terminée.");
    } catch (error) {
        logEvent("error", "handleSearch : Erreur lors de la recherche.", { error: error.message });
    }
}, 300);

/* ====================================================================================
/*  GESTION DE L’OUVERTURE ET FERMETURE DES DROPDOWNS
/* ==================================================================================== */

export function handleDropdownClick(event, button) {
    event.stopPropagation();

    const dropdownContainer = button.nextElementSibling;
    const allDropdowns = document.querySelectorAll(".dropdown-container");

    if (!dropdownContainer) {
        logEvent("error", "handleDropdownClick : Aucun conteneur de dropdown trouvé.");
        return;
    }

    allDropdowns.forEach(drop => {
        if (drop !== dropdownContainer) {
          drop.classList.remove("active");
        }
    });

    dropdownContainer.classList.toggle("active");

    logEvent("info", `handleDropdownClick : Dropdown "${button.dataset.filter}" ${dropdownContainer.classList.contains("active") ? "ouvert" : "fermé"}.`);
}

/* ====================================================================================
/*  GESTION DE LA SÉLECTION DES FILTRES
/* ==================================================================================== */

export function handleFilterSelection(event, option) {
    const filterType = option.dataset.filter;
    const filterValue = option.textContent.trim();

    if (!filterType || !filterValue) {
        logEvent("error", "handleFilterSelection : Paramètres invalides.");
        return;
    }

    logEvent("info", `handleFilterSelection : Sélection de "${filterValue}" dans "${filterType}".`);

    applyFilterSelection(filterType, filterValue);
    updateFilters();
    updateRecipeDisplay();
}

/* ====================================================================================
/*  GESTION DE LA SUPPRESSION DES TAGS
/* ==================================================================================== */

export function handleTagClick(tagElement) {
    const {filterType} = tagElement.dataset;
    const filterValue = tagElement.textContent.trim();

    if (!filterType || !filterValue) {
        logEvent("error", "handleTagClick : Paramètres invalides.");
        return;
    }

    logEvent("info", `handleTagClick : Suppression du filtre "${filterValue}" (${filterType}).`);

    removeTag(filterType, filterValue);
    updateFilters();
    updateRecipeDisplay();
}

/* ====================================================================================
/*  GESTION DE LA NAVIGATION AU CLAVIER DANS LES DROPDOWNS
/* ==================================================================================== */

export function handleKeyboardNavigation(event) {
    const activeDropdown = document.querySelector(".dropdown-container.active ul");
    if (!activeDropdown) {
      return;
    }

    const options = activeDropdown.querySelectorAll("li:not(.no-result)");
    if (!options.length) {
      return;
    }

    let currentIndex = Array.from(options).findIndex(option => option.classList.contains("highlighted"));

    switch (event.key) {
        case KEY_CODES.ARROW_DOWN:
            event.preventDefault();
            if (currentIndex < options.length - 1) {
              currentIndex++;
            }
            break;
        case KEY_CODES.ARROW_UP:
            event.preventDefault();
            if (currentIndex > 0) {
              currentIndex--;
            }
            break;
        case KEY_CODES.ENTER:
            event.preventDefault();
            if (currentIndex >= 0) {
              options[currentIndex].click();
            }
            return;
        case KEY_CODES.ESCAPE:
            event.preventDefault();
            document.querySelector(".dropdown-container.active")?.classList.remove("active");
            return;
    }

    options.forEach(option => option.classList.remove("highlighted"));
    if (currentIndex >= 0) {
      options[currentIndex].classList.add("highlighted");
    }
}

document.addEventListener("keydown", handleKeyboardNavigation);
