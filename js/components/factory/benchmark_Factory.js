class UIFactory {
    /* ====================================================================================
    /*  SECTION 1 : CRÉATION DU DASHBOARD PRINCIPAL
    /* ==================================================================================== */

    /**
     * Initialise et génère le Benchmark Dashboard
     * @returns {HTMLElement} - L'élément principal du Dashboard
     */
    static createDashboard() {
        const dashboard = this.createContainer(); // Création du conteneur principal
        dashboard.appendChild(this.createHeader()); // Ajout du bandeau supérieur
        dashboard.appendChild(this.createTabs()); // Ajout du système d'onglets
        dashboard.appendChild(this.createDockContainer()); // Ajout des docks flottants

        document.body.appendChild(dashboard); // Injection dans le DOM
        return dashboard;
    }

    /* ====================================================================================
    /*  SECTION 2 : CRÉATION DU CONTENEUR PRINCIPAL
    /* ==================================================================================== */

    /**
     * Crée le conteneur principal du dashboard
     * @returns {HTMLElement} - Conteneur du dashboard
     */
    static createContainer() {
        const container = document.createElement("div");
        container.id = "benchmark-dashboard"; // Attribution de l'ID principal
        container.classList.add("dashboard-container"); // Ajout d'une classe CSS pour le style
        return container;
    }

    /* ====================================================================================
    /*  SECTION 3 : CRÉATION DU BANDEAU SUPÉRIEUR (HEADER)
    /* ==================================================================================== */

    /**
     * Crée l'en-tête avec les boutons de contrôle
     * @returns {HTMLElement} - En-tête du dashboard
     */
    static createHeader() {
        const header = document.createElement("div");
        header.classList.add("benchmark-header"); // Ajout de la classe CSS

        header.innerHTML = `
            <div class="benchmark-banner">
                <h2>📊 Benchmark Dashboard</h2>
                <div class="benchmark-controls">
                    <button id="start-benchmark">▶️ Démarrer</button>
                    <button id="pause-benchmark">⏸ Pause</button>
                    <button id="replay-benchmark">🔄 Replay</button>
                    <button id="export-report">📥 Exporter</button>
                    <button id="minimize-dashboard">➖ Réduire</button>
                    <button id="close-dashboard">❌ Fermer</button>
                </div>
            </div>
        `;

        return header;
    }

    /* ====================================================================================
    /*  SECTION 4 : CRÉATION DU SYSTÈME D'ONGLETS
    /* ==================================================================================== */

    /**
     * Crée le système d'onglets pour naviguer entre les différentes sections
     * @returns {HTMLElement} - Conteneur des onglets
     */
    static createTabs() {
        const tabs = document.createElement("div");
        tabs.classList.add("benchmark-tabs"); // Ajout de la classe CSS

        tabs.innerHTML = `
            <div class="tab-buttons">
                <button class="tab-button active" data-target="tab-results">📈 Résultats</button>
                <button class="tab-button" data-target="tab-settings">⚙️ Paramètres</button>
                <button class="tab-button" data-target="tab-history">📜 Historique</button>
            </div>
            <div class="tab-content" id="tab-results">🔎 Résultats du Benchmark...</div>
            <div class="tab-content" id="tab-settings" style="display:none;">🛠 Réglages avancés...</div>
            <div class="tab-content" id="tab-history" style="display:none;">📂 Historique...</div>
        `;

        return tabs;
    }

    /* ====================================================================================
    /*  SECTION 5 : CRÉATION DU CONTENEUR DES DOCKS FLOTTANTS
    /* ==================================================================================== */

    /**
     * Crée le conteneur des docks flottants
     * @returns {HTMLElement} - Conteneur des docks
     */
    static createDockContainer() {
        const dockContainer = document.createElement("div");
        dockContainer.id = "dock-container";
        dockContainer.classList.add("dock-container");

        // Ajout des différents docks (Terminal, Graphiques, Données)
        dockContainer.appendChild(this.createDock("📟 Terminal", "benchmark-terminal"));
        dockContainer.appendChild(this.createDock("📊 Graphiques", "benchmark-graph"));
        dockContainer.appendChild(this.createDock("📂 Données", "benchmark-data"));

        return dockContainer;
    }

    /* ====================================================================================
    /*  SECTION 6 : CRÉATION D'UN DOCK FLOTTANT (DÉTACHABLE)
    /* ==================================================================================== */

    /**
     * Crée un dock flottant (panneaux détachables)
     * @param {string} title - Titre du dock
     * @param {string} id - ID du dock
     * @returns {HTMLElement} - Élément du dock
     */
    static createDock(title, id) {
        const dock = document.createElement("div");
        dock.id = id;
        dock.classList.add("dock-panel"); // Ajout de la classe CSS

        dock.innerHTML = `
            <div class="dock-header">
                <span>${title}</span>
                <button class="detach-dock">🔲 Détacher</button>
                <button class="close-dock">❌</button>
            </div>
            <div class="dock-content"></div>
        `;

        // Ajout des événements de détachement et de fermeture
        dock.querySelector(".detach-dock").addEventListener("click", () => this.detachDock(dock));
        dock.querySelector(".close-dock").addEventListener("click", () => dock.remove());

        return dock;
    }

    /* ====================================================================================
    /*  SECTION 7 : DÉTACHEMENT D'UN DOCK EN POP-UP
    /* ==================================================================================== */

    /**
     * Détache un dock en pop-up indépendante
     * @param {HTMLElement} dock - Élément du dock à détacher
     */
    static detachDock(dock) {
        const popup = window.open("", "", "width=600,height=400");

        if (popup) {
            popup.document.body.appendChild(dock);
        }
    }
}
