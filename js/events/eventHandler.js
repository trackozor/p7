/* ====================================================================================
/*  FICHIER          : eventHandler.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes.
/* ==================================================================================== */

import { logEvent, displayErrorMessage } from "../utils/utils.js";
import { updateTagDisplay, updateFilters, activeFilters, resetAllTags, restoreRemovedOption} from "../components/filterManager.js";
import { trapFocus } from "../utils/accessibility.js";
import { KEY_CODES } from "../config/constants.js";
import { Search } from "../components/search/search.js"; 
import { handleBarSearch } from "../components/searchBarManager.js";

// Déclaration globale de filtersArray pour utilisation dans tout le fichier
export let filtersArray = {
    ingredients: [],
    appliances: [],
    ustensils: []
};

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

    // Vérification si l’input est vide → Afficher toutes les recettes
    if (query === "") {
        logEvent("info", "handleSearchWrapper : Champ vide, affichage de toutes les recettes.");
        handleBarSearch(event)
        return;
    }

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
    event.stopPropagation();

    const button = event.currentTarget;
    const { filterType } = button.dataset;
    if (!filterType) {
        logEvent("error", "handleDropdownClick : Le bouton cliqué ne contient pas de dataset.filterType.");
        return;
    }

    const dropdownContainer = button.nextElementSibling;
    if (!dropdownContainer) {
        logEvent("error", `handleDropdownClick : Aucun conteneur de dropdown trouvé pour "${filterType}".`);
        return;
    }

    // Ferme tous les autres dropdowns avant d'ouvrir un nouveau
    document.querySelectorAll(".dropdown-container").forEach(drop => {
        if (drop !== dropdownContainer) {
            drop.classList.remove("active");
        }
    });

    // Basculer l'état du dropdown (ouverture/fermeture)
    const isOpening = !dropdownContainer.classList.contains("active");
    dropdownContainer.classList.toggle("active", isOpening);

    // Si on ferme le dropdown, on efface les options visibles
    if (!isOpening) {
        dropdownContainer.innerHTML = ""; // Efface le contenu des options
    }

    logEvent("info", `handleDropdownClick : Dropdown "${filterType}" ${isOpening ? "ouvert" : "fermé"}.`);
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
    // Récupération du tag parent à partir de l'élément cliqué 
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
/** ====================================================================================
 *  AJOUT D'UN FILTRE À LA LISTE DES FILTRES ACTIFS
 * ==================================================================================== */
/**
 * Gère la sélection d'un filtre et l'ajoute aux filtres actifs.
 *
 * - Vérifie la validité des paramètres avant de poursuivre.
 * - Empêche l'ajout en double si le filtre est déjà actif.
 * - Ajoute le filtre sélectionné à `activeFilters`.
 * - Met à jour l'affichage des tags avec `updateTagDisplay()`.
 * - Convertit l'état actuel des filtres en tableau pour un traitement ultérieur.
 * - Déclenche `Search()` si au moins un filtre est actif pour mettre à jour les résultats.
 * - Journalise chaque étape pour le suivi et le debugging.
 *
 * @param {string} filterType - Type de filtre sélectionné (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur du filtre sélectionné.
 */

export function handleFilterSelection(filterType, filterValue) {
    logEvent("info", `handleFilterSelection : Sélection de "${filterValue}" pour "${filterType}".`);

    if (!filterType || !filterValue) {
        logEvent("error", "handleFilterSelection : Paramètres invalides.");
        return;
    }

    //  On ajoute automatiquement le tag quand un élément est sélectionné
    handleTagAddition(filterType, filterValue);
}

/** ====================================================================================
 *  AJOUT D'UN TAG LORS DE LA SÉLECTION D'UNE OPTION DE FILTRE
 * ==================================================================================== */
/**
 * Gère l'ajout d'un tag lorsqu'une option est sélectionnée dans un dropdown.
 * - Ajoute la valeur sélectionnée dans `activeFilters`.
 * - Met à jour l'affichage des tags.
 *
 * @param {string} filterType - Type du filtre (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur de l'option sélectionnée.
 */
export function handleTagAddition(filterType, filterValue) {
    if (!filterType || !filterValue) {
        logEvent("error", "handleTagAddition : Paramètres invalides.");
        return;
    }

    logEvent("info", `handleTagAddition : Ajout du tag "${filterValue}" dans "${filterType}".`);

    if (!activeFilters[filterType].has(filterValue)) {
        activeFilters[filterType].add(filterValue);
        updateTagDisplay();
        updateFilters();
    }

    //  Vérifie si des filtres sont actifs avant d'exécuter `Search()`
    const filtersArray = {
        ingredients: Array.from(activeFilters["ingredients"]),
        appliances: Array.from(activeFilters["appliances"]),
        ustensils: Array.from(activeFilters["ustensils"])
    };

    if (filtersArray.ingredients.length || filtersArray.appliances.length || filtersArray.ustensils.length) {
        Search("", filtersArray);
    } else {
        logEvent("info", "handleTagAddition : Aucun filtre actif, pas de recherche lancée.");
    }
}

/** ====================================================================================
 *  SUPPRESSION D' UN TAG LORS DU CLIQUE SUR LE BOUTON DE FERMETURE
 * ==================================================================================== */
/**
 * Supprime un filtre actif et met à jour dynamiquement l'affichage.
 *
 * - Vérifie la validité des paramètres avant d'exécuter l'opération.
 * - Empêche la suppression d'un filtre qui n'est pas actif.
 * - Supprime le filtre de `activeFilters` et met à jour les tags affichés.
 * - Réintroduit l'option dans le dropdown correspondant.
 * - Met à jour les résultats en appelant `Search()` avec les filtres restants.
 * - Journalise chaque étape pour assurer un suivi et faciliter le debugging.
 *
 * @param {string} filterType - Type de filtre à supprimer (ingredients, appliances, ustensils).
 * @param {string} filterValue - Valeur spécifique du filtre à supprimer.
 */
export function removeTag(filterType, filterValue) {
    try {
        // Vérification de la validité des paramètres
        if (!filterType || !filterValue) {
            logEvent("warn", "removeTag : Paramètres invalides.");
            return;
        }

        logEvent("info", `removeTag : Suppression du tag '${filterValue}' (${filterType}).`);

        // Vérifie que le filtre est bien actif avant de le supprimer
        if (!activeFilters[filterType].has(filterValue)) {
            logEvent("warn", `removeTag : Le filtre '${filterValue}' (${filterType}) n'est pas actif.`);
            return;
        }

        // Suppression du filtre de la liste des filtres actifs
        activeFilters[filterType].delete(filterValue);

        // Mise à jour de l'affichage des tags et réintégration de l'option dans le dropdown
        updateTagDisplay();
        restoreRemovedOption(filterType, filterValue);

        // Conversion de l'état des filtres actifs en tableaux pour traitement
        const filtersArray = {
            ingredients: Array.from(activeFilters["ingredients"]),
            appliances: Array.from(activeFilters["appliances"]),
            ustensils: Array.from(activeFilters["ustensils"])
        }

        logEvent("debug", "Filtres actifs après suppression :", filtersArray);

        // Mise à jour des résultats en fonction des nouveaux filtres actifs
        Search("", filtersArray);
        
    } catch (error) {
        // Gestion et journalisation des erreurs
        logEvent("error", "removeTag : Erreur lors de la suppression du filtre.", { error: error.message });
    }
}

/* ==================================================================================== */
/*               GESTION DU BOUTON DE RÉINITIALISATION DES FILTRES                      */
/* ==================================================================================== */
/**
 * Gère dynamiquement l'affichage du bouton de réinitialisation des filtres.
 * - Ajoute le bouton si au moins 2 tags sont présents.
 * - Supprime le bouton si moins de 2 tags sont affichés.
 *
 * @param {number} totalTags - Nombre total de tags actuellement affichés.
 */
/**
 * Vérifie le nombre de tags actifs et affiche le bouton reset si nécessaire.
 */
export function handleResetButton() {
    const tagsContainer = document.querySelector("#selected-filters");
    let resetButton = document.querySelector("#reset-tags-btn");

    // Compte le nombre total de tags actifs
    const totalTags = Object.values(activeFilters).reduce((sum, set) => sum + set.size, 0);

    if (totalTags >= 2) {
        if (!resetButton) {
            resetButton = document.createElement("button");
            resetButton.id = "reset-tags-btn";
            resetButton.classList.add("filter-reset");
            resetButton.textContent = "Réinitialiser les filtres";
            resetButton.addEventListener("click", resetAllTags);
            tagsContainer.appendChild(resetButton);
            logEvent("info", "handleResetButton : Bouton de réinitialisation ajouté.");
        }
    } else if (resetButton) {
        resetButton.remove();
        logEvent("info", "handleResetButton : Bouton de réinitialisation supprimé.");
    }
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

/* ==================================================================================== */
/*               GESTION DES ÉVÉNEMENTS DE CLIC EN DEHORS DES DROPDOWNS                 */
/* ==================================================================================== */
/**
 * Ferme tous les dropdowns ouverts si l'utilisateur clique en dehors
 */
function closeDropdownsOnClickOutside(event) {
    const openDropdowns = document.querySelectorAll(".dropdown-container.active");

    openDropdowns.forEach(dropdown => {
        // Vérifie si l'élément cliqué est en dehors du dropdown ET du bouton d'ouverture
        if (!dropdown.contains(event.target) && !event.target.closest(".dropdown-button")) {
            dropdown.classList.remove("active");

            //  Sélectionne aussi la liste d'options associée et la cache
            const optionsList = dropdown.querySelector(".dropdown-options");
            if (optionsList) {
                optionsList.style.display = "none";
            }
        }
    });
}

// Ajout de l'écouteur global pour détecter les clics en dehors
document.addEventListener("click", closeDropdownsOnClickOutside);

