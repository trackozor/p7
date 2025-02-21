/* ==================================================================================== */
/*  FICHIER          : filterManager.js                                                */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 2.3                                                             */
/*  DATE DE CRÉATION : 08/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 10/02/2025                                                      */
/*  DESCRIPTION      : Gestion dynamique des filtres avec une structure optimisée.    */
/* ==================================================================================== */

import { dataManager } from "../data/dataManager.js";
import { templateManager } from "../data/templateManager.js";
import { logEvent } from "../utils/utils.js";
import { normalizeText } from "../utils/normalize.js";
import { createFilterSection} from "./factory/dropdownFactory.js";
import { displayResults } from "../events/eventHandler.js";



let selectedFilters = {
    searchKeyword: "",
    ingredients: new Set(),
    appliances: new Set(),
    utensils: new Set()
};

let allRecipes = [];

/* ==================================================================================== */
/*  INITIALISATION DES FILTRES                                                         */
/* ==================================================================================== */

/**
* Initialise les filtres en récupérant toutes les recettes et en générant les dropdowns.
*
* - Récupère l'ensemble des recettes via `dataManager.getAllRecipes()`.
* - Vérifie que les données sont valides avant de poursuivre.
* - Génère dynamiquement les options de filtres (ingrédients, appareils, ustensiles).
* - Gère les erreurs et enregistre les événements pour assurer un suivi détaillé.
*/
export async function initFilters() {
    try {
        // Étape 1 : Log de l'initialisation des filtres
        logEvent("info", "initFilters : Démarrage du chargement des recettes...");

        // Étape 2 : Attente de la récupération des recettes depuis le gestionnaire de données
        allRecipes = await dataManager.getAllRecipes();

        // Étape 3 : Vérification des données
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            throw new Error("Aucune recette disponible.");
        }

        logEvent("success", `initFilters : ${allRecipes.length} recettes chargées avec succès.`);

        // Étape 4 : Génération des données pour les filtres
        await generateFilterData(); // Assure que les filtres sont bien générés avant d'afficher

        // Étape 5 : Mise à jour de l'affichage des résultats et filtres
        displayResults(allRecipes);
        

        logEvent("success", "initFilters : Filtres et affichage mis à jour avec succès.");
        
    } catch (error) {
        logEvent("error", "initFilters : Échec de l'initialisation des filtres.", { error: error.message });
    }
}



/* ==================================================================================== */
/*  GÉNÉRATION DES FILTRES                                                             */
/* ==================================================================================== */

/**
     * Génère les ensembles uniques de filtres à partir des recettes.
     *
     * - Parcourt toutes les recettes pour extraire les ingrédients, appareils et ustensiles uniques.
     * - Utilise des `Set()` pour garantir l'unicité des valeurs.
     * - Applique une normalisation (`normalizeText()`) pour éviter les doublons liés à la casse ou aux accents.
     * - Crée dynamiquement les sections de filtres correspondantes dans l'UI.
     */

function generateFilterData() {
    try {
        logEvent("info", "Début de la génération des filtres...");

        const ingredientsSet = new Set();
        const appliancesSet = new Set();
        const utensilsSet = new Set();

        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            throw new Error("Aucune recette disponible pour générer les filtres.");
        }

        allRecipes.forEach(recipe => {
            if (Array.isArray(recipe.ingredients)) {
                recipe.ingredients.forEach(ing => {
                    if (ing.ingredient) {
                        ingredientsSet.add(normalizeText(ing.ingredient));
                    }
                });
            }
            if (recipe.appliance) {
                appliancesSet.add(normalizeText(recipe.appliance));
            }
            if (Array.isArray(recipe.ustensils)) {
                recipe.ustensils.forEach(ust => {
                    if (ust) {
                        utensilsSet.add(normalizeText(ust));
                    }
                });
            }
        });

        console.log("✅ Filtres générés :", {
            ingredients: [...ingredientsSet],
            appliances: [...appliancesSet],
            utensils: [...utensilsSet]
        });

        createFilterSection("#filters", "Ingrédients", "ingredients", ingredientsSet);
        createFilterSection("#filters", "Appareils", "appliances", appliancesSet);
        createFilterSection("#filters", "Ustensiles", "utensils", utensilsSet);

        logEvent("success", "✅ generateFilterData : Filtres générés avec succès.");

    } catch (error) {
        logEvent("error", "❌ generateFilterData : Erreur lors de la génération des filtres.", { error: error.message });
    }
}

/* ==================================================================================== */
/*  FILTRAGE DYNAMIQUE                                                                  */
/* ==================================================================================== */
/**
 * Filtre dynamiquement les options du dropdown en fonction de la saisie utilisateur.
 *
 * - Vérifie la validité des paramètres avant d'exécuter le filtrage.
 * - Utilise `display: none` pour masquer les éléments qui ne correspondent pas à la recherche.
 * - Ajoute un `logEvent()` pour tracer les erreurs et suivre le processus de filtrage.
 *
 * @param {HTMLInputElement} searchInput - Champ de recherche du dropdown.
 * @param {HTMLElement} listContainer - Conteneur de la liste d'options.
 */

export function filterDropdownOptions(searchInput, listContainer) {
    try {
        // ==============================
        // Vérification des paramètres
        // ==============================

        if (!(searchInput instanceof HTMLInputElement)) {
            logEvent("error", "filterDropdownOptions : Paramètre `searchInput` invalide.", { searchInput });
            return;
        }
        if (!(listContainer instanceof HTMLElement)) {
            logEvent("error", "filterDropdownOptions : Paramètre `listContainer` invalide.", { listContainer });
            return;
        }

        // ==============================
        // Normalisation de la saisie utilisateur
        // ==============================

        const query = searchInput.value.toLowerCase().trim();
        logEvent("info", `filterDropdownOptions : Filtrage des options avec la requête "${query}".`);

        // ==============================
        // Filtrage des options
        // ==============================

        const options = listContainer.querySelectorAll("li");
        let matchesFound = 0;

        options.forEach(item => {
            const matches = item.textContent.toLowerCase().includes(query);
            item.style.display = matches ? "block" : "none"; // Affichage/Masquage des options
            if (matches) {
                matchesFound++;
            }
        });

        // ==============================
        // Journalisation du résultat du filtrage
        // ==============================

        logEvent("success", `filterDropdownOptions : ${matchesFound} résultats affichés.`);
        
    } catch (error) {
        logEvent("error", "filterDropdownOptions : Erreur lors du filtrage des options.", { error: error.message });
    }
}

/* ======================================================================================= */
/*  updateRecipeCount                                                                      */
/* ======================================================================================= */

/**
 * Met à jour dynamiquement l'affichage du nombre de recettes visibles après filtrage.
 * 
 * - Vérifie si l'élément du compteur existe, sinon le crée.
 * - Compte le nombre de `.recipe-card` visibles après filtrage.
 * - Met à jour dynamiquement l'affichage avec le nombre de recettes restantes.
 * - Utilise `logEvent()` pour journaliser les mises à jour et erreurs éventuelles.
 *
 * @function updateRecipeCount
 * @param {string} containerSelector - Sélecteur CSS du conteneur où afficher le compteur.
 * 
 * @throws {TypeError} - Si `containerSelector` n'est pas une chaîne de caractères valide.
 * @throws {Error} - Si aucun conteneur correspondant n'est trouvé.
 * 
 * @example
 * updateRecipeCount("#recipe-count-container");
 * 
 * @version 1.1 - Ajout de la gestion des erreurs et création dynamique de l'élément.
 */
function updateRecipeCount(containerSelector) {
    // Vérification : `containerSelector` doit être une chaîne de caractères
    if (typeof containerSelector !== "string") {
        logEvent("ERROR", "updateRecipeCount : Paramètre `containerSelector` invalide.");
        throw new TypeError("updateRecipeCount : `containerSelector` doit être une chaîne de caractères.");
    }

    // Sélection du conteneur
    const container = document.querySelector(containerSelector);
    
    // Vérification de l'existence du conteneur
    if (!container) {
        logEvent("ERROR", `updateRecipeCount : Conteneur introuvable pour '${containerSelector}'.`);
        throw new Error(`updateRecipeCount : Aucun élément trouvé avec '${containerSelector}'.`);
    }

    // Sélection ou création de l'élément du compteur
    let counterElement = container.querySelector(".recipe-count");
    if (!counterElement) {
        counterElement = document.createElement("p");
        counterElement.classList.add("recipe-count");
        container.appendChild(counterElement);
    }

    // Compter les recettes visibles
    const visibleRecipes = document.querySelectorAll(".recipe-card:not(.hidden)").length;

    // Mise à jour du texte du compteur
    counterElement.textContent = `${visibleRecipes} recette${visibleRecipes > 1 ? "s" : ""} affichée${visibleRecipes > 1 ? "s" : ""}`;

    // Journalisation du succès
    logEvent("INFO", `updateRecipeCount : ${visibleRecipes} recettes affichées.`);
}

/*----------------------------------------------------------------
/*   Filtrage des recettes par types
/*----------------------------------------------------------------*/

/**
 * Filtre les recettes selon un critère spécifique (ingrédient, appareil, ustensile).
 *
 * - Utilise une comparaison insensible à la casse et aux accents.
 * - Vérifie que le champ filtré est bien présent dans la recette.
 *
 * @param {Array} recipes - Liste complète des recettes.
 * @param {string} filterType - Type de filtre appliqué ("ingredient", "appliance", "ustensil").
 * @param {string} selectedValue - Valeur du filtre sélectionné.
 * @returns {Array} Recettes filtrées correspondant au critère.
 */

export function filterRecipesByType(recipes, filterType, selectedValue) {
    try {
        // 1. Vérifie que `recipes` est un tableau valide contenant au moins une recette.
        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("warning", "filterRecipesByType : Aucune recette à filtrer.");
            return []; // Retourne un tableau vide si `recipes` est invalide.
        }

        // 2. Vérifie que `filterType` et `selectedValue` sont bien définis et de type string.
        if (typeof filterType !== "string" || typeof selectedValue !== "string") {
            logEvent("error", "filterRecipesByType : Paramètres invalides.", { filterType, selectedValue });
            return [];
        }

        // 3. Normalise la valeur du filtre pour éviter les différences de casse et d’accents.
        const normalizedValue = normalizeText(selectedValue);

        // 4. Applique le filtrage selon le type spécifié.
        return recipes.filter(recipe => {
            // 4.1 Filtrage par ingrédient : vérifie si un des ingrédients contient la valeur recherchée.
            if (filterType === "ingredient" && Array.isArray(recipe.ingredients)) {
                return recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(normalizedValue));
            }

            // 4.2 Filtrage par appareil : compare l'appareil de la recette avec la valeur recherchée.
            if (filterType === "appliance" && recipe.appliance) {
                return normalizeText(recipe.appliance) === normalizedValue;
            }

            // 4.3 Filtrage par ustensile : vérifie si un des ustensiles contient la valeur recherchée.
            if (filterType === "ustensil" && Array.isArray(recipe.ustensils)) {
                return recipe.ustensils.some(ust => normalizeText(ust).includes(normalizedValue));
            }

            return false; // Aucune correspondance trouvée.
        });

    } catch (error) {
        // 5. Capture et journalise toute erreur survenue pendant le filtrage.
        logEvent("error", "filterRecipesByType : Erreur lors du filtrage des recettes.", { error: error.message });
        return []; // Retourne un tableau vide en cas d'erreur pour éviter un crash.
    }
}

/* ======================================================================================= */
/*  applyFilters                                                                          */
/* ======================================================================================= */

/**
 * Applique les filtres actifs et met à jour l'affichage des recettes.
 *
 * - Combine la recherche par mot-clé et les filtres avancés.
 * - Vérifie si `recipe[type]` est une chaîne ou un tableau avant d'appliquer le filtrage.
 * - Utilise `some()` uniquement pour les filtres pertinents.
 * - Met à jour le compteur de recettes après filtrage.
 *
 * @function applyFilters
 */

export function applyFilters() {
    try {
        const keyword = filters.searchKeyword ? normalizeText(filters.searchKeyword) : null;

        const filteredRecipes = allRecipes.filter(recipe => {
            // Vérifie si le mot-clé est présent dans le nom, la description ou les ingrédients
            const matchesKeyword = keyword
                ? normalizeText(recipe.name).includes(keyword) ||
                    normalizeText(recipe.description).includes(keyword) ||
                    (recipe.ingredients && recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(keyword)))
                : true;

            // Vérifie si la recette correspond à tous les filtres actifs
            const matchesFilters = ["ingredients", "appliances", "utensils"].every(type => {
                const filterValues = filters[type];

                // Si aucun filtre n'est actif pour ce type, on passe
                if (filterValues.size === 0) {
                    return true;
                }

                // Vérification selon le type de données
                if (Array.isArray(recipe[type])) {
                    return [...filterValues].every(filterVal =>
                        recipe[type].some(el => normalizeText(el).includes(filterVal))
                    );
                } else if (typeof recipe[type] === "string") {
                    return filterValues.has(normalizeText(recipe[type]));
                }

                return false; // Cas improbable, mais sécurisé
            });

            return matchesKeyword && matchesFilters;
        });

        // Mise à jour de l'affichage avec les recettes filtrées
        templateManager.displayAllRecipes("#recipe-container", filteredRecipes);

        // Mise à jour dynamique du compteur de recettes visibles
        updateRecipeCount("#recipe-count-container");

        logEvent("success", `applyFilters : ${filteredRecipes.length} recettes affichées après filtrage.`);
    } catch (error) {
        logEvent("error", "applyFilters : Erreur lors de l'application des filtres.", { error: error.message });
    }
}

export function updateFilters(results) {
    try {
        if (!Array.isArray(results)) {
            logEvent("error", "updateFilters : Résultats invalides fournis.", { results });
            return;
        }

        logEvent("info", `updateFilters : Mise à jour des filtres avec ${results.length} recettes.`);

        let updatedFilters = {
            ingredients: new Set(),
            ustensils: new Set(),
            appliances: new Set()
        };

        results.forEach(recipe => {
            recipe.ingredients?.forEach(ing => updatedFilters.ingredients.add(normalizeText(ing.ingredient)));
            recipe.ustensils?.forEach(ust => updatedFilters.ustensils.add(normalizeText(ust)));
            if (recipe.appliance) {
                updatedFilters.appliances.add(normalizeText(recipe.appliance));
            }
        });

        // Assure que `selectedFilters` contient bien des `Set()`
        if (!(selectedFilters.ingredients instanceof Set)) {
            selectedFilters.ingredients = new Set();
        }
        if (!(selectedFilters.utensils instanceof Set)) {
            selectedFilters.ustensils = new Set();
        }
        if (!(selectedFilters.appliances instanceof Set)) {
            selectedFilters.appliances = new Set();
        }

        // Met à jour les filtres sélectionnés en s'assurant qu'ils sont bien définis
        selectedFilters.ingredients = new Set(
            Array.from(selectedFilters.ingredients).filter(tag => updatedFilters.ingredients.has(tag))
        );
        selectedFilters.ustensils = new Set(
            Array.from(selectedFilters.ustensils).filter(tag => updatedFilters.ustensils.has(tag))
        );
        selectedFilters.appliances = new Set(
            Array.from(selectedFilters.appliances).filter(tag => updatedFilters.appliances.has(tag))
        );


        logEvent("success", `updateFilters : Filtres mis à jour.`);
    } catch (error) {
        logEvent("error", "updateFilters : Erreur lors de la mise à jour des filtres.", { error: error.message });
    }
}

