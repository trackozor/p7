/* ====================================================================================
/*  FICHIER          : eventListener.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gestion des écouteurs d'événements pour la recherche et les filtres.
/* ==================================================================================== */

import { logEvent, debounce } from "../utils/utils.js";
import { safeQuerySelectorAll, waitForElement } from "../config/domSelectors.js";
import {  handleDropdownClickWrapper, handleFilterSelectionWrapper, handleTagRemovalWrapper, handleSearchWrapper,handleKeyboardNavigation } from "./eventHandler.js";
import { handleBarSearch } from "../components/searchBarManager.js";

/* ====================================================================================
/*                            ATTACHEMENT DES ÉVÉNEMENTS DE RECHERCHE
/* ==================================================================================== */
/**
 * Attache les événements à la barre de recherche.
 * - Gère la saisie utilisateur et applique un debounce pour limiter les appels à la recherche.
 * - Empêche la soumission par défaut du formulaire et déclenche la recherche manuellement.
 *
 * @async
 * @param {Object} searchSelectors - Sélecteurs de la barre de recherche.
 * @param {HTMLFormElement} searchSelectors.form - Élément du formulaire de recherche.
 * @param {HTMLInputElement} searchSelectors.input - Champ de saisie de la recherche.
 * @returns {Promise<void>} Ne retourne rien, attache les écouteurs d'événements à la barre de recherche.
 */
export async function attachSearchListeners(searchSelectors) {
    try {
        logEvent("info", "attachSearchListeners : Vérification des éléments DOM...");

        // Récupère le formulaire et le champ de recherche, ou attend leur présence dans le DOM si absent
        const form = searchSelectors.form || await waitForElement(".search-bar");
        const input = searchSelectors.input || await waitForElement("#search");

        // Vérifie que les éléments existent avant d'ajouter les événements
        if (!form || !input) {
            throw new Error("attachSearchListeners : Élément(s) de la recherche introuvable(s).");
        }

        logEvent("success", "attachSearchListeners : Éléments trouvés, attachement des écouteurs...");

        // Suppression des écouteurs existants pour éviter les doublons
        input.removeEventListener("input", debounce(handleBarSearch, 300));
        form.removeEventListener("submit", handleSearchWrapper);

        // Ajout de l'écouteur sur l'input pour détecter la saisie utilisateur avec un délai (debounce)
        input.addEventListener("input", debounce(handleBarSearch, 300));

        // Ajout de l'écouteur sur le formulaire pour gérer la soumission sans rechargement
        form.addEventListener("submit", handleSearchWrapper);

        logEvent("success", "attachSearchListeners : Écouteurs attachés avec succès.");
    } catch (error) {
        logEvent("error", "attachSearchListeners : Erreur lors de l'ajout des écouteurs.", { error: error.message });
    }
}

/** ====================================================================================
/*                          ATTACHEMENT DES ÉVÉNEMENTS AUX DROPDOWNS
/* ==================================================================================== */
/**
 * Attache les événements aux dropdowns de filtres.
 * - Gère l'ouverture et la fermeture des dropdowns.
 * - Attache les événements aux options de filtre.
 * - Gère la barre de recherche interne des dropdowns.
 * - Ajoute un événement au bouton loupe pour lancer la recherche.
 *
 * @returns {void} Ne retourne rien, attache les événements nécessaires aux dropdowns.
 */
export function attachFilterEvents() {
    logEvent("info", "attachFilterEvents : Démarrage de l'attachement des événements aux dropdowns...");

    // Sélectionne tous les boutons de dropdown
    const dropdownButtons = safeQuerySelectorAll(".filter-button");

    // Sélectionne toutes les options disponibles dans les dropdowns
    const dropdownOptions = safeQuerySelectorAll(".filter-option");

    // Sélectionne toutes les barres de recherche des dropdowns
    const searchInputs = safeQuerySelectorAll(".dropdown-search");

    // Sélectionne tous les boutons loupe dans les dropdowns
    const searchIcons = safeQuerySelectorAll("search-icon-button");

    // Vérifie qu'il y a bien des boutons dropdown avant d'attacher les événements
    if (!dropdownButtons.length) {
        logEvent("warn", "attachFilterEvents : Aucun bouton de filtre trouvé.");
        return;
    }

    // Attache un événement de clic à chaque bouton de dropdown
    dropdownButtons.forEach(button => {
        button.removeEventListener("click", handleDropdownClickWrapper);
        button.addEventListener("click", handleDropdownClickWrapper);
    });

    // Attache un événement de sélection à chaque option de filtre
    dropdownOptions.forEach(option => {
        option.removeEventListener("click", handleFilterSelectionWrapper);
        option.addEventListener("click", handleFilterSelectionWrapper);
    });

    // Attache un événement pour filtrer dynamiquement les options en tapant dans la barre de recherche du dropdown
    searchInputs.forEach(input => {
        input.removeEventListener("input", handleDropdownSearch);
        input.addEventListener("input", handleDropdownSearch);
    });

    // Attache un événement au clic sur le bouton loupe pour déclencher la recherche dans le dropdown
    searchIcons.forEach(icon => {
        icon.removeEventListener("click", triggerDropdownSearch);
        icon.addEventListener("click", triggerDropdownSearch);
    });

    logEvent("success", "attachFilterEvents : Événements attachés avec succès aux dropdowns.");
}

/* ====================================================================================
/*                     GESTION DE LA RECHERCHE DYNAMIQUE DANS LES DROPDOWNS
/* ==================================================================================== */
/**
 * Gère la recherche dynamique dans les dropdowns de filtres.
 * - Filtre les options disponibles en fonction de la saisie de l'utilisateur.
 * - Masque les options qui ne correspondent pas au texte recherché.
 *
 * @param {Event} event - L'événement déclenché lors de la saisie dans le champ de recherche.
 * @returns {void} Ne retourne rien, modifie dynamiquement l'affichage des options du dropdown.
 */
function handleDropdownSearch(event) {
    try {
        logEvent("info", "handleDropdownSearch : Déclenchement du filtrage des options...");

        // Récupère l'élément de recherche (input) qui a déclenché l'événement
        const searchInput = event.target;

        // Extrait le type de filtre en supprimant le préfixe "search-" de l'ID
        const filterType = searchInput.id.replace("search-", "");

        // Récupère la valeur de l'input et la met en minuscule pour une comparaison insensible à la casse
        const query = searchInput.value.trim().toLowerCase();

        // Sélectionne la liste des options du dropdown correspondant
        const dropdownList = document.querySelector(`.${filterType}-list`);

        // Vérifie que la liste existe avant de procéder au filtrage
        if (!dropdownList) {
            logEvent("error", `handleDropdownSearch : Liste de filtres introuvable pour "${filterType}".`);
            return;
        }

        // Parcourt chaque option et ajuste son affichage en fonction de la recherche
        dropdownList.querySelectorAll(".filter-option").forEach(option => {
            const text = option.textContent.toLowerCase();

            // Affiche uniquement les options qui contiennent la recherche
            option.style.display = text.includes(query) ? "block" : "none";
        });

        logEvent("success", `handleDropdownSearch : Options filtrées pour "${filterType}" avec le mot-clé "${query}".`);
    } catch (error) {
        logEvent("error", "handleDropdownSearch : Erreur lors du filtrage des options.", { error: error.message });
    }
}

/* ====================================================================================
/*                   DÉCLENCHEMENT DE LA RECHERCHE DANS LE DROPDOWN
/* ==================================================================================== */
/**
 * Déclenche la recherche dans le dropdown lorsqu'on clique sur l'icône de la loupe.
 * - Sélectionne dynamiquement le champ de recherche associé.
 * - Simule un événement `input` pour filtrer les options en fonction du texte saisi.
 *
 * @param {Event} event - L'événement du clic sur l'icône de recherche.
 * @returns {void} Ne retourne rien, applique un filtrage dynamique des options.
 */
function triggerDropdownSearch(event) {
    try {
        logEvent("info", "triggerDropdownSearch : Activation de la recherche via l'icône de loupe...");

        // Sélectionne l'élément cliqué (icône loupe)
        const icon = event.target;

        // Récupère le champ de recherche associé (élément précédent dans le DOM)
        const searchInput = icon.previousElementSibling;

        // Vérifie si le champ de recherche est bien présent dans le DOM
        if (!searchInput) {
            logEvent("error", "triggerDropdownSearch : Champ de recherche introuvable.");
            return;
        }

        // Simule un événement `input` pour activer le filtrage dynamique des options
        searchInput.dispatchEvent(new Event("input"));

        logEvent("success", "triggerDropdownSearch : Recherche déclenchée avec succès via l'icône de loupe.");
    } catch (error) {
        logEvent("error", "triggerDropdownSearch : Erreur lors de la recherche.", { error: error.message });
    }
}

/* ====================================================================================
/*                     ATTACHEMENT DES ÉVÉNEMENTS AUX TAGS DE FILTRES
/* ==================================================================================== */
/**
 * Attache les événements aux tags de filtres sélectionnés.
 * Permet la suppression des filtres en cliquant sur le bouton de fermeture (icône "X").
 *
 * @returns {void} Ne retourne rien, attache les événements aux tags de filtres.
 */
export function attachTagEvents() {
    try {
        logEvent("info", "attachTagEvents : Activation de l'écoute des tags...");

        // Sélection du conteneur où les tags seront ajoutés
        const tagContainer = document.querySelector("#selected-filters");

        // Vérifie si le conteneur des tags est bien présent
        if (!tagContainer) {
            logEvent("error", "attachTagEvents : Conteneur des tags introuvable.");
            return;
        }

        // Création d'un observer pour surveiller les changements du DOM
        const observer = new MutationObserver(() => {
            // Récupère tous les tags actuellement affichés
            const tagElements = document.querySelectorAll(".filter-tag");

            // Vérifie si aucun tag n'est présent
            if (tagElements.length === 0) {
                logEvent("info", "attachTagEvents : Aucun tag actuellement sélectionné.");
                return;
            }

            // Ajoute un événement à chaque tag pour gérer leur suppression
            tagElements.forEach(tag => {
                const removeIcon = tag.querySelector("i.fa-times");

                // Vérifie si l'icône de suppression existe et si l'événement n'a pas déjà été attaché
                if (removeIcon && !removeIcon.dataset.eventAttached) {
                    removeIcon.addEventListener("click", handleTagRemovalWrapper);
                    removeIcon.dataset.eventAttached = "true"; // Évite les doublons d'événements
                }
            });

            logEvent("success", `attachTagEvents : Événements attachés à ${tagElements.length} tag(s).`);
        });

        // Configure l'observateur pour détecter les ajouts et suppressions de tags
        observer.observe(tagContainer, { childList: true });

        logEvent("info", "attachTagEvents : Observation des ajouts de tags activée.");

    } catch (error) {
        logEvent("error", "attachTagEvents : Erreur lors de l'attachement des événements aux tags.", { error: error.message });
    }
}

/* ====================================================================================*/
/*                     ATTACHEMENT DES ÉVÉNEMENTS CLAVIER                              */
/* ==================================================================================== */
/**
 * Attache les écouteurs d'événements pour la navigation au clavier.
 * Gère les interactions clavier telles que la navigation par tabulation,
 * la sélection des options de filtres et la fermeture des dropdowns avec Échap.
 *
 * @returns {void} Ne retourne rien, attache un écouteur global pour la navigation clavier.
 */
export function attachKeyboardListeners() {
    try {
        logEvent("test_start", "attachKeyboardListeners : Démarrage de l'attachement des événements clavier...");

        // Suppression des anciens écouteurs pour éviter les doublons
        document.removeEventListener("keydown", handleKeyboardNavigation);

        // Ajout d'un nouvel écouteur pour gérer la navigation au clavier
        document.addEventListener("keydown", handleKeyboardNavigation);

        logEvent("test_end", "attachKeyboardListeners : Écoute globale du clavier activée.");
    } catch (error) {
        // Enregistre une erreur si l'attachement des événements échoue
        logEvent("error", "attachKeyboardListeners : Erreur lors de l'attachement des événements clavier.", { error: error.message });
    }
}

/* ====================================================================================
/*                    INITIALISATION GLOBALE DES ÉVÉNEMENTS
/* ==================================================================================== */
/**
 * Initialise et attache tous les événements nécessaires au bon fonctionnement des filtres,
 * de la barre de recherche et des interactions clavier.
 *
 * - Attache les événements aux dropdowns des filtres.
 * - Attache les événements à la barre de recherche.
 * - Attache les événements de gestion des tags de filtres.
 * - Attache les événements clavier pour l’accessibilité et la navigation.
 */
export function initEventListeners() {
    try {
        logEvent("test_start", "initEventListeners : Démarrage de l'attachement des événements...");

        /** ====================================================================================
         *  ATTACHEMENT DES ÉVÉNEMENTS AUX DROPDOWNS
         * ==================================================================================== */
        logEvent("info", "initEventListeners : Attachement des événements aux dropdowns...");
        attachFilterEvents();
        logEvent("success", "initEventListeners : Événements aux dropdowns attachés.");

        /** ====================================================================================
         *  ATTACHEMENT DES ÉVÉNEMENTS À LA BARRE DE RECHERCHE
         * ==================================================================================== */
        logEvent("info", "initEventListeners : Attachement des événements à la barre de recherche...");

        // Sélection des éléments de la barre de recherche
        const searchSelectors = {
            form: document.querySelector(".search-bar"), // Sélection du formulaire de recherche
            input: document.querySelector("#search") // Sélection du champ de recherche
        };

        // Vérification de l'existence des éléments de la barre de recherche
        if (!searchSelectors.form || !searchSelectors.input) {
            logEvent("warn", "initEventListeners : Élément(s) de la barre de recherche introuvable(s). Vérifiez le DOM.");
        } else {
            attachSearchListeners(searchSelectors);
            logEvent("success", "initEventListeners : Événements attachés à la barre de recherche.");
        }

        /** ====================================================================================
         *  ATTACHEMENT DES ÉVÉNEMENTS AUX TAGS DE FILTRES
         * ==================================================================================== */
        logEvent("info", "initEventListeners : Attachement des événements aux tags de filtres...");
        attachTagEvents();
        logEvent("success", "initEventListeners : Événements aux tags attachés.");

        /** ====================================================================================
         *  ATTACHEMENT DES ÉVÉNEMENTS CLAVIER
         * ==================================================================================== */
        logEvent("info", "initEventListeners : Attachement des événements clavier...");
        attachKeyboardListeners();
        logEvent("success", "initEventListeners : Événements clavier attachés.");

        logEvent("test_end", "initEventListeners : Tous les événements ont été attachés avec succès.");
    } catch (error) {
        logEvent("error", "initEventListeners : Erreur lors de l'initialisation des événements.", { error: error.message });
    }
}

