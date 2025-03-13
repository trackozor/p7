/* =============================================================================
/* PROJET      : Les Petits Plats
/* FICHIER     : utils.js
/* AUTEUR      : Trackozor
/* DATE        : 21/01/2025
/* VERSION     : 1.2.0
/* DESCRIPTION : Fonctions utilitaires globales du projet.
/*               - Gestion et vérification des logs.
/*               - Manipulation sécurisée des classes CSS.
/*               - Détection de la page actuelle.
/*               - Gestion des erreurs des formulaires.
/* ============================================================================= */


/* =============================================================================
/* SECTION : IMPORTATIONS (Imports des constantes globales)
/* ============================================================================= */

import {
  CONFIGLOG,        // Configuration des logs (niveaux de logs, couleurs, icônes...)
  ENVIRONMENTS,     // Liste des environnements (Développement, Production...)
  ACTIVE_ENVIRONMENT // Environnement actif du projet
} from "../config/constants.js";
import { safeQuerySelector } from "../config/domSelectors.js";


/* =============================================================================
/*                 SECTION 1 : FONCTIONS DE LOG
/* ============================================================================= */

/* =============================================================================
/* 1.1 ISLOGENABLED : VÉRIFICATION DE L'ACTIVATION DES LOGS
/* ============================================================================= */

/**
 * Vérifie si un niveau de log est activé selon la configuration du projet.
 *
 * - Prend en compte :
 *   - La configuration des niveaux de log (`CONFIGLOG.LOG_LEVELS`).
 *   - La verbosité sélectionnée (`CONFIGLOG.VERBOSITY`).
 *   - L'environnement actif (`ACTIVE_ENVIRONMENT`).
 * - Restreint certains logs à l'environnement de développement uniquement.
 *
 * @param {string} level - Niveau de log à vérifier (ex : "info", "error", etc.).
 * @returns {boolean} `true` si le log est autorisé, sinon `false`.
 */
export const isLogEnabled = (level) => {
    // === Validation de l'entrée : Vérifie que `level` est une chaîne de caractères ===
    if (typeof level !== "string" || level.trim() === "") {
        console.error("isLogEnabled : Niveau de log invalide.", { level });
        return false; // Stoppe la fonction si le niveau est invalide
    }

    // === Définition des niveaux de verbosité ===
    const verbosityMap = {
        low: ["error", "warn"], // Mode bas : seulement erreurs et avertissements
        medium: ["error", "warn", "success"], // Mode moyen : inclut les succès
        high: ["error", "warn", "success", "info", "test_start", "test_end"], // Mode haut : inclut tous les logs
    };

    // === Récupération des niveaux de logs autorisés selon la verbosité ===
    const allowedLevels = verbosityMap[CONFIGLOG.VERBOSITY] || [];

    // === Vérifie si le niveau demandé est activé dans la configuration globale ===
    const isLevelEnabledInConfig = CONFIGLOG.LOG_LEVELS?.[level] ?? false;

    // === Vérifie si le niveau demandé est inclus dans la verbosité active ===
    const isAllowedByVerbosity = allowedLevels.includes(level);

    // === Limitation des logs "info" et "test" aux environnements de développement uniquement ===
    const isEnvironmentAllowed =
        ACTIVE_ENVIRONMENT === ENVIRONMENTS.DEVELOPMENT || // Si on est en développement, tous les logs sont autorisés
        !["info", "test_start", "test_end"].includes(level); // Sinon, ces logs sont bloqués

    // === Retourne `true` uniquement si toutes les conditions sont validées ===
    return isLevelEnabledInConfig && isAllowedByVerbosity && isEnvironmentAllowed;
};


/* =============================================================================
/* 1.2 LOGEVENT : ENREGISTREMENT D'UN ÉVÉNEMENT DE LOG
/* ============================================================================= */

/**
 * Enregistre un événement de log dans la console avec formatage avancé.
 *
 * - Génère un horodatage pour chaque log.
 * - Applique un style et une icône spécifique selon le type de log.
 * - Permet d'ajouter des données contextuelles pour un meilleur débogage.
 * - Gère les erreurs pour éviter un crash en cas de problème.
 *
 * @param {string} type - Type de log (ex: "info", "warn", "error").
 * @param {string} message - Message à afficher.
 * @param {Object} [data={}] - Données contextuelles facultatives.
 */
export function logEvent (type, message, data = {}) {
  // === Validation du type de log ===
    if (!type || typeof type !== "string") {
        console.error("logEvent : Type de log invalide ou non défini.", { type });
        return; // Stoppe l'exécution si le type est invalide
    }

    // === Génération d'un horodatage formaté ===
    const timestamp = new Date().toLocaleTimeString();

    // === Construction du préfixe standardisé pour les logs ===
    const prefix = `[Les-Petits-Plats][${timestamp}]`;

    // === Sélection des icônes en fonction du type de log ===
    const icon = CONFIGLOG.LOG_ICONS?.[type] || CONFIGLOG.LOG_ICONS?.default || "🔵";

    // === Sélection du style CSS pour afficher le log coloré ===
    const style = CONFIGLOG.LOG_STYLES?.[type] || CONFIGLOG.LOG_STYLES?.default || "color: black;";

    // === Construction du message final formaté ===
    const fullMessage = `${icon} ${prefix} ${type.toUpperCase()}: ${message}`;

    try {
        // === Vérification et affichage du log dans la console ===
        if (console[type] && typeof console[type] === "function") {
            console[type](`%c${fullMessage}`, style, data); // Affichage stylisé
        } else {
            console.log(`%c${fullMessage}`, style, data); // Affichage par défaut si `console[type]` n'existe pas
        }
    } catch (error) {
        // === Gestion des erreurs en cas de problème avec la console ===
        console.error(
            "%cErreur dans logEvent :",
            CONFIGLOG.LOG_STYLES?.error || "color: red;",
            error
        );
    }
};


/* =============================================================================
/*              SECTION 2 : MANIPULATION DES CLASSES CSS
/* ============================================================================= */

/* =============================================================================
/* 2.1 ADDCLASS : AJOUT SÉCURISÉ D'UNE CLASSE CSS À UN ÉLÉMENT
/* ============================================================================= */

/**
 * Ajoute une classe CSS à un élément HTML de manière sécurisée.
 *
 * - Vérifie si `element` est bien un élément HTML valide.
 * - Vérifie si `className` est une chaîne de caractères valide.
 * - Vérifie si la classe est déjà présente avant de l'ajouter.
 * - Gère les erreurs pour éviter tout crash.
 *
 * @param {HTMLElement} element - Élément cible.
 * @param {string} className - Classe CSS à ajouter.
 * @returns {boolean} `true` si la classe a été ajoutée, sinon `false`.
 */
export function addClass(element, className) {
    // === Validation de l'élément HTML ===
    if (!(element instanceof HTMLElement)) {
        logEvent("error", "addClass: Élément HTML invalide.", { element });
        return false; // Retourne `false` si l'élément n'est pas valide
    }

    // === Validation du nom de classe ===
    if (typeof className !== "string" || className.trim() === "") {
        logEvent("error", "addClass: Nom de classe invalide.", { className });
        return false; // Retourne `false` si la classe est invalide
    }

    // === Vérifie si la classe est déjà présente pour éviter un ajout inutile ===
    if (element.classList.contains(className)) {
        logEvent("info", `addClass: Classe "${className}" déjà présente.`, { element });
        return false; // Retourne `false` si la classe est déjà appliquée
    }

    try {
        // === Ajout sécurisé de la classe ===
        element.classList.add(className);

        // === Log de confirmation de l'ajout ===
        logEvent("success", `addClass: Classe "${className}" ajoutée.`, { element });

        return true; // Retourne `true` si l'ajout est réussi
    } catch (error) {
        // === Gestion des erreurs en cas d'échec ===
        logEvent("error", "addClass: Erreur lors de l'ajout de la classe.", { error });
        return false; // Retourne `false` en cas d'erreur
    }
}


/* =============================================================================
/* 2.2 REMOVECLASS : SUPPRESSION SÉCURISÉE D'UNE CLASSE CSS D'UN ÉLÉMENT
/* ============================================================================= */

/**
 * Supprime une classe CSS d'un élément HTML de manière sécurisée.
 *
 * - Vérifie si `element` est bien un élément HTML valide.
 * - Vérifie si `className` est une chaîne de caractères valide.
 * - Vérifie si la classe est bien présente avant de la supprimer.
 * - Gère les erreurs pour éviter tout crash.
 *
 * @param {HTMLElement} element - Élément cible.
 * @param {string} className - Classe CSS à supprimer.
 * @returns {boolean} `true` si la classe a été supprimée, sinon `false`.
 */
export function removeClass(element, className) {
    // === Validation de l'élément HTML ===
    if (!(element instanceof HTMLElement)) {
        logEvent("error", "removeClass: Élément HTML invalide.", { element });
        return false; // Retourne `false` si l'élément n'est pas valide
    }

    // === Validation du nom de classe ===
    if (typeof className !== "string" || className.trim() === "") {
        logEvent("error", "removeClass: Nom de classe invalide.", { className });
        return false; // Retourne `false` si la classe est invalide
    }

    // === Vérifie si la classe est bien présente pour éviter une suppression inutile ===
    if (!element.classList.contains(className)) {
        logEvent("info", `removeClass: Classe "${className}" non présente.`, { element });
        return false; // Retourne `false` si la classe n'est pas appliquée
    }

    try {
        // === Suppression sécurisée de la classe ===
        element.classList.remove(className);

        // === Log de confirmation de la suppression ===
        logEvent("success", `removeClass: Classe "${className}" supprimée.`, { element });

        return true; // Retourne `true` si la suppression est réussie
    } catch (error) {
        // === Gestion des erreurs en cas d'échec ===
        logEvent("error", "removeClass: Erreur lors de la suppression de la classe.", { error });
        return false; // Retourne `false` en cas d'erreur
    }
}
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
export function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        // Vérifie d'abord si l'élément est déjà disponible grâce au cache
        const cachedElement = safeQuerySelector(selector, true);
        if (cachedElement) {
            return resolve(cachedElement);
        }

        // Création de l'observateur pour surveiller les ajouts d'éléments
        const observer = new MutationObserver(() => {
            const element = safeQuerySelector(selector, true);
            if (element) {
                observer.disconnect(); // Arrête l'observation une fois l'élément trouvé
                resolve(element);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Timeout pour éviter les attentes infinies
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`waitForElement : "${selector}" introuvable après ${timeout}ms.`));
        }, timeout);
    });
}


/**
 * Fonction debounce pour limiter l'exécution d'une fonction lorsqu'elle est appelée fréquemment.
 * 
 * - Empêche l’exécution immédiate à chaque frappe.
 * - N'exécute la fonction qu'après un temps d'inactivité défini.
 *
 * @param {Function} func - Fonction à exécuter après le délai.
 * @param {number} delay - Temps en millisecondes avant l'exécution (ex : 300ms).
 * @returns {Function} Fonction enveloppée avec debounce.
 */
export function debounce(func, delay = 300) {
    let timeout;
    
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

export function sanitizeText(text) {
    if (typeof text !== "string") {
        return "";
    }
    
    return text.replace(/[&<>"'/]/g, (char) => {
        const charMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
            "/": "&#x2F;"
        };
        return charMap[char] || char;
    });
}
/**
 * Affiche un message d'erreur à l'écran.
 * - Ajoute dynamiquement un conteneur si nécessaire.
 * - Le message s'affiche en haut de l'écran avec un effet visuel.
 * - Disparaît après 3 secondes automatiquement.
 *
 * @param {string} message - Le message d'erreur à afficher.
 */
export function displayErrorMessage(message) {
    // Vérifier si un conteneur d'erreur existe, sinon le créer
    let errorContainer = document.querySelector("#error-container");

    if (!errorContainer) {
        errorContainer = document.createElement("div");
        errorContainer.id = "error-container";
        errorContainer.style.position = "fixed";
        errorContainer.style.top = "20px";
        errorContainer.style.left = "50%";
        errorContainer.style.transform = "translateX(-50%)";
        errorContainer.style.zIndex = "1000";
        document.body.appendChild(errorContainer);
    }

    // Vérifier si un message est déjà affiché
    let existingError = document.querySelector(".error-message");
    if (existingError) {
        existingError.remove();
    }

    // Création de l'élément de message d'erreur
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error-message");
    errorDiv.textContent = message;

    // Ajout du message dans le conteneur des erreurs
    errorContainer.appendChild(errorDiv);

    // Disparition automatique après 3 secondes
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

/**
 * Supprime les doublons entre les catégories de filtres.
 */
export function removeDuplicates(rawData) {
    const uniqueItems = new Set();
    return Object.fromEntries(Object.entries(rawData).map(([type, values]) => [
        type, new Set(values.filter(value => !uniqueItems.has(value) && uniqueItems.add(value)))
    ]));
}

/**
 * Capitalise la première lettre d'une chaîne.
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}