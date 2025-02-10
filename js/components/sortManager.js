/* ==================================================================================== */
/*  FICHIER          : sortManager.js                                                  */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.0                                                             */
/*  DATE DE CRÉATION : 10/02/2025                                                      */
/*  DESCRIPTION      : Gère le tri dynamique des recettes                              */
/* ==================================================================================== */

import { templateManager } from "../data/templateManager.js";
import { logEvent } from "../utils/utils.js";

class SortManager {
    constructor() {
        this.currentSort = "default"; // Tri par défaut
    }

    /* 🔹 Applique un tri aux recettes et met à jour l'affichage */
    applySort(recipes, sortType) {
        if (!recipes.length) {
            return;
        }

        switch (sortType) {
            case "A-Z":
                recipes.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "Z-A":
                recipes.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "time-asc":
                recipes.sort((a, b) => a.time - b.time);
                break;
            case "time-desc":
                recipes.sort((a, b) => b.time - a.time);
                break;
            case "ingredients-asc":
                recipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
                break;
            case "ingredients-desc":
                recipes.sort((a, b) => b.ingredients.length - a.ingredients.length);
                break;
            default:
                logEvent("INFO", "🔹 Tri par défaut appliqué.");
                break;
        }

        logEvent("SUCCESS", `Tri appliqué : ${sortType}`);
        templateManager.displayAllRecipes("#recipes-container", recipes);
    }
}

/*  Export du module */
export const sortManager = new SortManager();
