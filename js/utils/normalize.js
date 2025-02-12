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
 * Normalise une chaîne de texte en :
 * - Supprimant les accents et caractères spéciaux.
 * - Convertissant tout en minuscules.
 * - Supprimant les espaces inutiles.
 * 
 * Cette fonction est principalement utilisée pour uniformiser les données 
 * avant une comparaison ou une recherche.
 *
 * @param {string} text - Texte à normaliser.
 * @param {boolean} [keepPunctuation=false] - Conserve certains caractères spéciaux (`-` et `'`).
 * @returns {string} Texte normalisé, prêt pour la recherche.
 */

export function normalizeText(text, keepPunctuation = false) {
    try {
        // Vérifie que l'entrée est bien une chaîne de caractères
        if (typeof text !== "string") {
            logEvent("error", "normalizeText : entrée invalide", { text });
            return ""; // Retourne une chaîne vide si l'entrée est invalide
        }

        // Supprime les espaces au début et à la fin
        const trimmedText = text.trim();

        // Vérifie si la chaîne est vide après suppression des espaces
        if (trimmedText.length === 0) {
            logEvent("warning", "normalizeText : texte vide après trim");
            return "";
        }

        // Initialisation de la variable locale pour stocker le texte transformé
        let normalizedText = trimmedText.normalize("NFD"); // Décompose les caractères accentués

        // Supprime les diacritiques (accents)
        normalizedText = normalizedText.replace(/[\u0300-\u036f]/g, "");

        // Convertit en minuscules
        normalizedText = normalizedText.toLowerCase();

        // Supprime les caractères spéciaux selon l'option `keepPunctuation`
        if (keepPunctuation) {
            normalizedText = normalizedText.replace(/[^\w\s'-]/gi, ""); // Garde les tirets et apostrophes
        } else {
            normalizedText = normalizedText.replace(/[^\w\s]/gi, ""); // Supprime tout sauf lettres et chiffres
        }

        // Remplace plusieurs espaces consécutifs par un seul espace
        normalizedText = normalizedText.replace(/\s+/g, " ");

        return normalizedText;

    } catch (error) {
        logEvent("error", "Erreur dans normalizeText", { message: error.message });
        return ""; // Retourne une chaîne vide en cas d'erreur
    }
}

