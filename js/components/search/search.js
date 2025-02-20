/* ==================================================================================== */
/*  FICHIER          : search.js                                                       */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.3                                                             */
/*  DATE DE CRÉATION : 10/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 11/02/2025                                                      */
/*  DESCRIPTION      : Gestion de la recherche de recettes avec filtres avancés.      */
/*                     - Recherche avec une boucle `for` et avec `.filter()`.         */
/*                     - Prise en compte des filtres actifs (ingrédients, ustensiles).*/
/*                     - Mise à jour dynamique des options disponibles.               */
/* ==================================================================================== */

import { searchRecipesLoopNative } from "./searchloopNative.js";
import { searchRecipesFunctional } from "./searchFunctional.js";
import { debounce, logEvent } from "../../utils/utils.js";

// Mode de recherche actif : soit "native" (boucles) soit "functional" (filter)
let searchMode = "functional"; // Par défaut, on utilise la version fonctionnelle

/**
 * Exécute la bonne version de l'algorithme de recherche selon le mode choisi.
 *
 * @param {string} query - Texte recherché.
 * @returns {Promise<Array>} Liste des recettes correspondant aux critères.
 */
export async function executeSearch(query) {
    logEvent("info", `Exécution de la recherche avec mode : ${searchMode}`);

    if (searchMode === "native") {
        return await searchRecipesLoopNative(query);
    } else {
        return await searchRecipesFunctional(query);
    }
}

/**
 * Change dynamiquement la méthode de recherche utilisée.
 *
 * @param {string} mode - "native" ou "functional".
 */
export function SearchMode(mode) {
    if (mode === "native" || mode === "functional") {
        searchMode = mode;
        logEvent("success", `Mode de recherche changé : ${mode}`);
    } else {
        logEvent("error", "Mode de recherche invalide, utilisez 'native' ou 'functional'.");
    }
}

// Ajout du debounce sur l’input de recherche
document.querySelector("#search").addEventListener("input", debounce(() => {
    const query = document.querySelector("#search").value;
    executeSearch(query).then(displayResults);
}, 300));
