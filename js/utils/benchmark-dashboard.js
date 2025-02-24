import { BenchmarkEngine } from "../benchmark/benchmarkEngine.js";
import { GraphRenderer } from "../benchmark/GraphRenderer.js";
import { BenchmarkTerminal } from "../benchmark/benchmarkTerminal.js";
import { logEvent } from "./utils.js";

/* ====================================================================================
/*  SECTION 1 : INITIALISATION DU DASHBOARD
/* ==================================================================================== */

export function BenchmarkDashboard() {
    let container = null;

    initialize();

    return {
        showDashboard,
        hideDashboard,
        runTests,
        trackElement: startTrackingMode,
        exportResults,
        pauseBenchmark: BenchmarkEngine.pauseBenchmark,
        replayBenchmark: BenchmarkEngine.replayBenchmark,
    };
}

/**
 * Initialise le Benchmark Dashboard avec tous les composants.
 */
function initialize() {
    logEvent("info", "Initialisation du Benchmark Dashboard...");
    try {
        container = createUI();
        if (!container) {
            logEvent("error", "Échec de l'initialisation du Benchmark Dashboard : UI non créée");
            return;
        }
        cacheElements();
        bindEvents();
        logEvent("success", "Benchmark Dashboard initialisé avec succès.");
    } catch (error) {
        logEvent("error", "Erreur critique lors de l'initialisation", { message: error.message });
    }
}

/* ====================================================================================
/*  SECTION 2 : CRÉATION DE L’INTERFACE UTILISATEUR
/* ==================================================================================== */

/**
 * Crée et retourne l'élément du Dashboard.
 * @returns {HTMLElement} Le conteneur du dashboard.
 */
function createUI() {
    const dashboard = document.createElement("div");
    dashboard.id = "benchmark-dashboard";
    dashboard.innerHTML = `
        <div class="benchmark-header">
            <h2>Benchmark Dashboard</h2>
            <button id="start-benchmark">▶️ Démarrer</button>
            <button id="pause-benchmark">⏸ Pause</button>
            <button id="replay-benchmark">🔄 Replay</button>
            <button id="track-element">🖱 Sélectionner Élément</button>
            <button id="export-report">📥 Exporter</button>
            <button id="minimize-benchmark">➖ Réduire</button>
            <button id="close-benchmark">❌ Fermer</button>
        </div>
        <div id="benchmark-body">
            ${BenchmarkTerminal.createTerminal().outerHTML}
            ${GraphRenderer.createGraphPanel().outerHTML}
        </div>
    `;
    document.body.appendChild(dashboard);
    return dashboard;
}

/* ====================================================================================
/*  SECTION 3 : STOCKAGE DES ÉLÉMENTS DU DOM
/* ==================================================================================== */

/**
 * Stocke les références DOM pour éviter de refaire des sélections.
 */
function cacheElements() {
    logEvent("info", "Stockage des références DOM du Benchmark Dashboard...");
}

/**
 * Lie les événements aux boutons du dashboard.
 */
function bindEvents() {
    document.getElementById("start-benchmark").addEventListener("click", runTests);
    document.getElementById("pause-benchmark").addEventListener("click", BenchmarkEngine.pauseBenchmark);
    document.getElementById("replay-benchmark").addEventListener("click", BenchmarkEngine.replayBenchmark);
    document.getElementById("track-element").addEventListener("click", startTrackingMode);
    document.getElementById("export-report").addEventListener("click", () => exportResults("pdf"));
    document.getElementById("minimize-benchmark").addEventListener("click", toggleDashboard);
    document.getElementById("close-benchmark").addEventListener("click", closeDashboard);
}

/* ====================================================================================
/*  SECTION 4 : MODE "SÉLECTION D'ÉLÉMENT" (DEVTOOLS)
/* ==================================================================================== */

function startTrackingMode() {
    logEvent("info", "Mode sélection d’élément activé. Cliquez sur un élément pour analyser.");
    document.body.addEventListener("mouseover", highlightElement);
    document.body.addEventListener("click", captureElementData, { once: true });
}

function highlightElement(event) {
    event.target.style.outline = "2px solid red";
    setTimeout(() => (event.target.style.outline = "none"), 500);
}

function captureElementData(event) {
    document.body.removeEventListener("mouseover", highlightElement);
    logEvent("success", `Élément sélectionné : ${event.target.tagName}`);
}

/* ====================================================================================
/*  SECTION 5 : EXÉCUTION DES TESTS DE BENCHMARK
/* ==================================================================================== */

/**
 * Lance les tests de benchmark via BenchmarkEngine.
 */
async function runTests() {
    logEvent("info", "Démarrage du Benchmark...");

    BenchmarkEngine.runBenchmark("Loop", () => searchRecipesLoopNative("poulet"), 10);
    BenchmarkEngine.runBenchmark("Functional", () => searchRecipesFunctional("poulet"), 10);
}

/* ====================================================================================
/*  SECTION 6 : EXPORT DES DONNÉES (JSON, CSV, PDF)
/* ==================================================================================== */

function exportResults(format) {
    const VALID_FORMATS = ["json", "csv", "pdf"];
    if (!VALID_FORMATS.includes(format)) {
        logEvent("error", `Format d'export invalide : "${format}"`);
        return;
    }

    try {
        const dataStr = format === "json"
            ? JSON.stringify(BenchmarkEngine.getHistory(), null, 2)
            : BenchmarkEngine.getHistory().map(r => `${r.label},${r.avgTime},${r.iterations}`).join("\n");

        const blob = new Blob([dataStr], { type: format === "json" ? "application/json" : "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `benchmark_results.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        logEvent("success", `Export des résultats en ${format.toUpperCase()} effectué.`);
    } catch (error) {
        logEvent("error", `Erreur lors de l'export en ${format.toUpperCase()}`, { message: error.message });
    }
}

/* ====================================================================================
/*  SECTION 7 : CONTRÔLE DE L'AFFICHAGE (RÉDUCTION/FERMETURE)
/* ==================================================================================== */

function toggleDashboard() {
    document.getElementById("benchmark-dashboard").classList.toggle("minimized");
}

function closeDashboard() {
    document.getElementById("benchmark-dashboard").remove();
    logEvent("info", "Benchmark fermé.");
}
