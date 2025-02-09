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
        /** Contient les éléments généraux de la page */
        indexPage: {
            body: document.body,
            header: safeQuerySelector("header"),
            main: safeQuerySelector("main"),
            footer: safeQuerySelector("footer"),
        },
        /** Contient les éléments liés à l’identité visuelle et branding */
        branding: {
            logo: safeQuerySelector(".logo"),
            backgroundImage: safeQuerySelector(".fond", true), // Optionnel
        },
        /** Contient les éléments relatifs à la barre de recherche */
        search: {
            form: safeQuerySelector(".search-bar"),
            input: safeQuerySelector("#search"),
            button: safeQuerySelector("#search-btn"),
        },
        /** Contient les sélecteurs liés aux filtres dynamiques */
        filters: {
            section: safeQuerySelector("#filters"),
            ingredientList: safeQuerySelector("#ingredient-list"),
            applianceList: safeQuerySelector("#appliance-list"),
            ustensilList: safeQuerySelector("#ustensil-list"),
        },
        /** Conteneur où seront affichées les recettes */
        recipes: {
            container: safeQuerySelector("#recipes-container"), // Corrigé
            list: document.getElementById("recipes-list") || null, // Vérification alternative
            template: document.getElementById("recipe-template") || null, // Vérification alternative
            recipeCards: () => safeQuerySelectorAll(".recipe-card"), // Fonction pour récupération dynamique
        },
    };
}




/*==============================================*/
/*    Vérification de la Présence des Éléments  */
/*==============================================*/

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Parcourt un objet contenant des sélecteurs DOM pour vérifier leur présence et signaler ceux manquants.
 * ---------------------------------------------------------------------------------------------------
 * 
 * ## **Pourquoi utiliser cette fonction ?**
 * - **Détecte automatiquement les sélecteurs non trouvés** pour éviter des erreurs à l’exécution.
 * - **Facilite le débogage** en générant une liste de tous les éléments absents.
 * - **Assure la fiabilité du code** en empêchant l’utilisation de sélecteurs invalides.
 * 
 * ## **Quand utiliser cette fonction ?**
 * - **À l'initialisation des sélecteurs** pour vérifier qu’ils sont bien récupérés.
 * - **Après une modification du DOM** pour s’assurer qu’aucun élément n’a été supprimé ou mal nommé.
 * - **Dans un environnement de développement** pour alerter en cas d’oubli d’un élément HTML.
 * 
 * ## **Bénéfices :**
 * - **Fiabilise la gestion des sélecteurs** en alertant sur les manques.
 * - **Évite les erreurs cachées** qui pourraient provoquer des bugs à l’exécution.
 * - **Facilite la maintenance du projet** en listant précisément les sélecteurs absents.
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Vérifie la présence de tous les sélecteurs nécessaires au bon fonctionnement d’une page donnée.
 * ---------------------------------------------------------------------------------------------------
 * 
 * ## **Pourquoi utiliser cette fonction ?**
 * - **Détecte automatiquement les éléments DOM manquants** pour éviter des erreurs d’exécution.
 * - **Assure l'intégrité des sélecteurs** en vérifiant qu’ils existent bien dans le document.
 * - **Facilite le débogage et la maintenance** en générant une liste claire des sélecteurs absents.
 * 
 * ## **Quand utiliser cette fonction ?**
 * - **Lors de l'initialisation de la page** pour s’assurer que tous les sélecteurs requis sont disponibles.
 * - **Avant toute manipulation dynamique du DOM** pour éviter des erreurs d’accès à des éléments inexistants.
 * - **Dans un test d'intégration** pour valider que l'interface utilisateur respecte la structure prévue.
 * 
 * ## **Bénéfices :**
 * - **Fiabilise l'application** en évitant l'utilisation de références nulles.
 * - **Aide à la résolution rapide des problèmes** en fournissant une liste détaillée des sélecteurs manquants.
 * - **Facilite l’évolution du projet** en maintenant un contrôle sur la structure du DOM.
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Charge dynamiquement les sélecteurs nécessaires en fonction de la page détectée.
 * ---------------------------------------------------------------------------------------------------
 * 
 * ## **Pourquoi utiliser cette fonction ?**
 * - **Évite les sélections inutiles** en ne chargeant que les sélecteurs pertinents pour la page active.
 * - **Améliore la maintenabilité** en centralisant la gestion des sélecteurs par page.
 * - **Assure la fiabilité de l'application** en détectant les sélecteurs manquants et en journalisant les erreurs.
 * 
 * ## **Quand utiliser cette fonction ?**
 * - **À l'initialisation de l'application** pour récupérer les sélecteurs avant toute manipulation du DOM.
 * - **Lors d’un changement de page dynamique** pour mettre à jour les sélecteurs sans recharger le site.
 * - **Dans un environnement de test** pour vérifier la structure DOM en fonction des pages.
 * 
 * ## **Bénéfices :**
 * - **Optimisation des performances** en réduisant les requêtes inutiles au DOM.
 * - **Meilleure gestion des erreurs** en loguant les sélecteurs absents.
 * - **Code plus modulaire et évolutif** en permettant d’ajouter facilement d'autres pages.
 * 
 * @function loadSelectorsForCurrentPage
 * @returns {Object} Un objet contenant les sélecteurs DOM propres à la page actuelle.
 * 
 * @example
 *  Récupérer les sélecteurs pour la page active :
 * const selectors = loadSelectorsForCurrentPage();
 * console.log("Sélecteurs chargés :", selectors);
 * 
 *  Exemple d'utilisation dans une initialisation :
 * document.addEventListener("DOMContentLoaded", () => {
 *    const selectors = loadSelectorsForCurrentPage();
 *    initializeUI(selectors);
 * });
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Réinitialise dynamiquement les sélecteurs DOM pour garantir leur validité et éviter les erreurs.
 * ---------------------------------------------------------------------------------------------------
 *
 * ## **Pourquoi rafraîchir les sélecteurs ?**
 * - **Évite l'utilisation de références obsolètes** suite à des modifications du DOM.
 * - **Garantit la stabilité** des interactions utilisateur en s’assurant que les sélections sont valides.
 * - **Facilite la gestion des mises à jour dynamiques** de contenu (ex: filtres, chargement asynchrone).
 *
 * ## **Quand utiliser cette fonction ?**
 * - **Après une mise à jour du DOM** (ex: AJAX, changement d’état, animations).
 * - **Avant toute manipulation de l’UI** nécessitant des interactions avec des éléments DOM.
 * - **Lorsqu’un problème d’affichage** est détecté à cause de sélecteurs cassés.
 *
 * ## **Bénéfices :**
 * - **Optimise la stabilité** en purgeant et rechargeant les sélecteurs.
 * - **Réduit les risques d’erreurs** en évitant l’accès à des éléments supprimés.
 * - **Améliore la performance** en évitant des requêtes répétées inutiles.
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Initialise les sélecteurs DOM après le chargement complet de la page et empêche une double exécution.
 * ---------------------------------------------------------------------------------------------------
 *
 * ## **Pourquoi initialiser les sélecteurs au chargement du DOM ?**
 * - **Assure que tous les éléments sont disponibles** avant de les manipuler.
 * - **Évite des erreurs de sélection** causées par des éléments non encore rendus.
 * - **Garantit une initialisation unique** pour prévenir les surcharges mémoire et comportements imprévisibles.
 *
 * ## **Quand cette fonction est-elle exécutée ?**
 * - **Automatiquement après le chargement complet du DOM** (`DOMContentLoaded`).
 * - **Uniquement si elle n'a pas déjà été exécutée**, grâce à un verrou global (`window.domSelectorsLoaded`).
 *
 * ## **Bénéfices :**
 * - **Optimise les performances** en évitant les exécutions redondantes.
 * - **Fiabilise les sélections DOM** en s'assurant que les éléments existent bien avant l'accès.
 * - **Facilite la maintenance** en centralisant l'initialisation des sélecteurs.
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Observe en temps réel les modifications du DOM et met à jour dynamiquement les sélecteurs.
 * ---------------------------------------------------------------------------------------------------
 *
 * ## **Pourquoi observer les changements du DOM ?**
 * - **Gère les ajouts/suppressions dynamiques** d'éléments sans besoin de recharger la page.
 * - **Évite les erreurs de sélection** en maintenant les sélecteurs toujours à jour.
 * - **Améliore l'expérience utilisateur** en assurant une réactivité optimale des composants interactifs.
 *
 * ## **Quand cette fonction est-elle exécutée ?**
 * - **Après le chargement du DOM** (`DOMContentLoaded`).
 * - **À chaque modification structurelle** détectée dans le `document.body`.
 * - **Uniquement si une modification pertinente est détectée**, grâce à un timer `setTimeout()`.
 *
 * ## **Bénéfices :**
 * - **Optimise les performances** en limitant les rafraîchissements inutiles.
 * - **Fiabilise les interactions dynamiques** en maintenant à jour les références DOM.
 * - **Prévient les conflits d’éléments** lors d’injections ou suppressions dynamiques.
 *
 * @function observeDomChanges
 * @returns {void} Ne retourne rien, mais active un `MutationObserver` sur le `document.body`.
 *
 * @example
 *  Activer l'observation après le chargement du DOM :
 * document.addEventListener("DOMContentLoaded", observeDomChanges);
 *
 *  Déclenchement automatique en cas de changement dans le DOM :
 * // Exemple d’ajout dynamique d’un élément
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

/** ## DESCRIPTION ##
 * ---------------------------------------------------------------------------------------------------
 *  Regroupe et expose les fonctions essentielles de gestion des sélecteurs DOM pour toute l’application.
 * ---------------------------------------------------------------------------------------------------
 *
 * ## **Pourquoi centraliser ces exports ?**
 * - **Facilite l’importation et l’accès** aux fonctions de manipulation DOM.
 * - **Évite la duplication du code** en regroupant les méthodes communes.
 * - **Assure une meilleure maintenabilité** en unifiant les points d’accès aux sélecteurs et méthodes.
 *
 * ## **Contenu des exports :**
 * - `safeQuerySelector` : Récupération sécurisée d’un élément DOM avec cache.
 * - `getCurrentPage` : Détection automatique de la page active selon l'URL.
 * - `refreshSelectors` : Mise à jour dynamique des sélecteurs après une modification du DOM.
 *
 * ## **Bénéfices :**
 * - **Modularité** : Permet un import ciblé des fonctionnalités selon les besoins.
 * - **Performance** : Optimise les appels aux sélecteurs avec mise en cache.
 * - **Clarté** : Facilite la lisibilité et la gestion du code.
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
