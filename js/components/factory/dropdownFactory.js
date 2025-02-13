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
        // ==============================
        // Vérification des paramètres
        // ==============================

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
        if (!(dataSet instanceof Set) || dataSet.size === 0) {
            logEvent("warning", `createFilterSection : Ensemble de données vide pour ${filterType}.`);
            return;
        }

        // ==============================
        // Sélection et création des éléments HTML
        // ==============================

        // Sélection du conteneur parent
        const parent = document.querySelector(parentSelector);
        if (!parent) {
            logEvent("error", `createFilterSection : Conteneur parent introuvable (${parentSelector}).`);
            return;
        }

        // Création du conteneur du filtre
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");

        // Création du bouton du filtre
        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filter = filterType;
        filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`; // Ajout d'une icône

        // Génération du menu déroulant
        const dropdownContainer = createDropdownContainer(filterType, dataSet);

        // ==============================
        // Ajout des éléments au DOM
        // ==============================

        filterContainer.appendChild(filterButton);
        filterContainer.appendChild(dropdownContainer);
        parent.appendChild(filterContainer);

        // ==============================
        // Ajout des événements pour le dropdown
        // ==============================

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
 * - Génère dynamiquement une liste d'options avec une recherche intégrée.
 * - Optimisation de la performance avec `DocumentFragment`.
 * - Associe un événement de filtrage dynamique en fonction de la saisie utilisateur.
 * 
 * @param {string} filterType - Type de filtre (`ingredients`, `appliances`, `utensils`).
 * @param {Set} dataSet - Ensemble des valeurs uniques à afficher dans le dropdown.
 * @returns {HTMLElement} Conteneur du dropdown.
 */
export function createDropdownContainer(filterType, dataSet) {
    try {
        // ==============================
        //  Vérification des paramètres
        // ==============================

        // Vérifie que `filterType` est une chaîne valide
        if (!filterType || typeof filterType !== "string") {
            logEvent("error", "createDropdownContainer : Paramètre `filterType` invalide.", { filterType });
            return null; // Arrête l'exécution en cas d'erreur
        }

        // Vérifie que `dataSet` est un `Set` valide et non vide
        if (!(dataSet instanceof Set) || dataSet.size === 0) {
            logEvent("warning", `createDropdownContainer : Ensemble de données vide pour ${filterType}.`);
            return null; // Arrête l'exécution si aucun élément n'est disponible
        }

        // Log de confirmation de la création du dropdown
        logEvent("info", `createDropdownContainer : Génération du dropdown pour "${filterType}".`);

        // ==================================
        //  Création du conteneur principal
        // ==================================

        const dropdownContainer = document.createElement("div"); // Crée un div pour contenir le dropdown
        dropdownContainer.classList.add("filter-dropdown", "hidden"); // Masqué par défaut
        dropdownContainer.dataset.filter = filterType; // Stocke le type de filtre dans un attribut `data`

        // ====================================
        //  Création du champ de recherche
        // ====================================

        const searchInput = document.createElement("input"); // Création de l'élément input
        searchInput.type = "text"; // Définit le type comme champ de texte
        searchInput.classList.add("filter-search"); // Ajoute une classe CSS
        searchInput.placeholder = `Rechercher ${filterType.toLowerCase()}...`; // Texte d'indication

        // ========================================
        //  Création de la liste des options
        // ========================================

        const listContainer = document.createElement("ul"); // Création de l'élément `ul` pour les options
        listContainer.classList.add("filter-options"); // Ajout d'une classe CSS
        listContainer.style.maxHeight = "250px"; // Hauteur maximale avec défilement
        listContainer.style.overflowY = "auto"; // Activation du scroll si nécessaire

        // ==============================
        //  Optimisation des performances
        // ==============================

        const fragment = document.createDocumentFragment(); // Utilisation d'un fragment pour limiter le re-render

        

        // ===================================================
        //  Ajout de l'événement de recherche en temps réel
        // ===================================================

        searchInput.addEventListener("input", () => filterDropdownOptions(searchInput, listContainer));

        //  Log de succès
        logEvent("success", `createDropdownContainer : Dropdown pour "${filterType}" généré avec succès.`);
        
        return dropdownContainer; // Retourne l'élément créé
    } catch (error) {
        //  Gestion des erreurs et log
        logEvent("error", "createDropdownContainer : Erreur lors de la création du dropdown.", { error: error.message });
        return null; // Retourne `null` en cas d'erreur
    }
}
