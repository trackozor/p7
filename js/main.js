/* ====================================================================================
/*  FICHIER          : main.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 08/02/2025
/*  DERNIÈRE MODIF.  : 24/02/2025
/*  DESCRIPTION      : Orchestration des recettes, filtres et du Benchmark Dashboard.
/* ==================================================================================== */

import { logEvent, waitForElement } from "./utils/utils.js";
import { getAllRecipes } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import { updateCounter } from "./components/count/count.js";
import { initFilters } from "./components/filterManager.js";



/* ====================================================================================
/*  I. INITIALISATION GLOBALE DE L'APPLICATION
/* ==================================================================================== */
/**
 * Initialise l'application en chargeant les recettes, en appliquant les filtres et en configurant les événements.
 *
 * Ce processus comprend :
 * 1. L'attente du chargement du DOM.
 * 2. Le chargement des recettes depuis le gestionnaire de données.
 * 3. L'affichage des recettes dans l'interface utilisateur.
 * 4. L'initialisation des filtres et des événements utilisateur.
 * 5. La vérification du mode Benchmark (pour les tests de performance).
 *
 * @async
 * @function initApplication
 * @returns {Promise<void>} Ne retourne rien mais gère les étapes d'initialisation.
 * @throws {Error} Si aucune recette n'est trouvée ou en cas d'erreur inattendue.
 */
export async function initApplication() {
    try {
        // Étape 1 : Journaliser le démarrage de l'application
        logEvent("info", "Démarrage de l'application");

        // Étape 2 : Attendre que l'élément contenant les recettes soit présent dans le DOM
        await waitForElement("#recipes-container");

        // Étape 3 : Récupérer toutes les recettes depuis le gestionnaire de données
        const recipes = await getAllRecipes();

        // Vérification : Si aucune recette n'est trouvée, lever une erreur
        if (!recipes || recipes.length === 0) {
            throw new Error("Aucune recette trouvée.");
        }
         // Mettre à jour dynamiquement le compteur après affichage des recettes
        updateCounter();
        // Étape 4 : Afficher toutes les recettes dans le conteneur prévu
        await templateManager.displayAllRecipes("#recipes-container", recipes);

        // Étape 5 : Initialiser les filtres de recherche
        await initFilters();

        // Étape 6 : Activer les écouteurs d'événements pour l'interaction utilisateur
        initEventListeners();

        

        // Étape 8 : Confirmer que l'application est bien chargée
        logEvent("success", "Application chargée avec succès !");
    } catch (error) {
        // Gestion des erreurs : Journaliser l'erreur en cas d'échec de l'initialisation
        logEvent("error", "Échec de l'initialisation de l'application.", { message: error.message });
    }
}





/* ====================================================================================
/*  DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM
/* ==================================================================================== */
document.addEventListener("DOMContentLoaded", initApplication);
