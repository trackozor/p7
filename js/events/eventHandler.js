/** ====================================================================================
 *  FICHIER          : eventHandler.js
 *  AUTEUR           : Trackozor
 *  VERSION          : 1.5
 *  DATE DE CRÉATION : 08/02/2025
 *  DERNIÈRE MODIF.  : 26/02/2025
 *  DESCRIPTION      : Gère les événements de recherche et de filtres sur les recettes.
 *                     - Recherche dynamique des recettes.
 *                     - Filtrage des résultats par ingrédients, ustensiles, appareils.
 *                     - Mise à jour automatique des filtres dans l'interface.
 * ==================================================================================== */

import { searchRecipesLoopNative } from "../components/search/searchloopNative.js";
import domSelectors from "../config/domSelectors.js";
import { logEvent, debounce } from "../utils/utils.js";
import { recipeFilterCache, filterRecipesByType } from "../components/filterManager.js";
import { recipesData } from "../data/dataManager.js";

const MIN_SEARCH_LENGTH = 3; // Nombre minimal de caractères pour déclencher la recherche.

/* ================================================================================ 
    GESTION DE L'ÉVÉNEMENT DE RECHERCHE 
================================================================================ */
/**
 * Gère la recherche dynamique des recettes en fonction de la saisie utilisateur.
 * 
 * Cette fonction :
 * - Vérifie que l'élément de recherche est disponible.
 * - Ignore les recherches trop courtes (< 3 caractères).
 * - Exécute une recherche en utilisant `searchRecipesLoopNative()`.
 * - Met à jour l'affichage avec les résultats obtenus.
 *
 * La recherche est **déclenchée avec un `debounce()` de 300ms** pour limiter les requêtes.
 */
export const handleSearch = debounce(async function () {
    try {
        // Enregistre l'événement indiquant le début du processus de recherche.
        logEvent("test_start", "handleSearch : Début de la recherche.");

        // Vérifie que l'élément input de recherche est bien présent dans le DOM.
        if (!domSelectors?.search?.input) {
            throw new Error("handleSearch : Élément input de recherche introuvable.");
        }

        // Récupère l'élément input et son contenu, en supprimant les espaces inutiles.
        const searchInput = domSelectors.search.input;
        const query = searchInput.value.trim();

        // Si la recherche contient moins de 3 caractères, elle est ignorée.
        if (query.length < MIN_SEARCH_LENGTH) {
            return; // Évite des recherches inutiles et améliore les performances.
        }

        // Exécute une recherche des recettes correspondant à la saisie utilisateur.
        const results = await searchRecipesLoopNative(query);

        // Vérifie que la fonction de recherche a bien retourné un tableau valide.
        if (!Array.isArray(results)) {
            throw new Error("handleSearch : Résultat de recherche invalide.");
        }

        // Met à jour l'affichage avec les résultats obtenus.
        displayResults(results);

        // Enregistre l'événement indiquant la fin de la recherche avec le nombre de résultats trouvés.
        logEvent("test_end", `handleSearch : ${results.length} résultats trouvés.`);
    } catch (error) {
        // Capture et enregistre toute erreur survenue pendant le processus de recherche.
        logEvent("error", "handleSearch : Erreur lors de la recherche.", { error: error.message });
    }
}, 300); // Applique un délai de 300ms avant d'exécuter la recherche pour éviter les requêtes excessives.

/* ================================================================================ 
    GESTION DES FILTRES 
================================================================================ */
/**
 * Gère la modification d'un filtre et met à jour les résultats affichés.
 *
 * Cette fonction :
 * - Vérifie la validité des entrées (type de filtre, valeur sélectionnée).
 * - Utilise `recipeFilterCache` pour éviter des recalculs inutiles.
 * - Applique un filtrage sur `recipesData.recipes` si aucun cache n'est disponible.
 * - Met à jour l'affichage avec les résultats filtrés.
 *
 * @param {Event} event - L'événement déclenché lors de la sélection d'un filtre.
 * @throws {Error} Si les paramètres sont invalides ou si un problème survient lors du filtrage.
 */
export async function handleFilterChange(event) {
    try {
        // Enregistre l'événement indiquant le début du processus de filtrage
        logEvent("test_start", "handleFilterChange : Détection du changement de filtre.");

        // Vérifie que l'événement et le type de filtre sont valides
        if (!event?.target?.dataset?.filterType) {
            throw new Error("handleFilterChange : Événement ou type de filtre invalide.");
        }

        // Récupère le type de filtre sélectionné (ingredient, appliance, ustensil)
        const { filterType } = event.target.dataset;

        // Récupère la valeur sélectionnée, en supprimant les espaces inutiles
        const selectedValue = event.target.value.trim();

        // Ignore le filtrage si aucune valeur n'a été sélectionnée
        if (!selectedValue) {
            return;
        }

        // Vérifie si les recettes sont bien chargées avant de procéder au filtrage
        if (!recipesData.recipes || recipesData.recipes.length === 0) {
            throw new Error("handleFilterChange : Les recettes ne sont pas encore chargées.");
        }

        // Génère une clé unique pour le cache en combinant le type de filtre et la valeur sélectionnée
        const cacheKey = `${filterType}_${selectedValue.toLowerCase()}`;

        // Vérifie si le cache contient déjà un résultat pour ce filtre
        if (recipeFilterCache.has(cacheKey)) {
            // Affiche les résultats mis en cache et évite un recalcul inutile
            displayResults(recipeFilterCache.get(cacheKey));
            logEvent("test_end", `handleFilterChange : ${recipeFilterCache.get(cacheKey).length} recettes affichées depuis le cache.`);
            return;
        }

        // Applique le filtrage sur la liste complète des recettes chargées
        const filteredRecipes = filterRecipesByType(recipesData.recipes, filterType, selectedValue);

        // Stocke le résultat dans le cache pour accélérer les prochaines recherches similaires
        recipeFilterCache.set(cacheKey, filteredRecipes);

        // Met à jour l'affichage avec les nouvelles recettes filtrées
        displayResults(filteredRecipes);

        // Enregistre un événement indiquant la fin du filtrage avec le nombre de résultats affichés
        logEvent("test_end", `handleFilterChange : ${filteredRecipes.length} recettes affichées après filtrage.`);
    } catch (error) {
        // Capture et logue toute erreur survenue pendant le processus de filtrage
        logEvent("error", "handleFilterChange : Erreur lors du filtrage.", { error: error.message });
    }
}

/* ================================================================================ 
    AFFICHAGE DES RECETTES FILTRÉES
================================================================================ */
/**
 * Affiche les résultats des recettes filtrées dans l'interface utilisateur.
 *
 * Cette fonction :
 * - Vérifie la disponibilité du conteneur des résultats.
 * - Efface les résultats précédents avant d'afficher les nouveaux.
 * - Utilise un `documentFragment` pour améliorer les performances du DOM.
 * - Gère l'affichage d'un message lorsque **aucune recette** n'est trouvée.
 *
 * @param {Array<Object>} recipes - Liste des recettes à afficher.
 * @throws {Error} En cas de problème avec le conteneur des résultats.
 */
export function displayResults(recipes) {
    try {
        // Enregistre l'événement de début d'affichage des résultats
        logEvent("test_start", `displayResults : Affichage de ${recipes.length} recettes.`);

        // Sélection du conteneur principal où afficher les résultats
        const resultsContainer = document.querySelector("#recipes-container");

        // Vérifie que l'élément est bien présent dans le DOM
        if (!resultsContainer) {
            logEvent("error", "displayResults : Conteneur de résultats introuvable.");
            return; // Évite de bloquer l'exécution du script
        }
        

        // Réinitialise le contenu pour supprimer les anciens résultats
        resultsContainer.innerHTML = "";

        // Vérifie si le tableau `recipes` est vide ou invalide
        if (!Array.isArray(recipes) || recipes.length === 0) {
            // Affiche un message informant l'utilisateur qu'aucune recette ne correspond
            resultsContainer.innerHTML = `<p class="no-results">Aucune recette ne correspond à votre recherche.</p>`;
            
            // Enregistre un événement indiquant qu'aucun résultat n'a été affiché
            logEvent("test_end", "displayResults : Aucun résultat affiché.");
            return;
        }

        // Crée un `documentFragment` pour limiter les manipulations directes du DOM
        const fragment = document.createDocumentFragment();

        // Parcours de chaque recette pour créer une carte affichable
        recipes.forEach(recipe => {
            // Création d'un élément `div` représentant une carte de recette
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-card");

            // Ajoute le titre et la description de la recette
            recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
            `;

            // Ajoute la carte au fragment pour un rendu plus performant
            fragment.appendChild(recipeCard);
        });

        // Ajoute tous les éléments en une seule opération pour éviter un reflow DOM excessif
        resultsContainer.appendChild(fragment);

        // Enregistre un événement indiquant que l'affichage des recettes s'est terminé avec succès
        logEvent("test_end", `displayResults : ${recipes.length} recettes affichées.`);
    } catch (error) {
        // Capture et enregistre toute erreur survenue lors de l'affichage des résultats
        logEvent("error", "displayResults : Erreur lors de l'affichage des résultats.", { error: error.message });
    }
}

