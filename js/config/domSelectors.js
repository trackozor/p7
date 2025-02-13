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
 *
 * Objectifs :
 * - Charger dynamiquement les sélecteurs DOM en fonction de la page active.
 * - Vérifier la présence des sélecteurs essentiels et identifier ceux manquants.
 * - Optimiser les requêtes DOM en stockant les éléments dans un cache local.
 * - Mettre à jour automatiquement les sélecteurs si le DOM est modifié.
 * - Éviter les erreurs en fournissant des alternatives aux éléments manquants.
 * - Centraliser les sélecteurs pour une meilleure maintenabilité du code.
 *
 * Fonctionnalités :
 * 
 *  Gestion avancée du **cache DOM** pour éviter les requêtes inutiles.
 *  Sélection sécurisée des éléments avec **fallback et journalisation des erreurs**.
 * **Détection automatique** de la page active via l’URL.
 *  Vérification récursive des sélecteurs et **rapport des éléments manquants**.
 *  Système de **rafraîchissement dynamique** pour suivre les modifications du DOM.
 *  **Surveillance du DOM** via `MutationObserver` pour détecter les changements en temps réel.
 *  Optimisation des performances avec **détection et prévention des accès redondants**.
 *  Gestion de l’**initialisation différée** pour garantir le chargement complet du DOM avant utilisation.
 *
 *  Architecture du module :
 * 
 * - **Cache DOM** : Stocke les sélecteurs pour limiter les appels répétitifs.
 * - **Fonctions de sélection** : Récupèrent les éléments de manière optimisée.
 * - **Gestion de page** : Identifie la page actuelle et charge les sélecteurs adaptés.
 * - **Vérification des sélecteurs** : Détecte les éléments manquants pour éviter les erreurs.
 * - **Chargement dynamique** : Adapte les sélecteurs selon le contexte.
 * - **Observation des changements** : Met à jour les sélecteurs lorsque le DOM évolue.
 *
 * Standards et Bonnes Pratiques :
 * 
 * - Utilisation de **`Map()`** pour un cache rapide et efficace.
 * - Journalisation détaillée avec **`logEvent()`** pour chaque action.
 * - Utilisation de **`MutationObserver`** pour améliorer la robustesse.
 * - Respect des principes **DRY** (Don't Repeat Yourself) et **KISS** (Keep It Simple, Stupid).
 * - Code entièrement **documenté** et **structuré** pour faciliter la maintenance.
 *
 * Version et Historique :
 * 
 * - v1.0.0 (05/01/2025) : Création initiale du fichier avec récupération basique des sélecteurs.
 * - v1.5.0 (15/01/2025) : Ajout du cache DOM et amélioration de la gestion des erreurs.
 * - v1.7.0 (01/02/2025) : Détection automatique de la page active et log avancé des erreurs.
 * - v2.0.0 (09/02/2025) : Surveillance du DOM, rafraîchissement dynamique et optimisation des performances.
 *
 * Licence :
 * 
 * Ce code est distribué sous licence **MIT**, libre de modification et d'utilisation.
 *
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
import {createFilterSection} from "../components/factory/dropdownFactory.js";

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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Vide intégralement le cache des sélections DOM pour garantir une mise à jour fiable des éléments.
 * ---------------------------------------------------------------------------------------------------
 * 
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Sélectionne un élément du DOM en toute sécurité avec gestion du cache et fallback optionnel.
 * ---------------------------------------------------------------------------------------------------
 * 
 *  
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

/** ## DESCRIPTION ##
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Détecte la page active en analysant l’URL actuelle du navigateur et retourne son type.
 * ---------------------------------------------------------------------------------------------------
 * 
 * 
 * @function getCurrentPage
 * @returns {string} Le nom de la page détectée parmi les valeurs suivantes :
 *   - `"index"` : Page d’accueil.
 *   - `"photographer"` : Page dédiée à un photographe spécifique.
 *   - `"unknown"` : Aucune correspondance trouvée.
 * 
 * @example
 *  Appliquer un comportement spécifique selon la page :
 * const currentPage = getCurrentPage();
 * if (currentPage === "index") loadHomepageFeatures();
 * if (currentPage === "photographer") setupPhotographerProfile();
 * 
 */
export function getCurrentPage() {
    const url = window.location.pathname.toLowerCase();
    if (url.includes("photographer")) {
        return "photographer";
    }
    if (url.includes("index") || url === "/") {
        return "index";
    }
    return "unknown";
}


/*==============================================*/
/*       Définition Structurée des Sélecteurs   */
/*==============================================*/

/** ## DESCRIPTION ##
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
        /* ============================== */
        /* Structure Principale        */
        /* ============================== */
        layout: {
            body: document.body,
            header: safeQuerySelector("header"),
            main: safeQuerySelector("main"),
            footer: safeQuerySelector("footer"),
        },

        /* ============================== */
        /* Barre de Recherche          */
        /* ============================== */
        search: {
            form: safeQuerySelector(".search-bar"),
            input: safeQuerySelector("#search"),
            button: safeQuerySelector("#search-btn"),
        },

        /* ============================== */
        /* Filtres Dynamiques          */
        /* ============================== */
        filters: {
            container: safeQuerySelector("#filters"),
            ingredients: () => safeQuerySelector('#ingredient-list') || waitForElement('[data-filter="ingredients"]'),
            appliances: () => safeQuerySelector('[data-filter="appliances"]') || waitForElement('[data-filter="appliances"]'),
            utensils: () => safeQuerySelector('[data-filter="utensils"]') || waitForElement('[data-filter="utensils"]'),
        },

        /* ============================== */
        /* Recettes                    */
        /* ============================== */
        recipes: {
            recipeCards: () => safeQuerySelector(".recipe-card", true),
        },

        /* ============================== */
        /* Compteur de Recettes        */
        /* ============================== */
        recipeCount: {
            container: safeQuerySelector("#recipe-count-container"),
        },
    };
}

/**
 * Attend qu'un élément apparaisse dans le DOM avant de le récupérer.
 *
 * @param {string} selector - Sélecteur CSS de l'élément à attendre.
 * @returns {Promise<Element>} Élément DOM une fois disponible.
 */
export function waitForElement(selector) {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}
/*==============================================*/
/*    Vérification de la Présence des Éléments  */
/*==============================================*/

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Parcourt un objet contenant des sélecteurs DOM pour vérifier leur présence et signaler ceux manquants.
 * ---------------------------------------------------------------------------------------------------
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
 *    console.warn("Sélecteurs manquants :", missing);
 * }
 */
export function recursiveCheck(obj, parentKey = "", missingSelectors = []) {
    Object.entries(obj).forEach(([key, value]) => {
        // Construit la clé complète pour suivre la hiérarchie des sélecteurs
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        // Si la valeur est un objet, on applique la récursivité
        if (typeof value === "object" && value !== null) {
            recursiveCheck(value, fullKey, missingSelectors);
        } 
        // Si la valeur est absente (null ou undefined), elle est ajoutée à la liste des manquants
        else if (!value) {
            missingSelectors.push(fullKey);
        }
    });

    return missingSelectors; // Retourne la liste des sélecteurs manquants
}


/*==============================================*/
/*    Vérification Globale des Sélecteurs       */
/*==============================================*/
/** 
 * ---------------------------------------------------------------------------------------------------
 *  Vérifie la présence de tous les sélecteurs nécessaires au bon fonctionnement d’une page donnée.
 * ---------------------------------------------------------------------------------------------------
 * 
 * @function checkSelectors
 * @param {Object} selectors - Objet contenant les sélecteurs DOM à vérifier (ex: `getIndexSelectors()`).
 * @returns {Array<string>} Liste des sélecteurs manquants sous forme de chaînes de caractères.
 * 
 * @example
 *  Vérifier les sélecteurs d'une page spécifique :
 * const missingSelectors = checkSelectors(getIndexSelectors());
 * if (missingSelectors.length > 0) {
 *    console.warn("Sélecteurs DOM manquants :", missingSelectors);
 * }
 */
export function checkSelectors(selectors) {
    return recursiveCheck(selectors);
}

/*==============================================*/
/*          Chargement Dynamique des Sélecteurs */
/*==============================================*/
/**
 * ---------------------------------------------------------------------------------------------------
 *  Charge dynamiquement les sélecteurs nécessaires en fonction de la page détectée.
 * ---------------------------------------------------------------------------------------------------
 * 
 * @function loadSelectorsForCurrentPage
 * @returns {Object} Un objet contenant les sélecteurs DOM propres à la page actuelle.
 * 
 */
export function loadSelectorsForCurrentPage() {
    const currentPage = getCurrentPage();
    logEvent("info", `Page détectée : ${currentPage}`);

    // Sélection des sélecteurs en fonction de la page détectée
    let selectors = {};
    if (currentPage === "index") {
        selectors = getIndexSelectors();
    } 

    // Vérification des sélecteurs manquants
    const missingSelectors = checkSelectors(selectors);
    if (missingSelectors.length > 0) {
        logEvent("error", "Sélecteurs manquants détectés.", { missingSelectors });
    }

    return selectors;
}

/*==============================================*/
/*        Rafraîchissement des Sélecteurs       */
/*==============================================*/
/** 
 * ---------------------------------------------------------------------------------------------------
 *  Réinitialise dynamiquement les sélecteurs DOM pour garantir leur validité et éviter les erreurs.
 * ---------------------------------------------------------------------------------------------------
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
    logEvent("info", "Rafraîchissement des sélecteurs DOM...");

    // Purge le cache pour garantir des références valides
    clearDomCache();

    // Recharge les sélecteurs dynamiquement en fonction de la page active
    Object.assign(domSelectors, loadSelectorsForCurrentPage());

    logEvent("success", "Sélecteurs DOM mis à jour avec succès.");
}

/*==============================================*/
/*        Initialisation des Sélecteurs         */
/*==============================================*/
/**
 * ---------------------------------------------------------------------------------------------------
 *  Initialise les sélecteurs DOM après le chargement complet de la page et empêche une double exécution.
 * ---------------------------------------------------------------------------------------------------
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
    // Empêche une double initialisation
    if (window.domSelectorsLoaded) {
        return;
    }

    logEvent("info", "Initialisation des sélecteurs DOM...");

    // Charge dynamiquement les sélecteurs de la page
    Object.assign(domSelectors, loadSelectorsForCurrentPage());

    logEvent("success", "Sélecteurs DOM chargés.");

    // Marque l'initialisation comme terminée pour éviter les répétitions
    window.domSelectorsLoaded = true;
}

// Exécute automatiquement après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", initializeDomSelectors);

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
            logEvent("info", "Changements détectés, rafraîchissement des sélecteurs...");
            refreshSelectors();
        }, 300);
    });

    // Active l'observation sur tout le document pour détecter les modifications
    observer.observe(document.body, { childList: true, subtree: true });

    logEvent("success", "Observation des changements du DOM activée.");
}

// Exécute l'observation après le chargement complet du DOM
document.addEventListener("DOMContentLoaded", observeDomChanges);


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
