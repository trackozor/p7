/* ====================================================================================
/*  FICHIER          : dropdownFactory.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.4
/*  DESCRIPTION      : Génération dynamique et optimisée des dropdowns de filtres.
/* ==================================================================================== */

import { logEvent, debounce } from "../../utils/utils.js";
import { safeQuerySelector } from "../../config/domSelectors.js";

/* ====================================================================================
/* 1. CRÉATION DES FILTRES (DROPDOWNS)
/* ==================================================================================== */

/**
 * Crée une section de filtre avec un dropdown interactif.
 * 
 * - Vérifie si le conteneur parent est valide.
 * - Génère dynamiquement un bouton pour ouvrir le dropdown.
 * - Remplit la liste des options à partir des données disponibles.
 * - Associe les événements pour gérer l'interactivité.
 * 
 * @param {string} parentSelector - Sélecteur CSS du conteneur parent.
 * @param {string} title - Titre du filtre.
 * @param {string} filterType - Type de filtre (`ingredients`, `appliances`, `utensils`).
 * @param {Set} dataSet - Ensemble des valeurs uniques à afficher.
 */

export function createFilterSection(parentSelector, title, filterType, dataSet) {
    try {
        if (!parentSelector || !title || !filterType || !(dataSet instanceof Set)) {
            logEvent("error", `createFilterSection : Paramètres invalides pour ${filterType}.`, { parentSelector, title, filterType, dataSet });
            return;
        }

        const parent = safeQuerySelector(parentSelector);
        if (!parent) {
            logEvent("error", `createFilterSection : Conteneur parent introuvable (${parentSelector}).`);
            return;
        }

        //  Création du conteneur
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");

        //  Création du bouton
        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filter = filterType;
        filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`;

        //  Création de la liste des filtres
        const dropdownList = document.createElement("ul");
        dropdownList.id = `${filterType}-list`;
        dropdownList.classList.add("dropdown-list");

        //  Injection immédiate des options
        if (dataSet.size > 0) {
            dataSet.forEach(item => {
                const listItem = document.createElement("li");
                listItem.classList.add("filter-option");
                listItem.textContent = item;
                dropdownList.appendChild(listItem);
            });
        } else {
            dropdownList.innerHTML = `<li class="empty">Aucune option disponible</li>`;
        }

        // Ajout des éléments au conteneur principal
        filterButton.appendChild(dropdownList);
        filterContainer.appendChild(filterButton);
        parent.appendChild(filterContainer);

        logEvent("success", `createFilterSection : Section de filtre "${title}" générée avec succès.`);
        
        // Retourne les éléments pour qu'on puisse les manipuler ailleurs
        return { filterButton, dropdownList };
    } catch (error) {
        logEvent("error", "createFilterSection : Erreur lors de la création de la section de filtre.", { error: error.message });
    }
}



