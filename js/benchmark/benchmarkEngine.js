/* ====================================================================================
/*  FICHIER          : BenchmarkEngine.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.1
/*  DATE DE CRÉATION : 11/02/2025
/*  DERNIÈRE MODIF.  : 13/02/2025
/*  DESCRIPTION      : Moteur d’exécution des benchmarks avec Web Workers.
/*                     - Gestion avancée des benchmarks en parallèle.
/*                     - Possibilité de pause / replay des tests.
/*                     - Stockage des résultats et intégration avec le terminal et les graphiques.
/* ==================================================================================== */

import { GraphRenderer } from "./GraphRenderer.js";
import { BenchmarkTerminal } from "./benchmarkTerminal.js";

export class BenchmarkEngine {
    static workers = []; // Stockage des Web Workers actifs
    static results = []; // Stockage des résultats des tests
    static isPaused = false; // État de pause
    static currentBenchmarks = []; // Benchmarks en cours
    static iterations = 10; // Nombre d’itérations par défaut

    /* ====================================================================================
    /*  SECTION 1 : LANCEMENT D'UN BENCHMARK
    /* ==================================================================================== */

    /**
     * Lance un benchmark en utilisant un Web Worker.
     * @param {string} label - Nom du test
     * @param {Function} testFunction - Fonction à tester
     * @param {number} iterations - Nombre de répétitions (optionnel, par défaut 10)
     */
    static runBenchmark(label, testFunction, iterations = this.iterations) {
        if (this.isPaused) {
            this.log(` Impossible de démarrer : le benchmark est en pause`, "error");
            return;
        }

        this.log(` Démarrage du benchmark : ${label} (${iterations} itérations)`, "info");

        // Création d’un Web Worker
        const worker = new Worker(URL.createObjectURL(new Blob([`
            self.onmessage = function(event) {
                try {
                    const { label, iterations, funcString } = event.data;
                    const func = new Function("return " + funcString)();
                    let results = [];

                    for (let i = 0; i < iterations; i++) {
                        const start = performance.now();
                        func();
                        const end = performance.now();
                        results.push(end - start);
                    }

                    self.postMessage({ label, results });
                } catch (error) {
                    self.postMessage({ label, error: error.message });
                }
            };
        `], { type: "application/javascript" })));

        worker.onmessage = (event) => {
            if (event.data.error) {
                this.log(`❌ Erreur dans le benchmark "${event.data.label}" : ${event.data.error}`, "error");
            } else {
                this.handleBenchmarkResult(event.data.label, event.data.results);
            }
        };

        worker.onerror = (error) => {
            this.log(`⚠️ Erreur Web Worker : ${error.message}`, "error");
        };

        worker.postMessage({ label, iterations, funcString: testFunction.toString() });
        this.workers.push(worker);
        this.currentBenchmarks.push(label);
    }

    /* ====================================================================================
    /*  SECTION 2 : GESTION DES RÉSULTATS DES BENCHMARKS
    /* ==================================================================================== */

    /**
     * Gère les résultats d'un benchmark et met à jour les graphiques.
     * @param {string} label - Nom du test
     * @param {Array<number>} results - Liste des temps d'exécution
     */
    static handleBenchmarkResult(label, results) {
        const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
        this.results.push({ label, avgTime, results });

        this.log(`✅ Benchmark terminé : ${label} (Temps moyen : ${avgTime.toFixed(2)}ms)`, "success");

        GraphRenderer.updateGraph(label, avgTime);
    }

    /* ====================================================================================
    /*  SECTION 3 : PAUSE / REPLAY / STOP DES BENCHMARKS
    /* ==================================================================================== */

    /**
     * Met en pause l'exécution des benchmarks en cours.
     */
    static pauseBenchmark() {
        this.isPaused = true;
        this.log("⏸ Benchmark mis en pause", "info");
    }

    /**
     * Relance les benchmarks en cours avec les mêmes conditions.
     */
    static replayBenchmark() {
        if (!this.isPaused) {
            this.log("⚠️ Le benchmark n'est pas en pause, impossible de relancer", "error");
            return;
        }

        this.isPaused = false;
        this.currentBenchmarks.forEach((benchmark) => {
            const test = this.results.find(r => r.label === benchmark);
            if (test) {
                this.runBenchmark(test.label, () => eval(test.funcString), this.iterations);
            }
        });

        this.log("🔄 Reprise du benchmark", "info");
    }

    /**
     * Stoppe immédiatement tous les benchmarks en cours et vide la liste des Web Workers.
     */
    static stopAllBenchmarks() {
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.currentBenchmarks = [];
        this.log("🛑 Tous les benchmarks ont été arrêtés.", "info");
    }

    /* ====================================================================================
    /*  SECTION 4 : GESTION DES LOGS, HISTORIQUE ET PARAMÈTRES
    /* ==================================================================================== */

    /**
     * Ajoute un log dans la console du benchmark.
     * @param {string} message - Message du log
     * @param {string} type - Type du log ("info", "success", "error")
     */
    static log(message, type) {
        BenchmarkTerminal.addLog(type, message);
    }

    /**
     * Retourne les résultats stockés sous forme d'historique.
     * @returns {Array} - Liste des benchmarks enregistrés
     */
    static getHistory() {
        return this.results;
    }

    /**
     * Définit dynamiquement le nombre d’itérations pour les benchmarks futurs.
     * @param {number} newIterations - Nouveau nombre d’itérations
     */
    static setIterations(newIterations) {
        if (newIterations <= 0) {
            this.log("⚠️ Nombre d'itérations invalide, valeur ignorée.", "error");
            return;
        }
        this.iterations = newIterations;
        this.log(`🔧 Nombre d'itérations défini à ${newIterations}`, "info");
    }
}
