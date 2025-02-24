/* ====================================================================================
/*  FICHIER          : GraphRenderer.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 11/02/2025
/*  DERNIÈRE MODIF.  : 13/02/2025
/*  DESCRIPTION      : Gestion de l'affichage graphique des performances en temps réel.
/*                     - Mise à jour dynamique des benchmarks.
/*                     - Sélection du type de graphique (courbe, barre, radar).
/*                     - Affichage ergonomique et interactif.
/* ==================================================================================== */

export class GraphRenderer {
    /* ====================================================================================
    /*  SECTION 1 : INITIALISATION DU GRAPHIQUE
    /* ==================================================================================== */

    /**
     * Crée le panneau des graphiques avec une sélection du type de graphe.
     * @returns {HTMLElement} - Conteneur principal du panneau graphique.
     */
    static createGraphPanel() {
        const panel = document.createElement("div");
        panel.id = "benchmark-graph-panel";
        panel.classList.add("graph-container");

        panel.innerHTML = `
            <div class="graph-header">
                <span> Performance Graph</span>
                <select id="graph-type">
                    <option value="line">Courbe</option>
                    <option value="bar">Barres</option>
                    <option value="radar">🕸 Radar</option>
                </select>
            </div>
            <canvas id="benchmarkChart"></canvas>
        `;

        this.initChart(); // Initialise le graphique par défaut
        return panel;
    }

    /* ====================================================================================
    /*  SECTION 2 : INITIALISATION DU CHART (CHART.JS)
    /* ==================================================================================== */

    /**
     * Initialise un graphique avec `Chart.js`, permettant l'affichage en temps réel des benchmarks.
     * 
     */
    static initChart() {
        const ctx = document.getElementById("benchmarkChart");
        if (!ctx) {
            console.error("GraphRenderer : Impossible d'initialiser le graphique (canvas non trouvé)");
            return;
        }

        this.chart = new Chart(ctx, {
            type: "line", // Type de graphique par défaut (courbe)
            data: {
                labels: [], // Étiquettes des benchmarks
                datasets: [{
                    label: "Temps d'exécution (ms)", // Légende du graphe
                    data: [], // Données en temps réel
                    borderWidth: 2, // Épaisseur des lignes
                }]
            },
            options: {
                responsive: true, // Rend le graphe adaptable à la taille de l'écran
                maintainAspectRatio: false, // Désactive la contrainte de ratio
                animation: {
                    duration: 500 // Animation fluide sur les mises à jour
                },
                scales: {
                    y: {
                        beginAtZero: true // Assure que l'axe Y démarre à zéro
                    }
                }
            }
        });

        // Écouteur d'événements pour changer le type de graphique en temps réel
        document.getElementById("graph-type").addEventListener("change", (event) => {
            this.updateChartType(event.target.value);
        });
    }

    /* ====================================================================================
    /*  SECTION 3 : MISE À JOUR DU GRAPHIQUE AVEC DE NOUVELLES DONNÉES
    /* ==================================================================================== */

    /**
     * Ajoute une nouvelle entrée au graphique en temps réel.
     * @param {string} label - Nom du test ou de la fonction benchmarkée.
     * @param {number} executionTime - Temps d'exécution en millisecondes.
     */
    static updateGraph(label, executionTime) {
        if (!this.chart) {
            console.error("GraphRenderer : Aucune instance de graphique trouvée.");
            return;
        }

        // Ajout des nouvelles données
        this.chart.data.labels.push(label);
        this.chart.data.datasets[0].data.push(executionTime);
        this.chart.update(); // Met à jour l'affichage

        console.log(`GraphRenderer : Données mises à jour → ${label} : ${executionTime} ms`);
    }

    /* ====================================================================================
    /*  SECTION 4 : CHANGEMENT DU TYPE DE GRAPHIQUE
    /* ==================================================================================== */

    /**
     * Modifie dynamiquement le type de graphique (courbes, barres, radar...).
     * @param {string} newType - Type de graphique souhaité ("line", "bar", "radar").
     */
    static updateChartType(newType) {
        if (!this.chart) {
            console.error("GraphRenderer : Impossible de modifier le type de graphique.");
            return;
        }

        console.log(`GraphRenderer : Changement du graphique vers le type ${newType.toUpperCase()}`);

        // Récupère les données existantes et détruit le graphique actuel
        const chartData = this.chart.data;
        this.chart.destroy();
        const ctx = document.getElementById("benchmarkChart").getContext("2d");

        // Création du nouveau graphique avec le type sélectionné
        this.chart = new Chart(ctx, {
            type: newType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}
