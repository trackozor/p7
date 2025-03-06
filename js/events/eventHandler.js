/* ====================================================================================
/*  FICHIER          : eventHandler.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes.
/* ==================================================================================== */

import { logEvent, displayErrorMessage } from "../utils/utils.js";
import { updateTagDisplay, activeFilters } from "../components/filterManager.js";
import { trapFocus } from "../utils/accessibility.js";
import { KEY_CODES } from "../config/constants.js";
import { Search } from "../components/search/search.js"; 
import { handleBarSearch } from "../components/searchBarManager.js";
/* ==================================================================================== */
/*                            GESTION DE LA RECHERCHE                                  */
/* ==================================================================================== */
/**
 * Gère l'événement de soumission du formulaire de recherche.
 *
 * - Empêche le rechargement de la page pour éviter une perte de données.
 * - Vérifie que `event` est bien défini avant d'appeler `preventDefault()`.
 * - Vérifie que `handleBarSearch()` reçoit bien un `event` valide.
 * - Affiche un message d'erreur si la requête est trop courte (moins de 3 caractères).
 *
 * @param {Event} event - Événement déclenché lors de la soumission du formulaire.
 */
export function handleSearchWrapper(event) {
    // Vérification et prévention du rechargement de page
    if (event && event.preventDefault) {
        event.preventDefault();
    } else {
        console.warn("handleSearchWrapper a été appelé sans événement.");
    }

    // Sélection du champ de recherche
    const searchInput = document.querySelector("#search");

    // Vérifie si l'élément du champ de recherche est présent dans le DOM
    if (!searchInput) {
        console.error("handleSearchWrapper : Élément de recherche introuvable.");
        return;
    }

    // Récupération et nettoyage de la requête utilisateur
    const query = searchInput.value.trim();

    // Vérification si la recherche est suffisamment longue (3 caractères minimum)
    if (query.length < 3) {
        displayErrorMessage("Veuillez entrer au moins 3 caractères pour rechercher.");
        return;
    }

    // Exécute la recherche avec la requête validée
    handleBarSearch(event);
}

/* ==================================================================================== */
/*                 GESTION DE L'OUVERTURE ET FERMETURE DES DROPDOWNS                   */
/* ==================================================================================== */
/**
 * Gère l'ouverture et la fermeture d'un dropdown.
 *
 * - Empêche la propagation de l'événement pour éviter la fermeture immédiate.
 * - Récupère le bouton cliqué et son type de filtre associé.
 * - Vérifie la présence du `filterType` avant d'exécuter l'action.
 * - Ferme tous les autres dropdowns avant d'en ouvrir un nouveau.
 * - Active le piégeage du focus pour une meilleure accessibilité.
 *
 * @param {Event} event - Événement du clic sur le bouton de dropdown.
 */
export function handleDropdownClick(event) {
    // Empêche la propagation pour éviter les fermetures accidentelles
    event.stopPropagation();

    // Récupère le bouton cliqué et son type de filtre
    const button = event.currentTarget;
    const { filterType } = button.dataset;

    // Vérifie que `filterType` est bien défini
    if (!filterType) {
        logEvent("error", "handleDropdownClick : Le bouton cliqué ne contient pas de dataset.filterType.");
        console.error("handleDropdownClick : Problème de dataset :", button);
        return;
    }

    // Sélectionne le conteneur du dropdown associé
    const dropdownContainer = button.nextElementSibling;
    const allDropdowns = document.querySelectorAll(".dropdown-container");

    // Vérifie si le conteneur du dropdown est bien trouvé
    if (!dropdownContainer) {
        logEvent("error", `handleDropdownClick : Aucun conteneur de dropdown trouvé pour "${filterType}".`);
        return;
    }

    // Ferme tous les autres dropdowns avant d'en ouvrir un
    allDropdowns.forEach(drop => {
        if (drop !== dropdownContainer) {
            drop.classList.remove("active");
        }
    });

    // Basculer l'état du dropdown (ouverture/fermeture)
    dropdownContainer.classList.toggle("active");

    // Si le dropdown est ouvert, active le piégeage du focus
    if (dropdownContainer.classList.contains("active")) {
        trapFocus(dropdownContainer);
    }

    logEvent("info", `handleDropdownClick : Dropdown "${filterType}" ${dropdownContainer.classList.contains("active") ? "ouvert" : "fermé"}.`);
}

/* ==================================================================================== */
/*                   WRAPPERS POUR ÉVITER LES DOUBLONS D'ÉVÉNEMENTS                    */
/* ==================================================================================== */

/* ------------------------------- */
/*  WRAPPER : Gestion des Dropdowns  */
/* ------------------------------- */
/**
 * Wrapper pour la gestion du clic sur un bouton de dropdown.
 *
 * - Permet d'éviter les doublons d'événements en s'assurant que la cible est correcte.
 * - Passe l'événement au gestionnaire principal `handleDropdownClick()`.
 *
 * @param {Event} event - L'événement du clic.
 */
export function handleDropdownClickWrapper(event) {
    handleDropdownClick(event, event.currentTarget);
}

/* ------------------------------- */
/*  WRAPPER : Sélection des Filtres  */
/* ------------------------------- */
/**
 * Wrapper pour la gestion du clic sur une option de dropdown.
 *
 * - Permet d'éviter les doublons d'événements en ciblant précisément l'option cliquée.
 * - Vérifie que l'élément cliqué est bien une option valide.
 * - Appelle la fonction `handleFilterSelection()` avec le type et la valeur du filtre sélectionné.
 *
 * @param {Event} event - L'événement du clic.
 */
export function handleFilterSelectionWrapper(event) {
    console.log("Événement reçu dans handleFilterSelectionWrapper :", event);

    let { target } = event;

    // Vérifie que l'utilisateur clique bien sur un élément `<li>`, sinon remonte dans le DOM
    while (target && !target.classList.contains("filter-option")) {
        target = target.parentElement;
    }

    // Vérification de la validité de l'élément sélectionné
    if (!target || !target.dataset.filterType || !target.textContent.trim()) {
        console.error("handleFilterSelectionWrapper : Élément cliqué invalide.", target);
        return;
    }

    // Extraction du type et de la valeur du filtre sélectionné
    const { filterType } = target.dataset;
    const filterValue = target.textContent.trim();

    console.log(`handleFilterSelectionWrapper - Appel avec : { filterType: ${filterType}, filterValue: ${filterValue} }`);

    // Appel de la gestion de la sélection de filtre
    handleFilterSelection(filterType, filterValue);
}

/* ====================================================================================
/*               GESTION DE LA SUPPRESSION DES FILTRES (TAGS)
/* ==================================================================================== */
/**
 * Gère la suppression d'un tag de filtre lorsqu'on clique sur son bouton de fermeture.
 *
 * - Récupère dynamiquement l'élément du tag supprimé.
 * - Extrait le type et la valeur du filtre associé.
 * - Vérifie la validité des paramètres avant suppression.
 * - Supprime le tag et met à jour l'affichage des filtres actifs.
 *
 * @param {Event} event - L'événement déclenché par le clic sur le bouton de suppression du tag.
 */
export function handleTagRemovalWrapper(event) {
    // Récupération du tag parent à partir de l'élément cliqué (icône "X")
    const tagElement = event.currentTarget.closest(".filter-tag");

    // Vérifie que l'élément existe avant de continuer
    if (!tagElement) {
        logEvent("warn", "handleTagRemovalWrapper : Aucun tag trouvé pour la suppression.");
        return;
    }

    // Extraction des données du tag (type et valeur du filtre)
    const { filterType } = tagElement.dataset;
    const filterValue = tagElement.textContent.trim();

    // Vérifie la validité des paramètres avant suppression
    if (!filterType || !filterValue) {
        logEvent("error", "handleTagRemovalWrapper : Paramètres invalides.");
        return;
    }

    logEvent("info", `handleTagRemovalWrapper : Suppression du tag "${filterValue}" (${filterType}).`);

    // Suppression du filtre sélectionné et mise à jour de l'affichage
    removeTag(filterType, filterValue);
}

/* ====================================================================================
/*                        GESTION DES FILTRES SÉLECTIONNÉS (TAGS)
/* ==================================================================================== */
/*--------------- */
/* Ajout         */
/*---------------*/
export function handleFilterSelection(filterType, filterValue) {
    try {
        if (!filterType || !filterValue) {
            logEvent("warn", "handleFilterSelection : Paramètres invalides.");
            return;
        }

        // Vérifier si le filtre est déjà actif pour éviter les doublons
        if (activeFilters[filterType].has(filterValue)) {
            logEvent("info", `handleFilterSelection : '${filterValue}' déjà actif, pas d'ajout.`);
            return;
        }

        logEvent("info", `handleFilterSelection : Ajout du tag '${filterValue}' (${filterType}).`);
        activeFilters[filterType].add(filterValue);

        updateTagDisplay();

        // Récupérer l'état des filtres sous forme de tableau
        const filtersArray = {
            ingredients: Array.from(activeFilters["ingredients"]),
            appliances: Array.from(activeFilters["appliances"]),
            ustensils: Array.from(activeFilters["ustensils"])
        };

        logEvent("debug", "Filtres actifs après ajout :", filtersArray);

        //  Vérification avant d’appeler Search() (éviter les appels inutiles)
        if (filtersArray.ingredients.length > 0 || filtersArray.appliances.length > 0 || filtersArray.ustensils.length > 0) {
            Search("", "filters", filtersArray);
        }

    } catch (error) {
        logEvent("error", "handleFilterSelection : Erreur lors de l'ajout du filtre.", { error: error.message });
    }
}

/*--------------- */
/* Retrait        */
/*--------------- */
/**
 * Supprime un filtre actif et met à jour l'affichage.
 *
 * @param {string} filterType - Type de filtre.
 * @param {string} filterValue - Valeur du filtre à supprimer.
 */
export function removeTag(filterType, filterValue) {
    try {
        if (!filterType || !filterValue) {
            logEvent("warn", "removeTag : Paramètres invalides.");
            return;
        }

        logEvent("info", `removeTag : Suppression du tag '${filterValue}' (${filterType}).`);

        if (!activeFilters[filterType].has(filterValue)) {
            logEvent("warn", `removeTag : Le filtre '${filterValue}' (${filterType}) n'est pas actif.`);
            return;
        }

        //  Supprime le tag de la liste active
        activeFilters[filterType].delete(filterValue);

        updateTagDisplay();
        restoreOptionInDropdown(filterType, filterValue);

        //  Recherche avec les filtres restants après suppression
        const filtersArray = {
            ingredients: Array.from(activeFilters["ingredients"]),
            appliances: Array.from(activeFilters["appliances"]),
            ustensils: Array.from(activeFilters["ustensils"])
        };

        logEvent("debug", "Filtres actifs après suppression :", filtersArray);
        Search("", filtersArray);
        
    } catch (error) {
        logEvent("error", "removeTag : Erreur lors de la suppression du filtre.", { error: error.message });
    }
}

/**
 * Restaure une option supprimée dans le dropdown quand un tag est retiré.
 *
 * @param {string} filterType - Type de filtre.
 * @param {string} filterValue - Valeur du filtre à réintégrer.
 */
function restoreOptionInDropdown(filterType, filterValue) {
    const dropdown = document.querySelector(`#${filterType} ul`);
    if (!dropdown) {
        return;
    }

    const li = document.createElement("li");
    li.classList.add("filter-option");
    li.textContent = filterValue;
    li.addEventListener("click", () => handleFilterSelection(filterType, filterValue));

    dropdown.appendChild(li);
}
/* ==================================================================================== */
/*               GESTION  DU FOCUS (PIÉGEAGE)                                          */
/* ==================================================================================== */
/**
 * Gère les interactions clavier pour la navigation et l'accessibilité.
 *
 * - Tabulation : Maintient le focus dans les dropdowns et modales.
 * - Échap : Ferme les dropdowns ouverts et libère le focus.
 * - Entrée / Espace : Active les filtres ou déclenche des actions.
 *
 * @param {KeyboardEvent} event - Événement clavier déclenché.
 */
export function handleKeyboardNavigation(event) {
    const { activeElement } = document; // Récupère l'élément actuellement sélectionné

    // Gestion de la touche Échap (Escape) pour fermer les dropdowns actifs
    if (event.key === KEY_CODES.ESCAPE) {
        const openDropdowns = document.querySelectorAll(".dropdown-container.active");

        // Parcours et fermeture de tous les dropdowns ouverts
        openDropdowns.forEach(dropdown => dropdown.classList.remove("active"));

        logEvent("info", "handleKeyboardNavigation : Fermeture des dropdowns avec ESC.");
    }

    // Gestion de la touche Tab pour restreindre le focus dans le dropdown actif
    if (event.key === KEY_CODES.TAB) {
        const openDropdown = document.querySelector(".dropdown-container.active");

        // Si un dropdown est actif, on applique le piège du focus
        if (openDropdown) {
            trapFocus(openDropdown);
            logEvent("info", "handleKeyboardNavigation : Focus piégé dans un dropdown.");
        }
    }

    // Gestion de la touche Entrée ou Espace pour sélectionner une option de filtre
    if ((event.key === KEY_CODES.ENTER || event.key === KEY_CODES.SPACE) && activeElement.classList.contains("filter-option")) {
        activeElement.click(); // Simule un clic sur l'option sélectionnée
        logEvent("success", `handleKeyboardNavigation : Option sélectionnée "${activeElement.textContent}".`);
    }
}
