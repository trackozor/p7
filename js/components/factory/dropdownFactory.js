/* ==================================================================================== */
/*  FICHIER          : dropdownFactory.js                                              */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 2.6                                                              */
/*  DESCRIPTION      : Factory pour la génération des dropdowns de filtres.            */
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";

/* ==================================================================================== */
/* 1. CRÉATION DES FILTRES (DROPDOWNS) */
/* ==================================================================================== */

/**
 * Crée dynamiquement un dropdown de filtre avec un champ de recherche et des options.
 *
 * @param {string} title - Titre du filtre (ex: "Ingrédients", "Appareils").
 * @param {string} filterType - Identifiant du filtre (ex: "ingredients", "appliances").
 * @param {Set<string>} dataSet - Ensemble des options disponibles.
 * @returns {HTMLElement} Retourne le conteneur du dropdown sans gestion d'événements.
 */
export function createFilterSection(title, filterType, dataSet) {
    try {
        logEvent("test_start", `createFilterSection : Création du dropdown "${title}" (${filterType}).`);

        // Vérification des paramètres
        if (typeof title !== "string" || !title.trim()) {
            throw new Error("createFilterDropdown : title doit être une chaîne de caractères non vide.");
        }
        if (typeof filterType !== "string" || !filterType.trim()) {
            throw new Error("createFilterSection : filterType doit être une chaîne de caractères non vide.");
        }
        if (!(dataSet instanceof Set)) {
            throw new Error("createFilterSection : dataSet doit être une instance de Set.");
        }

        // Création du conteneur principal
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");
        filterContainer.dataset.filter = filterType;

        // Création du bouton principal
        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filter = filterType;
        filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`;

        // Conteneur du dropdown
        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("dropdown-container");

        // Champ de recherche
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.classList.add("dropdown-search");
        searchInput.placeholder = "Rechercher...";

        // Liste des options
        const filterList = document.createElement("ul");
        filterList.classList.add("$(title)-list");

        // Ajout des options
        dataSet.forEach(item => {
            if (typeof item === "string" && item.trim()) {
                const listItem = document.createElement("li");
                listItem.classList.add("filter-option");
                listItem.textContent = item;
                listItem.dataset.filter = filterType;
                filterList.appendChild(listItem);
            }
        });

        // Ajout des éléments au dropdown
        dropdownContainer.appendChild(searchInput);
        dropdownContainer.appendChild(filterList);
        filterContainer.appendChild(filterButton);
        filterContainer.appendChild(dropdownContainer);

        logEvent("test_end", `createFilterDropdown : Dropdown "${title}" généré avec succès.`);

        return filterContainer; // Retourne uniquement l'élément généré

    } catch (error) {
        logEvent("error", "createFilterDropdown : Erreur inattendue.", { error: error.message });
        return null;
    }
}
