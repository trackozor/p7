/* ====================================================================================
/*  FICHIER          : count.js                                                         */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.1                                                              */
/*  DATE DE CRÉATION : 21/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 26/02/2025                                                       */
/*  DESCRIPTION      : Gestion du compteur de recettes affichées sur la page.          */
/*                                                                                      */
/*  - Initialise le compteur et crée l'élément HTML si nécessaire.                      */
/*  - Met à jour dynamiquement le nombre de recettes affichées.                         */
/*  - Sépare la logique de comptage pour une meilleure lisibilité et réutilisabilité.  */
/* ==================================================================================== */

import { logEvent } from "../../utils/utils.js";
import { templateManager } from "../../data/templateManager.js";

/*------------------------------------------------------------------
/*   Initialisation du compteur
/*------------------------------------------------------------------*/

/**
 * Initialise le compteur de recettes.
 *
 * - Vérifie si l'élément HTML existe, sinon le crée dynamiquement.
 * - Affiche un compteur initial (0 recettes trouvées).
 */
export function initCount() {
    try {
        let counterElement = document.getElementById("recipe-counter");

        // Si l'élément n'existe pas, on le crée dynamiquement
        if (!counterElement) {
            counterElement = document.createElement("h2");
            counterElement.id = "recipe-counter";
            counterElement.textContent = "0 recette trouvée";
            document.body.prepend(counterElement);
        }

        logEvent("success", "initCount : Compteur de recettes initialisé.");
    } catch (error) {
        logEvent("error", "initCount : Erreur lors de l'initialisation du compteur.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Mise à jour du compteur
/*----------------------------------------------------------------*/

/**
 * Met à jour dynamiquement le texte du compteur de recettes affichées.
 *
 * - Vérifie l'existence de l'élément du compteur avant mise à jour.
 * - Récupère et affiche le nombre actuel de recettes via `templateManager.displayAllRecipes()`.
 * - Assure la gestion des erreurs pour éviter tout blocage de l'UI.
 */
export async function updateCounter() {
    try {
        const counterElement = document.getElementById("recipe-count-container");

        if (!counterElement) {
            logEvent("error", "updateCounter : L'élément #recipe-counter est introuvable.");
            return;
        }

        // Récupérer le nombre de recettes affichées via `displayAllRecipes`
        const recipeCount = await templateManager.displayAllRecipes("#recipes-list");

        // Mise à jour du texte du compteur
        counterElement.textContent = `${recipeCount} recette${recipeCount > 1 ? "s" : ""} trouvée${recipeCount > 1 ? "s" : ""}`;

        logEvent("info", `updateCounter : ${recipeCount} recettes affichées.`);
        
    } catch (error) {
        logEvent("error", "updateCounter : Erreur lors de la mise à jour du compteur.", { error: error.message });
    }
}
