/* ==================================================================================== */
/*  FICHIER          : main.js                                                          */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.4                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Orchestration des recettes, filtres et Benchmark Dashboard.      */
/* ==================================================================================== */

import { dataManager } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import { logEvent } from "./utils/utils.js";
import BenchmarkDashboard from "./utils/benchmark-dashboard.js";
import { filterManager } from "./components/filterManager.js";

/* ==================================================================================== */
/*    INITIALISATION GLOBALE DE L'APPLICATION                                          */
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
async function initApplication() {
    try {
        logEvent("info", "démarrage de l'application");

        /** 
         * Étape 1 : Chargement des recettes 
         * Récupération des recettes à partir du gestionnaire de données.
         */
        logEvent("info", "chargement des recettes");
        const recipes = await dataManager.getAllRecipes(); // Ajout de `await` pour garantir un retour de promesse
        
        if (!recipes || recipes.length === 0) {
            throw new Error("aucune recette trouvée.");
        }
        logEvent("success", `${recipes.length} recettes chargées`);

        /** 
         * Étape 2 : Initialisation des filtres 
         * Génération et application des filtres basés sur les recettes chargées.
         */
        logEvent("info", "initialisation des filtres");
        await filterManager.initFilters();
        logEvent("success", "filtres générés et appliqués");

        /** 
         * Étape 3 : Affichage des recettes après application des filtres 
         * Affiche toutes les recettes filtrées dans le conteneur défini.
         */
        logEvent("info", "affichage des recettes");
        await templateManager.displayAllRecipes("#recipes-container", recipes);
        logEvent("success", "recettes affichées avec succès");

        /** 
         * Étape 4 : Initialisation des événements utilisateur 
         * Active les écouteurs d'événements pour permettre l'interaction.
         */
        logEvent("info", "initialisation des événements");
        initEventListeners();
        logEvent("success", "événements interactifs prêts");

        /** 
         * Étape 5 : Vérification et activation du mode Benchmark si nécessaire 
         */
        checkBenchmarkMode();

        logEvent("success", "application chargée avec succès");
    } catch (error) {
        logEvent("error", "échec de l'initialisation de l'application", { message: error.message });
    }
}


/* ==================================================================================== */
/*    DÉTECTION DU MODE BENCHMARK                                                      */
/* ==================================================================================== */

/**
 * Vérifie si le mode Benchmark doit être activé et gère son affichage.
 * - Écoute les entrées clavier pour détecter les commandes d'activation.
 * - Vérifie l'accès administrateur avant d'activer le Benchmark.
 * - Active le suivi des performances sur les clics d'éléments de la page.
 * 
 * @function checkBenchmarkMode
 */
function checkBenchmarkMode() {
    const searchInput = document.getElementById("search");
    let benchmarkEnabled = false;
    let benchmarkInstance = null;

    if (!searchInput) {
        logEvent("error", "barre de recherche introuvable. benchmark désactivé.");
        return;
    }

    logEvent("info", "surveillance de la barre de recherche pour activer le benchmark");

    /**
     * Détecte la saisie d'une commande spéciale dans la barre de recherche
     * pour activer le mode Benchmark.
     */
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const query = searchInput.value.trim();
            if (query === "/benchmark" || query === "!benchmark") {
                event.preventDefault();
                requestAdminAccess();
            }
        }
    });

    /**
     * Demande un accès administrateur via un mot de passe avant d'activer le mode Benchmark.
     * 
     * @function requestAdminAccess
     */
    function requestAdminAccess() {
        logEvent("info", "demande de mot de passe admin");
        createPasswordModal((isAuthorized) => {
            if (isAuthorized) {
                enableBenchmarkMode();
            } else {
                alert("accès refusé.");
                logEvent("error", "échec de l'authentification admin");
            }
        });
    }

    /**
     * Active le mode Benchmark et affiche le tableau de bord des performances.
     * 
     * @function enableBenchmarkMode
     */
    function enableBenchmarkMode() {
        if (!benchmarkEnabled) {
            benchmarkEnabled = true;
            benchmarkInstance = new BenchmarkDashboard();
            benchmarkInstance.showDashboard();
            alert("mode benchmark activé.");
            logEvent("success", "benchmark dashboard activé avec succès");
        } else {
            logEvent("info", "le mode benchmark est déjà activé");
        }
    }

    /**
     * Suivi des performances en enregistrant les interactions utilisateur.
     * 
     * @listens click - Capture les clics sur les éléments de la page.
     */
    document.body.addEventListener("click", (event) => {
        if (benchmarkEnabled && benchmarkInstance && event.target) {
            benchmarkInstance.trackElement(event.target);
        }
    });
}


/* ==================================================================================== */
/*    DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM                                    */
/* ==================================================================================== */

document.addEventListener("DOMContentLoaded", initApplication);
