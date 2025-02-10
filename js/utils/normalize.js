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
/*  FONCTIONNALITÉS :                                                                */
/*    Suppression des accents (é -> e, à -> a, etc.)                               */
/*    Conversion en minuscules pour une recherche insensible à la casse           */
/*    Suppression des espaces inutiles                                            */
/*    Suppression des caractères spéciaux                                         */
/* ==================================================================================== */

import { logEvent } from "./utils.js";

/**
 * Normalise une chaîne de texte en :
 * - Supprimant les accents et caractères spéciaux.
 * - Convertissant tout en minuscules.
 * - Supprimant les espaces inutiles.
 * 
 * Cette fonction est principalement utilisée pour uniformiser les données avant une comparaison ou une recherche.
 *
 * @param {string} text - Texte à normaliser.
 * @returns {string} Texte normalisé, prêt pour la recherche.
 */
export function normalizeText(text) {
    try {
        // Vérification du type d'entrée
        if (typeof text !== "string") {
            logEvent("error", "normalizeText : entrée invalide", { text });
            return "";
        }

        logEvent("info", `normalisation du texte : "${text}"`);

        return text
            .normalize("NFD") // Décompose les caractères accentués (é → e + ́)
            .replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques (accents)
            .toLowerCase() // Convertit en minuscules
            .trim() // Supprime les espaces inutiles au début et à la fin
            .replace(/[^\w\s]/gi, "") // Supprime les caractères spéciaux (sauf lettres et chiffres)
            .replace(/\s+/g, " "); // Remplace plusieurs espaces consécutifs par un seul espace

    } catch (error) {
        logEvent("error", "erreur dans normalizeText", { message: error.message });
        return "";
    }
}
