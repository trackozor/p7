/* ====================================================================================
   FICHIER          : search.js
   AUTEUR           : Trackozor
   VERSION          : 1.4
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
   - Le mode actif peut être "native" (boucles for) ou "functional" (filter()).
   - Par défaut, on privilégie la version "functional".
   ==================================================================================== */

let searchMode = "functional"; 

/**
 * Exécute la recherche avec le mode défini.
 *
 * - Normalise la requête pour éviter les erreurs.
 * - Vérifie que la requête a une longueur valide.
 * - Sélectionne le bon mode de recherche (`native` ou `functional`).
 * - Passe les résultats à `updateRecipes()` pour l'affichage.
 *
 * @param {string} query - Texte recherché par l'utilisateur.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function Search(query) {
    try {
        logEvent("test_start", `Search : Début de la recherche avec mode "${searchMode}"`);

        // Vérification et nettoyage de la requête utilisateur
        const sanitizedQuery = query.trim().toLowerCase();

        if (sanitizedQuery.length < 3) {
            logEvent("warn", "Search : Requête trop courte (minimum 3 caractères).");
            updateRecipes([]); // Réinitialise l'affichage si la requête est invalide
            return [];
        }

        let results = [];

        // Sélection du mode de recherche
        if (searchMode === "native") {
            results = await searchRecipesLoopNative(sanitizedQuery);
        } else {
            results = await searchRecipesFunctional(sanitizedQuery);
        }

        logEvent("info", `Search : ${results.length} recette(s) trouvée(s) pour "${sanitizedQuery}"`);

        // Mise à jour de la galerie avec les nouvelles recettes
        updateRecipes(results);

        logEvent("test_end", "Search : Recherche terminée.");
        return results;
    } catch (error) {
        logEvent("error", "Search : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

/**
 * Change dynamiquement la méthode de recherche utilisée.
 *
 * - Vérifie que le mode est valide avant d'appliquer le changement.
 * - Relance une recherche si une requête est déjà en cours.
 *
 * @param {string} mode - "native" ou "functional".
 * @param {string} [query=""] - Requête en cours (si existante).
 */
export function setSearchMode(mode, query = "") {
    if (mode !== "native" && mode !== "functional") {
        logEvent("error", "setSearchMode : Mode invalide, utilisez 'native' ou 'functional'.");
        return;
    }

    searchMode = mode;
    logEvent("success", `setSearchMode : Mode de recherche changé en "${mode}"`);

    // Si une requête est déjà en cours et contient au moins 3 caractères, relancer la recherche
    if (query.length >= 3) {
        Search(query);
    }
}
