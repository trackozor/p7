/**
 * 📊 Benchmark Live Dashboard - utils/benchmark-dashboard.js
 * - Interface dynamique pour voir les performances en temps réel.
 * - Génère un tableau interactif avec des graphiques en live.
 * - Export JSON/CSV pour analyse ultérieure.
 */

import { benchmarkSearch } from "../benchmark/benchmark.js";
import { searchRecipesLoop, searchRecipesFunctional } from "../components/search.js";
import { logEvent } from "../utils/utils.js"; 
// Import en relatif



class BenchmarkDashboard {
    constructor() {
        this.results = [];
        this.chartInstance = null;
        this.isVisible = false;
        this.createUI();
    }

    /**
     * 🔹 Génère l'interface HTML sans style inline
     */
    createUI() {
        try {
            this.container = document.createElement("div");
            this.container.id = "benchmark-dashboard";
            this.container.classList.add("hidden"); // Caché par défaut

            this.container.innerHTML = `
                <div class="benchmark-header">
                    <h2>🛠️ Benchmark Live Dashboard</h2>
                    <button id="close-benchmark">❌ Fermer</button>
                </div>

                <div class="benchmark-config">
                    <label for="iterations">Itérations :</label>
                    <input type="number" id="iterations" value="10" min="1">
                    <button id="run-benchmark">🔄 Lancer</button>
                </div>

                <div class="benchmark-chart-container">
                    <canvas id="benchmarkChart"></canvas>
                </div>

                <table id="benchmarkTable">
                    <thead>
                        <tr>
                            <th>Fonction</th>
                            <th>Moyenne (ms)</th>
                            <th>Min (ms)</th>
                            <th>Max (ms)</th>
                            <th>Itérations</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>

                <div class="benchmark-actions">
                    <button id="export-json">📤 Export JSON</button>
                    <button id="export-csv">📤 Export CSV</button>
                </div>
            `;

            document.body.appendChild(this.container);
            this.bindEvents();

            logEvent("INFO", "Benchmark Dashboard initialisé.");
        } catch (error) {
            logEvent("ERROR", "Échec de la création de l'UI du Benchmark Dashboard", { error: error.message });
        }
    }

    /**
     * 🔹 Ajoute les événements aux boutons
     */
    bindEvents() {
        try {
            document.getElementById("run-benchmark").addEventListener("click", () => this.runTests());
            document.getElementById("export-json").addEventListener("click", () => this.exportResults("json"));
            document.getElementById("export-csv").addEventListener("click", () => this.exportResults("csv"));
            document.getElementById("close-benchmark").addEventListener("click", () => this.toggleDashboard(false));

            logEvent("INFO", "Événements du Benchmark Dashboard liés.");
        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'ajout des événements du Benchmark", { error: error.message });
        }
    }

    /**
     * 🔹 Affiche ou masque le dashboard
     */
    toggleDashboard(show = true) {
        try {
            this.isVisible = show;
            this.container.classList.toggle("hidden", !show);
            logEvent("INFO", show ? "Dashboard affiché" : "Dashboard caché");
        } catch (error) {
            logEvent("ERROR", "Erreur lors de l'affichage du Dashboard", { error: error.message });
        }
    }

    /**
     * 🔹 Exécute les tests de performance
     */
    async runTests() {
        try {
            const iterations = parseInt(document.getElementById("iterations").value, 10);
            logEvent("INFO", `Exécution du benchmark avec ${iterations} itérations...`);

            this.results = [
                benchmarkSearch("🔄 Loop", () => searchRecipesLoop("poulet"), iterations),
                benchmarkSearch("⚡ Functional", () => searchRecipesFunctional("poulet"), iterations),
            ];

            this.updateTable();
            this.updateChart();
            logEvent("SUCCESS", "Benchmark terminé avec succès.");

        } catch (error) {
            logEvent("ERROR", "Erreur lors du benchmark", { error: error.message });
        }
    }

    /**
     * 🔹 Met à jour le tableau des résultats
     */
    updateTable() {
        try {
            const tbody = document.querySelector("#benchmarkTable tbody");
            tbody.innerHTML = "";

            this.results.forEach(result => {
                tbody.innerHTML += `
                    <tr>
                        <td>${result.label}</td>
                        <td>${result.avgTime} ms</td>
                        <td>${result.minTime} ms</td>
                        <td>${result.maxTime} ms</td>
                        <td>${result.iterations}</td>
                    </tr>
                `;
            });

            logEvent("INFO", "Tableau des résultats mis à jour.");
        } catch (error) {
            logEvent("ERROR", "Erreur lors de la mise à jour du tableau", { error: error.message });
        }
    }

    /**
     * 🔹 Met à jour le graphique des performances
     */
    updateChart() {
        try {
            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            const ctx = document.getElementById("benchmarkChart").getContext("2d");
            this.chartInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: this.results.map(r => r.label),
                    datasets: [{
                        label: "Temps moyen (ms)",
                        data: this.results.map(r => parseFloat(r.avgTime)),
                        backgroundColor: ["#FF6384", "#36A2EB"]
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });

            logEvent("INFO", "Graphique mis à jour.");
        } catch (error) {
            logEvent("ERROR", "Erreur lors de la mise à jour du graphique", { error: error.message });
        }
    }

    /**
     * 🔹 Exporte les résultats en JSON ou CSV
     */
    exportResults(format) {
        try {
            const dataStr = format === "json"
                ? JSON.stringify(this.results, null, 2)
                : this.results.map(r => `${r.label},${r.avgTime},${r.minTime},${r.maxTime},${r.iterations}`).join("\n");

            const blob = new Blob([dataStr], { type: format === "json" ? "application/json" : "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `benchmark_results.${format}`;
            a.click();

            logEvent("SUCCESS", `Export des résultats en ${format.toUpperCase()} effectué.`);
        } catch (error) {
            logEvent("ERROR", `Erreur lors de l'export en ${format.toUpperCase()}`, { error: error.message });
        }
    }
}

/**
 * 📌 Active le Dashboard via la barre de recherche avec "/benchmark"
 */
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    let benchmarkDashboard = new BenchmarkDashboard();

    if (!searchInput) {
      return;
    }

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const query = searchInput.value.trim();
            if (query === "/benchmark" || query === "!benchmark") {
                event.preventDefault();
                benchmarkDashboard.toggleDashboard(true);
            }
        }
    });

    logEvent("INFO", "Alias /benchmark activé pour ouvrir le Dashboard.");
});

export default BenchmarkDashboard;
