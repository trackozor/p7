/** ====================================================================================
 *  FICHIER          : dropdownFactory.js
 *  AUTEUR           : Trackozor
 *  VERSION          : 2.7
 *  DESCRIPTION      : Factory pour la génération des dropdowns de filtres.
 * ==================================================================================== */

import { logEvent } from "../../utils/utils.js";

/** ====================================================================================
 * 1. CRÉATION DES FILTRES (DROPDOWNS)
 * ==================================================================================== */
/**
 * Crée dynamiquement un dropdown de filtre avec un champ de recherche et des options.
 *
 * @param {string} title - Titre du filtre affiché.
 * @param {string} filterType - Type de filtre interne.
 * @param {Set<string>} dataSet - Ensemble des options du filtre.
 * @returns {HTMLElement|null} Retourne le dropdown généré ou `null` en cas d'erreur.
 */
export function createFilterSection(title, filterType, dataSet) {
    try {
        logEvent("test_start", `Création du dropdown "${title}" (${filterType}).`);

        if (!title || !filterType || !(dataSet instanceof Set)) {
            throw new Error("Paramètres invalides pour la création du dropdown.");
        }

        const labelMapping = {
            ingredients: "Ingrédients",
            appliances: "Appareils",
            ustensils: "Ustensiles"
        };
        const translatedTitle = labelMapping[filterType] || title;

        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");
        filterContainer.dataset.filterType = filterType;

        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filterType = filterType;
        filterButton.innerHTML = `${translatedTitle} <i class="fas fa-chevron-down"></i>`;
        filterButton.setAttribute("aria-expanded", "false");

        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("dropdown-container");

        //  Conteneur englobant pour bien positionner la loupe dans l'input
        const searchContainer = document.createElement("div");
        searchContainer.classList.add("dropdown-search-container");

        const searchLabel = document.createElement("label");
        searchLabel.setAttribute("for", `search-${filterType}`);
        searchLabel.classList.add("sr-only");
        searchLabel.textContent = `Rechercher dans ${translatedTitle}`;

        //  Input avec espace à droite pour la loupe
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.classList.add("dropdown-search");
        searchInput.placeholder = `Rechercher...`;
        searchInput.id = `search-${filterType}`;
        searchInput.name = `search-${filterType}`;

        //  Bouton loupe placé dans l'input
        const searchButton = document.createElement("button");
        searchButton.classList.add("search-icon-button");
        searchButton.setAttribute("aria-label", `Lancer la recherche dans ${translatedTitle}`);
        searchButton.innerHTML = `<i class="fas fa-search"></i>`; 

        //  Ajout de la loupe DANS l'input
        searchContainer.appendChild(searchLabel);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchButton); 
        const filterList = document.createElement("ul");
        filterList.classList.add(`${filterType}-list`);

        dataSet.forEach(item => {
            const listItem = createDropdownOption(item, filterType);
            if (listItem) {
                filterList.appendChild(listItem);
            }
        });

        dropdownContainer.appendChild(searchContainer);
        dropdownContainer.appendChild(filterList);
        filterContainer.appendChild(filterButton);
        filterContainer.appendChild(dropdownContainer);

        logEvent("test_end", `Dropdown "${translatedTitle}" généré avec succès.`);
        return filterContainer;

    } catch (error) {
        logEvent("error", "Erreur dans createFilterSection", { error: error.message });
        return null;
    }
}

/** ====================================================================================
 * 2. CRÉATION DES OPTIONS DU DROPDOWN
 * ==================================================================================== */
/**
 * Crée un élément `<li>` pour une option du dropdown.
 *
 * - Vérifie que `item` est une chaîne non vide.
 * - Ajoute l'attribut `data-filter-type` pour éviter les erreurs de sélection.
 *
 * @param {string} item - Nom de l'option à ajouter.
 * @param {string} filterType - Type du filtre auquel appartient l'option.
 * @returns {HTMLElement|null} Retourne l'élément `<li>` ou `null` si invalide.
 */
function createDropdownOption(item, filterType) {
    if (typeof item !== "string" || !item.trim()) {
        logEvent("warn", `createDropdownOption : Élément invalide ignoré.`);
        return null;
    }

    const listItem = document.createElement("li");
    listItem.classList.add("filter-option");
    listItem.textContent = item;
    listItem.dataset.filterType = filterType;  // Correction pour `handleFilterSelectionWrapper`

    console.log(`✅ Option créée : ${item}, filterType = ${filterType}`); // Vérification console

    return listItem;
}

