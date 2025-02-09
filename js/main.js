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

/* ========================================================== */
/*    🚀 INITIALISATION GLOBALE DE L'APPLICATION              */
/* ========================================================== */
async function initApplication() {
    try {
        logEvent("INFO", "🚀 Démarrage de l'application...");

        // Étape 1 : Chargement des recettes
        logEvent("INFO", "📦 Chargement des recettes...");
        const recipes = await dataManager.getAllRecipes();
        if (!recipes.length) {
            throw new Error("❌ Aucune recette trouvée.");
        }
        logEvent("SUCCESS", `✅ ${recipes.length} recettes chargées.`);

        // Étape 2 : Initialisation des filtres avant affichage
        logEvent("INFO", "🔍 Initialisation des filtres...");
        await filterManager.initFilters();
        logEvent("SUCCESS", "✅ Filtres générés et appliqués.");

        // Étape 3 : Affichage des recettes après filtres
        logEvent("INFO", "🖼️ Affichage des recettes...");
        await templateManager.displayAllRecipes("#recipes-container", recipes);
        logEvent("SUCCESS", "✅ Recettes affichées avec succès.");

        // Étape 4 : Initialisation des événements utilisateur
        logEvent("INFO", "🎯 Initialisation des événements...");
        initEventListeners();
        logEvent("SUCCESS", "✅ Événements interactifs prêts.");

        // Étape 5 : Vérification du mode Benchmark
        checkBenchmarkMode();

        logEvent("SUCCESS", "✅ Application chargée avec succès !");
    } catch (error) {
        logEvent("ERROR", "💥 Échec de l'initialisation de l'application.", { error: error.message });
    }
}

/* ========================================================== */
/*    🛠️ DÉTECTION DU MODE BENCHMARK                        */
/* ========================================================== */
function checkBenchmarkMode() {
    const searchInput = document.getElementById("search");
    let benchmarkEnabled = false;
    let benchmarkInstance = null;

    if (!searchInput) {
        logEvent("ERROR", "🔴 Barre de recherche introuvable. Benchmark désactivé.");
        return;
    }

    logEvent("INFO", "🔍 Surveillance de la barre de recherche pour activer le Benchmark.");

    // 🎯 Écoute de la barre de recherche pour activer le benchmark
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const query = searchInput.value.trim();
            if (query === "/benchmark" || query === "!benchmark") {
                event.preventDefault();
                requestAdminAccess();
            }
        }
    });

    /* 🔐 Vérification du mot de passe admin */
    function requestAdminAccess() {
    logEvent("INFO", "🔑 Demande de mot de passe admin...");
    createPasswordModal((isAuthorized) => {
        if (isAuthorized) {
            enableBenchmarkMode();
        } else {
            alert("⛔ Accès refusé !");
        }
    });
}

    /* 🚀 Active le mode Benchmark et affiche le Dashboard */
    function enableBenchmarkMode() {
        if (!benchmarkEnabled) {
            benchmarkEnabled = true;
            benchmarkInstance = new BenchmarkDashboard();
            benchmarkInstance.showDashboard();
            alert("✅ Mode Benchmark Activé !");
            logEvent("SUCCESS", "🚀 Benchmark Dashboard activé avec succès !");
        } else {
            logEvent("INFO", "ℹ️ Le mode Benchmark est déjà activé.");
        }
    }

    /* 🎯 Ajoute un suivi des performances sur les clics d’éléments */
    document.body.addEventListener("click", (event) => {
        if (benchmarkEnabled && benchmarkInstance && event.target) {
            benchmarkInstance.trackElement(event.target);
        }
    });
}

/* ========================================================== */
/*    DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM          */
/* ========================================================== */
document.addEventListener("DOMContentLoaded", initApplication);
