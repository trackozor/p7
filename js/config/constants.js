/* =============================================================================
    Projet      : Fisheye
    Fichier     : constants.js
    Auteur      : trackozor
    Date        : 01/01/2025
    Version     : 2.1
    Description : Fichier centralisant les constantes globales du projet.
                  Optimisation pour une gestion flexible des environnements,
                  des logs et des styles CSS standardisés.
============================================================================= */

/**
 * Détection et Gestion des Environnements
 * =============================================================================
 */

// Définition des environnements possibles.
export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
};

/**
 * Détecte l'environnement actif en fonction du domaine ou d'un paramètre d'URL.
 * @returns {string} L'environnement détecté (development, staging ou production).
 */
export const detectEnvironment = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const envOverride = urlParams.get("env"); // Récupère ?env=production

  if (envOverride && Object.values(ENVIRONMENTS).includes(envOverride)) {
      return envOverride;
  }

  const { hostname } = window.location;

  if (hostname === "trackozor.github.io") {
      return ENVIRONMENTS.PRODUCTION;
  }

  if (hostname === "127.0.0.1" || hostname === "localhost") {
      return ENVIRONMENTS.STAGING;
  }

  return ENVIRONMENTS.DEVELOPMENT;
};


// Force le mode développement, quelle que soit l'URL (utile pour les tests locaux).
export const FORCE_DEV_MODE = false;

// Détermination de l'environnement actif.
export const ACTIVE_ENVIRONMENT = FORCE_DEV_MODE
  ? ENVIRONMENTS.DEVELOPMENT
  : detectEnvironment();

console.log(`Environnement actif : ${ACTIVE_ENVIRONMENT}`);

/**
 * =============================================================================
 * Configuration Globale de l'Application
 * =============================================================================
 * Toutes les configurations sont regroupées dans une constante exportée.
 * Cela inclut la gestion des logs, des styles CSS, et des comportements par environnement.
 */
export const CONFIGLOG = {
  // -------------------------------------------------------------------------
  // Informations sur l'Environnement
  // -------------------------------------------------------------------------
  ENABLE_LOGS: ACTIVE_ENVIRONMENT === ENVIRONMENTS.DEVELOPMENT, // Activer les logs uniquement en dev.

  // -------------------------------------------------------------------------
  // Niveau de verbosité global
  // -------------------------------------------------------------------------
  VERBOSITY: (() => {
    switch (ACTIVE_ENVIRONMENT) {
      case ENVIRONMENTS.DEVELOPMENT:
        return "high"; // Tous les logs sont activés
      case ENVIRONMENTS.STAGING:
        return "medium"; // Logs essentiels pour staging
      case ENVIRONMENTS.PRODUCTION:
        return "low"; // Logs critiques uniquement
      default:
        return "low"; // Par défaut, verbosité minimale
    }
  })(),

  // -------------------------------------------------------------------------
  // Configuration des logs par environnement
  // -------------------------------------------------------------------------
  LOG_LEVELS: (() => {
    switch (ACTIVE_ENVIRONMENT) {
      case ENVIRONMENTS.DEVELOPMENT:
        return {
          default: true,
          info: true, // Tout afficher
          warn: true,
          error: true,
          success: true,
          test_start: true, // Logs pour les tests activés
          test_end: false, // Logs pour les tests activés
        };
      case ENVIRONMENTS.STAGING:
        return {
          default: true,
          info: true, // Afficher uniquement les informations clés
          warn: true,
          error: true,
          success: true,
          test_start: false, // Pas de logs de tests
          test_end: false, // Pas de logs de tests
        };
      case ENVIRONMENTS.PRODUCTION:
        return {
          default: true,
          info: false, // Désactiver les logs d'informations
          warn: true,
          error: true, // Logs critiques activés
          success: true,
          test_start: false, // Aucun log inutile
          test_end: false, // Aucun log inutile
        };
      default:
        return {
          default: true,
          info: false,
          warn: true,
          error: true,
          success: true,
          test_start: false,
          test_end: false,
        };
    }
  })(),

  // -------------------------------------------------------------------------
  // Classes CSS Utilisées
  // -------------------------------------------------------------------------

  CSS_CLASSES: {
    ERROR_INPUT: "error-input", // Classe pour les champs en erreur.
    ERROR_MODAL: "error-modal", // Classe pour les modales d'erreur.
    MODAL_ACTIVE: "active", // Classe pour les modales actives.
    BODY_NO_SCROLL: "no-scroll", // Classe pour empêcher le scroll en arrière-plan.
  },

  // -------------------------------------------------------------------------
  // Styles pour les Logs
  // -------------------------------------------------------------------------
  LOG_STYLES: {
    default: "color: black;",
    info: "color: blue; font-weight: bold;",
    warn: "color: orange; font-weight: bold;",
    error: "color: red; font-weight: bold;",
    success: "color: green; font-weight: bold;",
    test_start: "background-color: purple; color: white; font-weight: bold;",
    test_end: "background-color: brown; color: white; font-weight: bold;",
    test_start_modal:
      "background-color: purple; color: white; font-weight: bold;",
    test_end_modal: "background-color: brown; color: white; font-weight: bold;",
    test_start_lightbox:
      "background-color: darkblue; color: white; font-weight: bold;",
    test_end_lightbox:
      "background-color: teal; color: white; font-weight: bold;",
    test_start_sort:
      "background-color: lightgreen; color: white; font-weight: bold;",
    test_end_sort:
      "background-color: darkgreen; color: white; font-weight: bold;",
    test_start_events:
      "background-color: lightpink; color: white; font-weight: bold;",
    test_end_events:
      "background-color: darkpink; color: white; font-weight: bold;",
  },

  // -------------------------------------------------------------------------
  // Icônes des Logs
  // -------------------------------------------------------------------------
  LOG_ICONS: {
    default: "🔵", // Icône par défaut.
    info: "ℹ️", // Icône pour les infos.
    warn: "⚠️", // Icône pour les avertissements.
    error: "❌", // Icône pour les erreurs.
    success: "✅", // Icône pour les succès.
    test_start: "🔧", // Icône pour le début des tests.
    test_end: "🏁", // Icône pour la fin des tests.
  },
};
export const KEY_CODES = (() => {
    return Object.freeze({
        ESCAPE: "Escape",
        TAB: "Tab",
        ARROW_LEFT: "ArrowLeft",
        ARROW_RIGHT: "ArrowRight",
        ENTER: "Enter",
        SPACE: " ",
    });
})();

