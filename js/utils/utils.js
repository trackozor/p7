/* =============================================================================*/
/* 🎯 PROJET      : Fisheye */
/* 📄 FICHIER     : utils.js */
/* 🖊️ AUTEUR      : Trackozor */
/* 📆 DATE        : 21/01/2025 */
/* 🔄 VERSION     : 1.2.0 */
/* 📝 DESCRIPTION : Fonctions utilitaires globales du projet Fisheye :     */
/*   - Gestion et vérification des logs.                                    */
/*   - Manipulation sécurisée des classes CSS.                               */
/*   - Détection de la page actuelle.                                        */
/*   - Gestion des erreurs des formulaires.                                  */
/* ============================================================================= */


/* =============================================================================*/
/* SECTION : IMPORTATIONS (Imports des constantes globales) */
/* =============================================================================*/

import {
  CONFIGLOG,        // Configuration des logs (niveaux de logs, couleurs, icônes...)
  ENVIRONMENTS,     // Liste des environnements (Développement, Production...)
  ACTIVE_ENVIRONMENT // Environnement actif du projet
} from "../config/constants.js";


/* ============================================================================= */
/* SECTION : FONCTIONS DE LOG                                                    */
/* ============================================================================= */

/**
 * Vérifie si un niveau de log est activé en fonction de la verbosité, du niveau de log configuré,
 * et de l'environnement actif.
 *
 * @param {string} level - Niveau de log à vérifier (ex : "info", "error", etc.).
 * @returns {boolean} - `true` si le log est autorisé, sinon `false`.
 */
export const isLogEnabled = (level) => {
  const verbosityMap = {
    low: ["error", "warn"], // Verbosité basse : uniquement erreurs et avertissements
    medium: ["error", "warn", "success"], // Verbosité moyenne : ajoute les succès
    high: ["error", "warn", "success", "info", "test_start", "test_end"], // Verbosité haute : tous les logs
  };

  // Récupération des niveaux autorisés par la verbosité
  const allowedLevels = verbosityMap[CONFIGLOG.VERBOSITY] || [];

  // Vérifie si le niveau est activé dans la configuration
  const isLevelEnabledInConfig = CONFIGLOG.LOG_LEVELS?.[level] ?? false;

  // Vérifie si le niveau est permis par la verbosité
  const isAllowedByVerbosity = allowedLevels.includes(level);

  // Limite certains logs à l'environnement développement
  const isEnvironmentAllowed =
    ACTIVE_ENVIRONMENT === ENVIRONMENTS.DEVELOPMENT ||
    !["info", "test_start", "test_end"].includes(level);

  // La combinaison des trois critères détermine si le log est activé
  return isLevelEnabledInConfig && isAllowedByVerbosity && isEnvironmentAllowed;
};

/**
 * Logue des événements dans la console avec horodatage, icônes et styles.
 * @param {string} type - Type de log (info, warn, error, etc.).
 * @param {string} message - Message à afficher.
 * @param {Object} [data={}] - Données supplémentaires pour le contexte.
 */
export const logEvent = (type, message, data = {}) => {
  if (!type || typeof type !== "string") {
    console.error("logEvent : Type de log invalide ou non défini.", { type });
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[Fisheye][${timestamp}]`;
  const icon =
    CONFIGLOG.LOG_ICONS?.[type] || CONFIGLOG.LOG_ICONS?.default || "🔵";
  const style =
    CONFIGLOG.LOG_STYLES?.[type] ||
    CONFIGLOG.LOG_STYLES?.default ||
    "color: black;";
  const fullMessage = `${icon} ${prefix} ${type.toUpperCase()}: ${message}`;

  try {
    if (console[type] && typeof console[type] === "function") {
      console[type](`%c${fullMessage}`, style, data);
    } else {
      console.log(`%c${fullMessage}`, style, data);
    }
  } catch (error) {
    console.error(
      "%cErreur dans logEvent :",
      CONFIGLOG.LOG_STYLES?.error || "color: red;",
      error,
    );
  }
};

/* ============================================================================= */
/*  SECTION : MANIPULATION DES CLASSES CSS   */
/* ============================================================================= */

/**
 * Ajoute une classe CSS à un élément HTML.
 * @param {HTMLElement} element - Élément cible.
 * @param {string} className - Classe CSS à ajouter.
 * @returns {boolean} `true` si la classe est ajoutée, `false` sinon.
 */
export function addClass(element, className) {
  if (!(element instanceof HTMLElement)) {
    logEvent("error", "addClass: Élément HTML invalide.", { element });
    return false;
  }

  if (typeof className !== "string" || className.trim() === "") {
    logEvent("error", "addClass: Nom de classe invalide.", { className });
    return false;
  }

  if (element.classList.contains(className)) {
    logEvent("info", `addClass: Classe "${className}" déjà présente.`, {
      element,
    });
    return false;
  }

  try {
    element.classList.add(className);
    logEvent("success", `addClass: Classe "${className}" ajoutée.`, {
      element,
    });
    return true;
  } catch (error) {
    logEvent("error", "addClass: Erreur lors de l'ajout de la classe.", {
      error,
    });
    return false;
  }
}


/* ============================================================================= */
/**
 * Supprime une classe CSS d'un élément HTML.
 * @param {HTMLElement} element - Élément cible.
 * @param {string} className - Classe CSS à supprimer.
 * @returns {boolean} `true` si la classe est supprimée, `false` sinon.
 */
export function removeClass(element, className) {
  if (!(element instanceof HTMLElement)) {
    logEvent("error", "removeClass: Élément HTML invalide.", { element });
    return false;
  }

  if (typeof className !== "string" || className.trim() === "") {
    logEvent("error", "removeClass: Nom de classe invalide.", { className });
    return false;
  }

  if (!element.classList.contains(className)) {
    logEvent("info", `removeClass: Classe "${className}" non présente.`, {
      element,
    });
    return false;
  }

  try {
    element.classList.remove(className);
    logEvent("success", `removeClass: Classe "${className}" supprimée.`, {
      element,
    });
    return true;
  } catch (error) {
    logEvent(
      "error",
      "removeClass: Erreur lors de la suppression de la classe.",
      { error },
    );
    return false;
  }
}

/* ============================================================================= */
/* SECTION : FONCTIONS DOM */
/* ============================================================================= */
/**
 * Détecte la page actuelle en combinant plusieurs méthodes :
 * - Attribut HTML `data-page` (préféré si disponible).
 * - Analyse de l'URL (path ou query string).
 * - Valeur par défaut si aucun cas ne correspond.
 *
 * @returns {string} Nom de la page actuelle ("index", "photographer", ou "unknown").
 */

export const getCurrentPage = () => {
  const bodyPage = document.body.getAttribute("data-page");
  if (bodyPage) {
    logEvent("info", "Page détectée via data-page", { page: bodyPage });
    return bodyPage;
  }

  const path = window.location.pathname;
  logEvent("info", "Path détecté", { path });

  if (path === "/" || path.endsWith("/") || path.includes("index.html")) {
    logEvent("info", "Page détectée via pathname", { page: "index" });
    return "index";
  }
  if (path.includes("photographer.html")) {
    logEvent("info", "Page détectée via pathname", { page: "photographer" });
    return "photographer";
  }

  logEvent("warn", "Page inconnue, aucun sélecteur spécifique chargé.", {
    path,
  });
  return "unknown";
};

/*================================================================================================================================================*/
/*===============================================================================================*/
/*                                 ======= Messages erreurs =======                              */
/*===============================================================================================*/

/* ============ Fonction pour afficher un message d'erreur et ajouter une bordure rouge ============*/

/**
 * Affiche un message d'erreur et applique une bordure rouge au champ cible.
 *
 * @param {string} message - Message d'erreur à afficher.
 * @param {HTMLElement} inputElement - Champ d'entrée associé à l'erreur.
 */
export function showError(message, inputElement) {
  try {
    // === Validation des paramètres ===
    if (!message || !(inputElement instanceof HTMLElement)) {
      logEvent("error", "Paramètres invalides dans showError.", {
        message,
        inputElement,
      });
      return;
    }

    // === Log : Début de l'affichage de l'erreur ===
    logEvent("info", "Affichage d'une erreur.", {
      field: inputElement.id || "non défini",
      message,
    });

    // === Suppression des erreurs existantes (pour éviter les doublons) ===
    removeError(inputElement);

    // === Création et ajout du message d'erreur ===
    const errorTooltip = document.createElement("div");
    errorTooltip.classList.add("error-modal"); // Classe CSS pour styliser le message d'erreur
    errorTooltip.textContent = message; // Ajout du texte d'erreur

    // Applique une bordure rouge au champ d'entrée
    inputElement.classList.add("error-input");

    // Ajoute le message d'erreur en tant qu'enfant de l'élément parent
    const { parentElement } = inputElement;
    if (parentElement) {
      parentElement.appendChild(errorTooltip);
    } else {
      logEvent("error", "Impossible de trouver l'élément parent.", {
        field: inputElement.id || "non défini",
      });
    }

    // === Log : Succès de l'ajout ===
    logEvent("success", "Message d'erreur ajouté.", {
      field: inputElement.id || "non défini",
      message,
    });
  } catch (error) {
    // === Gestion des erreurs ===
    logEvent("error", "Erreur dans showError.", { error: error.message });
  }
}

/* ============ Fonction pour supprimer un message d'erreur et retirer la bordure rouge ============ */
/**
 * Supprime un message d'erreur et retire la bordure rouge du champ cible.
 *
 * @param {HTMLElement} inputElement - Champ d'entrée associé à l'erreur.
 */
export function removeError(inputElement) {
  try {
    // === Validation du paramètre ===
    if (!(inputElement instanceof HTMLElement)) {
      logEvent("error", "Paramètre invalide dans removeError.", {
        inputElement,
      });
      return;
    }

    // === Suppression du message d'erreur ===
    const { parentElement } = inputElement;
    if (parentElement) {
      const errorTooltip = parentElement.querySelector(".error-modal");
      if (errorTooltip) {
        errorTooltip.remove(); // Supprime l'élément du DOM
        logEvent("success", "Message d'erreur supprimé.", {
          field: inputElement.id || "non défini",
        });
      }
    } else {
      logEvent("error", "Impossible de trouver l'élément parent.", {
        field: inputElement.id || "non défini",
      });
    }

    // === Suppression de la classe de bordure rouge ===
    inputElement.classList.remove("error-input");

    // === Log : Succès de la suppression ===
    logEvent("success", "Erreur visuelle supprimée.", {
      field: inputElement.id || "non défini",
    });
  } catch (error) {
    // === Gestion des erreurs ===
    logEvent("error", "Erreur dans removeError.", { error: error.message });
  }
}
