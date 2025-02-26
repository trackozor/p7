/* ====================================================================================
/*  FICHIER          : dropdownFactory.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.4
/*  DESCRIPTION      : Génération dynamique et optimisée des dropdowns de filtres.
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";
import { safeQuerySelector } from "../../config/domSelectors.js";
import { handleFilterSelection } from "../filterManager.js";

/* ====================================================================================
/* 1. CRÉATION DES FILTRES (DROPDOWNS)
/* ==================================================================================== */


/**
 * Crée dynamiquement une section de filtre avec un bouton et une liste déroulante.
 * 
 * Cette fonction génère une section de filtre comprenant :
 * - Un bouton déclencheur (`filter-button`).
 * - Une liste déroulante (`dropdown-list`) contenant les éléments de `dataSet`.
 * - Un conteneur global (`filter-group`) pour l'organisation des éléments.
 * 
 * @param {string} parentSelector - Sélecteur CSS du conteneur parent où insérer le filtre.
 * @param {string} title - Titre du filtre (ex: "Ingrédients", "Appareils").
 * @param {string} filterType - Identifiant du filtre (ex: "ingredients", "appliances").
 * @param {Set<string>} dataSet - Ensemble des options disponibles pour le filtre.
 * @returns {Object|null} Un objet contenant les éléments du filtre ou `null` en cas d'erreur.
 */
export function createFilterSection(parentSelector, title, filterType, dataSet) {
    try {
        logEvent("test_start", `createFilterSection : Début de la création du filtre "${title}" (${filterType}).`);

        // Vérification des paramètres
        if (typeof parentSelector !== "string" || !parentSelector.trim()) {
            throw new Error("createFilterSection : parentSelector doit être une chaîne de caractères non vide.");
        }
        if (typeof title !== "string" || !title.trim()) {
            throw new Error("createFilterSection : title doit être une chaîne de caractères non vide.");
        }
        if (typeof filterType !== "string" || !filterType.trim()) {
            throw new Error("createFilterSection : filterType doit être une chaîne de caractères non vide.");
        }
        if (!(dataSet instanceof Set)) {
            throw new Error("createFilterSection : dataSet doit être une instance de Set.");
        }

        // Sélection du conteneur parent
        const parent = safeQuerySelector(parentSelector);
        if (!parent) {
            throw new Error(`createFilterSection : Conteneur parent introuvable (${parentSelector}).`);
        }

        // Création du conteneur principal du filtre
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");

        // Création du bouton du filtre
        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filter = filterType;
        filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`;

        // Création de la liste déroulante
        const filterList = document.createElement("ul");
        filterList.id = `${filterType}-list`;
        filterList.classList.add("dropdown-list");

        // Remplissage de la liste déroulante avec les options de `dataSet`
        if (dataSet.size > 0) {
            dataSet.forEach(item => {
                if (typeof item !== "string" || !item.trim()) {
                    logEvent("warn", `createFilterSection : Option ignorée car invalide.`, { item });
                    return;
                }
                const listItem = document.createElement("li");
                listItem.classList.add("filter-option");
                listItem.textContent = item;
                listItem.addEventListener("click", () => handleFilterSelection(filterType, item));
                filterList.appendChild(listItem);
            });
        } else {
            // Ajoute un message par défaut si aucune option n'est disponible
            filterList.innerHTML = `<li class="empty">Aucune option disponible</li>`;
        }

        // Ajout des éléments au DOM
        filterContainer.appendChild(filterButton);
        filterContainer.appendChild(filterList);
        parent.appendChild(filterContainer);

        // Fin du test et confirmation de la création réussie
        logEvent("test_end", `createFilterSection : Section de filtre "${title}" générée avec succès.`);

        // Retourne les éléments créés sous forme d'objet pour réutilisation
        return { button: filterButton, dropdown: filterContainer, list: filterList };

    } catch (error) {
        // Log en cas d'erreur et retour de `null`
        logEvent("error", "createFilterSection : Erreur inattendue lors de la création du filtre.", { error: error.message });
        return null;
    }
}






