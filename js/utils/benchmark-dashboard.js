/* ====================================================================================
/*  FICHIER          : benchmark-dashboard.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 1.5
/*  DATE DE CRÉATION : 11/02/2025
/*  DERNIÈRE MODIF.  : 11/02/2025
/*  DESCRIPTION      : Interface de Benchmark Live pour mesurer les performances.
/*                     - Teste les temps d'exécution des recherches de recettes.
/*                     - Affiche les résultats sous forme de tableau et graphique.
/*                     - Permet l'export des données en JSON et CSV.
/* ==================================================================================== */

/* ====================================================================================
/*  SECTION 1 : IMPORTATIONS
/* ==================================================================================== */

import { benchmarkSearch } from "../benchmark/benchmark.js";
import { searchRecipesLoop, searchRecipesFunctional } from "../components/search/search.js";
import { logEvent } from "../utils/utils.js";

/* ====================================================================================
/*  SECTION 2 : GESTION DU BENCHMARK DASHBOARD
/* ==================================================================================== */

/**
 * Initialise et gère le Benchmark Dashboard.
 */
export function BenchmarkDashboard() {
    /* ====================================================================================
    /*  2.1 INITIALISATION DES VARIABLES
    /* ==================================================================================== */
    let results = [];
    let chartInstance = null;
    let isVisible = false;
    let container = null;

    /* ====================================================================================
    /*  2.2 INITIALISATION DU DASHBOARD
    /* ==================================================================================== */

    /**
     * Initialise le Benchmark Dashboard.
     *
     * Cette fonction réalise plusieurs étapes essentielles :
     * 1. **Création de l'interface** via `createUI()`.
     * 2. **Vérification de l'existence du conteneur** avant de poursuivre.
     * 3. **Stockage des références DOM** avec `cacheElements()`.
     * 4. **Attachement des événements interactifs** via `bindEvents()`.
     * 5. **Log des différentes étapes** pour le suivi du processus d'initialisation.
     *
     * En cas d'échec de création de l'UI, un log d'erreur est enregistré.
     * En cas d'erreur inattendue, elle est capturée et journalisée.
     *
     * @function initialize
     * @throws {Error} Capture les erreurs critiques et les enregistre avec `logEvent()`.
     */
    function initialize() {
        logEvent("info", "Initialisation du Benchmark Dashboard...");

        try {
            // Étape 1 : Création de l'interface du Dashboard
            container = createUI();
            if (!container) {
                logEvent("error", "Échec de l'initialisation du Benchmark Dashboard : UI non créée");
                return;
            }

            // Étape 2 : Stockage des références DOM
            logEvent("info", "Stockage des références DOM...");
            cacheElements();

            // Étape 3 : Attachement des événements interactifs
            logEvent("info", "Attachement des événements aux boutons...");
            bindEvents();

            // Fin de l'initialisation
            logEvent("success", "Benchmark Dashboard initialisé avec succès.");
        } catch (error) {
            logEvent("error", "Erreur critique lors de l'initialisation du Benchmark Dashboard", { message: error.message });
        }
    }


    /* ====================================================================================
    /*  2.3 STOCKAGE DES ÉLÉMENTS DU DOM
    /* ==================================================================================== */

    /**
     * Stocke les références des éléments du DOM pour éviter des requêtes répétées.
     *
     * Cette fonction permet :
     * 1. La récupération des éléments HTML clés du Benchmark Dashboard.
     * 2. La vérification de la présence de chaque élément afin d'éviter les erreurs d'accès.
     * 3. L'enregistrement des références dans des variables globales pour éviter les recherches DOM inutiles.
     * 4. L'ajout de logs informatifs et d'erreurs pour suivre l'exécution du processus.
     *
     * Gestion des erreurs :
     * - Si un ou plusieurs éléments sont introuvables, une erreur est enregistrée via `logEvent()`.
     * - Si une exception survient, elle est capturée et journalisée.
     *
     * @function cacheElements
     * @throws {Error} Capture les erreurs critiques et les enregistre avec `logEvent()`.
     */
    function cacheElements() {
        logEvent("info", "Stockage des références DOM du Benchmark Dashboard...");

        try {
            // Récupération des éléments DOM
            btnRun = document.getElementById("run-benchmark");
            btnExportJson = document.getElementById("export-json");
            btnExportCsv = document.getElementById("export-csv");
            btnClose = document.getElementById("close-benchmark");
            inputIterations = document.getElementById("iterations");
            benchmarkChart = document.getElementById("benchmarkChart");

            // Vérification de la présence des éléments
            if (!btnRun || !btnExportJson || !btnExportCsv || !btnClose || !inputIterations || !benchmarkChart) {
                logEvent("error", "Certains éléments du Benchmark Dashboard sont introuvables", {
                    btnRun,
                    btnExportJson,
                    btnExportCsv,
                    btnClose,
                    inputIterations,
                    benchmarkChart,
                });
                return;
            }

            logEvent("success", "Références DOM du Benchmark Dashboard mises en cache avec succès.");
        } catch (error) {
            logEvent("error", "Erreur lors du stockage des éléments DOM", { message: error.message });
        }
    }


    /* ====================================================================================
    /*  2.4 AFFICHAGE DU DASHBOARD
    /* ==================================================================================== */

    /**
     * Contrôle l'affichage du Benchmark Dashboard en le rendant visible ou caché.
     *
     * Cette fonction permet :
     * 1. De vérifier si l'interface du Dashboard (`container`) est disponible.
     * 2. De basculer l'affichage en ajoutant ou supprimant la classe CSS `hidden`.
     * 3. De mettre à jour l'état interne `isVisible` pour suivre l'état du Dashboard.
     * 4. De journaliser chaque action pour un suivi clair via `logEvent()`.
     *
     * Gestion des erreurs :
     * - Si `container` est inexistant, une erreur est enregistrée et la fonction s'arrête.
     * - En cas d'exception, l'erreur est capturée et journalisée.
     *
     * @function toggleDashboard
     * @param {boolean} [show=true] - Détermine si le Dashboard doit être affiché (`true`) ou masqué (`false`).
     * @throws {Error} Capture les erreurs critiques et les enregistre avec `logEvent()`.
     */
    function toggleDashboard(show = true) {
        try {
            // Vérifie si le conteneur du Dashboard est disponible
            if (!container) {
                logEvent("error", "Impossible de basculer l'affichage du Dashboard : UI non disponible");
                return;
            }

            // Mise à jour de l'état d'affichage
            isVisible = show;
            container.classList.toggle("hidden", !show);

            // Journalisation de l'action effectuée
            logEvent("info", show ? "Benchmark Dashboard affiché." : "Benchmark Dashboard caché.");
        } catch (error) {
            logEvent("error", "Erreur lors du basculement de l'affichage du Dashboard", { message: error.message });
        }
    }


    /* ====================================================================================
    /*  2.5 EXÉCUTION DES TESTS DE BENCHMARK
    /* ==================================================================================== */

    /**
     * Exécute les tests de performance du Benchmark Dashboard.
     *
     * Cette fonction réalise plusieurs opérations :
     * 1. Vérifie la présence du champ `inputIterations` permettant de spécifier le nombre d'itérations.
     * 2. Récupère et valide le nombre d'itérations entré par l'utilisateur.
     * 3. Lance des benchmarks sur deux approches de recherche :
     *    - `searchRecipesLoop` : Implémentation basée sur une boucle.
     *    - `searchRecipesFunctional` : Implémentation basée sur une approche fonctionnelle.
     * 4. Met à jour l'affichage des résultats sous forme de tableau et de graphique.
     * 5. Gère les erreurs potentielles en journalisant les messages appropriés.
     *
     * Gestion des erreurs :
     * - Si `inputIterations` est absent, l'exécution est interrompue et une erreur est loggée.
     * - Si l'entrée utilisateur est invalide (`NaN` ou ≤ 0), la valeur est corrigée à `10` et un avertissement est loggé.
     * - Si les benchmarks ne renvoient aucun résultat, une erreur est enregistrée.
     * - Toute exception est capturée et journalisée avec son message.
     *
     * @async
     * @function runTests
     * @throws {Error} Capture les erreurs critiques et les enregistre via `logEvent()`.
     */
    async function runTests() {
        try {
            // Vérifie si le champ d'entrée des itérations est présent
            if (!inputIterations) {
                logEvent("error", "Impossible d'exécuter le benchmark : champ 'iterations' introuvable");
                return;
            }

            // Récupération et validation du nombre d'itérations
            const iterations = parseInt(inputIterations.value, 10);
            if (isNaN(iterations) || iterations <= 0) {
                logEvent("warning", "Nombre d'itérations invalide : valeur corrigée à 10");
                inputIterations.value = 10;
                return;
            }

            // Lancement des benchmarks avec le nombre d'itérations spécifié
            logEvent("info", `Exécution du benchmark avec ${iterations} itérations...`);

            results = [
                benchmarkSearch("Loop", () => searchRecipesLoop("poulet"), iterations),
                benchmarkSearch("Functional", () => searchRecipesFunctional("poulet"), iterations),
            ];

            // Vérification des résultats obtenus
            if (!results || results.length === 0) {
                logEvent("error", "Aucun résultat obtenu après l'exécution du benchmark");
                return;
            }

            // Mise à jour de l'affichage avec les résultats obtenus
            updateTable(results);
            updateChart(benchmarkChart, results);
            logEvent("success", "Benchmark terminé avec succès.");
        } catch (error) {
            logEvent("error", "Erreur lors de l'exécution du benchmark", { message: error.message });
        }
    }


    // Initialise le dashboard immédiatement après déclaration
    initialize();

    // Retourne les fonctions accessibles publiquement
    return {
        showDashboard: () => toggleDashboard(true),
        hideDashboard: () => toggleDashboard(false),
        runTests,
        trackElement: () => { /* future feature */ }
    };
}

/* ====================================================================================
/*  SECTION 3 : EXPORT DES RÉSULTATS
/* ==================================================================================== */

/**
 * Exporte les résultats sous format JSON ou CSV.
 * @param {string} format - Format d'export ("json" ou "csv").
 * @param {Array} results - Liste des résultats du benchmark.
 */
/**
 * Exporte les résultats du benchmark sous format JSON ou CSV et initie le téléchargement du fichier.
 *
 * Cette fonction prend en charge deux formats d'exportation :
 * - **JSON** : Les données sont formatées en JSON avec une indentation de 2 espaces pour une meilleure lisibilité.
 * - **CSV** : Les résultats sont convertis en une chaîne de caractères où chaque ligne représente une entrée du benchmark.
 *
 * Fonctionnement :
 * 1. Vérifie si le format spécifié est valide ("json" ou "csv"), sinon une erreur est journalisée.
 * 2. Convertit les données `results` dans le format spécifié.
 * 3. Crée un objet `Blob` contenant les données et génère une URL de téléchargement.
 * 4. Simule un clic sur un élément `<a>` pour déclencher le téléchargement automatique du fichier.
 * 5. Capture les erreurs potentielles et les journalise.
 *
 * Restrictions :
 * - Le format doit être `"json"` ou `"csv"`, sinon une erreur est enregistrée.
 * - `results` doit être un tableau valide, sinon une erreur est journalisée.
 *
 * @function exportResults
 * @param {string} format - Format d'exportation, doit être "json" ou "csv".
 * @param {Array} results - Tableau contenant les résultats du benchmark.
 * @throws {Error} Capture les erreurs critiques et les enregistre via `logEvent()`.
 */
function exportResults(format, results) {
    try {
        // Vérification du format
        if (!["json", "csv"].includes(format)) {
            logEvent("error", `Format d'export invalide : "${format}". Formats acceptés : json, csv.`);
            return;
        }

        // Vérification des résultats
        if (!Array.isArray(results) || results.length === 0) {
            logEvent("error", "Aucune donnée disponible pour l'export.");
            return;
        }

        // Conversion des données dans le format sélectionné
        const dataStr = format === "json"
            ? JSON.stringify(results, null, 2)
            : results.map(r => `${r.label},${r.avgTime},${r.minTime},${r.maxTime},${r.iterations}`).join("\n");

        // Création d'un Blob et génération d'une URL pour le téléchargement
        const blob = new Blob([dataStr], { type: format === "json" ? "application/json" : "text/csv" });
        const url = URL.createObjectURL(blob);

        // Création et simulation du clic sur un élément <a> pour télécharger le fichier
        const a = document.createElement("a");
        a.href = url;
        a.download = `benchmark_results.${format}`;
        document.body.appendChild(a); // Nécessaire pour certains navigateurs
        a.click();
        document.body.removeChild(a); // Nettoyage après téléchargement

        // Journalisation de l'export réussi
        logEvent("success", `Export des résultats en ${format.toUpperCase()} effectué.`);
    } catch (error) {
        logEvent("error", `Erreur lors de l'export en ${format.toUpperCase()}`, { message: error.message });
    }
}


/* ====================================================================================
/*  EXPORT FINAL
/* ==================================================================================== */

export default BenchmarkDashboard;
