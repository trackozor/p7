/* ==================================================================================== */
/*  FICHIER          : main.js                                                          */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.4                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Orchestration des recettes, filtres et Benchmark Dashboard.      */
/* ==================================================================================== */

import { logEvent } from "./utils/utils.js";
import { dataManager } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import BenchmarkDashboard from "./utils/benchmark-dashboard.js";
import { filterManager } from "./components/filterManager.js";

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
async function initApplication() {
    try {
        logEvent("info", "démarrage de l'application");

        /** =====================================================
         *  Étape 1 : Chargement des recettes 
         *  ======================================================
         * Récupération des recettes à partir du gestionnaire de données.
         */
        logEvent("info", "chargement des recettes");
        const recipes =  dataManager.getAllRecipes(); 
        
        if (!recipes || recipes.length === 0) {
            throw new Error("aucune recette trouvée.");
        }
        logEvent("success", `${recipes.length} recettes chargées`);

        /** ============================================================ 
         *  Étape 2 : Initialisation des filtres 
         *  ============================================================
         * Génération et application des filtres basés sur les recettes chargées.
         */
        logEvent("info", "initialisation des filtres");
        await filterManager.initFilters();
        logEvent("success", "filtres générés et appliqués");

        /** ==============================================================
         *  Étape 3 : Affichage des recettes après application des filtres
         *  ============================================================== 
         * Affiche toutes les recettes filtrées dans le conteneur défini.
         */
        logEvent("info", "affichage des recettes");
        await templateManager.displayAllRecipes("#recipes-container", recipes);
        logEvent("success", "recettes affichées avec succès");

        /** =============================================================
         *  Étape 4 : Initialisation des événements utilisateur 
         *  ==============================================================
         * Active les écouteurs d'événements pour permettre l'interaction.
         */
        logEvent("info", "initialisation des événements");
        initEventListeners();
        logEvent("success", "événements interactifs prêts");

        /** ====================================================================
         * Étape 5 : Vérification et activation du mode Benchmark si nécessaire 
         * ====================================================================
         */
        checkBenchmarkMode();

        logEvent("success", "application chargée avec succès");
    } catch (error) {
        logEvent("error", "échec de l'initialisation de l'application", { message: error.message });
    }
}


/* ====================================================================================
 * II. DÉTECTION DU MODE BENCHMARK
 * ==================================================================================== */

/**
 * Vérifie si le mode Benchmark doit être activé et gère son affichage.
 * - Surveille le bouton de recherche pour détecter la commande `/benchmark`.
 * - Vérifie si l'utilisateur a saisi `/benchmark` ou `!benchmark` dans la barre de recherche.
 * - Demande une authentification avant d'activer le mode Benchmark.
 * - Active le suivi des interactions utilisateur en mode Benchmark.
 */
function checkBenchmarkMode() {
    const searchInput = document.getElementById("search");
    const searchButton = document.getElementById("search-button");
    let benchmarkEnabled = false;
    let benchmarkInstance = null;

    /** ==========================================================
     *  Validation des éléments du DOM
     * ========================================================== */
    if (!searchInput || !searchButton) {
        logEvent("error", "Élément bouton de recherche ou champ de recherche introuvable.");
        return;
    }

    /** ==========================================================
     *  Surveillance du bouton de recherche
     * ========================================================== */
    logEvent("info", "Surveillance du bouton de recherche pour détecter le mode Benchmark.");

    searchButton.addEventListener("click", (event) => {
        event.preventDefault(); // Empêche l'action par défaut du bouton

        try {
            const query = searchInput.value.trim();

            if (query === "/benchmark" || query === "!benchmark") {
                logEvent("info", "Commande Benchmark détectée. Affichage de la modale.");
                requestAdminAccess();
            } else {
                logEvent("info", `Recherche normale déclenchée : ${query}`);
                triggerNormalSearch(query);
            }
        } catch (error) {
            logEvent("error", "Erreur lors de la détection du mode Benchmark", { error: error.message });
        }
    });

    /** ==========================================================
     *  Demande d'authentification avant activation du Benchmark
     * ========================================================== */

    /**
     * Demande un accès administrateur via un mot de passe avant d'activer le mode Benchmark.
     */
    function requestAdminAccess() {
        try {
            logEvent("info", "Demande d'authentification pour le mode Benchmark.");

            // Affiche la modale avec un callback qui active le Benchmark si la validation est réussie
            createPasswordModal((isAuthorized) => {
                if (isAuthorized) {
                    enableBenchmarkMode();
                } else {
                    alert("Accès refusé.");
                    logEvent("error", "Échec de l'authentification admin.");
                }
            });
        } catch (error) {
            logEvent("error", "Erreur lors de la demande d'authentification", { error: error.message });
        }
    }

    /** ==========================================================
     *  Activation du Benchmark et suivi des interactions
     * ========================================================== */

    /**
     * Active le mode Benchmark et affiche le tableau de bord des performances.
     */
    function enableBenchmarkMode() {
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

    /** ==========================================================
     *  Recherche normale si ce n'est pas une commande Benchmark
     * ========================================================== */

    /**
     * Gère la recherche normale si ce n'est pas une commande Benchmark.
     * @param {string} query - La requête de recherche saisie par l'utilisateur.
     */
    function triggerNormalSearch(query) {
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
}




/* ==================================================================================== */
/*    DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM                                    */
/* ==================================================================================== */

document.addEventListener("DOMContentLoaded", initApplication);
