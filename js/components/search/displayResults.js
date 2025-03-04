/** ====================================================================================
 * FICHIER          : updateRecipes.js
 * AUTEUR           : Trackozor
 * VERSION          : 1.2
 * DESCRIPTION      : Gestion de l'affichage des recettes dans la galerie.
 *                   - Nettoyage et mise à jour dynamique des recettes affichées.
 *                   - Gestion des erreurs en cas de conteneur manquant.
 *                   - Mise à jour du compteur de recettes après filtrage.
 * ==================================================================================== */

import { templateManager } from "../../data/templateManager.js";
import { updateCounter } from "../count/count.js";
import { logEvent } from "../../utils/utils.js";

/** ====================================================================================
 *  FONCTION PRINCIPALE : MISE À JOUR DE L'AFFICHAGE DES RECETTES
 * ==================================================================================== */
export function updateRecipes(recipes) {
    try {
        logEvent("test_start", `updateRecipes : Début de la mise à jour avec ${recipes.length} recette(s).`);

        // Vérification que la fonction est bien exécutée
        console.log("updateRecipes appelée avec :", recipes);

        // Sélection du conteneur principal de la galerie
        const container = document.querySelector("#recipes-container");

        // Vérification que le conteneur existe dans le DOM
        if (!container) {
            logEvent("error", "updateRecipes : Conteneur de recettes introuvable.");
            console.log("Erreur : Le conteneur #recipes-container est introuvable.");
            return;
        }
        console.log("Conteneur trouvé :", container);

        // Nettoyer l'affichage avant d'ajouter les nouvelles recettes
        container.innerHTML = "";

        // Vérification si aucune recette n'a été trouvée
        if (recipes.length === 0) {
            container.innerHTML = "<p class='no-recipes'>Aucune recette trouvée.</p>";
            logEvent("warn", "updateRecipes : Aucune recette trouvée.");
            console.log("Aucune recette trouvée.");
        } else {
            // Vérification des recettes avant affichage
            console.log("Recettes envoyées au templateManager :", recipes);

            // Mise à jour dynamique des recettes dans le conteneur
            templateManager.displayAllRecipes("#recipes-container", recipes);
            logEvent("success", `updateRecipes : Affichage mis à jour avec ${recipes.length} recette(s).`);
        }

        // Mise à jour du compteur de recettes affichées
        updateCounter(recipes.length);
        logEvent("info", `updateRecipes : Mise à jour du compteur (${recipes.length} recette(s) affichée(s)).`);
        console.log("Compteur mis à jour :", recipes.length);

        logEvent("test_end", "updateRecipes : Mise à jour terminée avec succès.");
    } catch (error) {
        logEvent("error", "updateRecipes : Erreur lors de la mise à jour des recettes.", { error: error.message });
        console.error("Erreur dans updateRecipes :", error);
    }
}

