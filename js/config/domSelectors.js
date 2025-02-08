/**
 * ===============================================================
 * Nom du fichier : domSelectors.js
 * Description    : Centralisation des sélecteurs DOM pour l'application Fisheye.
 * Auteur         : Trackozor
 * Date           : 05/01/2025
 * Version        : 1.7.0 (Réorganisation des fonctions et optimisation)
 * ===============================================================
 *
 * Objectifs :
 * - Charger dynamiquement les sélecteurs selon la page en cours.
 * - Vérifier la présence des sélecteurs essentiels au bon fonctionnement.
 * - Ajouter des logs détaillés pour chaque élément trouvé ou manquant.
 * ===============================================================
 */
/*==============================================*/
/*                 Import                       */
/*==============================================*/
import { logEvent } from "../utils/utils.js";


/*==============================================*/
/*          Récupération éléments DOM           */
/*==============================================*/
const domCache = new Map(); // Stocke les sélections DOM pour éviter les requêtes répétées


/**------------------------------------------------------------------------------------
 *  FONCTION :Sélectionne un élément du DOM en toute sécurité avec gestion du cache et des erreurs.
 * --------------------------------------------------------------------------------------
 * 
 * - Utilise un cache (`domCache`) pour éviter les requêtes répétitives.
 * - Vérifie si l'élément est toujours présent dans le DOM avant de l'utiliser.
 * - Gère les erreurs si l'élément est absent, sauf s'il est optionnel.
 * 
 * @param {string} selector - Sélecteur CSS de l'élément à récupérer.
 * @param {boolean} [isOptional=false] - Si `true`, ne génère pas d'erreur si l'élément est introuvable.
 * @returns {Element|null} L'élément DOM trouvé ou `null` si non trouvé.
 */
export function safeQuerySelector(selector, isOptional = false) {
    // Vérifie d'abord si l'élément est déjà présent dans le cache
    if (domCache.has(selector)) {
        const cachedElement = domCache.get(selector);

        // Vérifie si l'élément en cache est toujours dans le DOM
        if (document.body.contains(cachedElement)) {
            return cachedElement; // Retourne l'élément valide depuis le cache
        } else {
            domCache.delete(selector); // Supprime du cache si l'élément n'existe plus
        }
    }

    // Recherche de l'élément dans le DOM si absent du cache ou supprimé du DOM
    const element = document.querySelector(selector);

    // Gestion des cas où l'élément n'est pas trouvé
    if (!element) {
        if (!isOptional) {
            logEvent("error", `Élément non trouvé : ${selector}`); // Log d'erreur si l'élément est requis
        }
        return null; // Retourne `null` si l'élément est introuvable
    }

    // Si l'élément est trouvé, l'ajoute dans le cache pour éviter une nouvelle requête
    logEvent("info", `Élément trouvé : ${selector}`);
    domCache.set(selector, element);

    return element; // Retourne l'élément sélectionné
}

/**-------------------------------------------------------------------------------
 *  FONCTION: Sélectionne plusieurs éléments du DOM en toute sécurité avec gestion du cache.
 * -------------------------------------------------------------------------------
 * 
 * - Stocke la `NodeList` en cache (`domCache`) pour éviter les requêtes répétitives.
 * - Vérifie si les éléments en cache existent toujours dans le DOM avant de les utiliser.
 * - Journalise les résultats et gère les cas où aucun élément n'est trouvé.
 * 
 * @param {string} selector - Sélecteur CSS des éléments à récupérer.
 * @returns {NodeList} Liste des éléments trouvés (peut être vide).
 */
export function safeQuerySelectorAll(selector) {
    // Vérifie si la NodeList est déjà présente et toujours valide dans le cache
    if (domCache.has(selector)) {
        const cachedNodeList = domCache.get(selector);

        // Vérifie si la liste d'éléments est encore valide en testant le premier élément
        if (cachedNodeList.length > 0 && document.body.contains(cachedNodeList[0])) {
            return cachedNodeList; // Retourne la liste d'éléments valide depuis le cache
        } else {
            domCache.delete(selector); // Supprime la NodeList invalide du cache
        }
    }

    // Recherche des éléments correspondants dans le DOM
    const elements = document.querySelectorAll(selector);

    // Gestion des cas où aucun élément correspondant n'est trouvé
    if (!elements.length) {
        logEvent("warn", `Aucun élément trouvé pour : ${selector}`);
    } else {
        logEvent("info", `Éléments trouvés pour : ${selector}, total : ${elements.length}`);
        domCache.set(selector, elements); // Stocke la NodeList dans le cache
    }

    return elements; // Retourne la liste des éléments trouvés (peut être vide)
}



/**------------------------------------------------------------------------
 *  FONCTION: Vide entièrement le cache des sélections DOM.
 * -----------------------------------------------------------------------
 * 
 * - Supprime toutes les entrées stockées dans `domCache`.
 * - Permet de forcer une nouvelle récupération des éléments du DOM.
 * - Journalise l’action pour un meilleur suivi dans la console.
 */
export function clearDomCache() {
    // Vide complètement le cache des sélections DOM
    domCache.clear();

    // Journalise l'action pour indiquer que le cache a été supprimé
    logEvent("info", "Cache des sélections DOM vidé avec succès.");
}


/*==============================================*/
/*            designation page                  */
/*==============================================*/

/**---------------------------------------------------------------
 *  FONCTION : Détermine la page actuelle en fonction de l'URL.
 *---------------------------------------------------------------
 * 
 * - Analyse `window.location.pathname` pour identifier la page courante.
 * - Renvoie `"photographer"` si l'URL contient `"photographer"`.
 * - Renvoie `"index"` si l'URL contient `"index"` ou correspond à la racine `/`.
 * - Renvoie `"unknown"` si aucun match n'est trouvé.
 * 
 * @returns {string} Le nom de la page détectée (`"index"`, `"photographer"` ou `"unknown"`).
 */
export function getCurrentPage() {
    // Récupère le chemin de l'URL et le met en minuscules pour éviter toute casse sensible
    const url = window.location.pathname.toLowerCase();

    // Vérifie si l'URL correspond à une page photographe
    if (url.includes("photographer")) {
        return "photographer"; // Page détectée : photographe
    }

    // Vérifie si l'URL correspond à la page d'accueil (index.html ou `/`)
    if (url.includes("index") || url === "/") {
        return "index"; // Page détectée : index
    }

    // Si aucune correspondance trouvée, renvoie "unknown"
    return "unknown"; // Page inconnue
}

/*==============================================*/
/*       definition sélecteurs page index       */
/*==============================================*/

/**---------------------------------------------------------------
 *  FONCTION : Récupère les sélecteurs spécifiques pour la page d'accueil (`index.html`).
 *---------------------------------------------------------------
 * 
 * - Utilise `safeQuerySelector()` pour récupérer les éléments du DOM en toute sécurité.
 * - Sépare les sélecteurs en deux groupes : `indexPage` (éléments principaux) et `templates` (modèles réutilisables).
 * - Certains sélecteurs (`photographerTemplate`) sont facultatifs (`true`).
 * 
 * @returns {Object} Un objet contenant les sélecteurs organisés par catégorie.
 */
export function getIndexSelectors() {
    return {
        // 📌 Sélecteurs principaux de la page
        indexPage: {
            body: document.body,
            header: document.querySelector("header"),
            main: document.querySelector("main"),
            footer: document.querySelector("footer"),
        },

        // 📌 Sélecteurs liés au logo et aux images de fond
        branding: {
            logo: document.querySelector(".logo"),
            backgroundImage: document.querySelector(".fond"),
        },

        // 📌 Barre de recherche
        search: {
            form: document.querySelector(".search-bar"),
            input: document.querySelector("#search"),
            button: document.querySelector("#search-btn"),
        },

        // 📌 Filtres interactifs
        filters: {
            section: document.querySelector("#filters"),
            ingredientList: document.querySelector("#ingredient-list"),
            applianceList: document.querySelector("#appliance-list"),
            ustensilList: document.querySelector("#ustensil-list"),
        },

        // 📌 Conteneur des recettes (là où on injecte les cartes)
        recipes: {
            container: document.querySelector("#recipes-container .container"),
        },

        // 📌 Conteneur des filtres dynamiques
        filterDropdowns: {
            ingredientDropdown: document.querySelector("#filter-ingredients"),
            applianceDropdown: document.querySelector("#filter-appliances"),
            ustensilDropdown: document.querySelector("#filter-ustensils"),
        },

        // 📌 Footer et informations légales
        footer: {
            container: document.querySelector("footer .container"),
            copyright: document.querySelector("footer p"),
        },
    };
}




/*==============================================*/
/*    Verification présence sélecteurs   */
/*==============================================*/

/**---------------------------------------------------------------
 *  FONCTION : Vérifie récursivement la présence des sélecteurs dans un objet donné.
 *---------------------------------------------------------------
 * 
 * - Parcourt de manière récursive un objet contenant des sélecteurs DOM.
 * - Ajoute les sélecteurs manquants dans un tableau `missingSelectors`.
 *
 * 
 * @param {Object} obj - Objet contenant les sélecteurs à vérifier.
 * @param {string} [parentKey=""] - Clé parent pour générer le chemin complet du sélecteur.
 * @param {Array<string>} [missingSelectors=[]] - Tableau contenant les sélecteurs manquants.
 * @returns {Array<string>} Liste des sélecteurs manquants.
 */
export function recursiveCheck(obj, parentKey = "", missingSelectors = []) {
    Object.entries(obj).forEach(([key, value]) => {
        // Construit la clé complète pour suivre la hiérarchie
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        // Si la valeur est un objet, on applique la récursivité
        if (typeof value === "object" && value !== null) {
            recursiveCheck(value, fullKey, missingSelectors);
        } 
        // Si la valeur est absente (null ou undefined), elle est ajoutée aux sélecteurs manquants
        else if (!value) {
            missingSelectors.push(fullKey); //  Ajoute le sélecteur manquant à la liste
        }
    });

    return missingSelectors; // Retourne la liste des sélecteurs manquants
}


/**---------------------------------------------------------------
 *  FONCTION : Vérifie la présence des sélecteurs nécessaires pour une page donnée.
 *---------------------------------------------------------------
 * 
 * - Utilise la fonction `recursiveCheck()` pour parcourir l'objet des sélecteurs.
 * - Retourne une liste des sélecteurs manquants.
 * 
 * @param {Object} selectors - Objet contenant les sélecteurs DOM de la page.
 * @returns {Array<string>} Liste des sélecteurs manquants.
 */
export function checkSelectors(selectors) {
    return recursiveCheck(selectors); //  Exécute la vérification récursive des sélecteurs
}

/*==============================================*/
/*          Chargement sélecteurs               */
/*==============================================*/
/**---------------------------------------------------------------
 *  FONCTION : Charge dynamiquement les sélecteurs en fonction de la page actuelle.
 *---------------------------------------------------------------
 * 
 * - Détecte la page en cours grâce à `getCurrentPage()`.
 * - Sélectionne les sélecteurs correspondants (`index.html` ou `photographer.html`).
 * - Vérifie si des sélecteurs sont manquants via `checkSelectors()`.
 * - Journalise les informations et erreurs éventuelles.
 * 
 * @returns {Object} Objet contenant les sélecteurs spécifiques à la page actuelle.
 */
export function loadSelectorsForCurrentPage() {
    //  Détecte la page actuelle en fonction de l'URL
    const currentPage = getCurrentPage();
    logEvent("info", `Page détectée : ${currentPage}`);

    // Initialisation des sélecteurs (par défaut vide)
    let selectors = {};

    // Sélectionne les sélecteurs correspondant à la page actuelle
    if (currentPage === "index") {
        selectors = getIndexSelectors(); // Charge les sélecteurs pour la page index
    } else if (currentPage === "photographer") {
        selectors = getPhotographerSelectors(); // Charge les sélecteurs pour la page photographe
    }

    //  Vérification des sélecteurs manquants
    const missingSelectors = checkSelectors(selectors);
    if (missingSelectors.length > 0) {
        logEvent("error", "Sélecteurs manquants détectés.", { missingSelectors });
    }

    return selectors; // Retourne l'objet des sélecteurs trouvés
}


/*==============================================*/
/*           Initialisation sélecteurs          */
/*==============================================*/

/**---------------------------------------------------------------
 *  FONCTION : Rafraîchit dynamiquement les sélecteurs DOM.
 *---------------------------------------------------------------
 * 
 * - Vide le cache des sélecteurs pour éviter l’utilisation d’éléments obsolètes.
 * - Recharge les sélecteurs en fonction de la page actuelle.
 * - Met à jour l’objet `domSelectors` avec les nouveaux sélecteurs.
 * - Journalise l’opération pour le suivi des mises à jour.
 */
export function refreshSelectors() {
    logEvent("info", "Rafraîchissement des sélecteurs DOM...");

    // Vide le cache des sélections pour garantir une nouvelle récupération
    clearDomCache();

    // Recharge les sélecteurs en fonction de la page active et met à jour `domSelectors`
    Object.assign(domSelectors, loadSelectorsForCurrentPage());

    logEvent("success", "Sélecteurs DOM mis à jour avec succès.");
}



/**---------------------------------------------------------------
 *  FONCTION : Initialise les sélecteurs après le chargement du DOM.
 *---------------------------------------------------------------
 */
function initializeDomSelectors() {
    logEvent("info", "Initialisation des sélecteurs DOM...");

    Object.assign(domSelectors, loadSelectorsForCurrentPage());

    logEvent("success", "Sélecteurs DOM chargés.");
}

// Initialisation différée après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", initializeDomSelectors);

/**---------------------------------------------------------------
 *  OBJET : `domSelectors` - Stocke tous les sélecteurs globaux.
 *---------------------------------------------------------------
 */
const domSelectors = {
    safeQuerySelector, 
    getCurrentPage, 
    refreshSelectors,
};

/**---------------------------------------------------------------
 *  FONCTION : Observe les modifications du DOM et met à jour les sélecteurs dynamiquement.
 *---------------------------------------------------------------
 * 
 * - Utilise `MutationObserver` pour détecter l'ajout de nouveaux éléments au DOM.
 * - Vérifie si un élément surveillé a été ajouté avant de rafraîchir les sélecteurs.
 * - Évite les mises à jour inutiles pour préserver les performances.
 * - Journalise les événements pour assurer un bon suivi des changements détectés.
 */
function observeDomChanges() {
    const observer = new MutationObserver((mutations) => {
        const modifiedSelectors = new Set(); //  Évite les doublons

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    for (const selector of Object.values(domSelectors)) {
                        if (selector instanceof Element && node.contains(selector)) {
                            modifiedSelectors.add(selector);
                        }
                    }
                }
            });
        });

        if (modifiedSelectors.size > 0) {
            logEvent("info", `Modification détectée (${modifiedSelectors.size} élément(s) touché(s)), mise à jour...`);
            refreshSelectors();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    logEvent("success", "Observation des changements du DOM activée.");
}



/*==============================================*/
/*        ACTIVATION DE L'OBSERVATION DOM       */
/*==============================================*/

/**---------------------------------------------------------------
 *  ACTIVATION : Démarre l'observation des changements du DOM.
 *---------------------------------------------------------------
 * 
 * - Assure que l'observation ne démarre qu'après l'initialisation des sélecteurs.
 * - Surveille les modifications du DOM pour détecter l'ajout ou la suppression d'éléments clés.
 * - Permet de maintenir `domSelectors` toujours à jour sans impact sur les performances.
 */
document.addEventListener("DOMContentLoaded", () => {
    logEvent("info", "Initialisation complète du DOM. Démarrage de l'observation...");
    observeDomChanges();
});

export default domSelectors;
