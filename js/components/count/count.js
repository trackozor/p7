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

/*------------------------------------------------------------------
/*   Initialisation du compteur
/*------------------------------------------------------------------*/
/**
 * Initialise le compteur de recettes.
 *
 * - Vérifie si l'élément HTML `#recipe-counter` existe.
 * - Si l'élément n'existe pas, le crée dynamiquement et l'ajoute en début de `body`.
 * - Affiche un compteur initial à `0 recette trouvée`.
 * - Journalise les étapes clés avec `logEvent()`.
 */
export function initCount() {
    try {
        logEvent("test_start_count", "initCount : Vérification de l'existence du compteur de recettes.");

        // Récupération du compteur dans le DOM
        let counterElement = document.getElementById("recipe-counter");

        // Si l'élément n'existe pas, on le crée dynamiquement
        if (!counterElement) {
            logEvent("warn", "initCount : Compteur introuvable, création d'un nouvel élément.");

            counterElement = document.createElement("h2");
            counterElement.id = "recipe-counter";
            counterElement.textContent = "0 recette ";

            // Ajoute l'élément en haut du `body`
            document.body.prepend(counterElement);

            logEvent("success", "initCount : Nouveau compteur de recettes créé et ajouté au DOM.");
        } else {
            logEvent("info", "initCount : Compteur de recettes déjà présent dans le DOM.");
        }

        logEvent("test_end_count", "initCount : Compteur de recettes initialisé avec succès.");
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
 * - Vérifie l'existence de l'élément du compteur avant la mise à jour.
 * - Récupère et affiche le nombre actuel de recettes via `templateManager.displayAllRecipes()`.
 * - Assure une gestion des erreurs robuste pour éviter tout blocage de l'UI.
 */
export function updateCounter() {
    try {
        logEvent("test_start_count", "updateCounter : Début de la mise à jour du compteur.");

        // Récupération du compteur dans le DOM
        const counterElement = document.getElementById("recipe-count-container");

        // Vérifie si l'élément du compteur est présent
        if (!counterElement) {
            console.error(" updateCounter : L'élément #recipe-count-container est introuvable.");
            logEvent("error", "updateCounter : L'élément #recipe-count-container est introuvable.");
            return;
        }

        // Compter le nombre de recettes affichées dans le conteneur principal
        const recipeCards = document.querySelectorAll("#recipes-container .recipe-card");
        const recipeCount = recipeCards.length;

        // Mise à jour du texte du compteur
        counterElement.textContent = `${recipeCount} recette${recipeCount !== 1 ? "s" : ""}`;

        logEvent("test_end_count", `updateCounter : ${recipeCount} recette(s) affichée(s).`);
    } catch (error) {
        logEvent("error", " updateCounter : Erreur lors de la mise à jour du compteur.", { error: error.message });
    }
}


