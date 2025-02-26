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

        // Écouteur d'événements pour changer le type de graphique en temps réel
        document.getElementById("graph-type").addEventListener("change", (event) => {
            this.updateChartType(event.target.value);
        });
    };
}

