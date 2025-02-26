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

/**===========================================================================
 * Détection et Gestion des Environnements
 * =============================================================================
 */

/*------------------------------------------------------------------------------
*               Détection de l 'environnement
* Définit les types d'environnements dans lesquels l'application peut fonctionner.
*--------------------------------------------------------------------------------*/
/**
 * @constant {Object} ENVIRONMENTS
 * @description Définit les différents environnements possibles de l'application.
 * 
 * - `DEVELOPMENT` : Environnement de développement local (logs activés, debugging facilité).
 * - `STAGING` : Environnement de préproduction (tests avant mise en production).
 * - `PRODUCTION` : Environnement en ligne (optimisé pour les performances, logs restreints).
 */
export const ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
});

/*-------------------------------------------------------------------------------
*               Détection de l 'environnement Actif
* Permet d'identifier l'environnement en fonction de l'URL ou d'un paramètre.
*--------------------------------------------------------------------------------*/
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

/*-------------------------------------------------------------------------------
*               Configuration de l 'environnement Actif
*  Détermine si l'on force le mode développement et affiche l'environnement en cours.
*--------------------------------------------------------------------------------*/

/**
 * @constant {boolean} FORCE_DEV_MODE
 * @description Force l'application à rester en mode développement, quelle que soit l'URL.
 * Utile pour les tests locaux et le débogage.
 * 
 * - `true` : L'environnement sera toujours en mode développement.
 * - `false` : L'environnement sera détecté automatiquement via `detectEnvironment()`.
 */
export const FORCE_DEV_MODE = false;

/**
 * @constant {string} ACTIVE_ENVIRONMENT
 * @description Détermine l'environnement actif de l'application en fonction de `FORCE_DEV_MODE` et `detectEnvironment()`.
 * 
 * - Si `FORCE_DEV_MODE` est activé, l'environnement est forcé en `DEVELOPMENT`.
 * - Sinon, il est automatiquement détecté avec `detectEnvironment()`.
 */
export const ACTIVE_ENVIRONMENT = FORCE_DEV_MODE
  ? ENVIRONMENTS.DEVELOPMENT
  : detectEnvironment();


console.log(`🛠️ Environnement actif : ${ACTIVE_ENVIRONMENT}`);

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
  LOG_STYLES: (() => {
        const baseStyles = {
            default: "color: black;",
            info: "color: blue; font-weight: bold;",
            warn: "color: orange; font-weight: bold;",
            error: "color: red; font-weight: bold;",
            success: "color: green; font-weight: bold;",
        };

        const testStyles = {
            test_start: "background-color: purple; color: white; font-weight: bold;",
            test_end: "background-color: brown; color: white; font-weight: bold;",
            test_start_modal: "background-color: purple; color: white; font-weight: bold;",
            test_end_modal: "background-color: brown; color: white; font-weight: bold;",
            test_start_lightbox: "background-color: darkblue; color: white; font-weight: bold;",
            test_end_lightbox: "background-color: teal; color: white; font-weight: bold;",
            test_start_sort: "background-color: lightgreen; color: white; font-weight: bold;",
            test_end_sort: "background-color: darkgreen; color: white; font-weight: bold;",
            test_start_events: "background-color: lightpink; color: white; font-weight: bold;",
            test_end_events: "background-color: deeppink; color: white; font-weight: bold;",
        };

        return Object.freeze({ ...baseStyles, ...testStyles });
    })(), 

  // -------------------------------------------------------------------------
  // Icônes des Logs
  // -------------------------------------------------------------------------
  // Icônes des logs pour une identification rapide
    LOG_ICONS: Object.freeze({
        default: "🔵", // Icône par défaut
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
        success: "✅",
        test_start: "🔧",
        test_end: "🏁",
        test_start_modal: "🟣",
        test_end_modal: "🟤",
        test_start_lightbox: "🔵",
        test_end_lightbox: "🟢",
        test_start_sort: "🟢",
        test_end_sort: "🟢",
        test_start_events: "🌸",
        test_end_events: "🌺",
    }),
};

// -------------------------------------------------------------------------
// config des touches claviers
// -------------------------------------------------------------------------
/**
 * @constant {Object} KEY_CODES
 * @description Contient les codes des touches du clavier sous forme d'objet immuable.
 * Permet de faciliter l'accès aux codes clavier dans les événements `keydown` et `keyup`.
 * 
 * Les catégories incluent :
 * - **Contrôle et navigation** (ESCAPE, TAB, ENTER, SPACE, BACKSPACE, DELETE)
 * - **Flèches directionnelles** (ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT)
 * - **Modificateurs** (SHIFT, CTRL, ALT, META)
 * - **Touches de fonction (F1 - F12)**
 * - **Pavé numérique** (NUMPAD_0 à NUMPAD_9, opérations arithmétiques)
 * - **Lettres (A-Z)**
 * - **Chiffres du clavier principal (0-9)**
 * - **Symboles courants** (`-`, `=`, `[`, `]`, etc.)
 * - **Touches système et verrouillage** (CAPS_LOCK, NUM_LOCK, PRINT_SCREEN...)
 */
export const KEY_CODES = Object.freeze({
  //  Contrôle et navigation
  ESCAPE: "Escape",        // Touche Échap
  TAB: "Tab",              // Tabulation
  ENTER: "Enter",          // Entrée
  SPACE: " ",              // Espace
  BACKSPACE: "Backspace",  // Retour arrière
  DELETE: "Delete",        // Supprimer

  //  Flèches directionnelles
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",

  //  Modificateurs (Touches spéciales)
  SHIFT: "Shift",
  CTRL: "Control",
  ALT: "Alt",
  META: "Meta", // Touche Windows (PC) ou Commande (Mac)

  //  Touches de fonction (F1 - F12)
  F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5",
  F6: "F6", F7: "F7", F8: "F8", F9: "F9", F10: "F10",
  F11: "F11", F12: "F12",

  //  Pavé numérique
  NUMPAD_0: "Numpad0", NUMPAD_1: "Numpad1", NUMPAD_2: "Numpad2",
  NUMPAD_3: "Numpad3", NUMPAD_4: "Numpad4", NUMPAD_5: "Numpad5",
  NUMPAD_6: "Numpad6", NUMPAD_7: "Numpad7", NUMPAD_8: "Numpad8",
  NUMPAD_9: "Numpad9",
  NUMPAD_DECIMAL: "NumpadDecimal", NUMPAD_DIVIDE: "NumpadDivide",
  NUMPAD_MULTIPLY: "NumpadMultiply", NUMPAD_SUBTRACT: "NumpadSubtract",
  NUMPAD_ADD: "NumpadAdd", NUMPAD_ENTER: "NumpadEnter",
  NUMPAD_EQUAL: "NumpadEqual",

  // Lettres (A-Z)
  A: "a", B: "b", C: "c", D: "d", E: "e", F: "f", G: "g",
  H: "h", I: "i", J: "j", K: "k", L: "l", M: "m", N: "n",
  O: "o", P: "p", Q: "q", R: "r", S: "s", T: "t", U: "u",
  V: "v", W: "w", X: "x", Y: "y", Z: "z",

  // Chiffres du clavier principal (0-9)
  DIGIT_0: "0", DIGIT_1: "1", DIGIT_2: "2", DIGIT_3: "3",
  DIGIT_4: "4", DIGIT_5: "5", DIGIT_6: "6", DIGIT_7: "7",
  DIGIT_8: "8", DIGIT_9: "9",

  // Symboles courants
  BACKQUOTE: "`", // Tilde et backtick
  MINUS: "-", EQUAL: "=", // Moins et Égal
  BRACKET_LEFT: "[", BRACKET_RIGHT: "]", // Crochets
  BACKSLASH: "\\", // Barre oblique inverse
  SEMICOLON: ";", QUOTE: "'", // Point-virgule et apostrophe
  COMMA: ",", PERIOD: ".", SLASH: "/", // Virgule, point et slash

  // Touches système et verrouillage
  CAPS_LOCK: "CapsLock",
  NUM_LOCK: "NumLock",
  SCROLL_LOCK: "ScrollLock",
  PRINT_SCREEN: "PrintScreen",
  PAUSE: "Pause",
  INSERT: "Insert",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
});



