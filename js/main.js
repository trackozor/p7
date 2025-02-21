/* ==================================================================================== */
/*  FICHIER          : main.js                                                          */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.4                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Orchestration des recettes, filtres et Benchmark Dashboard.      */
/* ==================================================================================== */

import {  logEvent, waitForElement, debounce } from "./utils/utils.js";
import { dataManager } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import BenchmarkDashboard from "./utils/benchmark-dashboard.js";
import { initFilters } from "./components/filterManager.js";
import {createPasswordModal} from "./components/factory/modalFactory.js";


/* ==================================================================================== */
/*  I.  INITIALISATION GLOBALE DE L'APPLICATION                                          */
/* ==================================================================================== */

/**
 * Initialise l'application en suivant les étapes suivantes :
 * 1. Chargement des recettes depuis le gestionnaire de données.
 * 2. Initialisation des filtres basés sur les recettes chargées.
 * 3. Affichage des recettes filtrées dans le conteneur principal.
 * 4. Mise en place des événements utilisateur pour l'interaction.
 * 5. Vérification et activation du mode Benchmark si nécessaire.
 * 
 * @async
 * @function initApplication
 * @throws {Error} Si aucune recette n'est trouvée ou si une étape échoue.
 */
export async function initApplication() {
    try {
        logEvent("info", "Démarrage de l'application");

        /** =======================================================
         * Étape 1 : Attendre que le DOM soit prêt
         * =======================================================
         */
        await waitForElement("#recipes-container");
        logEvent("success", "DOM chargé et prêt.");

        /** =======================================================
         * Étape 2 : Chargement des recettes
         * =======================================================
         */
        logEvent("info", "Chargement des recettes...");
        const recipes = await dataManager.getAllRecipes();

        if (!recipes || recipes.length === 0) {
            throw new Error("Aucune recette trouvée.");
        }
        logEvent("success", `${recipes.length} recettes chargées.`);

        /** =======================================================
         * Étape 3 : Initialisation des filtres
         * =======================================================
         */
        logEvent("info", "Initialisation des filtres...");
        await initFilters();
        logEvent("success", "Filtres générés et appliqués.");

        /** =======================================================
         * Étape 4 : Affichage des recettes
         * =======================================================
         */
        logEvent("info", "Affichage des recettes...");
        await templateManager.displayAllRecipes("#recipes-container", recipes);
        logEvent("success", "Recettes affichées avec succès.");

        /** =======================================================
         * Étape 5 : Initialisation des événements utilisateur
         * =======================================================
         */
        logEvent("info", "Initialisation des événements...");
        initEventListeners();
        logEvent("success", "Événements interactifs prêts.");

        /** =======================================================
         * Étape 6 : Vérification du mode Benchmark
         * =======================================================
         */
        checkBenchmarkMode();

        logEvent("success", "Application chargée avec succès !");
    } catch (error) {
        logEvent("error", "Échec de l'initialisation de l'application.", { message: error.message });
    }
}



/** ====================================================================================
 * II. DÉTECTION DU MODE BENCHMARK
 * ==================================================================================== */

/**
 * Vérifie si le mode Benchmark doit être activé et gère son affichage.
 * - Surveille le bouton de recherche pour détecter la commande `/benchmark`.
 * - Vérifie si l'utilisateur a saisi `/benchmark` ou `!benchmark` dans la barre de recherche.
 * - Demande une authentification avant d'activer le mode Benchmark.
 * - Active le suivi des interactions utilisateur en mode Benchmark.
 */
let benchmarkEnabled = false;
let benchmarkInstance = null;

/**
 * Vérifie si le mode Benchmark doit être activé via une commande spécifique.
 * Associe un écouteur d'événement au bouton de recherche.
 */
export function checkBenchmarkMode() {
    const searchInput = document.getElementById("search");
    const searchButton = document.getElementById("search-btn");

    /** ============================
     *  Validation des éléments du DOM
     * ============================ */
    if ( !searchButton) {
        logEvent("error", "Élément bouton de recherche ou champ de recherche introuvable.");
        return;
    }

    logEvent("info", "Surveillance du bouton de recherche pour détecter le mode Benchmark.");

    searchButton.addEventListener("click", (event) => {
        event.preventDefault(); // Empêche l'action par défaut du bouton

        try {
            const query = searchInput.value.trim();

            if (query === "/benchmark" || query === "!benchmark") {
                logEvent("info", "Commande Benchmark détectée. Affichage de la modale.");
                createPasswordModal();
            } else {
                logEvent("info", `Recherche normale déclenchée : ${query}`);
                triggerNormalSearch(query);
            }
        } catch (error) {
            logEvent("error", "Erreur lors de la détection du mode Benchmark", { error: error.message });
        }
    });
}

/**
 * Demande une authentification administrateur pour activer le mode Benchmark.
 */

export function requestAdminAccess() {
    try {
        logEvent("info", "🔒 Demande d'authentification pour le mode Benchmark.");
        createPasswordModal(); // Affiche la modale sans callback
    } catch (error) {
        logEvent("error", "❌ Erreur lors de la demande d'authentification", { error: error.message });
    }
}

/**
 * Active le mode Benchmark et affiche le tableau de bord des performances.
 */
export function enableBenchmarkMode() {
    try {
        if (!benchmarkEnabled) {
            benchmarkEnabled = true;
            benchmarkInstance = BenchmarkDashboard();
            benchmarkInstance.showDashboard(); // Affichage du Benchmark
            alert("Mode Benchmark activé.");
            logEvent("success", "Benchmark Dashboard activé avec succès.");
        } else {
            logEvent("info", "Le mode Benchmark est déjà activé.");
        }
    } catch (error) {
        logEvent("error", "Erreur lors de l'activation du mode Benchmark", { error: error.message });
    }
}

/**
 * Suivi des performances en enregistrant les interactions utilisateur.
 */
document.body.addEventListener("click", (event) => {
    try {
        if (benchmarkEnabled && benchmarkInstance && event.target) {
            benchmarkInstance.trackElement(event.target);
        }
    } catch (error) {
        logEvent("error", "Erreur lors du suivi des interactions utilisateur", { error: error.message });
    }
});

/**
 * Gère la recherche normale si ce n'est pas une commande Benchmark.
 * @param {string} query - La requête de recherche saisie par l'utilisateur.
 */ 
export function triggerNormalSearch(query) {
    try {
        if (typeof performSearch === "function") {
            performSearch(query);
        } else {
            logEvent("warning", "Fonction performSearch non définie, la recherche ne peut pas être effectuée.");
        }
    } catch (error) {
        logEvent("error", "Erreur lors de l'exécution de la recherche", { error: error.message });
    }
}


/* ==================================================================================== */
/*    DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM                                    */
/* ==================================================================================== */

document.addEventListener("DOMContentLoaded", initApplication);
