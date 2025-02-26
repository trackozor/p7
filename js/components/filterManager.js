/** ====================================================================================
 *  FICHIER          : filterManager.js
 *  AUTEUR           : Trackozor
 *  VERSION          : 3.2
 *  DATE DE CRÉATION : 08/02/2025
 *  DERNIÈRE MODIF.  : 26/02/2025
 *  DESCRIPTION      : Gestion avancée des filtres avec mise à jour dynamique.
 *                     - Extraction des options de filtrage depuis les recettes disponibles.
 *                     - Filtrage dynamique des recettes par ingrédients, ustensiles, appareils.
 *                     - Gestion avancée du cache pour optimiser les performances.
 *                     - Mise à jour en temps réel des dropdowns dans l'interface utilisateur.
 *                     - Intégration avec les gestionnaires d'événements et le module de recherche.
 * ==================================================================================== */


import { recipesData } from "../data/dataManager.js"; 
import { logEvent, debounce } from "../utils/utils.js";
import { normalizeText } from "../utils/normalize.js";
import { createFilterSection } from "./factory/dropdownFactory.js";
import { attachFilterListeners } from "../events/eventListener.js";
import { displayResults } from "../events/eventHandler.js";

/** ====================================================================================
 *  VARIABLES GLOBALES
 * ==================================================================================== */

let allRecipes = [];
let filters = {};
const CACHE_SIZE_LIMIT = 100; // Définit une limite de taille pour le cache
export const recipeFilterCache = new Map(); // Utilisation d'une Map pour mieux gérer le cache

/** ====================================================================================
 *  INITIALISATION DES FILTRES
 * ==================================================================================== */
/**
 * Initialise les filtres dynamiques de l'application.
 *
 * Cette fonction :
 * - Récupère la liste des recettes depuis le cache.
 * - Vérifie la disponibilité des recettes.
 * - Génère les sections de filtres dynamiques (ingrédients, appareils, ustensiles).
 * - Associe les événements de gestion des filtres.
 *
 * @throws {Error} Si aucune recette n'est disponible ou si la génération des filtres échoue.
 */
export async function initFilters() {
    try {
        logEvent("test_start", "initFilters : Démarrage...");

        // Vérifie si les recettes sont bien chargées en mémoire
        if (!recipesData.recipes) {
            throw new Error("initFilters : Les recettes ne sont pas encore chargées.");
        }

        // Stocke la liste des recettes localement pour optimiser les accès
        allRecipes = recipesData.recipes;

        // Vérifie que la liste des recettes n'est pas vide
        if (allRecipes.length === 0) {
            throw new Error("initFilters : Aucune recette disponible.");
        }

        // Liste des filtres à générer dynamiquement avec leur configuration
        const filterTypes = [
            { selector: "#filters", title: "Ingrédients", key: "ingredients" },
            { selector: "#filters", title: "Appareils", key: "appliances" },
            { selector: "#filters", title: "Ustensiles", key: "ustensils" }
        ];

        // Réinitialisation de l'objet `filters` avant de le remplir
        filters = {};

        // Génère chaque filtre en utilisant la factory `createFilterSection`
        filterTypes.forEach(({ selector, title, key }) => {
            const filter = createFilterSection(selector, title, key, new Set());

            // Vérifie que la section du filtre a bien été créée
            if (!filter) {
                throw new Error(`initFilters : Impossible de générer le filtre "${title}".`);
            }

            // Stocke la référence du filtre dans l'objet `filters`
            filters[key] = filter;
        });

        // Vérifie que tous les filtres ont bien été créés avant d'attacher les écouteurs
        if (!filters.ingredients || !filters.appliances || !filters.ustensils) {
            throw new Error("initFilters : Certains filtres sont manquants avant l'attachement des écouteurs.");
        }

        // Associe les événements de gestion aux filtres créés
        attachFilterListeners(filters);

        logEvent("test_end", "initFilters : Filtres générés et écouteurs attachés.");
    } catch (error) {
        // Capture et logue toute erreur survenue lors de l'initialisation des filtres
        logEvent("error", "initFilters : Erreur lors de l'initialisation.", { error: error.message });
    }
}

/** ====================================================================================
 *  UTILITAIRE : OBTENIR LES RECETTES FILTRÉES AVEC GESTION DU CACHE
 * ==================================================================================== */
/**
 * Récupère les recettes filtrées en fonction du type et de la valeur sélectionnée,
 * avec gestion avancée du cache pour éviter des recalculs inutiles.
 *
 * @param {string} filterType - Type de filtre appliqué (ingredient, appliance, ustensil).
 * @param {string} selectedValue - Valeur sélectionnée dans le filtre.
 * @returns {Array<Object>} Liste des recettes correspondant au filtre.
 * @throws {Error} Si les paramètres sont invalides ou si les recettes ne sont pas disponibles.
 */
export function getFilteredRecipes(filterType, selectedValue) {
    try {
        // Vérification de la validité des entrées
        if (!filterType || !selectedValue) {
            throw new Error("getFilteredRecipes : Type de filtre ou valeur sélectionnée invalide.");
        }

        // Vérification de la disponibilité des recettes dans `recipesData`
        if (!recipesData.recipes || recipesData.recipes.length === 0) {
            throw new Error("getFilteredRecipes : Les recettes ne sont pas encore chargées.");
        }

        // Génération d'une clé unique pour le cache en combinant le type de filtre et la valeur sélectionnée
        const cacheKey = `${filterType}_${selectedValue.toLowerCase()}`;

        // Vérification si le cache contient déjà un résultat pour ce filtre
        if (recipeFilterCache.has(cacheKey)) {
            return recipeFilterCache.get(cacheKey); // Retourne directement les résultats mis en cache
        }

        // Applique le filtrage des recettes en fonction du type et de la valeur sélectionnée
        const filteredRecipes = filterRecipesByType(recipesData.recipes, filterType, selectedValue);

        // Vérification de la limite de taille du cache pour éviter un dépassement de mémoire
        if (recipeFilterCache.size >= CACHE_SIZE_LIMIT) {
            const firstKey = recipeFilterCache.keys().next().value; // Récupère la première clé stockée
            recipeFilterCache.delete(firstKey); // Supprime l'entrée la plus ancienne pour libérer de l'espace
        }

        // Stocke le résultat dans le cache pour des accès futurs rapides
        recipeFilterCache.set(cacheKey, filteredRecipes);

        return filteredRecipes; // Retourne les recettes filtrées
    } catch (error) {
        // Capture et logue toute erreur survenue pendant le filtrage
        logEvent("error", "getFilteredRecipes : Erreur lors de la récupération des recettes filtrées.", { error: error.message });

        return []; // Retourne un tableau vide en cas d'erreur pour éviter des crashs
    }
}

/** ====================================================================================
 *  FILTRAGE DES RECETTES PAR TYPE
 * ==================================================================================== */
/**
 * Filtre les recettes en fonction du type et de la valeur sélectionnée.
 *
 * Cette fonction :
 * - Vérifie la validité des entrées (tableau de recettes, type et valeur du filtre).
 * - Applique un filtrage dynamique sur les propriétés correspondantes de chaque recette.
 * - Retourne uniquement les recettes correspondant au filtre sélectionné.
 * - Gère les erreurs et les cas particuliers.
 *
 * @param {Array<Object>} recipes - Liste des recettes disponibles.
 * @param {string} filterType - Type de filtre appliqué (ingredient, appliance, ustensil).
 * @param {string} selectedValue - Valeur sélectionnée dans le filtre.
 * @returns {Array<Object>} Liste des recettes correspondant au filtre.
 * @throws {Error} En cas d'entrée invalide ou de problème lors du filtrage.
 */
export function filterRecipesByType(recipes, filterType, selectedValue) {
    try {
        // Vérifie que l'entrée `recipes` est un tableau non vide
        if (!Array.isArray(recipes) || recipes.length === 0) {
            throw new Error("filterRecipesByType : La liste des recettes est invalide ou vide.");
        }

        // Vérifie que `filterType` et `selectedValue` sont valides
        if (!filterType || typeof filterType !== "string" || !selectedValue || typeof selectedValue !== "string") {
            throw new Error("filterRecipesByType : Type de filtre ou valeur sélectionnée invalide.");
        }

        // Normalisation de la valeur sélectionnée pour éviter des erreurs de casse
        const normalizedValue = selectedValue.toLowerCase();

        // Applique le filtrage des recettes selon le type et la valeur sélectionnée
        return recipes.filter(recipe => {
            switch (filterType) {
                case "ingredient":
                    // Vérifie si l'un des ingrédients de la recette contient la valeur sélectionnée
                    return recipe.ingredients?.some(ing =>
                        typeof ing.ingredient === "string" &&
                        ing.ingredient.toLowerCase().includes(normalizedValue)
                    );

                case "appliance":
                    // Vérifie si l'appareil de la recette contient la valeur sélectionnée
                    return typeof recipe.appliance === "string" &&
                        recipe.appliance.toLowerCase().includes(normalizedValue);

                case "ustensil":
                    // Vérifie si l'un des ustensiles de la recette contient la valeur sélectionnée
                    return recipe.ustensils?.some(ust =>
                        typeof ust === "string" &&
                        ust.toLowerCase().includes(normalizedValue)
                    );

                default:
                    return true; // Si aucun filtre reconnu, retourne toutes les recettes sans filtrage
            }
        });

    } catch (error) {
        // Capture et logue toute erreur survenue pendant le filtrage
        logEvent("error", "filterRecipesByType : Erreur lors du filtrage des recettes.", { error: error.message });

        return []; // Retourne un tableau vide en cas d'erreur pour éviter des crashs
    }
}

/** ====================================================================================
 *  SÉLECTION D'UNE OPTION DE FILTRE ET MISE À JOUR DES RÉSULTATS
 * ==================================================================================== */
/**
 * Sélectionne une option de filtre et met à jour les résultats en conséquence.
 * 
 * Cette fonction :
 * - Vérifie que les paramètres fournis sont valides.
 * - Utilise `getFilteredRecipes()` pour éviter les doublons de code.
 * - Met à jour l’affichage avec les résultats filtrés.
 * 
 * @param {string} filterType - Type de filtre appliqué (ingredient, appliance, ustensil).
 * @param {string} selectedValue - Valeur sélectionnée dans le filtre.
 * @throws {Error} Si les paramètres sont invalides ou si un problème survient lors du filtrage.
 */
export function handleFilterSelection(filterType, selectedValue) {
    try {
        // Log de début d'exécution pour suivi des performances et erreurs
        logEvent("test_start", `handleFilterSelection : Sélection de filtre - ${filterType} : ${selectedValue}`);

        // Vérifie que `filterType` et `selectedValue` sont bien définis et sont des chaînes de caractères
        if (!filterType || typeof filterType !== "string" || !selectedValue || typeof selectedValue !== "string") {
            throw new Error("handleFilterSelection : Type de filtre ou valeur sélectionnée invalide.");
        }

        // Récupération des recettes filtrées en utilisant la fonction `getFilteredRecipes`
        const filteredRecipes = getFilteredRecipes(filterType, selectedValue);

        // Vérifie que la récupération des recettes a retourné un tableau valide
        if (!Array.isArray(filteredRecipes)) {
            throw new Error("handleFilterSelection : Résultat du filtrage invalide.");
        }

        // Met à jour l’affichage avec les résultats des recettes filtrées
        displayResults(filteredRecipes);

        // Log de fin d'exécution avec le nombre de résultats affichés
        logEvent("test_end", `handleFilterSelection : ${filteredRecipes.length} recettes affichées.`);
    } catch (error) {
        // Capture et logue toute erreur survenue pendant l'exécution
        logEvent("error", "handleFilterSelection : Erreur lors de la sélection du filtre.", { error: error.message });
    }
}

/** ====================================================================================
 *  UTILITAIRES POUR LA GESTION DES FILTRES
 * ==================================================================================== */
/**
 * Ajoute une valeur normalisée à un `Set` si elle est valide.
 *
 * Cette fonction :
 * - Vérifie que la valeur est une chaîne de caractères valide.
 * - Normalise la valeur pour uniformiser l’écriture et éviter les doublons.
 * - Ajoute la valeur normalisée au `Set`, garantissant ainsi l’unicité.
 *
 * @param {Set} set - Ensemble (`Set`) contenant les options uniques.
 * @param {string} value - Valeur à normaliser et ajouter.
 */
function normalizeAndAddToSet(set, value) {
    // Vérifie si `value` est définie et est une chaîne de caractères
    if (value && typeof value === "string") {
        // Normalise la valeur (suppression des espaces, accents, mise en minuscule, etc.)
        const normalizedValue = normalizeText(value);

        // Ajoute la valeur normalisée dans le `Set` pour éviter les doublons
        set.add(normalizedValue);
    }
}

/** ====================================================================================
 *  EXTRACTION DES OPTIONS UNIQUES POUR LES FILTRES
 * ==================================================================================== */
/**
 * Extrait les options uniques des filtres (ingrédients, appareils et ustensiles) à partir d'une liste de recettes.
 *
 * Cette fonction :
 * - Parcourt toutes les recettes disponibles.
 * - Récupère les ingrédients, appareils et ustensiles uniques.
 * - Normalise et stocke les valeurs sous forme de `Set` pour éviter les doublons.
 * - Retourne les options triées sous forme de tableaux.
 *
 * @param {Array<Object>} recipes - Liste des recettes disponibles.
 * @returns {Object} Contenant les ingrédients, appareils et ustensiles sous forme de tableaux triés.
 */
function extractFilterOptions(recipes) {
    // Initialisation des `Set` pour stocker les options uniques
    let filters = {
        ingredients: new Set(), // Stocke les ingrédients uniques
        appliances: new Set(),  // Stocke les appareils uniques
        ustensils: new Set()    // Stocke les ustensiles uniques
    };

    // Vérifie que `recipes` est un tableau valide
    if (!Array.isArray(recipes) || recipes.length === 0) {
        return {
            ingredients: [],
            appliances: [],
            ustensils: []
        };
    }

    // Parcours de chaque recette pour extraire les filtres
    recipes.forEach(recipe => {
        if (!recipe || typeof recipe !== "object") {
            return;
        } // Ignore les valeurs non valides

        // Extraction et normalisation des ingrédients
        recipe.ingredients?.forEach(ing => normalizeAndAddToSet(filters.ingredients, ing.ingredient));

        // Extraction et normalisation de l'appareil
        normalizeAndAddToSet(filters.appliances, recipe.appliance);

        // Extraction et normalisation des ustensiles
        recipe.ustensils?.forEach(ust => normalizeAndAddToSet(filters.ustensils, ust));
    });

    // Retourne les options sous forme de tableaux triés
    return {
        ingredients: [...filters.ingredients].sort(),
        appliances: [...filters.appliances].sort(),
        ustensils: [...filters.ustensils].sort()
    };
}

/** ====================================================================================
 *  CHARGEMENT INITIAL DES FILTRES
 * ==================================================================================== */
/**
 * Charge et met à jour les options des filtres à partir des recettes disponibles.
 *
 * Cette fonction :
 * - Extrait les options uniques des filtres en analysant les recettes chargées.
 * - Met à jour dynamiquement les listes de filtres affichées dans l'interface utilisateur.
 *
 * @throws {Error} En cas d'erreur lors du chargement des filtres.
 */
export function populateFilters() {
    try {
        // Enregistre un événement de début pour suivre le chargement des filtres
        logEvent("test_start", "populateFilters : Chargement des filtres...");

        // Extrait les options uniques des filtres (ingrédients, appareils, ustensiles) à partir des recettes
        const filterData = extractFilterOptions(recipesData.recipes);

        // Met à jour les listes déroulantes des filtres dans le DOM
        populateDropdown(filterData);

        // Enregistre un événement indiquant la fin du chargement des filtres avec succès
        logEvent("test_end", "populateFilters : Filtres mis à jour.");
    } catch (error) {
        // Capture et enregistre l'erreur en cas d'échec du chargement des filtres
        logEvent("error", "populateFilters : Erreur lors du chargement des filtres.", { error: error.message });
    }
}

/** ====================================================================================
 *  MISE À JOUR DES LISTES DE FILTRES DANS LE DOM
 * ==================================================================================== */
/**
 * Génère et met à jour une liste déroulante avec des options de filtre.
 *
 * Cette fonction :
 * - Vérifie la validité des filtres mis à jour.
 * - Récupère les éléments DOM des listes correspondantes.
 * - Efface et remplit chaque liste avec un maximum de 10 options triées.
 * - Conserve l'option précédemment sélectionnée si elle est encore disponible.
 * - Ajoute des écouteurs d'événements pour permettre la sélection des filtres.
 *
 * @param {Object} updatedFilters - Contient les nouvelles options des filtres sous forme de tableaux.
 * @throws {Error} En cas de problème lors de la mise à jour des filtres.
 */
function populateDropdown(updatedFilters) {
    try {
        // Enregistre un événement de début pour suivre la mise à jour des filtres
        logEvent("test_start", "populateDropdown : Mise à jour des filtres.");

        // Vérifie que `updatedFilters` est bien défini et qu'il s'agit d'un objet
        if (!updatedFilters || typeof updatedFilters !== "object") {
            throw new Error("populateDropdown : Données de filtre invalides.");
        }

        // Parcourt chaque type de filtre (ingredients, appliances, ustensils)
        Object.entries(updatedFilters).forEach(([filterType, options]) => {
            // Construit l'ID du conteneur de la liste correspondante
            const listId = `#${filterType}-list`;
            const listElement = document.querySelector(listId);

            // Vérifie que l'élément de la liste existe bien dans le DOM
            if (!listElement) {
                throw new Error(`populateDropdown : Liste introuvable (${listId}).`);
            }

            // Sauvegarde l'option actuellement sélectionnée avant de réinitialiser la liste
            const selectedOption = listElement.querySelector(".selected")?.textContent || null;

            // Efface les options existantes de la liste
            listElement.innerHTML = "";

            // Si aucune option n'est disponible, affiche un message et quitte
            if (options.length === 0) {
                listElement.innerHTML = `<li class="empty">Aucune option disponible</li>`;
                return;
            }

            // Utilisation d'un fragment de document pour optimiser les mises à jour du DOM
            const fragment = document.createDocumentFragment();

            // Parcourt les 10 premières options pour les ajouter à la liste
            options.slice(0, 10).forEach(option => {
                // Crée un élément `<li>` pour représenter une option de filtre
                const listItem = document.createElement("li");
                listItem.textContent = option;
                listItem.classList.add("filter-option");

                // Si l'option correspond à celle précédemment sélectionnée, ajoute la classe "selected"
                if (option === selectedOption) {
                    listItem.classList.add("selected");
                }

                // Ajoute un écouteur d'événement pour gérer la sélection de l'option
                listItem.addEventListener("click", () => handleFilterSelection(filterType, option));

                // Ajoute l'élément `<li>` au fragment
                fragment.appendChild(listItem);
            });

            // Ajoute toutes les nouvelles options en une seule mise à jour du DOM
            listElement.appendChild(fragment);
        });

        // Enregistre un événement indiquant la fin de la mise à jour des filtres avec succès
        logEvent("test_end", "populateDropdown : Filtres mis à jour.");
    } catch (error) {
        // Capture et enregistre l'erreur en cas d'échec de la mise à jour
        logEvent("error", "populateDropdown : Erreur lors de la mise à jour.", { error: error.message });
    }
}

/** ====================================================================================
 *  MISE À JOUR DES FILTRES APRÈS FILTRAGE
 * ==================================================================================== */
/**
 * Met à jour dynamiquement les filtres affichés en fonction des recettes filtrées.
 *
 * Cette fonction :
 * - Vérifie si la liste de recettes `results` est valide et contient des éléments.
 * - Extrait les options uniques des filtres à partir des recettes filtrées.
 * - Met à jour les dropdowns avec les nouvelles valeurs extraites.
 * - Utilise un `debounce` pour éviter des appels excessifs lors des mises à jour fréquentes.
 *
 * @param {Array<Object>} results - Liste des recettes après filtrage.
 */
export const updateFilters = debounce((results) => {
    try {
        // Enregistre un événement indiquant le début de la mise à jour des filtres
        logEvent("test_start", `updateFilters : Démarrage avec ${results.length} recettes.`);

        // Vérifie que `results` est bien un tableau et qu'il contient au moins une recette
        if (!Array.isArray(results) || results.length === 0) {
            throw new Error("updateFilters : Aucun résultat valide.");
        }

        // Extraction des nouvelles options de filtres à partir des résultats
        const updatedFilters = extractFilterOptions(results);

        // Met à jour les listes déroulantes avec les nouveaux filtres
        populateDropdown(updatedFilters);

        // Enregistre un événement indiquant la fin de la mise à jour des filtres
        logEvent("test_end", "updateFilters : Mise à jour des filtres terminée.");
    } catch (error) {
        // Capture et enregistre l'erreur en cas d'échec de la mise à jour
        logEvent("error", "updateFilters : Erreur lors de la mise à jour.", { error: error.message });
    }
}, 300);






