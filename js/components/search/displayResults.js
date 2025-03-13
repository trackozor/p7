/** ====================================================================================
 * FICHIER          : updateRecipes.js
 * AUTEUR           : Trackozor
 * VERSION          : 1.2
 * DESCRIPTION      : Gestion de l'affichage des recettes dans la galerie.
 *                   - Nettoyage et mise à jour dynamique des recettes affichées.
 *                   - Gestion des erreurs en cas de conteneur manquant.
 *                   - Mise à jour du compteur de recettes après filtrage.
 * ==================================================================================== */

import { RecipeFactory } from "../factory/recipeFactory.js";
import { updateCounter } from "../count/count.js";
import { logEvent } from "../../utils/utils.js";

/* ====================================================================================
/*                 MISE À JOUR DE L'AFFICHAGE DES RECETTES FILTRÉES
/* ==================================================================================== */
/**
 * Met à jour dynamiquement l'affichage des recettes dans la galerie.
 * - Vérifie l'existence du conteneur des recettes avant de modifier le DOM.
 * - Nettoie l'affichage précédent pour éviter les doublons.
 * - Affiche un message si aucune recette ne correspond aux critères de recherche.
 * - Utilise `displayFilteredRecipes` pour insérer les nouvelles recettes.
 * - Met à jour le compteur des recettes affichées.
 *
 * @param {Array<Object>} recipes - Liste des recettes à afficher.
 */
export function updateRecipes(recipes) {
    try {
        logEvent("test_start", `updateRecipes : Début de la mise à jour avec ${recipes.length} recette(s).`);
        
        // Vérification et affichage des recettes reçues dans la console pour le débogage
        console.log("updateRecipes appelée avec :", recipes);

        // Sélectionne le conteneur principal de la galerie des recettes
        const container = document.querySelector("#recipes-container");

        // Vérifie que le conteneur existe dans le DOM avant d'y insérer des éléments
        if (!container) {
            logEvent("error", "updateRecipes : Conteneur de recettes introuvable.");
            console.error("Erreur : Le conteneur #recipes-container est introuvable.");
            return;
        }
        console.log("Conteneur trouvé :", container);

        // Vide le contenu du conteneur avant d'y insérer de nouvelles recettes
        container.innerHTML = "";
        container.offsetHeight; // Force un recalcul du DOM pour éviter d'éventuels problèmes d'affichage

        // Vérifie si aucune recette ne correspond aux critères de recherche
        if (recipes.length === 0) {
            container.innerHTML = "<p class='no-recipes'>Aucune recette trouvée.</p>";
            logEvent("warn", "updateRecipes : Aucune recette trouvée.");
            console.warn("Aucune recette trouvée.");
        } else {
            // Affichage des recettes dans la console pour vérification avant insertion
            console.log("Recettes envoyées à displayFilteredRecipes :", recipes);

            // Utilisation de `displayFilteredRecipes` pour insérer les nouvelles recettes
            displayFilteredRecipes("#recipes-container", recipes);
            logEvent("success", `updateRecipes : Affichage mis à jour avec ${recipes.length} recette(s).`);
        }

        // Mise à jour du compteur indiquant le nombre de recettes affichées
        updateCounter(recipes.length);
        logEvent("info", `updateRecipes : Mise à jour du compteur (${recipes.length} recette(s) affichée(s)).`);
        console.log("Compteur mis à jour :", recipes.length);

        logEvent("test_end", "updateRecipes : Mise à jour terminée avec succès.");
    } catch (error) {
        logEvent("error", "updateRecipes : Erreur lors de la mise à jour des recettes.", { error: error.message });
        console.error("Erreur dans updateRecipes :", error);
    }
}

/* ====================================================================================
/*                  AFFICHAGE DES RECETTES FILTRÉES DANS LE CONTENEUR
/* ==================================================================================== */
/**
 * Affiche uniquement les recettes filtrées dans le conteneur donné.
 * - Vérifie la présence du conteneur avant d'y insérer du contenu.
 * - Utilise `RecipeFactory` pour générer les cartes de recettes.
 * - Nettoie le conteneur avant d'ajouter les nouvelles recettes.
 * - Optimise les performances en utilisant un `DocumentFragment` pour éviter les reflows inutiles.
 *
 * @param {string} containerSelector - Sélecteur du conteneur où afficher les recettes.
 * @param {Array<Object>} recipes - Liste des recettes filtrées à afficher.
 */
export function displayFilteredRecipes(containerSelector, recipes) {
    try {
        logEvent("info", `displayFilteredRecipes : Début de l'affichage de ${recipes.length} recette(s).`);

        // Sélectionne le conteneur où afficher les recettes
        const container = document.querySelector(containerSelector);

        // Vérification si le conteneur est bien présent dans le DOM
        if (!container) {
            throw new Error(`Le conteneur ${containerSelector} est introuvable.`);
        }

        // Création d'un fragment pour optimiser l'insertion dans le DOM et éviter les reflows inutiles
        const fragment = document.createDocumentFragment();

        // Parcourt la liste des recettes et génère leurs cartes HTML
        recipes.forEach(recipeData => {
            try {
                const recipe = RecipeFactory(recipeData);

                // Vérifie si la fabrique de recette retourne un objet valide
                if (!recipe || typeof recipe.generateCard !== "function") {
                    logEvent("error", "RecipeFactory a retourné une valeur invalide.", { recipeData });
                    return;
                }

                // Génère la carte HTML pour la recette
                const recipeCard = recipe.generateCard();

                // Vérifie si l'élément retourné est bien une carte HTML valide
                if (!(recipeCard instanceof HTMLElement)) {
                    logEvent("error", "generateCard() n'a pas retourné un élément valide.", { recipeData });
                    return;
                }

                // Ajoute la carte de recette au fragment
                fragment.appendChild(recipeCard);
            } catch (error) {
                logEvent("error", "displayFilteredRecipes : Erreur lors de la création d'une recette.", { 
                    error: error.message, 
                    recipeData 
                });
            }
        });

        // Vide le conteneur avant d'y insérer les nouvelles cartes de recettes
        container.innerHTML = "";
        container.appendChild(fragment);

        logEvent("success", `displayFilteredRecipes : ${recipes.length} recettes affichées avec succès.`);
    } catch (error) {
        logEvent("error", "displayFilteredRecipes : Erreur lors de l'affichage des recettes filtrées.", { 
            error: error.message 
        });
    }
}