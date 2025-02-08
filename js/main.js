/* ==================================================================================== */
/*  FICHIER          : main.js                                                          */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.2                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Fichier principal, chef d'orchestre des scripts.                 */
/*                     Il charge les recettes, initialise les composants et les écouteurs. */
/* ==================================================================================== */

import { dataManager } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import { logEvent } from "./utils/utils.js";

/* ================================================================================ 
    INITIALISATION GLOBALE DE L'APPLICATION
    Gère :
    -  Le chargement des recettes
    -  L'affichage initial des recettes
    -  L'initialisation des événements interactifs
================================================================================ */

async function initApplication() {
    try {
        logEvent("INFO", " Démarrage de l'application...");

        //  Étape 1 : Charger les recettes
        logEvent("INFO", " Chargement des recettes en cours...");
        const recipes = await dataManager.getAllRecipes();
        if (!recipes.length) {
            throw new Error("Aucune recette chargée, vérifiez le fichier JSON.");
        }
        logEvent("SUCCESS", ` ${recipes.length} recettes chargées.`);

        // Étape 2 : Afficher les recettes sur la page
        logEvent("INFO", " Affichage des recettes...");
        await templateManager.displayAllRecipes("#recipes-container", recipes);
        logEvent("SUCCESS", " Recettes affichées avec succès.");

        //  Étape 3 : Initialiser les événements utilisateur
        logEvent("INFO", " Initialisation des événements...");
        initEventListeners();
        logEvent("SUCCESS", " Événements interactifs prêts.");

        logEvent("SUCCESS", "Application chargée avec succès !");

    } catch (error) {
        // Gestion des erreurs globales
        logEvent("ERROR", "Échec de l'initialisation de l'application.", { error: error.message });
    }
}

/* ================================================================================ 
        ÉCOUTEUR D'ÉVÉNEMENT - Démarrage après chargement du DOM
   ================================================================================ */

document.addEventListener("DOMContentLoaded", initApplication);
