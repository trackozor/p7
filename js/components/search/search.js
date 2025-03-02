/* ====================================================================================
/*  FICHIER          : search.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 10/02/2025
/*  DERNIÈRE MODIF.  : 11/02/2025
/*  DESCRIPTION      : Gestion de la recherche de recettes avec filtres avancés.
/*                     - Recherche via boucle `for` (native) ou `.filter()` (functional).
/*                     - Prise en compte des filtres actifs (ingrédients, ustensiles).
/*                     - Mise à jour dynamique des options disponibles.
/* ==================================================================================== */

import { searchRecipesFunctional } from "./searchFunctional.js";
import { searchRecipesLoopNative } from "./searchloopNative.js"; 
import { logEvent } from "../../utils/utils.js";
import { updateRecipes } from "./displayResults.js";

/* ====================================================================================
/*                     GESTION DU MODE DE RECHERCHE
/* ==================================================================================== */

/* ------------------------------- */
/*  Mode de recherche actif        */
/* ------------------------------- */
// Mode actif : "native" (boucles) ou "functional" (filter)
let searchMode = "functional"; // Par défaut, version fonctionnelle
/**
 * Change dynamiquement la méthode de recherche utilisée.
 *
 * @param {string} mode - "native" ou "functional".
 * @param {string} [query=""] - Texte de recherche optionnel (exécuté si longueur ≥ 3).
 * @returns {void} Ne retourne rien, met à jour le mode et relance la recherche si nécessaire.
 */
export function setSearchMode(mode, query = "") {
    try {
        logEvent("info", `setSearchMode : Tentative de changement de mode vers '${mode}'.`);

        // Vérifie si le mode fourni est valide
        if (mode !== "native" && mode !== "functional") {
            throw new Error("Mode invalide, utilisez 'native' ou 'functional'.");
        }

        searchMode = mode;
        logEvent("success", `setSearchMode : Mode de recherche changé en '${mode}'.`);

        // Exécute une recherche immédiate si un mot-clé est fourni et qu'il est valide
        if (query.length >= 3) {
            Search(query);
        }
    } catch (error) {
        logEvent("error", "setSearchMode : Erreur lors du changement de mode.", { error: error.message });
    }
}

/* ====================================================================================
/*                     EXÉCUTION DE LA RECHERCHE
/* ==================================================================================== */
/**
 * Exécute la version appropriée de l'algorithme de recherche selon le mode choisi.
 *
 * @param {string} query - Texte recherché.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function Search(query) {
    try {
        logEvent("info", `Search : Début de la recherche pour '${query}' avec mode '${searchMode}'.`);

        // Vérifie si la requête est valide
        if (!query || typeof query !== "string" || query.trim().length < 3) {
            throw new Error("Requête invalide, un minimum de 3 caractères est requis.");
        }

        let results = [];

        // Exécute la recherche selon le mode actif
        if (searchMode === "native") {
            results = await searchRecipesLoopNative(query);
        } else {
            results = await searchRecipesFunctional(query);
        }

        // Vérifie que les résultats sont valides avant mise à jour
        if (!Array.isArray(results)) {
            throw new Error("Le résultat de la recherche n'est pas un tableau valide.");
        }

        logEvent("success", `Search : ${results.length} résultats trouvés pour '${query}'.`);

        // Mise à jour dynamique des recettes affichées
        updateRecipes(results);

        return results;
    } catch (error) {
        logEvent("error", "Search : Erreur lors de la recherche.", { error: error.message });
        return [];
    }
}

