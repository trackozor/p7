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

const filters = {
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
export async function  initFilters() {
    try {
        // Étape 1 : Log de l'initialisation des filtres
        logEvent("info", "initFilters : Démarrage du chargement des recettes...");

        // Étape 2 : Récupération des recettes depuis le gestionnaire de données
        allRecipes =  dataManager.getAllRecipes();
        if (!Array.isArray(allRecipes) || allRecipes.length === 0) {
            throw new Error("Aucune recette disponible.");
        }
        logEvent("SUCCESS", `initFilters : ${allRecipes.length} recettes chargées.`);

        // Étape 3 : Vérification de la validité des données reçues
        if (!Array.isArray(allRecipes)) {
            throw new TypeError("Les données des recettes ne sont pas sous forme de tableau.");
        }
        if (this.allRecipes.length === 0) {
            throw new Error("Aucune recette disponible.");
        }

        // Étape 4 : Log du succès du chargement des recettes
        logEvent("success", `initFilters : ${allRecipes.length} recettes chargées avec succès.`);

        // Étape 5 : Génération des données de filtres en fonction des recettes disponibles
            generateFilterData();

        
        // Étape 6 : affichage des résultats
        templateManager.displayResults(allRecipes);
            displayFilterUI();
        } catch (error) {
            // Étape 6 : Gestion des erreurs et journalisation détaillée
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
            // Étape 1 : Initialisation des ensembles pour stocker les valeurs uniques
            const ingredientsSet = new Set();
            const appliancesSet = new Set();
            const utensilsSet = new Set();

            // Étape 2 : Vérification des recettes avant de procéder
            if (!Array.isArray(this.allRecipes) || this.allRecipes.length === 0) {
                throw new Error("Aucune recette disponible pour générer les filtres.");
            }

            // Étape 3 : Extraction et normalisation des valeurs uniques
            this.allRecipes.forEach(recipe => {
                // Ajout des ingrédients uniques
                if (Array.isArray(recipe.ingredients)) {
                    recipe.ingredients.forEach(ing => {
                        if (ing.ingredient) {
                            ingredientsSet.add(normalizeText(ing.ingredient));
                        }
                    });
                }

                // Ajout des appareils uniques
                if (recipe.appliance) {
                    appliancesSet.add(normalizeText(recipe.appliance));
                }

                // Ajout des ustensiles uniques
                if (Array.isArray(recipe.ustensils)) {
                    recipe.ustensils.forEach(ust => {
                        if (ust) {
                            utensilsSet.add(normalizeText(ust));
                        }
                    });
                }
            });

            // Étape 4 : Création des sections de filtres dans l'UI
            createFilterSection ();
            createDropdownContainer ();

            // Étape 5 : Log de la réussite de la génération des filtres
            logEvent("success", "generateFilterData : Filtres générés avec succès.");

    } catch (error) {
        // Étape 6 : Gestion des erreurs et journalisation détaillée
        logEvent("error", "generateFilterData : Erreur lors de la génération des filtres.", { error: error.message });
    }
}



/* ==================================================================================== */
/*  CRÉATION DES FILTRES (DROPDOWN)                                                    */
/* ==================================================================================== */

/**
* Crée dynamiquement une section de filtre avec un dropdown, une recherche et un scroll.
*
* - Vérifie si le conteneur parent est présent avant de créer la section.
* - Génère un bouton pour afficher le dropdown.
* - Génère dynamiquement les options à partir des données disponibles.
* - Ajoute un champ de recherche pour filtrer les options en temps réel.
* - Associe les événements nécessaires pour gérer l'ouverture et la fermeture.
*
* @param {string} parentSelector - Sélecteur CSS du conteneur parent.
* @param {string} title - Titre du filtre affiché.
* @param {string} filterType - Type de filtre (`ingredients`, `appliances`, `utensils`).
* @param {Set} dataSet - Ensemble des valeurs uniques pour ce filtre.
*/
function  createFilterSection(parentSelector, title, filterType, dataSet) {
    try {
            // Vérification des paramètres avant d'exécuter le code
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
            filterButton.innerHTML = `${title} <i class="fas fa-chevron-down"></i>`;

            // Génération du menu déroulant
            const dropdownContainer = this.createDropdownContainer(filterType, dataSet);

            // Ajout des éléments au DOM
            filterContainer.appendChild(filterButton);
            filterContainer.appendChild(dropdownContainer);
            parent.appendChild(filterContainer);

            // Association des événements pour la gestion du dropdown
            this.setupDropdownEvents(filterButton, dropdownContainer);

            logEvent("success", `createFilterSection : Section de filtre "${title}" générée avec succès.`);
    } catch (error) {
        logEvent("error", "createFilterSection : Erreur lors de la création de la section de filtre.", { error: error.message });
    }
}


/**
     * Crée un conteneur de dropdown avec un champ de recherche et une liste d'options.
     * 
     * - Vérifie la validité des paramètres avant exécution.
     * - Génère dynamiquement une liste d'options avec une recherche intégrée.
     * - Utilise un `DocumentFragment` pour optimiser la performance.
     * - Associe un événement de recherche en temps réel.
     * 
     * @param {string} filterType - Type de filtre (`ingredients`, `appliances`, `utensils`).
     * @param {Set} dataSet - Ensemble des valeurs de filtre uniques.
     * @returns {HTMLElement} Conteneur du dropdown.
     */
function createDropdownContainer(filterType, dataSet) {
    try {
            // Vérification des paramètres
            if (!filterType || typeof filterType !== "string") {
                logEvent("error", "createDropdownContainer : Paramètre `filterType` invalide.", { filterType });
                return null;
            }
            if (!(dataSet instanceof Set) || dataSet.size === 0) {
                logEvent("warning", `createDropdownContainer : Ensemble de données vide pour ${filterType}.`);
                return null;
            }

            logEvent("info", `createDropdownContainer : Génération du dropdown pour "${filterType}".`);

            // Création du conteneur principal du dropdown
            const dropdownContainer = document.createElement("div");
            dropdownContainer.classList.add("filter-dropdown", "hidden");
            dropdownContainer.dataset.filter = filterType;

            // Champ de recherche
            const searchInput = document.createElement("input");
            searchInput.type = "text";
            searchInput.classList.add("filter-search");
            searchInput.placeholder = `Rechercher ${filterType.toLowerCase()}...`;

            // Conteneur de la liste d'options
            const listContainer = document.createElement("ul");
            listContainer.classList.add("filter-options");
            listContainer.style.maxHeight = "250px";
            listContainer.style.overflowY = "auto";

            // Optimisation avec un DocumentFragment
            const fragment = document.createDocumentFragment();

            // Création et ajout des options à la liste
            dataSet.forEach(item => {
                const listItem = document.createElement("li");
                listItem.dataset.value = item;
                listItem.textContent = item.charAt(0).toUpperCase() + item.slice(1);
                listItem.addEventListener("click", () => this.updateMultiFilter(filterType, item));
                fragment.appendChild(listItem);
            });

            listContainer.appendChild(fragment);

            // Ajout des éléments au conteneur principal
            dropdownContainer.appendChild(searchInput);
            dropdownContainer.appendChild(listContainer);

            // Ajout de l'événement de recherche dynamique
            searchInput.addEventListener("input", () => this.filterDropdownOptions(searchInput, listContainer));

            logEvent("success", `createDropdownContainer : Dropdown pour "${filterType}" généré avec succès.`);
            return dropdownContainer;
    } catch (error) {
        logEvent("error", "createDropdownContainer : Erreur lors de la création du dropdown.", { error: error.message });
        return null;
    }
}

/**
     * Filtre dynamiquement les options du dropdown en fonction de la saisie utilisateur.
     *
     * - Vérifie la validité des paramètres avant d'exécuter le filtrage.
     * - Utilise `display: none` pour masquer les éléments ne correspondant pas à la recherche.
     * - Ajoute un `logEvent()` pour tracer les erreurs et le processus de filtrage.
     *
     * @param {HTMLInputElement} searchInput - Champ de recherche du dropdown.
     * @param {HTMLElement} listContainer - Conteneur de la liste d'options.
     */
function filterDropdownOptions(searchInput, listContainer) {
    try {
            // Vérification des paramètres
            if (!(searchInput instanceof HTMLInputElement)) {
                logEvent("error", "filterDropdownOptions : Paramètre `searchInput` invalide.", { searchInput });
                return;
            }
            if (!(listContainer instanceof HTMLElement)) {
                logEvent("error", "filterDropdownOptions : Paramètre `listContainer` invalide.", { listContainer });
                return;
            }

            // Normalisation de la saisie utilisateur
            const query = searchInput.value.toLowerCase().trim();
            logEvent("info", `filterDropdownOptions : Filtrage des options avec la requête "${query}".`);

            // Filtrage des options
            const options = listContainer.querySelectorAll("li");
            let matchesFound = 0;

            options.forEach(item => {
                const matches = item.textContent.toLowerCase().includes(query);
                item.style.display = matches ? "block" : "none";
                if (matches) {
                matchesFound++;
                }
            });

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
        const keyword = this.filters.searchKeyword ? normalizeText(this.filters.searchKeyword) : null;

        const filteredRecipes = this.allRecipes.filter(recipe => {
            // Vérifie si le mot-clé est présent dans le nom, la description ou les ingrédients
            const matchesKeyword = keyword
                ? normalizeText(recipe.name).includes(keyword) ||
                normalizeText(recipe.description).includes(keyword) ||
                (recipe.ingredients && recipe.ingredients.some(ing => normalizeText(ing.ingredient).includes(keyword)))
                : true;

            // Vérifie si la recette correspond à tous les filtres actifs
            const matchesFilters = FILTER_TYPES.every(type => {
                const filterValues = this.filters[type];

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

        logEvent("SUCCESS", `applyFilters : ${filteredRecipes.length} recettes affichées après filtrage.`);
    } catch (error) {
        logEvent("ERROR", "applyFilters : Erreur lors de l'application des filtres.", { error: error.message });
    }
}
/* ================================================================================ */
/*  EXPORT DU MODULE `FilterManager`                                                */
/* ================================================================================ */

