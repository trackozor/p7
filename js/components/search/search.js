/* ====================================================================================
FICHIER          : search.js
AUTEUR           : Trackozor
VERSION          : 1.5
DESCRIPTION      : Gestion du système de recherche avancé.
                    - Sélection entre une recherche "native" et "fonctionnelle".
                    - Vérification et normalisation de la requête.
                    - Journalisation détaillée des actions.
   ==================================================================================== */

import { searchRecipesFunctional } from "./searchFunctional.js";
import { searchRecipesLoopNative } from "./searchloopNative.js"; 
import { logEvent } from "../../utils/utils.js";
import { updateRecipes } from "./displayResults.js";

/* ====================================================================================
    MODES DE RECHERCHE
   ==================================================================================== */
/**
 * Définition du mode de recherche utilisé.
 *
 * - "native" : Recherche avec boucles `for`
 * - "functional" : Recherche avec `filter()`
 *
 * @type {string}
 */
let searchMode = "functional"; 

/* ====================================================================================
    FONCTIONS PRINCIPALES DE RECHERCHE
   ==================================================================================== */
/**
 * Exécute la recherche avec le mode défini.
 *
 * - Nettoie et normalise la requête utilisateur.
 * - Vérifie que la requête est valide (min 3 caractères).
 * - Sélectionne et exécute le mode de recherche (`native` ou `functional`).
 * - Met à jour l'affichage des recettes via `updateRecipes()`.
 *
 * @param {string} query - Texte recherché par l'utilisateur.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function Search(query) {
    try {
        logEvent("test_start", `Search : Début de la recherche avec mode "${searchMode}"`);

        // Nettoyage et normalisation de la requête utilisateur
        const sanitizedQuery = query.trim().toLowerCase();

        // Vérification de la longueur minimale de la requête
        if (sanitizedQuery.length < 3) {
            logEvent("warn", "Search : Requête trop courte (minimum 3 caractères).");
            updateRecipes([]); // Réinitialise l'affichage si la requête est invalide
            return [];
        }

        let results = [];

        // Exécution de la recherche selon le mode actif
        if (searchMode === "native") {
            results = await searchRecipesLoopNative(sanitizedQuery);
        } else {
            results = await searchRecipesFunctional(sanitizedQuery);
        }

        logEvent("info", `Search : ${results.length} recette(s) trouvée(s) pour "${sanitizedQuery}"`);

        // Mise à jour de l'affichage des résultats
        updateRecipes(results);

        logEvent("test_end", "Search : Recherche terminée.");
        return results;
    } catch (error) {
        logEvent("error", "Search : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

/* ====================================================================================
    GESTION DU MODE DE RECHERCHE
   ==================================================================================== */
/**
 * Change dynamiquement la méthode de recherche utilisée.
 *
 * - Vérifie que le mode est valide avant de l'appliquer.
 * - Met à jour `searchMode` avec la nouvelle valeur.
 * - Relance une recherche si une requête est en cours et contient au moins 3 caractères.
 *
 * @param {string} mode - "native" ou "functional".
 * @param {string} [query=""] - Requête en cours (si existante).
 * @returns {void}
 */
export function setSearchMode(mode, query = "") {
    try {
        logEvent("test_start", `setSearchMode : Tentative de changement en mode "${mode}"`);

        // Vérifie si le mode fourni est valide
        if (mode !== "native" && mode !== "functional") {
            logEvent("error", "setSearchMode : Mode invalide, utilisez 'native' ou 'functional'.");
            return;
        }

        // Mise à jour du mode de recherche
        searchMode = mode;
        logEvent("success", `setSearchMode : Mode de recherche changé en "${mode}"`);

        // Relance une recherche si une requête est en cours (>= 3 caractères)
        if (query.length >= 3) {
            Search(query);
        }

        logEvent("test_end", "setSearchMode : Mode de recherche mis à jour avec succès.");
    } catch (error) {
        logEvent("error", "setSearchMode : Erreur lors du changement de mode de recherche.", { error: error.message });
    }
}
