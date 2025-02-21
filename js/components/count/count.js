/* ==================================================================================== */
/*  FICHIER          : count.js                                                         */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.0                                                              */
/*  DATE DE CRÉATION : 21/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 21/02/2025                                                       */
/*  DESCRIPTION      : Gestion du compteur de recettes affichées sur la page.          */
/*                                                                                      */
/*  - Initialise le compteur et crée l'élément HTML si nécessaire.                      */
/*  - Met à jour dynamiquement le nombre de recettes affichées.                         */
/*  - Sépare la logique de comptage pour une meilleure lisibilité et réutilisabilité.  */
/* ==================================================================================== */

import { logEvent } from "../utils/utils.js";

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
            document.body.prepend(counterElement); // Peut être placé ailleurs selon la structure
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
* - Récupère et affiche le nombre actuel de recettes après filtrage.
* - Assure la gestion des erreurs pour éviter tout blocage de l'UI.
*
* @param {Array} filteredRecipes - Tableau contenant les recettes actuellement affichées.
*/
export function updateRecipeCounter(filteredRecipes) {
    try {
        // Récupère l'élément HTML du compteur dans le DOM
        const counterElement = document.getElementById("recipe-counter");

        // Vérifie si l'élément existe, sinon log une erreur et stoppe la mise à jour
        if (!counterElement) {
            logEvent("error", "updateRecipeCounter : L'élément #recipe-counter est introuvable.");
            return;
        }

        // Récupère le nombre de recettes à afficher
        const count = countRecipes(filteredRecipes);

        // Met à jour dynamiquement le texte du compteur avec la bonne pluralisation
        counterElement.textContent = `${count} recette${count > 1 ? "s" : ""} trouvée${count > 1 ? "s" : ""}`;

        // Log l'information pour le suivi de l'état du compteur
        logEvent("info", `updateRecipeCounter : ${count} recettes affichées.`);
        
    } catch (error) {
        // Enregistre une erreur en cas de problème et empêche tout crash de l'interface
        logEvent("error", "updateRecipeCounter : Erreur lors de la mise à jour du compteur.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Calcul du nombre de recettes
/*----------------------------------------------------------------*/    
/**
 * Calcule le nombre de recettes affichées après filtrage.
 *
 * - Vérifie que `filteredRecipes` est bien un tableau.
 * - Retourne `0` si l'entrée est invalide ou vide.
 * - Ne génère pas d'erreur, même avec des valeurs inattendues.
 *
 * @param {Array} filteredRecipes - Tableau contenant les recettes filtrées.
 * @returns {number} - Nombre de recettes affichées après filtrage.
 */
function countRecipes(filteredRecipes) {
    // Vérifie si l'argument `filteredRecipes` est bien un tableau.
    if (!Array.isArray(filteredRecipes)) {
        logEvent("error", "countRecipes : Paramètre invalide, un tableau est attendu.", { filteredRecipes });
        return 0; // Retourne 0 pour éviter toute erreur.
    }

    // Retourne le nombre d'éléments dans le tableau (nombre de recettes affichées).
    return filteredRecipes.length;
}
