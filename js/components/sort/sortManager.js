/* ====================================================================================
/*  FICHIER          : sortManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 10/02/2025
/*  DERNIÈRE MODIF.  : 26/02/2025
/*  DESCRIPTION      : Trie les recettes selon la recherche et les filtres actifs.
/* ==================================================================================== */

import { templateManager } from "../templates/templateManager.js";
import { logEvent } from "../utils/utils.js";
import { getFilteredRecipes } from "../search/filterManager.js";

/* ====================================================================================
/*  Fonction : sortAndDisplayRecipes
/* ==================================================================================== */
/**
 * Trie les recettes visibles en fonction du critère choisi et met à jour l'affichage.
 *
 * @param {string} sortType - Critère de tri ("A-Z", "Z-A", "time-asc", "time-desc", "ingredients-asc", "ingredients-desc").
 */
export function sortAndDisplayRecipes() {
    try {
        // Récupère les recettes filtrées (après recherche et application des filtres)
        let filteredRecipes = getFilteredRecipes();

        if (!Array.isArray(filteredRecipes) || filteredRecipes.length === 0) {
            logEvent("warning", "sortAndDisplayRecipes : Aucune recette disponible pour le tri.");
            templateManager.displayAllRecipes("#recipes-container", []);
            return;
        }

       

    } catch (error) {
        logEvent("error", "sortAndDisplayRecipes : Erreur lors du tri des recettes.", { error: error.message });
    }
}

