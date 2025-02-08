/* ==================================================================================== */
/*  FICHIER          : normalize.js                                                    */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.0                                                              */
/*  DATE DE CRÉATION : 09/02/2025                                                       */
/*  DERNIÈRE MODIF.  : 09/02/2025                                                       */
/*  DESCRIPTION      : Fournit une fonction utilitaire pour normaliser les textes      */
/*                     afin d'optimiser la recherche et éviter les erreurs liées aux   */
/*                     accents, majuscules et espaces inutiles.                        */
/* ==================================================================================== */
/* 🔹 FONCTIONNALITÉS :                                                                */
/*    Suppression des accents (é -> e, à -> a, etc.)                               */
/*    Conversion en minuscules pour une recherche insensible à la casse           */
/*    Suppression des espaces inutiles                                            */
/*    Suppression des caractères spéciaux                                         */
/* ==================================================================================== */

import { logEvent } from "./utils.js";

/**
 * Normalise une chaîne de texte en supprimant les accents, les espaces inutiles
 * et en la convertissant en minuscules.
 *
 * @param {string} text - Texte à normaliser.
 * @returns {string} Texte normalisé, prêt pour la recherche.
 */
export function normalizeText(text) {
    try {
        if (typeof text !== "string") {
            logEvent("ERROR", "normalizeText : Entrée invalide", { text });
            return "";
        }

        logEvent("INFO", ` Normalisation du texte : "${text}"`);

        return text
            .normalize("NFD") // Décompose les caractères accentués (é → e + ́)
            .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
            .toLowerCase() // Convertit en minuscules
            .trim() // Supprime les espaces inutiles au début/fin
            .replace(/[^\w\s]/gi, "") // Supprime les caractères spéciaux
            .replace(/\s+/g, " "); // Remplace plusieurs espaces par un seul

    } catch (error) {
        logEvent("ERROR", " Erreur dans normalizeText", { error: error.message });
        return "";
    }
}
