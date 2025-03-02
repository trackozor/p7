import { templateManager } from "../utils/templateManager.js";
import { updateCounter } from "../utils/counter.js";
import { logEvent } from "../utils/utils.js";

/**
 * Met à jour l'affichage des recettes dans la galerie.
 *
 * @param {Array} recipes - Liste des recettes filtrées.
 * @returns {void} Ne retourne rien, met à jour l'interface utilisateur.
 */
export function updateRecipes(recipes) {
    try {
        logEvent("info", `updateRecipes : Mise à jour de la galerie avec ${recipes.length} recettes.`);

        const container = document.querySelector("#recipes-container");

        // Vérification que le conteneur est présent
        if (!container) {
            logEvent("error", "updateRecipes : Conteneur de recettes introuvable.");
            return;
        }

        // Nettoyer l'affichage avant d'ajouter les nouvelles recettes
        container.innerHTML = "";

        if (recipes.length === 0) {
            container.innerHTML = "<p class='no-recipes'>Aucune recette trouvée.</p>";
            logEvent("warn", "updateRecipes : Aucune recette trouvée.");
        } else {
            templateManager.displayAllRecipes("#recipes-container", recipes);
        }

        // Mise à jour du compteur après affichage
        updateCounter(recipes.length);
    } catch (error) {
        logEvent("error", "updateRecipes : Erreur lors de la mise à jour des recettes.", { error: error.message });
    }
}
