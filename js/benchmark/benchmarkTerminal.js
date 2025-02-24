/* ====================================================================================
/*  FICHIER          : BenchmarkTerminal.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.1
/*  DATE DE CRÉATION : 11/02/2025
/*  DERNIÈRE MODIF.  : 13/02/2025
/*  DESCRIPTION      : Terminal interactif affichant les logs en direct du benchmark.
/*                     - Gestion avancée des logs : ajout, effacement, export.
/*                     - Filtres et recherche pour une meilleure lisibilité.
/*                     - Interface optimisée pour l’expérience utilisateur.
/* ==================================================================================== */

export class BenchmarkTerminal {
    /* ====================================================================================
    /*  SECTION 1 : INITIALISATION DU TERMINAL
    /* ==================================================================================== */

    /**
     * Initialise et génère le terminal des logs avec les contrôles d’interaction.
     * @returns {HTMLElement} - Élément du terminal
     */
    static createTerminal() {
        const terminal = document.createElement("div");
        terminal.id = "benchmark-terminal";
        terminal.classList.add("benchmark-terminal");

        terminal.innerHTML = `
            <div class="terminal-header">
                <span>📟 Console Benchmark</span>
                <div class="terminal-controls">
                    <input type="text" id="search-logs" placeholder="🔍 Rechercher..." title="Rechercher un log">
                    <select id="log-filter">
                        <option value="all">📃 Tous</option>
                        <option value="info">ℹ️ Infos</option>
                        <option value="success">✅ Succès</option>
                        <option value="error">❌ Erreurs</option>
                    </select>
                    <button id="download-logs">📥 Télécharger</button>
                    <button id="copy-logs">📋 Copier</button>
                    <button id="clear-logs">🧹 Effacer</button>
                </div>
            </div>
            <div id="log-content" class="log-content"></div>
        `;

        this.bindEvents(terminal);
        return terminal;
    }

    /* ====================================================================================
    /*  SECTION 2 : GESTION DES ÉVÉNEMENTS DU TERMINAL
    /* ==================================================================================== */

    /**
     * Lie les événements aux boutons et éléments interactifs du terminal.
     * @param {HTMLElement} terminal - Élément du terminal
     */
    static bindEvents(terminal) {
        terminal.querySelector("#clear-logs").addEventListener("click", () => this.clearLogs());
        terminal.querySelector("#copy-logs").addEventListener("click", () => this.copyLogs());
        terminal.querySelector("#download-logs").addEventListener("click", () => this.downloadLogs());
        terminal.querySelector("#log-filter").addEventListener("change", (event) => this.filterLogs(event.target.value));
        terminal.querySelector("#search-logs").addEventListener("input", (event) => this.searchLogs(event.target.value));
    }

    /* ====================================================================================
    /*  SECTION 3 : AJOUTER UN LOG DANS LE TERMINAL
    /* ==================================================================================== */

    /**
     * Ajoute une ligne de log au terminal avec un timestamp.
     * @param {string} type - Type de log ("info", "success", "error")
     * @param {string} message - Message à afficher
     */
    static addLog(type, message) {
        const logContent = document.getElementById("log-content");
        if (!logContent) return;

        const logEntry = document.createElement("div");
        logEntry.classList.add("log-entry", type);
        logEntry.dataset.message = message.toLowerCase(); // Stocke pour la recherche
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight; // Scroll auto vers le bas
    }

    /* ====================================================================================
    /*  SECTION 4 : GESTION DES LOGS (EFFACER, COPIER, EXPORTER)
    /* ==================================================================================== */

    /**
     * Efface tous les logs du terminal.
     */
    static clearLogs() {
        const logContent = document.getElementById("log-content");
        if (logContent) logContent.innerHTML = "";
    }

    /**
     * Copie le contenu des logs dans le presse-papier.
     */
    static copyLogs() {
        const logContent = document.getElementById("log-content");
        if (!logContent) return;

        const text = Array.from(logContent.children).map(log => log.textContent).join("\n");
        navigator.clipboard.writeText(text).then(() => {
            alert("📋 Logs copiés !");
        }).catch(err => {
            console.error("Erreur lors de la copie des logs :", err);
        });
    }

    /**
     * Télécharge les logs sous forme de fichier `.txt`.
     */
    static downloadLogs() {
        const logContent = document.getElementById("log-content");
        if (!logContent) return;

        const text = Array.from(logContent.children).map(log => log.textContent).join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "benchmark_logs.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log("📥 Logs téléchargés avec succès.");
    }

    /* ====================================================================================
    /*  SECTION 5 : FILTRAGE & RECHERCHE DES LOGS
    /* ==================================================================================== */

    /**
     * Filtre l'affichage des logs selon le type choisi.
     * @param {string} filter - Type de log à afficher ("all", "info", "success", "error")
     */
    static filterLogs(filter) {
        const logEntries = document.querySelectorAll(".log-entry");
        logEntries.forEach(entry => {
            entry.style.display = (filter === "all" || entry.classList.contains(filter)) ? "block" : "none";
        });
    }

    /**
     * Recherche un texte dans les logs et masque ceux qui ne correspondent pas.
     * @param {string} searchText - Texte recherché
     */
    static searchLogs(searchText) {
        const logEntries = document.querySelectorAll(".log-entry");
        const lowerSearchText = searchText.toLowerCase();

        logEntries.forEach(entry => {
            const message = entry.dataset.message || "";
            entry.style.display = message.includes(lowerSearchText) ? "block" : "none";
        });
    }
}
