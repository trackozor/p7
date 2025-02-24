/* ==================================================================================== */
/*  FICHIER          : dropdownFactory.js                                              */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.3                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 10/02/2025                                                      */
/*  DESCRIPTION      : Génération dynamique des dropdowns de filtres avec une          */
/*                     architecture optimisée et modulaire.                           */
/* ==================================================================================== */
import { logEvent } from "../../utils/utils.js";
import { filterDropdownOptions } from "../filterManager.js"; // Import de la fonction de filtrage
import {setupDropdownEvents} from "../../events/eventHandler.js";

/* ==================================================================================== */
/*  FONCTION : createFilterSection                                                     */
/* ==================================================================================== */

/**
 * Crée une section de filtre avec un dropdown interactif.
 *
 * - Vérifie si le conteneur parent est valide.
 * - Génère dynamiquement un bouton pour ouvrir le dropdown.
 * - Remplit la liste des options à partir des données disponibles.
 * - Associe les événements pour gérer l'interactivité (affichage, recherche, sélection).
 *
 * @param {string} parentSelector - Sélecteur CSS du conteneur parent où ajouter le filtre.
 * @param {string} title - Titre du filtre affiché sur le bouton.
 * @param {string} filterType - Type de filtre (`ingredients`, `appliances`, `utensils`).
 * @param {Set} dataSet - Ensemble des valeurs uniques à afficher dans le dropdown.
 */
export function createFilterSection(parentSelector, title, filterType, dataSet) {
    try {
        // ✅ Vérification des paramètres
        if (!parentSelector || typeof parentSelector !== "string") {
            logEvent("error", "createFilterSection : Paramètre `parentSelector` invalide.", { parentSelector });
            return;
        }
        if (!title || typeof title !== "string") {
            logEvent("error", "createFilterSection : Paramètre `title` invalide.", { title });
            return;
        }
        if (!filterType || typeof filterType !== "string") {
            logEvent("error", "createFilterSection : Paramètre `filterType` invalide.", { filterType });
            return;
        }
        if (!dataSet || !(dataSet instanceof Set) || dataSet.size === 0) {
            logEvent("warning", `createFilterSection : Ensemble de données vide pour ${filterType}.`);
            return;
        }

        // ✅ Sélection du conteneur parent
        const parent = document.querySelector(parentSelector);
        if (!parent) {
            logEvent("error", `createFilterSection : Conteneur parent introuvable (${parentSelector}).`);
            return;
        }

        // ✅ Création du conteneur du filtre
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");

        // ✅ Création du bouton du filtre
        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filter = filterType;
        filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`;

        // ✅ Génération du menu déroulant
        const dropdownContainer = createDropdownContainer(filterType, dataSet);

        if (!dropdownContainer) {
            logEvent("error", `createFilterSection : Impossible de créer le dropdown pour ${filterType}.`);
            return;
        }

        // ✅ Ajout des éléments au DOM
        filterContainer.appendChild(filterButton);
        filterContainer.appendChild(dropdownContainer);
        parent.appendChild(filterContainer);

        // ✅ Appel de `setupDropdownEvents()` après l’insertion dans le DOM
        setupDropdownEvents(filterButton, dropdownContainer);

        logEvent("success", `createFilterSection : Section de filtre "${title}" générée avec succès.`);
    } catch (error) {
        logEvent("error", "createFilterSection : Erreur lors de la création de la section de filtre.", { error: error.message });
    }
}



/* ==================================================================================== */
/*  FONCTION : createDropdownContainer                                                 */
/* ==================================================================================== */

/**
 * Crée un menu déroulant (dropdown) pour un type de filtre donné.
 *
 * - Vérifie la validité des paramètres.
 * - Génère dynamiquement une liste `<ul>` vide (qui sera remplie plus tard).
 * - Associe un bouton de recherche pour filtrer les options en temps réel.
 *
 * @param {string} filterType - Type de filtre (`ingredients`, `appliances`, `utensils`).
 * @param {Set} dataSet - Ensemble des valeurs uniques à afficher dans le dropdown.
 * @returns {HTMLElement} Conteneur du dropdown.
 */
export function createDropdownContainer(filterType, dataSet) {
    try {
        // ✅ Vérification des paramètres
        if (!filterType || typeof filterType !== "string") {
            logEvent("error", "createDropdownContainer : Paramètre `filterType` invalide.", { filterType });
            return document.createElement("div");
        }

        // ✅ Sélection ou création du conteneur parent (`#filters`)
        let filtersContainer = document.querySelector("#filters");
        if (!filtersContainer) {
            logEvent("error", "createDropdownContainer : Conteneur `#filters` introuvable.");
            return document.createElement("div");
        }

        // ✅ Création du conteneur principal du dropdown
        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("filter-dropdown", "hidden");
        dropdownContainer.dataset.filter = filterType;

        // ✅ Création du champ de recherche
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.classList.add("filter-search");
        searchInput.placeholder = `Rechercher ${filterType.toLowerCase()}...`;

        // ✅ Création ou récupération de la liste des options
        let listContainer = document.getElementById(`${filterType}-list`);
        if (!listContainer) {
            logEvent("warning", `createDropdownContainer : ${filterType}-list introuvable, création...`);
            listContainer = document.createElement("ul");
            listContainer.id = `${filterType}-list`;
            listContainer.classList.add("filter-options");
            listContainer.style.maxHeight = "200px";
            listContainer.style.overflowY = "auto";
        }

        // ✅ Ajout des éléments au dropdown
        dropdownContainer.appendChild(searchInput);
        dropdownContainer.appendChild(listContainer);

        // ✅ Ajout au DOM si nécessaire
        if (!document.getElementById(`${filterType}-list`)) {
            filtersContainer.appendChild(listContainer);
        }

        logEvent("success", `createDropdownContainer : Dropdown pour "${filterType}" généré avec succès.`);
        return dropdownContainer;
    } catch (error) {
        logEvent("error", "createDropdownContainer : Erreur lors de la création du dropdown.", { error: error.message });
        return document.createElement("div"); // Retourne un `div` vide en cas d'erreur
    }
}
