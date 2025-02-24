/* ====================================================================================
/*  FICHIER          : main.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 08/02/2025
/*  DERNIÈRE MODIF.  : 24/02/2025
/*  DESCRIPTION      : Orchestration des recettes, filtres et du Benchmark Dashboard.
/* ==================================================================================== */

import { logEvent, waitForElement } from "./utils/utils.js";
import { dataManager } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import { BenchmarkDashboard } from "./utils/benchmark-dashboard.js";
import { initFilters } from "./components/filterManager.js";
import { createPasswordModal } from "./components/factory/modalFactory.js";
import { Search } from "./components/search/search.js";

/* ====================================================================================
/*  I. INITIALISATION GLOBALE DE L'APPLICATION
/* ==================================================================================== */
/**
 * Initialise l'application en chargeant les recettes, en appliquant les filtres et en configurant les événements.
 *
 * Ce processus comprend :
 * 1. L'attente du chargement du DOM.
 * 2. Le chargement des recettes depuis le gestionnaire de données.
 * 3. L'affichage des recettes dans l'interface utilisateur.
 * 4. L'initialisation des filtres et des événements utilisateur.
 * 5. La vérification du mode Benchmark (pour les tests de performance).
 *
 * @async
 * @function initApplication
 * @returns {Promise<void>} Ne retourne rien mais gère les étapes d'initialisation.
 * @throws {Error} Si aucune recette n'est trouvée ou en cas d'erreur inattendue.
 */
export async function initApplication() {
    try {
        // Étape 1 : Journaliser le démarrage de l'application
        logEvent("info", "Démarrage de l'application");

        // Étape 2 : Attendre que l'élément contenant les recettes soit présent dans le DOM
        await waitForElement("#recipes-container");

        // Étape 3 : Récupérer toutes les recettes depuis le gestionnaire de données
        const recipes = await dataManager.getAllRecipes();

        // Vérification : Si aucune recette n'est trouvée, lever une erreur
        if (!recipes || recipes.length === 0) {
            throw new Error("Aucune recette trouvée.");
        }

        // Étape 4 : Afficher toutes les recettes dans le conteneur prévu
        await templateManager.displayAllRecipes("#recipes-container", recipes);

        // Étape 5 : Initialiser les filtres de recherche
        await initFilters();

        // Étape 6 : Activer les écouteurs d'événements pour l'interaction utilisateur
        initEventListeners();

        // Étape 7 : Vérifier si le mode Benchmark est activé
        checkBenchmarkMode();

        // Étape 8 : Confirmer que l'application est bien chargée
        logEvent("success", "Application chargée avec succès !");
    } catch (error) {
        // Gestion des erreurs : Journaliser l'erreur en cas d'échec de l'initialisation
        logEvent("error", "Échec de l'initialisation de l'application.", { message: error.message });
    }
}

/* ====================================================================================
/*  II. DÉTECTION & GESTION DU MODE BENCHMARK
/* ==================================================================================== */

let benchmarkEnabled = false;
let benchmarkInstance = null;

/**
 * Vérifie si le mode Benchmark doit être activé en détectant une commande spécifique dans le champ de recherche.
 *
 * Ce processus comprend :
 * 1. La récupération des éléments du DOM nécessaires (champ de recherche et bouton de recherche).
 * 2. La gestion d'erreurs si le bouton de recherche est introuvable.
 * 3. L'ajout d'un écouteur d'événement sur le bouton de recherche pour détecter les requêtes de l'utilisateur.
 * 4. La restriction du mode Benchmark sur mobile et tablette.
 * 5. La vérification de la présence de la commande "/benchmark" ou "!benchmark".
 * 6. L'exécution du mode Benchmark si la commande est reconnue, sinon déclenchement d'une recherche normale.
 *
 * @function checkBenchmarkMode
 * @returns {void} Ne retourne rien, mais gère l'accès au mode Benchmark en fonction de la requête utilisateur.
 */
export function checkBenchmarkMode() {
    // Étape 1 : Récupérer le champ de recherche et le bouton de recherche dans le DOM
    const searchInput = document.getElementById("search");
    const searchButton = document.getElementById("search-btn");

    // Étape 2 : Vérifier si le bouton de recherche est bien présent
    if (!searchButton) {
        logEvent("error", "Bouton de recherche introuvable.");
        return;
    }

    // Étape 3 : Ajouter un écouteur d'événement au clic sur le bouton de recherche
    searchButton.addEventListener("click", (event) => {
        event.preventDefault(); // Empêcher le comportement par défaut du bouton

        // Étape 4 : Récupérer et nettoyer la requête utilisateur
        const query = searchInput.value.trim();

        // Étape 5 : Vérifier si l'écran est trop petit (mode Benchmark interdit sur mobile/tablette)
        if (window.innerWidth < 1024) {
            logEvent("error", "Mode Benchmark interdit sur mobile/tablette.");
            alert("Le mode Benchmark n'est pas disponible sur mobile et tablette.");
            return;
        }

        // Étape 6 : Vérifier si l'utilisateur a saisi une commande pour activer le mode Benchmark
        if (query === "/benchmark" || query === "!benchmark") {
            logEvent("warning", "Tentative d'accès au mode Benchmark.");
            requestAdminAccess(); // Demander l'accès administrateur pour activer le mode Benchmark
        } else {
            // Étape 7 : Si aucune commande spéciale n'est détectée, lancer une recherche normale
            logEvent("info", `Recherche normale : ${query}`);
            triggerNormalSearch(query);
        }
    });
}

/*-----------------------------------------------------------------
/*           Modale administrateur /mot de passe
 *----------------------------------------------------------------- */
/**
 * Demande une authentification administrateur pour activer le mode Benchmark.
 *
 * Ce processus comprend :
 * 1. Journalisation de la tentative d'authentification.
 * 2. Création et affichage d'une boîte de dialogue pour la saisie du mot de passe administrateur.
 * 3. Activation du mode Benchmark après validation réussie du mot de passe.
 * 4. Gestion des erreurs en cas de problème lors de l'authentification.
 *
 * @function requestAdminAccess
 * @returns {void} Ne retourne rien, mais gère la demande d'accès administrateur.
 */
export function requestAdminAccess() {
    try {
        // Étape 1 : Journaliser la tentative d'authentification
        logEvent("info", "Demande d'authentification pour le mode Benchmark.");

        // Étape 2 : Afficher une boîte de dialogue de mot de passe et activer le mode Benchmark si validé
        createPasswordModal(() => enableBenchmarkMode());
    } catch (error) {
        // Étape 3 : Gestion des erreurs et journalisation en cas d'échec
        logEvent("error", "Erreur lors de la demande d'authentification", { error: error.message });
    }
}

/*-----------------------------------------------------------------
/*           Activation du mode Benchmark
 *----------------------------------------------------------------- */
/**
 * Active le mode Benchmark après une authentification réussie.
 *
 * Ce processus comprend :
 * 1. Vérification si le mode Benchmark est déjà activé.
 * 2. Initialisation et affichage du tableau de bord Benchmark si nécessaire.
 * 3. Notification à l'utilisateur que le mode Benchmark est activé.
 * 4. Journalisation des événements pour assurer le suivi.
 * 5. Gestion des erreurs en cas de problème lors de l'activation.
 *
 * @function enableBenchmarkMode
 * @returns {void} Ne retourne rien, mais active et affiche le tableau de bord Benchmark.
 */
export function enableBenchmarkMode() {
    try {
        // Étape 1 : Vérifier si le mode Benchmark est déjà activé
        if (!benchmarkEnabled) {
            // Étape 2 : Activer le mode Benchmark
            benchmarkEnabled = true;

            // Étape 3 : Initialiser et afficher le tableau de bord Benchmark
            benchmarkInstance = BenchmarkDashboard();
            benchmarkInstance.showDashboard();

            // Étape 4 : Avertir l'utilisateur de l'activation
            alert("Mode Benchmark activé.");

            // Étape 5 : Journaliser le succès de l'activation
            logEvent("success", "Benchmark Dashboard activé avec succès.");
        } else {
            // Étape 6 : Journaliser si le mode Benchmark était déjà actif
            logEvent("info", "Le mode Benchmark est déjà activé.");
        }
    } catch (error) {
        // Étape 7 : Gestion des erreurs et journalisation en cas d'échec
        logEvent("error", "Erreur lors de l'activation du mode Benchmark", { error: error.message });
    }
}

/* ====================================================================================
/*  III. SUIVI DES INTERACTIONS UTILISATEUR
/* ==================================================================================== */

/**
 * Ajoute un écouteur d'événements global pour suivre les interactions utilisateur lorsqu'un élément est cliqué.
 *
 * Ce processus comprend :
 * 1. Vérification si le mode Benchmark est activé et si une instance est disponible.
 * 2. Suivi de l'élément cliqué via le tableau de bord Benchmark.
 * 3. Gestion des erreurs et journalisation des événements.
 *
 * @event click
 * @listens document.body
 * @returns {void} Ne retourne rien, mais enregistre les interactions utilisateur dans le mode Benchmark.
 */
document.body.addEventListener("click", (event) => {
    try {
        // Étape 1 : Vérifier si le mode Benchmark est activé et si une instance est disponible
        if (benchmarkEnabled && benchmarkInstance && event.target) {
            // Étape 2 : Suivre l'élément cliqué via l'instance Benchmark
            benchmarkInstance.trackElement(event.target);
        }
    } catch (error) {
        // Étape 3 : Gestion des erreurs et journalisation
        logEvent("error", "Erreur lors du suivi des interactions utilisateur", { error: error.message });
    }
});


/* ====================================================================================
/*  IV. RECHERCHE UTILISATEUR
/* ==================================================================================== */
/**
 * Exécute une recherche normale si ce n'est pas une commande Benchmark.
 *
 * Ce processus comprend :
 * 1. Vérification du type de la fonction `performSearch` pour s'assurer qu'elle est définie.
 * 2. Exécution de la recherche avec la requête utilisateur si la fonction est disponible.
 * 3. Gestion des erreurs et journalisation en cas de problème.
 *
 * @function triggerNormalSearch
 * @param {string} query - La requête de recherche saisie par l'utilisateur.
 * @returns {void} Ne retourne rien, mais déclenche une recherche normale.
 * @throws {Error} Si une erreur se produit lors de l'exécution de la recherche.
 */
export function triggerNormalSearch(query) {
    try {
        // Étape 1 : Vérifier si la fonction performSearch est définie avant de l'exécuter
        if (typeof Search === "function") {
            // Étape 2 : Lancer la recherche avec la requête utilisateur
            Search(query);
        } else {
            // Étape 3 : Journaliser un avertissement si la fonction est manquante
            logEvent("warning", "Fonction performSearch non définie, recherche impossible.");
        }
    } catch (error) {
        // Étape 4 : Gestion des erreurs et journalisation en cas d'échec
        logEvent("error", "Erreur lors de l'exécution de la recherche", { error: error.message });
    }
}


/* ====================================================================================
/*  DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM
/* ==================================================================================== */
document.addEventListener("DOMContentLoaded", initApplication);
