/**
 * ===============================================================
 * Nom du fichier  : domSelectors.js
 * Description     : Centralisation et gestion avancée des sélecteurs DOM
 *                  pour l'application Fisheye. Ce module permet de 
 *                  récupérer, gérer et surveiller les éléments du DOM 
 *                  en optimisant les performances via un système de cache 
 *                  intelligent.
 *
 * Auteur          : Trackozor
 * Date de création: 05/01/2025
 * Dernière MAJ    : 09/02/2025 (Version 2.0.0)
 * ===============================================================
 */

/*==============================================*/
/*                 Import                       */
/*==============================================*/
/**
 * Importation du module `logEvent` pour gérer la journalisation des événements.
 * Ce module est utilisé pour enregistrer les erreurs, les succès et les informations
 * relatives aux sélections DOM.
 */
import { logEvent } from "../utils/utils.js";

/*==============================================*/
/*         Cache et Sélection Sécurisée         */
/*==============================================*/
/**
 * Cache des sélections DOM pour améliorer les performances.
 * 
 */
const domCache = new Map();
/*==============================================*/
/*          Clear Cache (Purge Sélecteurs)    */
/*==============================================*/
/**
 * ---------------------------------------------------------------------------------------------------
 *  Vide intégralement le cache des sélections DOM pour garantir une mise à jour fiable des éléments.
 * ---------------------------------------------------------------------------------------------------*/
/** 
 * 
 * @function clearDomCache
 * @returns {void} Aucune valeur retournée, mais purge le cache interne.
 * @example
 *  Rafraîchir tous les sélecteurs après un gros changement dans le DOM
 * clearDomCache();
 * 
 *  Exemple d'utilisation avant une mise à jour de l'UI
 * clearDomCache();
 * updateUI(); // Fonction de mise à jour de l'interface utilisateur
 */
export function clearDomCache() {
    domCache.clear();
    logEvent("info", "Cache des sélections DOM vidé avec succès.");
}

/*==============================================*/
/*       Sélection Sécurisée d'un Élément DOM   */
/*==============================================*/
/**
 * ---------------------------------------------------------------------------------------------------
 *  Sélectionne un élément du DOM en toute sécurité avec gestion du cache et fallback optionnel.
 * ---------------------------------------------------------------------------------------------------  
 * @function safeQuerySelector
 * @param {string} selector - Sélecteur CSS de l'élément à récupérer.
 * @param {boolean} [isOptional=false] - Ne génère pas d'erreur si l'élément est absent.
 * @param {Element|null} [fallbackValue=null] - Valeur de remplacement si l'élément est introuvable.
 * @returns {Element|null} L'élément DOM sélectionné ou le fallback.
 * 
 * @example
 *  Récupérer un élément essentiel au fonctionnement de l'interface :
 * const mainContainer = safeQuerySelector("#main-container");
 * 
 */
export function safeQuerySelector(selector, isOptional = false, fallbackValue = null) {
    if (domCache.has(selector)) {
        const cachedElement = domCache.get(selector);
        if (document.body.contains(cachedElement)) {
            return cachedElement;
        }
        domCache.delete(selector);
    }

    const element = document.querySelector(selector);
    if (!element) {
        if (!isOptional) {
            logEvent("error", `Élément DOM introuvable : ${selector}`);
        }
        return fallbackValue;
    }

    domCache.set(selector, element);
    return element;
}

/*==============================================*/
/*       Sélection Sécurisée de Plusieurs Éléments DOM   */
/*==============================================*/
/** 
 * ---------------------------------------------------------------------------------------------------
 *  Récupère une liste d'éléments DOM en toute sécurité avec gestion du cache et validation dynamique.
 * ---------------------------------------------------------------------------------------------------
 * 
 * 
 * @function safeQuerySelectorAll
 * @param {string} selector - Sélecteur CSS des éléments à récupérer.
 * @returns {NodeList} Liste des éléments trouvés (peut être vide mais jamais `null`).
 * 
 * @example
 *  Récupérer tous les boutons d'action d'une page :
 * const buttons = safeQuerySelectorAll(".action-btn");
 * 
 */
export function safeQuerySelectorAll(selector) {
    if (domCache.has(selector)) {
        const cachedNodeList = domCache.get(selector);
        if (cachedNodeList.length > 0 && document.body.contains(cachedNodeList[0])) {
        return cachedNodeList;
        }
        domCache.delete(selector);
    }

    const elements = document.querySelectorAll(selector);
    if (!elements.length) {
        logEvent("warn", `Aucun élément trouvé pour : ${selector}`);
    } else {
        domCache.set(selector, elements);
    }

    return elements;
}

/*==============================================*/
/*          Détection Dynamique de la Page      */
/*==============================================*/
/**
 * ---------------------------------------------------------------------------------------------------
 *  Détecte la page active en analysant l’URL actuelle du navigateur et retourne son type.
 * ---------------------------------------------------------------------------------------------------*/
/** 
 * 
 * @function getCurrentPage
 * @returns {string} Le nom de la page détectée parmi les valeurs suivantes :
 *   - `"index"` : Page d’accueil.
 *   - `"recipe"` : Page dédiée à une recette spécifique.
 *   - `"unknown"` : Aucune correspondance trouvée.
 * 
 */
export function getCurrentPage() {
    const url = window.location.pathname.toLowerCase();
    if (url.includes("recipe")) {
        return "recipe";
    }
    if (url.includes("index") || url === "/") {
        return "index";
    }
    return "unknown";
}

/*==============================================*/
/*       Définition Structurée des Sélecteurs   */
/*==============================================*/
/**
 * ---------------------------------------------------------------------------------------------------
 *  Récupère les sélecteurs DOM essentiels pour la page d’accueil (`index.html`) et les organise
 *  par catégories afin de faciliter leur utilisation et leur gestion.
 * ---------------------------------------------------------------------------------------------------
 * 
 * 
 * @function getIndexSelectors
 * @returns {Object} Un objet contenant les sélecteurs organisés par catégories.
 * 
 * @example
 *  Initialiser les sélecteurs sur la page d’accueil :
 * const selectors = getIndexSelectors();
 * console.log(selectors.search.input); // Accède au champ de recherche
 * 
 * }
 */
export function getIndexSelectors() {
    return {

        /* Structure Principale        */
        layout: {
            body: document.body,
            header: safeQuerySelector("header"),
            main: safeQuerySelector("main"),
            footer: safeQuerySelector("footer"),
        },

        /* Barre de Recherche          */
        search: {
            form: safeQuerySelector(".search-bar"),
            searchInput: safeQuerySelector("#search"),
            button: safeQuerySelector("#search-btn"),
            
        },

        filters: {
            container: safeQuerySelector("#filters") || waitForElement("#filters"),
            dropdowns: safeQuerySelectorAll(".filter-dropdown"),
            searchInputs: safeQuerySelectorAll(".dropdown-search"),
            ingredients: safeQuerySelector('[data-filter-type="ingredients"]') || waitForElement('[data-filter-type="ingredients"]'),
            appliances: safeQuerySelector('[data-filter-type="appliances"]') || waitForElement('[data-filter-type="appliances"]'),
            ustensils: safeQuerySelector('[data-filter-type="ustensils"]') || waitForElement('[data-filter-type="ustensils"]'),
        },


        /* Recettes */
        recipes: {
            recipeCards: safeQuerySelector(".recipe-card", true) || null,
        },

        /* Compteur de Recettes        */
        recipeCount: {
            container: safeQuerySelector("#recipe-count-container"),
        },
    };
}

/* =============================================
/*   WaitforElement
/* ============================================= */
/**
 * Attend qu'un élément spécifique apparaisse dans le DOM avant de l’utiliser.
 * 
 * - Utilise `safeQuerySelector()` pour exploiter le cache DOM.
 * - Observe les changements en temps réel avec `MutationObserver`.
 * - Gère proprement le timeout pour éviter les boucles infinies.
 *
 * @param {string} selector - Sélecteur CSS de l'élément à attendre.
 * @param {number} timeout - Délai maximum (par défaut : 5000ms).
 * @returns {Promise<Element>} Élément DOM résolu ou rejeté après expiration.
 */
/**
 * Attend qu'un élément spécifique apparaisse dans le DOM avant de l'utiliser.
 * @param {string} selector - Sélecteur CSS de l'élément à attendre.
 * @param {number} timeout - Délai maximum en millisecondes (par défaut 5000ms).
 * @returns {Promise<Element>} - Résout avec l'élément trouvé ou rejette en cas de timeout.
 */
export function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        function checkElement() {
            const element = document.querySelector(selector);
            if (element) {
                logEvent("info", `✅ Élément trouvé : ${selector}`);
                resolve(element);
                return;
            }

            if (Date.now() - startTime >= timeout) {
                logEvent("error", `⏳ Timeout atteint : "${selector}" non trouvé.`);
                reject(new Error(`Timeout atteint : "${selector}" non trouvé.`));
                return;
            }

            setTimeout(checkElement, 100);
        }

        checkElement();
    });
}

/*==============================================*/
/*    Vérification de la Présence des Éléments  */
/*==============================================*/
/**
 * Parcourt un objet contenant des sélecteurs DOM pour vérifier leur présence et signaler ceux manquants.
 *
 * - Construit une hiérarchie des sélecteurs pour un meilleur suivi.
 * - Identifie et stocke les sélecteurs manquants.
 *
 * @function recursiveCheck
 * @param {Object} obj - Objet contenant les sélecteurs à vérifier (ex: `getIndexSelectors()`).
 * @param {string} [parentKey=""] - Clé parent servant à générer un chemin hiérarchique clair des sélecteurs.
 * @param {Array<string>} [missingSelectors=[]] - Tableau utilisé pour stocker les sélecteurs manquants.
 * @returns {Array<string>} Liste des sélecteurs manquants sous forme de chaînes de caractères.
 *
 * @example
 *  Vérifier les sélecteurs d'une page donnée :
 * const selectors = getIndexSelectors();
 * const missing = recursiveCheck(selectors);
 * if (missing.length > 0) {
 *    logEvent("warn", "Sélecteurs manquants détectés.", { missing });
 * }
 */
export function recursiveCheck(obj, parentKey = "", missingSelectors = []) {
    logEvent("test_start_events", `Début de la vérification des sélecteurs DOM pour : ${parentKey || "racine"}`);

    Object.entries(obj).forEach(([key, value]) => {
        // Construit la clé complète pour suivre la hiérarchie des sélecteurs
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        // Si la valeur est un objet, on applique la récursivité
        if (typeof value === "object" && value !== null) {
            logEvent("info", `Exploration du groupe de sélecteurs : ${fullKey}`);
            recursiveCheck(value, fullKey, missingSelectors);
        } 
        // Si la valeur est absente (null ou undefined), elle est ajoutée à la liste des manquants
        else if (!value) {
            logEvent("warn", `Sélecteur manquant détecté : ${fullKey}`);
            missingSelectors.push(fullKey);
        }
    });

    if (missingSelectors.length > 0) {
        logEvent("error", "Vérification terminée : Des sélecteurs manquent.", { missingSelectors });
    } else {
        logEvent("test_end_events", "Vérification terminée : Aucun sélecteur manquant.");
    }

    return missingSelectors; // Retourne la liste des sélecteurs manquants
}

/*==============================================*/
/*    Vérification Globale des Sélecteurs       */
/*==============================================*/
/**
 * Vérifie la présence de tous les sélecteurs nécessaires au bon fonctionnement d’une page donnée.
 *
 * - Analyse l’objet de sélecteurs et identifie ceux qui sont manquants.
 * - Utilise `recursiveCheck()` pour une détection approfondie.
 *
 * @function checkSelectors
 * @param {Object} selectors - Objet contenant les sélecteurs DOM à vérifier (ex: `getIndexSelectors()`).
 * @returns {Array<string>} Liste des sélecteurs manquants sous forme de chaînes de caractères.
 *
 * @example
 *  Vérifier les sélecteurs d'une page spécifique :
 * const missingSelectors = checkSelectors(getIndexSelectors());
 * if (missingSelectors.length > 0) {
 *    logEvent("warn", "Sélecteurs DOM manquants :", { missingSelectors });
 * }
 */
export function checkSelectors(selectors) {
    logEvent("test_start_events", "Début de la vérification globale des sélecteurs DOM.");

    const missingSelectors = recursiveCheck(selectors);

    if (missingSelectors.length > 0) {
        logEvent("error", "Sélecteurs DOM manquants détectés.", { missingSelectors });
    } else {
        logEvent("test_end_events", "Tous les sélecteurs DOM sont présents.");
    }

    return missingSelectors;
}

/*==============================================*/
/*          Chargement Dynamique des Sélecteurs */
/*==============================================*/
/**
 * Charge dynamiquement les sélecteurs nécessaires en fonction de la page détectée.
 *
 * - Identifie la page en cours.
 * - Récupère les sélecteurs appropriés.
 * - Vérifie la présence des sélecteurs et signale ceux qui sont absents.
 *
 * @function loadSelectorsForCurrentPage
 * @returns {Object} Un objet contenant les sélecteurs DOM propres à la page actuelle.
 *
 * @example
 *  Charger les sélecteurs de la page courante :
 * const selectors = loadSelectorsForCurrentPage();
 * console.log(selectors);
 */
export function loadSelectorsForCurrentPage() {
    logEvent("info", "🔄 Chargement des sélecteurs DOM pour la page actuelle...");

    const currentPage = getCurrentPage();
    let selectors = {};

    if (currentPage === "index") {
        selectors = getIndexSelectors();
    }

    return selectors;
}



/*==============================================*/
/*        Rafraîchissement des Sélecteurs       */
/*==============================================*/
/**
 * Réinitialise dynamiquement les sélecteurs DOM pour garantir leur validité et éviter les erreurs.
 *
 * - Vide le cache pour s'assurer d'utiliser des références valides.
 * - Recharge les sélecteurs adaptés à la page active.
 *
 * @function refreshSelectors
 * @returns {void} Ne retourne rien mais met à jour les sélecteurs en arrière-plan.
 *
 * @example
 *  Rafraîchir les sélecteurs après un changement dynamique :
 * refreshSelectors();
 * 
 *  Exemple d'utilisation avant une action critique :
 * refreshSelectors();
 * updateUI(); // Fonction qui met à jour l'affichage
 */
export function refreshSelectors() {
    logEvent("test_start_events", "Début du rafraîchissement des sélecteurs DOM...");

    // Purge le cache pour garantir des références valides
    logEvent("info", "Vidage du cache des sélections DOM.");
    clearDomCache();

    // Recharge les sélecteurs dynamiquement en fonction de la page active
    logEvent("info", "Rechargement des sélecteurs en fonction de la page active.");
    Object.assign(domSelectors, loadSelectorsForCurrentPage());

    logEvent("test_end_events", "Sélecteurs DOM mis à jour avec succès.");
}

/*==============================================*/
/*        Initialisation des Sélecteurs         */
/*==============================================*/
/**
 * ---------------------------------------------------------------------------------------------------
 *  Initialise les sélecteurs DOM après le chargement complet de la page et empêche une double exécution.
 * ---------------------------------------------------------------------------------------------------
/**
 * Initialise les sélecteurs DOM après le chargement complet de la page et empêche une double exécution.
 *
 * - Charge les sélecteurs DOM en fonction de la page détectée.
 * - Vérifie si l'initialisation a déjà eu lieu pour éviter toute duplication.
 *
 * @function initializeDomSelectors
 * @returns {void} Ne retourne rien mais charge les sélecteurs DOM de manière sécurisée.
 *
 * @example
 *  Lancement automatique au chargement du DOM :
 * document.addEventListener("DOMContentLoaded", initializeDomSelectors);
 *
 *  Vérification manuelle avant utilisation :
 * if (!window.domSelectorsLoaded) {
 *     initializeDomSelectors();
 * }
 */
function initializeDomSelectors() {
    logEvent("test_start_events", "Début de l'initialisation des sélecteurs DOM.");

    // Empêche une double initialisation
    if (window.domSelectorsLoaded) {
        logEvent("warn", "Initialisation des sélecteurs DOM ignorée (déjà effectuée).");
        return;
    }

    // Charge dynamiquement les sélecteurs de la page
    logEvent("info", "Chargement des sélecteurs en fonction de la page actuelle.");
    Object.assign(domSelectors, loadSelectorsForCurrentPage());

    logEvent("test_end_events", "Sélecteurs DOM chargés avec succès.");

    // Marque l'initialisation comme terminée pour éviter les répétitions
    window.domSelectorsLoaded = true;
}

/*==============================================*/
/*   Observation des Changements du DOM        */
/*==============================================*/
/** 
 * ---------------------------------------------------------------------------------------------------
 *  Observe en temps réel les modifications du DOM et met à jour dynamiquement les sélecteurs.
 * ---------------------------------------------------------------------------------------------------
 *
 * @function observeDomChanges
 * @returns {void} Ne retourne rien, mais active un `MutationObserver` sur le `document.body`.
 *
 * @example
 *  Activer l'observation après le chargement du DOM :
 * document.addEventListener("DOMContentLoaded", observeDomChanges);
 *
 *  Déclenchement automatique en cas de changement dans le DOM :
 * const newElement = document.createElement("div");
 * document.body.appendChild(newElement); // Déclenche l’observation et rafraîchit les sélecteurs
 */
function observeDomChanges() {
    const observer = new MutationObserver(() => {
        // Limite les rafraîchissements inutiles avec un délai anti-rebond (debounce)
        clearTimeout(window.domUpdateTimeout);
        window.domUpdateTimeout = setTimeout(() => {
            logEvent("test_start_events", "Changements détectés, rafraîchissement des sélecteurs...");
            refreshSelectors();
        }, 300);
    });

    // Active l'observation sur tout le document pour détecter les modifications
    observer.observe(document.body, { childList: true, subtree: true });

    logEvent("test_end_events", "Observation des changements du DOM activée.");
}

// Exécute l'observation après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", observeDomChanges, initializeDomSelectors );

/*==============================================*/
/*       Export des Fonctions & Sélecteurs      */
/*==============================================*/
/** 
 * ---------------------------------------------------------------------------------------------------
 *  Regroupe et expose les fonctions essentielles de gestion des sélecteurs DOM pour toute l’application.
 * ---------------------------------------------------------------------------------------------------
 *
 * @constant {Object} domSelectors - Regroupe les fonctions clés pour la gestion des sélecteurs DOM.
 * @property {Function} safeQuerySelector - Sélection sécurisée d'un élément DOM avec cache.
 * @property {Function} getCurrentPage - Détermine la page actuelle en fonction de l'URL.
 * @property {Function} refreshSelectors - Met à jour dynamiquement les sélecteurs après une modification du DOM.
 *
 * @example
 *  Importation et utilisation dans un autre fichier :
 * import { domSelectors } from "./domSelectors.js";
 *
 *  Sélectionner un élément en toute sécurité :
 * const header = domSelectors.safeQuerySelector("header");
 *
 *  Rafraîchir les sélecteurs après un changement de DOM :
 * domSelectors.refreshSelectors();
 */
export const domSelectors = {
    safeQuerySelector,
    getCurrentPage,
    refreshSelectors,
};

// Exporte `domSelectors` comme export par défaut pour un accès simplifié
export default domSelectors;
