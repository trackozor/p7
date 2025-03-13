/* ==================================================================================== */
/*  FICHIER          : normalize.js                                                    */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.1                                                              */
/*  DATE DE CRÉATION : 09/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 12/02/2025                                                       */
/*  DESCRIPTION      : Fournit une fonction utilitaire pour normaliser les textes      */
/*                     afin d'optimiser la recherche et éviter les erreurs liées aux   */
/*                     accents, majuscules et espaces inutiles.                        */
/* ==================================================================================== */
/*  FONCTIONNALITÉS :                                                                */
/*    Suppression des accents (é -> e, à -> a, etc.)                               */
/*    Conversion en minuscules pour une recherche insensible à la casse           */
/*    Suppression des espaces inutiles                                            */
/*    Suppression optionnelle des caractères spéciaux                             */
/* ==================================================================================== */

/* ===================================================================
/* 1. Imports
/* ===================================================================*/

import { logEvent } from "./utils.js"; // Import du module de journalisation

/* ===================================================================
/* 2. Fonction de Normalisation de Texte
/* ===================================================================*/
/**
 * Normalise une chaîne de texte en respectant la typographie française.
 * 
 * - Supprime les espaces au début et à la fin.
 * - Convertit tout en minuscules sauf la première lettre qui est mise en majuscule.
 * - Conserve les accents et les caractères spéciaux.
 * 
 * @param {string} text - La chaîne de texte à normaliser.
 * @returns {string} - Le texte normalisé avec la première lettre en majuscule.
 */
export function normalizeText(text) {
    try {
        // Vérifie que l'entrée est bien une chaîne de caractères
        if (typeof text !== "string") {
            logEvent("error", "normalizeText : entrée invalide", { text });
            return "";
        }

        // Supprime les espaces au début et à la fin
        const trimmedText = text.trim();

        // Vérifie si la chaîne est vide après suppression des espaces
        if (trimmedText.length === 0) {
            logEvent("warning", "normalizeText : texte vide après trim");
            return "";
        }

        // Convertit tout en minuscules puis met la première lettre en majuscule
        return trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1).toLowerCase();

    } catch (error) {
        // Capture et journalise toute erreur inattendue
        logEvent("error", "Erreur dans normalizeText", { message: error.message });
        return "";
    }
}



