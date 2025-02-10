/* ==================================================================================== */
/*  FICHIER          : benchmark-dashboard.js                                          */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.5                                                             */
/*  DATE DE CRÉATION : 11/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 11/02/2025                                                      */
/*  DESCRIPTION      : Interface de Benchmark Live pour mesurer les performances.      */
/*                     - Teste les temps d'exécution des recherches de recettes.      */
/*                     - Affiche les résultats sous forme de tableau et graphique.    */
/*                     - Permet l'export des données en JSON et CSV.                   */
/* ==================================================================================== */

import { benchmarkSearch } from "../benchmark/benchmark.js";
import { searchRecipesLoop, searchRecipesFunctional } from "../components/search.js";
import { logEvent } from "../utils/utils.js";

/* ==================================================================================== */
/*  Classe BenchmarkDashboard                                                           */
/* ==================================================================================== */

/**
 * Classe BenchmarkDashboard : Interface pour mesurer les performances des recherches.
 * - Permet l'exécution de benchmarks sur différentes méthodes de recherche.
 * - Affiche les résultats sous forme de tableau et graphique.
 * - Gère l'affichage, les événements et l'export des résultats.
 */
class BenchmarkDashboard {
    /**
     * Initialise le Dashboard et ses propriétés.
     */
    constructor() {
        this.results = [];
        this.chartInstance = null;
        this.isVisible = false;
        this.container = null;
        this.initialize();
    }

    /**
     * Initialise l'interface et attache les événements.
     */
    initialize() {
        try {
            this.container = createUI();
            if (!this.container) {
                logEvent("error", "Échec de l'initialisation du Benchmark Dashboard : UI non créée");
                return;
            }

            this.cacheElements();
            bindEvents(this);
            logEvent("success", "Benchmark Dashboard initialisé avec succès.");
        } catch (error) {
            logEvent("error", "Erreur lors de l'initialisation du Benchmark Dashboard", { error: error.message });
        }
    }

    /**
     * Stocke les références des éléments du DOM pour éviter des requêtes répétées.
     */
    cacheElements() {
        try {
            this.btnRun = document.getElementById("run-benchmark");
            this.btnExportJson = document.getElementById("export-json");
            this.btnExportCsv = document.getElementById("export-csv");
            this.btnClose = document.getElementById("close-benchmark");
            this.inputIterations = document.getElementById("iterations");
            this.benchmarkChart = document.getElementById("benchmarkChart");

            if (!this.btnRun || !this.btnExportJson || !this.btnExportCsv || !this.btnClose || !this.inputIterations || !this.benchmarkChart) {
                logEvent("error", "Certains éléments du Benchmark Dashboard sont introuvables");
                return;
            }

            logEvent("info", "Références DOM du Benchmark Dashboard mises en cache.");
        } catch (error) {
            logEvent("error", "Erreur lors du stockage des éléments DOM", { error: error.message });
        }
    }

    /**
     * Affiche ou masque le Dashboard.
     * @param {boolean} show - Indique si le Dashboard doit être affiché.
     */
    toggleDashboard(show = true) {
        try {
            if (!this.container) {
                logEvent("error", "Impossible de basculer l'affichage du Dashboard : UI non disponible");
                return;
            }

            this.isVisible = show;
            this.container.classList.toggle("hidden", !show);
            logEvent("info", show ? "Benchmark Dashboard affiché." : "Benchmark Dashboard caché.");
        } catch (error) {
            logEvent("error", "Erreur lors du basculement de l'affichage du Dashboard", { error: error.message });
        }
    }

    /**
     * Exécute les tests de benchmark.
     */
    async runTests() {
        try {
            if (!this.inputIterations) {
                logEvent("error", "Impossible d'exécuter le benchmark : champ 'iterations' introuvable");
                return;
            }

            const iterations = parseInt(this.inputIterations.value, 10);

            // Validation des itérations
            if (isNaN(iterations) || iterations <= 0) {
                logEvent("warning", "Nombre d'itérations invalide : valeur corrigée à 10");
                this.inputIterations.value = 10;
                return;
            }

            logEvent("info", `Exécution du benchmark avec ${iterations} itérations...`);

            this.results = [
                benchmarkSearch("Loop", () => searchRecipesLoop("poulet"), iterations),
                benchmarkSearch("Functional", () => searchRecipesFunctional("poulet"), iterations),
            ];

            if (!this.results || this.results.length === 0) {
                logEvent("error", "Aucun résultat obtenu après l'exécution du benchmark");
                return;
            }

            updateTable(this.results);
            updateChart(this.benchmarkChart, this.results);
            logEvent("success", "Benchmark terminé avec succès.");
        } catch (error) {
            logEvent("error", "Erreur lors de l'exécution du benchmark", { error: error.message });
        }
    }
}


/* ==================================================================================== */
/*  Fonctions Utilitaires                                                               */
/* ==================================================================================== */

/*----------------------------------------------------------------
/*   Création de l'interface du Dashboard
/*----------------------------------------------------------------*/

/**
 * Crée et insère l'interface HTML du Benchmark Dashboard dans le DOM.
 *
 * - Vérifie si un Dashboard existe déjà pour éviter les doublons.
 * - Vérifie la disponibilité de `document.body` avant d'ajouter l'élément.
 * - Génère une structure claire et accessible via `getDashboardTemplate()`.
 *
 * @returns {HTMLElement|null} Élément DOM du dashboard ou `null` en cas d'échec.
 */
function createUI() {
    try {
        // Vérifie si un dashboard existe déjà pour éviter les doublons.
        if (document.getElementById("benchmark-dashboard")) {
            logEvent("warning", "Tentative de création d'un Dashboard déjà existant");
            return document.getElementById("benchmark-dashboard");
        }

        // Vérifie que `document.body` est bien accessible
        if (!document.body) {
            logEvent("error", "Échec de la création du Dashboard : document.body non disponible");
            throw new Error("document.body non disponible");
        }

        // Création du conteneur principal
        const container = document.createElement("div");
        container.id = "benchmark-dashboard";
        container.classList.add("hidden"); // Caché par défaut

        // Injection du template HTML
        container.innerHTML = getDashboardTemplate();
        document.body.appendChild(container);

        logEvent("success", "Benchmark Dashboard créé avec succès");
        return container;
    } catch (error) {
        logEvent("error", "Échec de la création du Benchmark Dashboard", { error: error.message });
        return null;
    }
}

/*----------------------------------------------------------------
/*   Association des événements
/*----------------------------------------------------------------*/

/**
 * Associe les événements aux éléments du Benchmark Dashboard.
 *
 * - Vérifie la présence des éléments avant d'attacher les événements.
 * - Ajoute les événements pour exécuter les tests et exporter les résultats.
 * - Gère les erreurs avec `logEvent()` pour assurer un suivi clair.
 *
 * @param {BenchmarkDashboard} dashboard - Instance du dashboard.
 */
function bindEvents(dashboard) {
    try {
        if (!dashboard || !dashboard.btnRun || !dashboard.btnExportJson || !dashboard.btnExportCsv || !dashboard.btnClose) {
            logEvent("error", "bindEvents : Un ou plusieurs éléments du Dashboard sont manquants.", { dashboard });
            return;
        }

        // Écouteur pour exécuter les tests du benchmark
        try {
            dashboard.btnRun.addEventListener("click", () => dashboard.runTests());
            logEvent("info", "Écouteur attaché : Exécution du benchmark.");
        } catch (error) {
            logEvent("error", "Erreur lors de l'ajout de l'écouteur du bouton Run.", { error: error.message });
        }

        // Écouteur pour exporter les résultats en JSON
        try {
            dashboard.btnExportJson.addEventListener("click", () => exportResults("json", dashboard.results));
            logEvent("info", "Écouteur attaché : Export JSON.");
        } catch (error) {
            logEvent("error", "Erreur lors de l'ajout de l'écouteur du bouton Export JSON.", { error: error.message });
        }

        // Écouteur pour exporter les résultats en CSV
        try {
            dashboard.btnExportCsv.addEventListener("click", () => exportResults("csv", dashboard.results));
            logEvent("info", "Écouteur attaché : Export CSV.");
        } catch (error) {
            logEvent("error", "Erreur lors de l'ajout de l'écouteur du bouton Export CSV.", { error: error.message });
        }

        // Écouteur pour fermer le Benchmark Dashboard
        try {
            dashboard.btnClose.addEventListener("click", () => dashboard.toggleDashboard(false));
            logEvent("info", "Écouteur attaché : Fermeture du Benchmark Dashboard.");
        } catch (error) {
            logEvent("error", "Erreur lors de l'ajout de l'écouteur du bouton Close.", { error: error.message });
        }

        logEvent("success", "Tous les événements du Benchmark Dashboard ont été attachés avec succès.");
    } catch (error) {
        logEvent("error", "Erreur critique lors de l'ajout des événements du Benchmark.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Génération template HTML du Dashboard
/*----------------------------------------------------------------*/

/**
 * Génère le template HTML du Benchmark Dashboard.
 *
 * - Ajoute des attributs d'accessibilité (`aria-label`, `role`).
 * - Structure claire pour améliorer la maintenabilité.
 * - Inclut des `id` explicites pour faciliter le ciblage CSS et JS.
 *
 * @returns {string} - HTML du Benchmark Dashboard.
 */
function getDashboardTemplate() {
    return `
        <div class="benchmark-header" role="banner">
            <h2 id="benchmark-title">Benchmark Live Dashboard</h2>
            <button id="close-benchmark" title="Fermer le Dashboard" aria-label="Fermer le Benchmark Dashboard">
                Fermer
            </button>
        </div>

        <div class="benchmark-config" role="form">
            <label for="iterations">Nombre d'itérations :</label>
            <input 
                type="number" 
                id="iterations" 
                value="10" 
                min="1" 
                aria-describedby="iterations-description"
                aria-label="Saisissez le nombre d'itérations pour le benchmark"
            >
            <p id="iterations-description" class="sr-only">
                Ce champ permet de définir le nombre d'exécutions pour tester les performances.
            </p>
            <button id="run-benchmark" title="Lancer le test de performance" aria-label="Exécuter le benchmark">
                Lancer
            </button>
        </div>

        <div class="benchmark-chart-container" role="region" aria-labelledby="chart-title">
            <h3 id="chart-title">Graphique des performances</h3>
            <canvas id="benchmarkChart"></canvas>
        </div>

        <table id="benchmarkTable" role="table" aria-describedby="benchmark-table-description">
            <caption id="benchmark-table-description">
                Résultats des tests de performance des différentes méthodes de recherche.
            </caption>
            <thead>
                <tr>
                    <th scope="col">Fonction</th>
                    <th scope="col">Moyenne (ms)</th>
                    <th scope="col">Min (ms)</th>
                    <th scope="col">Max (ms)</th>
                    <th scope="col">Itérations</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <div class="benchmark-actions" role="complementary">
            <button id="export-json" title="Exporter en JSON" aria-label="Exporter les résultats au format JSON">
                Export JSON
            </button>
            <button id="export-csv" title="Exporter en CSV" aria-label="Exporter les résultats au format CSV">
                Export CSV
            </button>
        </div>
    `;
}

/*----------------------------------------------------------------
/*   Mise à jour du tableau des résultats
/*----------------------------------------------------------------*/

/** ---------------------------------------------------
 * Met à jour le tableau des résultats du benchmark.
 * -----------------------------------------------------
 * 
 * - Vérifie la validité des données avant l'affichage.
 * - Insère un message "Aucune donnée disponible" si aucun résultat.
 * - Gère les erreurs de manière robuste avec `logEvent()`.
 *
 * @param {Array} results - Liste des résultats du benchmark.
 */
function updateTable(results) {
    try {
        const tbody = document.querySelector("#benchmarkTable tbody");

        // Vérifie si le tableau est présent dans le DOM
        if (!tbody) {
            logEvent("error", "Élément tbody du tableau des résultats introuvable.");
            return;
        }

        // Vérifie si `results` est un tableau valide
        if (!Array.isArray(results)) {
            logEvent("error", "Type de données invalide pour updateTable. Un tableau est attendu.", { results });
            return;
        }

        // Vérifie si le tableau est vide
        if (results.length === 0) {
            logEvent("warning", "Aucun résultat à afficher dans le tableau.");
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; font-style:italic;">
                        Aucune donnée disponible
                    </td>
                </tr>
            `;
            return;
        }

        // Génération des lignes du tableau avec validation des valeurs
        tbody.innerHTML = results.map(result => `
            <tr>
                <td>${sanitizeText(result.label)}</td>
                <td>${formatTime(result.avgTime)}</td>
                <td>${formatTime(result.minTime)}</td>
                <td>${formatTime(result.maxTime)}</td>
                <td>${sanitizeText(result.iterations)}</td>
            </tr>
        `).join("");

        logEvent("success", `Tableau des résultats mis à jour (${results.length} entrées).`);
    } catch (error) {
        logEvent("error", "Erreur lors de la mise à jour du tableau", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*   Nettoyage texte
/*----------------------------------------------------------------*/
/**
 * Nettoie un texte pour éviter les erreurs d'affichage et prévenir les attaques XSS.
 *
 * - Vérifie si le texte est de type `string` ou `number`, sinon retourne `"N/A"`.
 * - Supprime les espaces inutiles et protège les caractères spéciaux.
 * - Empêche l'injection de code HTML (`<script>`, `&`, `"`, etc.).
 *
 * @param {any} text - Texte à nettoyer.
 * @returns {string} Texte sécurisé et propre.
 */
function sanitizeText(text) {
    try {
        // Vérifie si le texte est une chaîne de caractères ou un nombre
        if (typeof text === "string") {
            return text
                .trim() // Supprime les espaces inutiles
                .replace(/</g, "&lt;") // Protège les balises `<`
                .replace(/>/g, "&gt;") // Protège les balises `>`
                .replace(/"/g, "&quot;") // Protège les guillemets `"`
                .replace(/&/g, "&amp;"); // Protège le caractère `&`
        } 
        
        if (typeof text === "number") {
            return text.toString(); // Convertit les nombres en chaîne de caractères
        }

        logEvent("warning", "Valeur de texte invalide détectée lors du nettoyage", { text });
        return "N/A";
    } catch (error) {
        logEvent("error", "Erreur lors du nettoyage du texte", { error: error.message });
        return "N/A";
    }
}


/*----------------------------------------------------------------
/*   Formatage du temps
/*----------------------------------------------------------------*/

/**
 * Formate le temps pour l'affichage dans le tableau avec gestion des unités.
 *
 * - Remplace les valeurs invalides (`NaN`, `null`, `undefined`) par `"N/A"`.
 * - Convertit automatiquement les valeurs supérieures à 1000 ms en secondes (`s`).
 * - Corrige les valeurs négatives en `0.00 ms` pour éviter des incohérences.
 *
 * @param {any} time - Valeur du temps en millisecondes.
 * @returns {string} Temps formaté avec unité (`ms` ou `s`).
 */
function formatTime(time) {
    try {
        // Vérifie si la valeur est invalide
        if (isNaN(time) || time === null || time === undefined) {
            logEvent("warning", "Valeur de temps invalide reçue pour formatage", { time });
            return "N/A";
        }

        let parsedTime = parseFloat(time);

        // Correction des valeurs négatives
        if (parsedTime < 0) {
            logEvent("warning", `Valeur de temps négative détectée (${parsedTime} ms). Corrigée à 0.00 ms.`);
            parsedTime = 0;
        }

        // Conversion en secondes si le temps dépasse 1000 ms
        if (parsedTime >= 1000) {
            return `${(parsedTime / 1000).toFixed(2)} s`;
        }

        return `${parsedTime.toFixed(2)} ms`;
    } catch (error) {
        logEvent("error", "Erreur lors du formatage du temps", { error: error.message });
        return "N/A";
    }
}



/*----------------------------------------------------------------
/*   Mise à jour Benchmark des performances
/*----------------------------------------------------------------*/

/**
 * Met à jour le graphique des performances du benchmark.
 *
 * - Vérifie si `chartElement` est bien un élément `canvas`.
 * - Vérifie si `results` est un tableau valide et contient des données.
 * - Supprime l'ancien graphique avant d'en générer un nouveau.
 * - Assure que les valeurs de `data` sont valides avant l'affichage.
 *
 * @param {HTMLElement} chartElement - Élément `canvas` du graphique.
 * @param {Array} results - Liste des résultats du benchmark.
 */
function updateChart(chartElement, results) {
    try {
        // Vérifie si chartElement est valide et bien un élément canvas
        if (!(chartElement instanceof HTMLCanvasElement)) {
            logEvent("error", "updateChart : L'élément fourni n'est pas un canvas valide.");
            return;
        }

        const ctx = chartElement.getContext("2d");

        // Vérifie si `results` est un tableau et qu'il contient des données
        if (!Array.isArray(results) || results.length === 0) {
            logEvent("warning", "updateChart : Aucun résultat à afficher dans le graphique.");
            ctx.clearRect(0, 0, chartElement.width, chartElement.height);
            return;
        }

        // Vérification et extraction des données
        const labels = results.map(r => sanitizeText(r.label));
        const avgTimes = results.map(r => validateNumericValue(r.avgTime));

        // Vérifie s'il y a des valeurs valides à afficher
        if (avgTimes.every(time => time === null)) {
            logEvent("warning", "updateChart : Toutes les valeurs du benchmark sont invalides.");
            return;
        }

        // Détruit l'ancien graphique avant de générer un nouveau
        if (chartElement.chartInstance) {
            chartElement.chartInstance.destroy();
        }

        // Génération du nouveau graphique
        chartElement.chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Temps moyen (ms)",
                    data: avgTimes,
                    backgroundColor: ["#FF6384", "#36A2EB"]
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });

        logEvent("success", "Graphique mis à jour avec succès.");
    } catch (error) {
        logEvent("error", "Erreur lors de la mise à jour du graphique", { error: error.message });
    }
}
/*----------------------------------------------------------------
/*   Export des résultats
/*----------------------------------------------------------------*/

/**
 * Exporte les résultats sous format JSON ou CSV.
 * @param {string} format - Format d'export ("json" ou "csv").
 * @param {Array} results - Liste des résultats du benchmark.
 */
function exportResults(format, results) {
    try {
        const dataStr = format === "json"
            ? JSON.stringify(results, null, 2)
            : results.map(r => `${r.label},${r.avgTime},${r.minTime},${r.maxTime},${r.iterations}`).join("\n");

        const blob = new Blob([dataStr], { type: format === "json" ? "application/json" : "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `benchmark_results.${format}`;
        a.click();

        logEvent("success", `Export des résultats en ${format.toUpperCase()} effectué.`);
    } catch (error) {
        logEvent("error", `Erreur lors de l'export en ${format.toUpperCase()}`, { error: error.message });
    }
}

export default BenchmarkDashboard;
