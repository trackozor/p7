/* ====================================================================================
/*  FICHIER          : main.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 08/02/2025
/*  DERNIÈRE MODIF.  : 24/02/2025
/*  DESCRIPTION      : Orchestration des recettes, filtres et du Benchmark Dashboard.
/* ==================================================================================== */

import { logEvent, waitForElement } from "./utils/utils.js";
import { getAllRecipes } from "./data/dataManager.js";
import { templateManager } from "./data/templateManager.js";
import { initEventListeners } from "./events/eventListener.js";
import { updateCounter } from "./components/count/count.js";
import { initFilters } from "./components/filterManager.js";
import { enableSkipLink, isMobile, trapFocus } from "./utils/accessibility.js";

/* ====================================================================================
/*  I. INITIALISATION GLOBALE DE L'APPLICATION
/* ==================================================================================== */
/**
 * Initialise l'application en chargeant les recettes, en appliquant les filtres et en configurant les événements.
 * Gère également l'accessibilité en activant la navigation au clavier et la gestion du focus.
 *
 * @async
 * @function initApplication
 * @returns {Promise<void>} Ne retourne rien mais gère les étapes d'initialisation.
 * @throws {Error} Si aucune recette n'est trouvée ou en cas d'erreur inattendue.
 */
export async function initApplication() {
    try {
        logEvent("info", "initApplication : Démarrage de l'application...");

        // Attendre que l'élément contenant les recettes soit chargé dans le DOM
        await waitForElement("#recipes-container");

        // Récupérer toutes les recettes depuis le gestionnaire de données
        const recipes = await getAllRecipes();

        // Vérifier si des recettes sont disponibles
        if (!recipes || recipes.length === 0) {
            throw new Error("Aucune recette trouvée.");
        }

        logEvent("success", `initApplication : ${recipes.length} recettes chargées.`);

        // Afficher toutes les recettes dans l'interface utilisateur
        await templateManager.displayAllRecipes("#recipes-container", recipes);
        logEvent("success", "initApplication : Recettes affichées avec succès.");

        // Initialiser les filtres de recherche
        await initFilters();
        logEvent("success", "initApplication : Filtres initialisés.");

        // Activer les écouteurs d'événements pour l'interaction utilisateur
        initEventListeners();
        logEvent("success", "initApplication : Écouteurs d'événements activés.");

        // Mettre à jour dynamiquement le compteur après affichage des recettes
        updateCounter();
        logEvent("success", "initApplication : Compteur de recettes mis à jour.");

        // Vérifier si l'utilisateur est sur mobile
        const mobile = isMobile();
        logEvent("info", `initApplication : Mode détecté - ${mobile ? "Mobile" : "Desktop"}`);

        // Activer la gestion du clavier et du focus
        document.addEventListener("keydown", (event) => {
            if (event.key === "Tab") {
                trapFocus(document.querySelector("body"));
            }
        });

        // Vérifier et activer les liens d'accès rapide si présents
        const skipLink = document.querySelector("#skip-link");
        const mainContent = document.querySelector("#main-content");
        if (skipLink && mainContent) {
            enableSkipLink(skipLink, mainContent);
            logEvent("success", "initApplication : Lien d'accès rapide activé.");
        }

        logEvent("success", "initApplication : Application chargée avec succès !");
    } catch (error) {
        logEvent("error", "initApplication : Échec de l'initialisation de l'application.", { message: error.message });
    }
}





/* ====================================================================================
/*  DÉMARRAGE AUTOMATIQUE APRÈS CHARGEMENT DU DOM
/* ==================================================================================== */
document.addEventListener("DOMContentLoaded", initApplication);
