/* ====================================================================================
/*  FICHIER          : dropdownFactory.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.4
/*  DESCRIPTION      : Génération dynamique et optimisée des dropdowns de filtres.
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";
import { safeQuerySelector } from "../../config/domSelectors.js";
import { handleFilterSelection } from "../../events/eventHandler.js";

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
    logEvent("info", `createFilterSection : Début de la création du filtre "${title}" (${filterType}).`);

    try {
        // Vérification des paramètres
        if (typeof parentSelector !== "string" || !parentSelector.trim()) {
            logEvent("error", "createFilterSection : parentSelector doit être une chaîne de caractères non vide.", { parentSelector });
            return null;
        }
        if (typeof title !== "string" || !title.trim()) {
            logEvent("error", "createFilterSection : title doit être une chaîne de caractères non vide.", { title });
            return null;
        }
        if (typeof filterType !== "string" || !filterType.trim()) {
            logEvent("error", "createFilterSection : filterType doit être une chaîne de caractères non vide.", { filterType });
            return null;
        }
        if (!(dataSet instanceof Set)) {
            logEvent("error", "createFilterSection : dataSet doit être une instance de Set.", { dataSet });
            return null;
        }

        logEvent("info", "createFilterSection : Paramètres validés avec succès.");

        //  Sélection du conteneur parent
        const parent = safeQuerySelector(parentSelector);
        if (!parent) {
            logEvent("error", `createFilterSection : Conteneur parent introuvable (${parentSelector}). Assurez-vous que le sélecteur est correct.`);
            return null;
        }

        logEvent("info", `createFilterSection : Conteneur parent trouvé (${parentSelector}).`);

        //  Création des éléments HTML du filtre
        logEvent("info", `createFilterSection : Création du conteneur du filtre pour "${title}".`);
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("filter-group");

        logEvent("info", `createFilterSection : Création du bouton du filtre "${title}".`);
        const filterButton = document.createElement("button");
        filterButton.classList.add("filter-button");
        filterButton.dataset.filter = filterType;
        filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`;

        logEvent("info", `createFilterSection : Création de la liste déroulante pour "${title}".`);
        const filterList = document.createElement("ul");
        filterList.id = `${filterType}-list`;
        filterList.classList.add("dropdown-list");

        //  Remplissage de la liste déroulante
        if (dataSet.size > 0) {
            logEvent("info", `createFilterSection : Ajout des options dans la liste déroulante (${dataSet.size} options trouvées).`);
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
                logEvent("info", `createFilterSection : Option ajoutée -> "${item}".`);
            });
        } else {
            logEvent("warn", `createFilterSection : Aucun élément dans le dataSet, affichage d'un message vide.`);
            filterList.innerHTML = `<li class="empty">Aucune option disponible</li>`;
        }

        //  Assemblage des éléments dans le DOM
        logEvent("info", `createFilterSection : Ajout des éléments au DOM.`);
        filterContainer.appendChild(filterButton);
        filterContainer.appendChild(filterList);
        parent.appendChild(filterContainer);

        logEvent("success", `createFilterSection : Section de filtre "${title}" générée avec succès.`);

        //  Retourner un objet structuré avec les éléments créés
        return { button: filterButton, dropdown: filterContainer, list: filterList };

    } catch (error) {
        logEvent("error", "createFilterSection : Erreur inattendue lors de la création de la section de filtre.", { error: error.message, stack: error.stack });
        return null;
    }
}






