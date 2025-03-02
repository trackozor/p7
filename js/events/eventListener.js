/* ====================================================================================
/*  FICHIER          : eventListener.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DESCRIPTION      : Gestion des écouteurs d'événements pour la recherche et les filtres.
/* ==================================================================================== */

import { logEvent, debounce } from "../utils/utils.js";
import { safeQuerySelectorAll, waitForElement } from "../config/domSelectors.js";
import { handleSearch, handleDropdownClickWrapper, handleFilterSelectionWrapper, handleTagRemovalWrapper, handleSearchWrapper,handleKeyboardNavigation } from "./eventHandler.js";

/* ====================================================================================
/*                            ATTACHEMENT DES ÉVÉNEMENTS DE RECHERCHE
/* ==================================================================================== */
/**
 * Attache les événements à la barre de recherche.
 * Gère la saisie utilisateur et la soumission du formulaire pour déclencher la recherche.
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

        // Récupère le formulaire et le champ de recherche, ou attend leur présence dans le DOM
        const form = searchSelectors.form || await waitForElement(".search-bar");
        const input = searchSelectors.input || await waitForElement("#search");

        // Vérifie que les éléments sont bien présents avant d'ajouter les événements
        if (!form || !input) {
            throw new Error("attachSearchListeners : Élément(s) de la recherche introuvable(s).");
        }

        logEvent("success", "attachSearchListeners : Éléments trouvés, attachement des écouteurs...");

        // Suppression des événements existants pour éviter les doublons
        input.removeEventListener("input", debounce(handleSearch, 300));
        form.removeEventListener("submit", handleSearchWrapper);

        // Ajout de l'écouteur sur l'input pour détecter la saisie utilisateur (avec debounce)
        input.addEventListener("input", debounce(handleSearch, 300));

        // Ajout de l'écouteur sur le formulaire pour gérer la soumission et éviter le rechargement
        form.addEventListener("submit", handleSearchWrapper);

        logEvent("success", "attachSearchListeners : Écouteurs attachés.");
    } catch (error) {
        logEvent("error", "attachSearchListeners : Erreur lors de l'ajout des écouteurs.", { error: error.message });
    }
}

/* ====================================================================================
/*                          ATTACHEMENT DES ÉVÉNEMENTS AUX DROPDOWNS
/* ==================================================================================== */
/**
 * Attache les événements aux dropdowns de filtres.
 * Gère l'ouverture/fermeture des dropdowns et la sélection des options.
 *
 * @returns {void} Ne retourne rien, attache les événements aux boutons et options des dropdowns.
 */
export function attachFilterEvents() {
    logEvent("info", "attachFilterEvents : Démarrage de l'attachement des événements aux dropdowns...");

    // Sélectionne tous les boutons de dropdown
    const dropdownButtons = safeQuerySelectorAll(".filter-button");

    // Sélectionne toutes les options disponibles dans les dropdowns
    const dropdownOptions = safeQuerySelectorAll(".filter-option");

    // Vérifie qu'il y a bien des boutons dropdown avant d'attacher les événements
    if (!dropdownButtons.length) {
        logEvent("warn", "attachFilterEvents : Aucun bouton de filtre trouvé.");
        return;
    }

    // Parcourt chaque bouton dropdown pour y attacher un événement de clic
    dropdownButtons.forEach(button => {
        // Supprime tout événement existant pour éviter les doublons
        button.removeEventListener("click", handleDropdownClickWrapper);
        // Ajoute l'événement pour ouvrir/fermer le dropdown
        button.addEventListener("click", handleDropdownClickWrapper);
    });

    // Parcourt chaque option de filtre pour y attacher un événement de sélection
    dropdownOptions.forEach(option => {
        // Supprime tout événement existant pour éviter les doublons
        option.removeEventListener("click", handleFilterSelectionWrapper);
        // Ajoute l'événement pour sélectionner l'option de filtre
        option.addEventListener("click", handleFilterSelectionWrapper);
    });

    logEvent("success", "attachFilterEvents : Événements attachés avec succès aux dropdowns.");
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
        logEvent("info", "attachTagEvents : Démarrage de l'attachement des événements aux tags...");

        // Sélectionne tous les tags actuellement affichés dans le DOM
        const tagElements = document.querySelectorAll(".filter-tag");

        // Vérifie s'il y a au moins un tag affiché avant d'attacher les événements
        if (!tagElements.length) {
            logEvent("warn", "attachTagEvents : Aucun tag de filtre trouvé.");
            return;
        }

        // Parcourt chaque tag et attache un événement au bouton de suppression
        tagElements.forEach(tag => {
            // Sélection de l'icône "X" pour supprimer le tag
            const removeIcon = tag.querySelector("i.fa-times");

            // Vérifie que l'icône existe avant d'attacher l'événement
            if (removeIcon) {
                // Supprime tout écouteur existant pour éviter les doublons
                removeIcon.removeEventListener("click", handleTagRemovalWrapper);
                // Ajoute un nouvel écouteur pour gérer la suppression du tag
                removeIcon.addEventListener("click", handleTagRemovalWrapper);
            }
        });

        // Enregistre un succès une fois tous les événements attachés
        logEvent("success", `attachTagEvents : Événements attachés avec succès à ${tagElements.length} tags.`);
    } catch (error) {
        // Capture et enregistre toute erreur survenue durant l'exécution
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

        // Vérifie si un écouteur est déjà attaché pour éviter les doublons
        document.removeEventListener("keydown", handleKeyboardNavigation);

        // Ajoute l'écouteur global pour capturer les événements clavier
        document.addEventListener("keydown", handleKeyboardNavigation);

        logEvent("test_end", "attachKeyboardListeners : Écoute globale du clavier activée.");
    } catch (error) {
        logEvent("error", "attachKeyboardListeners : Erreur lors de l'attachement des événements clavier.", { error: error.message });
    }
}

/* ====================================================================================
/*                    INITIALISATION GLOBALE DES ÉVÉNEMENTS
/* ==================================================================================== */
/**
 * Initialise et attache tous les écouteurs d'événements de l'application.
 * Gère l'attachement des événements pour les filtres, la recherche et la suppression des tags.
 *
 * @returns {void} Ne retourne rien, mais attache tous les événements nécessaires à l'UI.
 */
export function initEventListeners() {
    try {
        logEvent("test_start", "initEventListeners : Démarrage de l'attachement des événements...");

        // Attachement des événements aux dropdowns (filtres)
        logEvent("info", "initEventListeners : Attachement des événements aux dropdowns...");
        attachFilterEvents();
        logEvent("success", "initEventListeners : Événements aux dropdowns attachés.");

        // Attachement des événements à la barre de recherche
        logEvent("info", "initEventListeners : Attachement des événements à la barre de recherche...");
        const searchSelectors = {
            form: document.querySelector(".search-bar"), // Sélection du formulaire de recherche
            input: document.querySelector("#search") // Sélection du champ de recherche
        };

        if (!searchSelectors.form || !searchSelectors.input) {
            logEvent("warn", "initEventListeners : Élément(s) de la barre de recherche introuvable(s). Vérifiez le DOM.");
        } else {
            attachSearchListeners(searchSelectors);
            logEvent("success", "initEventListeners : Événements attachés à la barre de recherche.");
        }

        // Attachement des événements aux tags de filtres
        logEvent("info", "initEventListeners : Attachement des événements aux tags de filtres...");
        attachTagEvents();
        attachKeyboardListeners();
        logEvent("success", "initEventListeners : Événements aux tags attachés.");

        logEvent("test_end", "initEventListeners : Tous les événements ont été attachés avec succès.");
    } catch (error) {
        logEvent("error", "initEventListeners : Erreur lors de l'initialisation des événements.", { error: error.message });
    }
}

