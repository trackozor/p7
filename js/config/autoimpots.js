/* ===================================================================================== */
/*  FICHIER          : autoImports.js                                                   */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.0                                                              */
/*  DATE DE CRÉATION : 20/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 20/02/2025                                                       */
/*  DESCRIPTION      : Système d'importation dynamique des modules du projet.          */
/*                     - Permet d'importer uniquement les modules nécessaires.         */
/*                     - Optimisation via mise en cache pour éviter les rechargements. */
/*                     - Gestion centralisée des chemins des modules.                  */
/* ===================================================================================== */

const modules = {
    utils: () => import("../utils/utils.js"),
    dataManager: () => import("../data/dataManager.js"),
    templateManager: () => import("../data/templateManager.js"),
    searchLoop: () => import("../components/search/searchloopNative.js"),
    searchFunctional: () => import("../components/search/searchFunctional.js"),
    recipeFactory: () => import("../components/factory/recipeFactory.js"),
};

// Stockage en cache pour éviter les multiples chargements
const cache = {};

/* ===================================================================================== */
/*  I. IMPORTATION DYNAMIQUE                                                             */
/* ===================================================================================== */

/**
 * **Importe un module de manière dynamique et optimise les performances.**
 * 
 * - Stocke les modules en cache pour éviter les rechargements inutiles.
 * - Gère les erreurs si le module demandé n'existe pas.
 * - Permet d'améliorer la maintenabilité en centralisant les chemins d'import.
 * 
 * @async
 * @function getModule
 * @param {string} moduleName - Nom du module à importer (doit correspondre aux clés de `modules`).
 * @returns {Promise<Object>} - Le module importé.
 * @throws {Error} - Si le module demandé n'existe pas.
 * 
 * @example
 * const utils = await getModule("utils");
 * utils.logEvent("info", "Chargement du module utils réussi.");
 */
export async function getModule(moduleName) {
    if (cache[moduleName]) {
        return cache[moduleName];
    }

    if (modules[moduleName]) {
        cache[moduleName] = await modules[moduleName]();
        return cache[moduleName];
    }

    throw new Error(`❌ Module "${moduleName}" non trouvé dans autoImports.js.`);
}

/* ===================================================================================== */
/*  II. IMPORTATION MULTIPLE                                                             */
/* ===================================================================================== */

/**
 *  **Importe plusieurs modules en une seule requête.**
 * 
 * - Utilise `Promise.all()` pour paralléliser les imports.
 * - Stocke les résultats en cache pour éviter les requêtes redondantes.
 * - Retourne un objet contenant les modules demandés.
 * 
 * @async
 * @function getModules
 * @param {Array<string>} moduleNames - Liste des modules à importer.
 * @returns {Promise<Object>} - Un objet associatif `{ moduleName: module }` avec les modules importés.
 * @throws {Error} - Si un des modules demandés n'existe pas.
 * 
 * @example
 * const { utils, dataManager } = await getModules(["utils", "dataManager"]);
 * utils.logEvent("success", "Modules chargés avec succès !");
 */
export async function getModules(moduleNames) {
    try {
        const results = await Promise.all(moduleNames.map(getModule));
        return Object.fromEntries(moduleNames.map((name, i) => [name, results[i]]));
    } catch (error) {
        throw new Error(`❌ Erreur lors de l'importation multiple : ${error.message}`);
    }
}

/* ===================================================================================== */
/*  III. LOGGING ET DEBUG                                                                */
/* ===================================================================================== */

/**
 * 🛠 **Affiche la liste des modules disponibles.**
 * 
 * @function listAvailableModules
 * @returns {Array<string>} - Liste des modules pouvant être importés.
 * 
 * @example
 * console.log(" Modules disponibles :", listAvailableModules());
 */
export function listAvailableModules() {
    return Object.keys(modules);
}

/**
 *  **Vérifie si un module est déjà chargé en cache.**
 * 
 * @function isModuleLoaded
 * @param {string} moduleName - Nom du module à vérifier.
 * @returns {boolean} - `true` si le module est en cache, sinon `false`.
 * 
 * @example
 * console.log(" Le module utils est-il chargé ?", isModuleLoaded("utils"));
 */
export function isModuleLoaded(moduleName) {
    return Boolean(cache[moduleName]);
}

