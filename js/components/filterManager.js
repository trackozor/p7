/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.1                                                             */
/*  DESCRIPTION      : Gère les filtres et l'affichage dynamique des recettes.         */
/* ==================================================================================== */

import { createFilterSection } from "./factory/dropdownFactory.js";
import { fetchFilterOptions } from "../data/dataManager.js";
import { logEvent, waitForElement, removeDuplicates } from "../utils/utils.js";
import { removeSelectedOption, restoreRemovedOption } from "./dropdownManager.js";
import { normalizeText } from "../utils/normalize.js";
import { handleFilterSelection } from "../events/eventHandler.js";

/* ==================================================================================== */
/*  VARIABLES GLOBALES ET ÉTAT DES FILTRES                                             */
/* ==================================================================================== */
/**
 * @typedef {Object} ActiveFilters
 * @property {Set<string>} ingredients - Ensemble des ingrédients sélectionnés.
 * @property {Set<string>} appliances - Ensemble des appareils sélectionnés.
 * @property {Set<string>} ustensils - Ensemble des ustensiles sélectionnés.
 */

/**
 * Objet contenant les filtres actifs sélectionnés par l'utilisateur.
 *
 * - Chaque catégorie de filtre est stockée sous forme de `Set()` pour éviter les doublons.
 * - Cet objet est mis à jour dynamiquement lorsque l'utilisateur sélectionne ou désélectionne des filtres.
 * - Les filtres actifs sont utilisés pour affiner les résultats de recherche.
 *
 * @type {ActiveFilters}
 */
export let activeFilters = {
    ingredients: new Set(), // Stocke les ingrédients sélectionnés
    appliances: new Set(),  // Stocke les appareils sélectionnés
    ustensils: new Set()    // Stocke les ustensiles sélectionnés
};

/**
 * Objet contenant les références aux conteneurs des dropdowns dans le DOM.
 *
 * - Utilisé pour éviter les requêtes répétées sur le DOM et améliorer les performances.
 * - Chaque clé de l'objet correspond à une catégorie de filtre (`ingredients`, `appliances`, `ustensils`).
 * - Les valeurs sont des références aux éléments HTML contenant les options des filtres.
 *
 * @type {Object.<string, HTMLElement>}
 */
const filterContainers = {};

/* ==================================================================================== */
/*  INITIALISATION DES FILTRES                                                         */
/* ==================================================================================== */
/**
 * Initialise les filtres de recherche et les insère dynamiquement dans le DOM.
 *
 * - Attend la disponibilité du conteneur des filtres avant d'agir.
 * - Récupère les options de filtres depuis les données disponibles.
 * - Supprime les doublons pour éviter des répétitions inutiles.
 * - Normalise les noms des filtres pour garantir un affichage cohérent.
 * - Génère les sections de filtres et les insère dans le DOM en une seule fois.
 * - Gère les erreurs pour éviter les crashs et faciliter le débogage.
 *
 * @async
 * @returns {Promise<void>} Ne retourne rien mais met à jour le DOM.
 */
export async function initFilters() {
    try {
        // Enregistre le début de l'initialisation des filtres pour le suivi des logs.
        logEvent("test_start_filter", "Début de l'initialisation des filtres...");

        // Attente de la présence du conteneur des filtres dans le DOM (timeout de 3s).
        const filtersContainer = await waitForElement("#filters .filter-dropdowns", 3000);
        if (!filtersContainer) {
            // Si le conteneur est introuvable, on déclenche une erreur pour arrêter l'exécution.
            throw new Error("Conteneur des filtres introuvable.");
        }

        // Récupération des données brutes des filtres (ingrédients, appareils, ustensiles).
        const rawData = fetchFilterOptions();
        if (!rawData || Object.values(rawData).every(arr => arr.length === 0)) {
            // Si aucune donnée n'est récupérée, on affiche un avertissement et on quitte la fonction.
            logEvent("warn", "Aucun filtre disponible.");
            return;
        }

        // Suppression des doublons dans les filtres pour éviter des répétitions inutiles.
        const filterData = removeDuplicates(rawData);

        // Vérifie si le conteneur contient déjà des filtres et les vide si nécessaire.
        if (filtersContainer.children.length > 0) {
            filtersContainer.innerHTML = "";
        }

        // Création d'un fragment de document pour optimiser l'insertion dans le DOM.
        const fragment = document.createDocumentFragment();

        // Parcourt chaque type de filtre (ingrédients, appareils, ustensiles).
        Object.entries(filterData).forEach(([type, values]) => {
            if (values.size) {
                // Normalise le texte du filtre avant l'affichage.
                // Ajoute dynamiquement la section correspondante dans le fragment.
                fragment.appendChild(createFilterSection(normalizeText(type), type, values));
            }
        });

        // Ajoute toutes les sections de filtres dans le conteneur en une seule fois.
        filtersContainer.appendChild(fragment);

        // Enregistre le succès de l'initialisation des filtres dans les logs.
        logEvent("success", "Filtres chargés avec succès.");
    } catch (error) {
        // Capture toute erreur survenue et l'enregistre pour faciliter le débogage.
        logEvent("error", "Échec de l'initialisation des filtres", { error: error.message });
    }
}

/** ====================================================================================
 *  MISE À JOUR DES FILTRES
 * ==================================================================================== */
/**
 * Met à jour dynamiquement les options des dropdowns en fonction des recettes filtrées.
 *
 * - Vérifie la validité du paramètre `filteredRecipes`.
 * - Extrait les nouvelles options disponibles (ingrédients, appareils, ustensiles).
 * - Optimise la mise à jour des dropdowns en limitant les manipulations DOM inutiles.
 * - Trie les options et les insère dans le DOM en une seule opération.
 * - Réintègre les options supprimées si elles sont encore pertinentes.
 * - Gère les erreurs pour éviter les plantages.
 *
 * @param {Array} filteredRecipes - Liste des recettes filtrées.
 */
export function updateFilters(filteredRecipes = []) {
    try {
        // Enregistre le début de la mise à jour des dropdowns dans les logs.
        logEvent("info", "Mise à jour des dropdowns avec les nouvelles recettes filtrées.");

        // Vérifie que `filteredRecipes` est bien un tableau.
        if (!Array.isArray(filteredRecipes)) {
            throw new Error("Paramètre `filteredRecipes` invalide.");
        }

        // Crée un objet contenant des ensembles pour stocker les nouvelles options sans doublons.
        const newFilterData = {
            ingredients: new Set(),
            appliances: new Set(),
            ustensils: new Set()
        };

        // Parcourt la liste des recettes filtrées et extrait les données pertinentes.
        filteredRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => newFilterData.ingredients.add(ing.ingredient));
            newFilterData.appliances.add(recipe.appliance);
            recipe.ustensils.forEach(ust => newFilterData.ustensils.add(ust));
        });

        // Mise à jour optimisée des dropdowns pour éviter des manipulations DOM excessives.
        Object.entries(filterContainers).forEach(([filterType, container]) => {
            // Récupère la liste des options du dropdown concerné.
            const dropdownList = container?.querySelector("ul");
            if (!dropdownList) {
                return; // Ignore si aucun dropdown n'est trouvé.
            }

            // Vérifie s'il y a un changement à faire avant de vider l'existant.
            if (dropdownList.children.length > 0) {
                dropdownList.innerHTML = "";
            }

            // Création d'un fragment pour limiter les accès au DOM.
            const fragment = document.createDocumentFragment();

            // Trie les options par ordre alphabétique avant de les insérer.
            [...newFilterData[filterType]]
                .sort((a, b) => a.localeCompare(b))
                .forEach(option => {
                    // Création d'un élément `<li>` pour chaque option du dropdown.
                    const li = document.createElement("li");
                    li.classList.add("filter-option");
                    li.textContent = option;

                    // Ajoute un événement de sélection pour chaque option.
                    li.addEventListener("click", () => {
                        handleFilterSelection(filterType, option);
                        removeSelectedOption(filterType, option);
                    });

                    // Ajoute l'option au fragment pour un rendu plus performant.
                    fragment.appendChild(li);
                });

            // Insère toutes les nouvelles options dans le dropdown en une seule opération.
            dropdownList.appendChild(fragment);
        });

        // Réintègre les options supprimées si elles sont encore pertinentes.
        Object.entries(activeFilters).forEach(([filterType, values]) => {
            values.forEach(filterValue => {
                restoreRemovedOption(filterType, filterValue);
            });
        });

        // Enregistre la réussite de la mise à jour dans les logs.
        logEvent("success", "Dropdowns mis à jour avec succès.");
    } catch (error) {
        // Capture et journalise toute erreur rencontrée pour faciliter le débogage.
        logEvent("error", "Échec de la mise à jour des dropdowns", { error: error.message });
    }
}








