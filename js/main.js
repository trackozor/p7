/* ==================================================================================== */
/*  FICHIER          : main.js                                                          */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.3                                                              */
/*  DATE DE CRÉATION : 08/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Fichier principal orchestrant le chargement des recettes,       */
/*                     la gestion des événements et l'affichage du Benchmark Dashboard.*/
/* ==================================================================================== */

import { dataManager } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import { logEvent } from "./utils/utils.js";
import BenchmarkDashboard from "./utils/benchmark-dashboard.js";
import { filterManager } from "./components/filterManager.js";

/* ========================================================== */
/*    INITIALISATION GLOBALE DE L'APPLICATION                 */
/* ========================================================== */
/**
 * Fonction principale d'initialisation de l'application.
 * Elle :
 * - Charge les recettes
 * - Affiche les recettes
 * - Initialise les événements utilisateur
 * - Vérifie l'activation du Benchmark Dashboard
 */
async function initApplication() {
    try {
        logEvent("INFO", "🚀 Démarrage de l'application...");

        //  Étape 1 : Chargement des recettes
        logEvent("INFO", "📦 Chargement des recettes en cours...");
        const recipes = await dataManager.getAllRecipes();

        if (!recipes.length) {
            throw new Error("⛔ Aucune recette chargée, vérifiez le fichier JSON.");
        }
        logEvent("SUCCESS", `✅ ${recipes.length} recettes chargées.`);

        //  Étape 2 : Affichage des recettes
        logEvent("INFO", "🎨 Affichage des recettes...");
        await templateManager.displayAllRecipes("#recipes-container", recipes);
        logEvent("SUCCESS", "✅ Recettes affichées avec succès.");

        // Étape 3 : Initialisation des événements utilisateur
        logEvent("INFO", "🎯 Initialisation des événements...");
        initEventListeners();
        logEvent("SUCCESS", "✅ Événements interactifs prêts.");

        //  Vérification du mode Benchmark
        checkBenchmarkMode();

        // initialise les filtres
        FilterManager.initFilters();
        logEvent("SUCCESS", "🚀 Application chargée avec succès !");
    } catch (error) {
        logEvent("ERROR", "❌ Échec de l'initialisation de l'application.", { error: error.message });
    }
}

/* ========================================================== */
/*    DÉTECTION DU MODE BENCHMARK                            */
/* ========================================================== */
/**
 * Vérifie si le mode Benchmark est activé via la barre de recherche.
 * Active le mode Benchmark si l'utilisateur entre `/benchmark`.
 */
function checkBenchmarkMode() {
    const searchInput = document.getElementById("search");
    let benchmarkEnabled = false;
    let benchmarkInstance = null;

    if (!searchInput) {
        logEvent("ERROR", "⛔ Barre de recherche introuvable.");
        return;
    }

    // 📌 Écoute de la barre de recherche pour activer le benchmark
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const query = searchInput.value.trim();

            if (query === "/benchmark" || query === "!benchmark") {
                event.preventDefault();
                requestAdminAccess();
            }
        }
    });

    // 🔒 Vérification du mot de passe admin
    function requestAdminAccess() {
        const password = prompt("🔒 Entrez le mot de passe admin :");
        if (password === "SuperSecure123") {
            enableBenchmarkMode();
        } else {
            alert("⛔ Accès refusé !");
            logEvent("WARNING", "Tentative d'accès non autorisée au Benchmark.");
        }
    }

    // 🚀 Active le mode Benchmark et affiche le Dashboard
    function enableBenchmarkMode() {
        if (!benchmarkEnabled) {
            benchmarkEnabled = true;
            benchmarkInstance = new BenchmarkDashboard();
            benchmarkInstance.showDashboard();
            alert("✅ Mode Benchmark Activé !");
            logEvent("SUCCESS", "🚀 Benchmark Dashboard activé avec succès !");
        }
    }

    // 🎯 Ajoute un suivi des performances sur les clics d’éléments
    document.body.addEventListener("click", (event) => {
        if (benchmarkEnabled && event.target) {
            benchmarkInstance.trackElement(event.target);
        }
    });
}

/* ========================================================== */
/*    DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM          */
/* ========================================================== */
document.addEventListener("DOMContentLoaded", initApplication);
