/* ==================================================================================== */
/*  FICHIER          : modalManager.js                                                 */
/*  AUTEUR           : Trackozor                                                       */
/*  VERSION          : 1.2                                                             */
/*  DATE DE CRÉATION : 11/02/2025                                                      */
/*  DERNIÈRE MODIF.  : 11/02/2025                                                      */
/*  DESCRIPTION      : Gestion de la modale de mot de passe administrateur.            */
/*                     - Création et affichage de la modale.                           */
/*                     - Validation du mot de passe avec callback.                     */
/*                     - Fermeture propre et suppression des écouteurs.                */
/* ==================================================================================== */

/* ===================================================================
/* 1. Imports
/* ===================================================================*/

import {logEvent} from "../utils/utils"
import { attachModalEvents, detachModalEvents } from "../events/eventHandler";


/* ===================================================================
/* 2. Création Modale
/* ===================================================================*/

/**
 * Crée et affiche une modale de saisie de mot de passe pour l'accès administrateur.
 *
 * - Vérifie si une modale est déjà ouverte pour éviter les doublons.
 * - Génère dynamiquement la structure HTML de la modale et l'insère dans le DOM.
 * - Initialise les événements pour la validation et l'annulation de la saisie.
 * - Gère les erreurs potentielles lors de la création et de l'initialisation de la modale.
 *
 * @param {function} callback - Fonction exécutée après validation du mot de passe.
 * @throws {Error} Si le callback est invalide ou non fourni.
 */
export function createPasswordModal(callback) {
    try {
        // Vérifie que le callback est bien une fonction valide
        if (!callback || typeof callback !== "function") {
            logEvent("error", "createPasswordModal : callback invalide ou non fourni");
            throw new Error("Un callback valide est requis pour la validation du mot de passe.");
        }

        // Vérifie si une modale de mot de passe existe déjà pour éviter les doublons
        if (document.getElementById("password-modal")) {
            logEvent("info", "createPasswordModal : modale de mot de passe déjà présente");
            return;
        }

        // Création de l'élément contenant la modale
        const modal = document.createElement("div");
        modal.id = "password-modal";
        modal.innerHTML = getModalTemplate(); // Insère le contenu HTML de la modale
        document.body.appendChild(modal); // Ajoute la modale au DOM
        modal.classList.add("active"); // Active l'affichage de la modale

        // Sélection des éléments de saisie et des boutons
        const passwordInput = modal.querySelector("#admin-password");
        const validateBtn = modal.querySelector(".validate-btn");
        const cancelBtn = modal.querySelector(".cancel-btn");

        // Vérifie que tous les éléments requis sont présents
        if (!passwordInput || !validateBtn || !cancelBtn) {
            logEvent("error", "createPasswordModal : Échec de l'initialisation des éléments de la modale.");
            throw new Error("Échec de l'initialisation des éléments de la modale.");
        }

        // Place le focus sur le champ de saisie du mot de passe pour améliorer l'expérience utilisateur
        passwordInput.focus();

        // Attache les événements pour gérer la validation et l'annulation
        attachModalEvents(passwordInput, validateBtn, cancelBtn, callback, modal);

        logEvent("success", "createPasswordModal : modale de mot de passe créée avec succès");

    } catch (error) {
        // Capture et logue l'erreur en cas de problème lors de la création de la modale
        logEvent("error", "createPasswordModal : erreur lors de la création de la modale", { message: error.message });

        // Optionnel : Peut afficher un message utilisateur si la création échoue
        alert("Une erreur est survenue lors de la création de la modale. Veuillez réessayer.");
    }
}

// ==========================================================
// 3. Création et Affichage de la Modale de Saisie du Mot de Passe
// ==========================================================

/**
 * Crée et affiche une modale de saisie de mot de passe pour l'accès administrateur.
 *
 * - Vérifie si une modale est déjà ouverte pour éviter les doublons.
 * - Génère dynamiquement la structure HTML de la modale et l'insère dans le DOM.
 * - Initialise les événements pour la validation et l'annulation de la saisie.
 * - Gère les erreurs potentielles lors de la création et de l'initialisation de la modale.
 *
 * @param {function} callback - Fonction exécutée après validation du mot de passe.
 * @throws {Error} Si le callback est invalide ou non fourni.
 */
export function createPasswordModal(callback) {
    try {
        // Vérifie que `callback` est une fonction valide
        if (!callback || typeof callback !== "function") {
            logEvent("error", "createPasswordModal : callback invalide ou non fourni");
            throw new Error("Un callback valide est requis pour la validation du mot de passe.");
        }

        // Vérifie si une modale de mot de passe existe déjà pour éviter les doublons
        if (document.getElementById("password-modal")) {
            logEvent("info", "createPasswordModal : modale de mot de passe déjà présente");
            return;
        }

        // Création de l'élément contenant la modale
        const modal = document.createElement("div");
        modal.id = "password-modal";
        modal.innerHTML = getModalTemplate(); // Insère le contenu HTML de la modale
        document.body.appendChild(modal); // Ajoute la modale au DOM
        modal.classList.add("active"); // Active l'affichage de la modale

        // Sélection des éléments de saisie et des boutons
        const passwordInput = modal.querySelector("#admin-password");
        const validateBtn = modal.querySelector(".validate-btn");
        const cancelBtn = modal.querySelector(".cancel-btn");

        // Vérifie que tous les éléments requis sont présents
        if (!passwordInput || !validateBtn || !cancelBtn) {
            logEvent("error", "createPasswordModal : Échec de l'initialisation des éléments de la modale.");
            throw new Error("Échec de l'initialisation des éléments de la modale.");
        }

        // Place le focus sur le champ de saisie du mot de passe pour améliorer l'expérience utilisateur
        passwordInput.focus();

        // Attache les événements pour gérer la validation et l'annulation
        attachModalEvents(passwordInput, validateBtn, cancelBtn, callback, modal);

        logEvent("success", "createPasswordModal : modale de mot de passe créée avec succès");

    } catch (error) {
        // Capture et logue l'erreur en cas de problème lors de la création de la modale
        logEvent("error", "createPasswordModal : erreur lors de la création de la modale", { message: error.message });

        // Optionnel : Peut afficher un message utilisateur si la création échoue
        alert("Une erreur est survenue lors de la création de la modale. Veuillez réessayer.");
    }
}

/* ====================================================================
/* 4. Génération HTML de la Modale de Saisie de Mot de Passe
/* ====================================================================*/

/** 
 * Génère le code HTML de la modale de saisie de mot de passe.
 *
 * - Fournit une structure claire et accessible pour une meilleure expérience utilisateur.
 * - Intègre des attributs d'accessibilité (`aria-label`, `aria-labelledby`, `aria-describedby`).
 * - Utilise `autocomplete="current-password"` pour faciliter la saisie du mot de passe.
 * - Centralise la structure HTML pour simplifier la maintenance et les mises à jour.
 *
 * @returns {string} Code HTML de la modale sous forme de chaîne de caractères.
 */
export function getModalTemplate() {
    return `
        <!-- Conteneur principal de la modale -->
        <div 
            class="modal-content" 
            role="dialog" 
            aria-labelledby="modal-title" 
            aria-describedby="modal-description"
        >
            <!-- Titre de la modale -->
            <h2 id="modal-title">Accès Administrateur</h2>

            <!-- Description informative de l'action requise -->
            <p id="modal-description">
                Veuillez entrer votre mot de passe pour accéder à cette section.
            </p>

            <!-- Champ de saisie sécurisé pour le mot de passe -->
            <input 
                type="password" 
                id="admin-password" 
                class="password-input" 
                placeholder="Entrez votre mot de passe..." 
                autocomplete="current-password" 
                aria-label="Champ de saisie du mot de passe" 
                required
            />

            <!-- Conteneur des boutons d'action -->
            <div class="modal-buttons">
                <!-- Bouton de validation pour soumettre le mot de passe -->
                <button class="validate-btn" aria-label="Valider l'accès">Valider</button>

                <!-- Bouton d'annulation pour fermer la modale -->
                <button class="cancel-btn" aria-label="Annuler et fermer la modale">Annuler</button>
            </div>
        </div>
    `;
}

/* ================================================================
/* 5. Validation Mot de Passe
/* ================================================================*/

/**  
 * Vérifie la validité du mot de passe administrateur.
 *
 * - Vérifie si le champ est vide et empêche la validation.
 * - Compare le mot de passe avec une valeur sécurisée récupérée dynamiquement.
 * - Ferme la modale et exécute le `callback` si la validation réussit.
 * - Réinitialise le champ de saisie et affiche un message en cas d'échec.
 * - Enregistre les tentatives et erreurs dans un journal d'événements.
 *
 * @param {string} password - Mot de passe entré par l'utilisateur.
 * @param {function} callback - Fonction exécutée après validation.
 * @param {HTMLElement} modal - Modale à fermer si l'authentification réussit.
 * @throws {Error} Si le callback ou la modale sont invalides.
 */
export function verifyPassword(password, callback, modal) {
    try {
        // Vérifie la validité des paramètres
        validateParameters(password, callback, modal);

        // Récupération du champ de saisie du mot de passe
        const passwordInput = document.getElementById("admin-password");

        // Vérifie que le champ de saisie existe bien dans le DOM
        if (!passwordInput) {
            logEvent("error", "verifyPassword : champ de saisie du mot de passe introuvable");
            throw new Error("Le champ de saisie du mot de passe est introuvable.");
        }

        // Nettoie l'entrée utilisateur en supprimant les espaces superflus
        const trimmedPassword = password.trim();

        // Vérifie si le champ est vide et affiche un message d'erreur sans bloquer l'interface
        if (trimmedPassword === "") {
            logEvent("warning", "tentative de validation avec un champ vide");
            displayErrorMessage("Le champ mot de passe ne peut pas être vide.", passwordInput);
            return;
        }

        // Récupération sécurisée du mot de passe administrateur
        const storedPassword = getStoredAdminPassword();

        // Vérification du mot de passe entré par l'utilisateur
        if (trimmedPassword === storedPassword) {
            logEvent("success", "Authentification administrateur réussie");

            // Ferme la modale après validation réussie
            closeModal(modal);

            // Exécute le callback après validation
            callback(true);

        } else {
            logEvent("warning", "tentative d'accès non autorisée");
            displayErrorMessage("Mot de passe incorrect.", passwordInput);
        }

    } catch (error) {
        logEvent("critical", "Erreur critique lors de la vérification du mot de passe", { message: error.message });
        throw error;
    }
}

/* ================================================================
/* 6. Validation des Paramètres de verifyPassword
/* ================================================================*/

/**
 * Vérifie la validité des paramètres fournis à `verifyPassword`.
 *
 * - Vérifie que le mot de passe est une chaîne de caractères valide.
 * - Vérifie que le callback est une fonction exécutable.
 * - Vérifie que la modale est un élément HTML valide.
 * - Logue les erreurs détectées et lève des exceptions en cas de non-conformité.
 *
 * @param {string} password - Mot de passe entré par l'utilisateur.
 * @param {function} callback - Fonction exécutée après validation.
 * @param {HTMLElement} modal - Modale à fermer si l'authentification réussit.
 * @throws {Error} Si l'un des paramètres est invalide.
 */
function validateParameters(password, callback, modal) {
    try {
        // Vérification du mot de passe
        if (typeof password !== "string" || password.trim() === "") {
            logEvent("error", "validateParameters : Mot de passe invalide ou vide.");
            throw new Error("Le mot de passe doit être une chaîne de caractères non vide.");
        }

        // Vérification du callback
        if (!callback || typeof callback !== "function") {
            logEvent("error", "validateParameters : Callback invalide ou non fourni.");
            throw new Error("Un callback valide est requis pour la validation du mot de passe.");
        }

        // Vérification de la modale
        if (!modal || !(modal instanceof HTMLElement)) {
            logEvent("error", "validateParameters : Élément modal invalide ou inexistant.");
            throw new Error("L'élément modal fourni est invalide ou inexistant.");
        }

    } catch (error) {
        // Log de l'erreur critique et relance de l'exception pour un traitement en amont
        logEvent("critical", "Erreur critique dans validateParameters", { message: error.message });
        throw error;
    }
}

/* ===============================================================
/* 7. Gestion des Messages d'Erreur
/* ================================================================*/

/**
 * Affiche un message d'erreur et réinitialise le champ de saisie du mot de passe.
 *
 * - Utilise une alerte système par défaut pour afficher le message.
 * - Réinitialise le champ de saisie après une erreur.
 * - Met le focus sur le champ de saisie pour améliorer l'expérience utilisateur.
 * - Permet une alternative UX pour un affichage personnalisé si nécessaire.
 *
 * @param {string} message - Message d'erreur à afficher.
 * @param {HTMLInputElement} passwordInput - Champ de saisie du mot de passe.
 * @throws {Error} Si les paramètres sont invalides.
 */
function displayErrorMessage(message, passwordInput) {
    try {
        // Vérifie que les paramètres sont valides
        if (typeof message !== "string" || message.trim() === "") {
            logEvent("error", "displayErrorMessage : message d'erreur invalide ou vide.");
            throw new Error("Le message d'erreur doit être une chaîne de caractères non vide.");
        }

        if (!passwordInput || !(passwordInput instanceof HTMLInputElement)) {
            logEvent("error", "displayErrorMessage : champ de saisie du mot de passe invalide.");
            throw new Error("Le champ de saisie du mot de passe est invalide ou inexistant.");
        }

        // Crée ou met à jour un élément de message d'erreur sous le champ de saisie
        let errorMessage = passwordInput.nextElementSibling;
        if (!errorMessage || !errorMessage.classList.contains("error-message")) {
            errorMessage = document.createElement("p");
            errorMessage.classList.add("error-message");
            passwordInput.parentNode.insertBefore(errorMessage, passwordInput.nextSibling);
        }
        errorMessage.textContent = message;

        // Réinitialisation du champ de saisie après l'affichage du message
        passwordInput.value = "";

        // Focus sur le champ pour améliorer l'expérience utilisateur
        passwordInput.focus();

    } catch (error) {
        logEvent("critical", "Erreur critique dans displayErrorMessage", { message: error.message });
        throw error;
    }
}

// ==========================================================
// 8. Gestion sécurisée du mot de passe administrateur
// ==========================================================

/**
 * Récupère le mot de passe administrateur sécurisé.
 *
 * - Évite le stockage en dur du mot de passe.
 * - Récupère le mot de passe à partir d'un stockage sécurisé (ex: API, variable d'environnement).
 * - Vérifie l'intégrité des données avant de retourner le mot de passe.
 * - Gère les erreurs si la récupération du mot de passe échoue.
 *
 * @returns {string} Le mot de passe sécurisé récupéré.
 * @throws {Error} Si le mot de passe n'est pas défini, vide ou ne peut pas être récupéré.
 */
function getStoredAdminPassword() {
    try {
        // Récupération du mot de passe sécurisé via une API ou une variable d'environnement
        const storedPassword = process.env.ADMIN_PASSWORD?.trim() || null;

        // Vérifie si le mot de passe est bien récupéré et respecte un minimum de sécurité
        if (!storedPassword || typeof storedPassword !== "string" || storedPassword.length < 12) {
            logEvent("error", "getStoredAdminPassword : Mot de passe administrateur invalide ou trop court.");
            throw new Error("Échec de récupération du mot de passe sécurisé.");
        }

        return storedPassword;

    } catch (error) {
        logEvent("critical", "Erreur critique lors de la récupération du mot de passe sécurisé.", { message: error.message });
        throw error;
    }
}


/* =====================================================================
/* 9.Fermeture Modale 
/* ====================================================================
/*
/*   Cette fonction gère la fermeture sécurisée de la modale.
/*   Assure un nettoyage complet des événements pour éviter les fuites mémoire.
/*   Supprime la modale après un court délai pour gérer l'animation.
/*
/*-------------------------------------------------------------------*/

/**
 * Ferme la modale et supprime les événements attachés.
 *
 * - Vérifie que l'élément `modal` est valide avant de procéder.
 * - Retire la classe `active` pour déclencher l'animation de fermeture.
 * - Supprime la modale du DOM après un délai pour laisser l'animation se jouer.
 * - Nettoie les événements attachés pour éviter les fuites mémoire.
 *
 * @param {HTMLElement} modal - Élément DOM de la modale à fermer.
 * @throws {Error} Si l'élément `modal` est invalide ou inexistant.
 */
export function closeModal(modal) {
    try {
        // Vérifie que la modale est bien un élément HTML valide
        if (!modal || !(modal instanceof HTMLElement)) {
            logEvent("error", "closeModal : élément modal invalide ou non fourni");
            throw new Error("L'élément modal fourni est invalide ou inexistant.");
        }

        logEvent("info", "Fermeture de la modale de mot de passe en cours");

        // Nettoie les événements attachés pour éviter les fuites mémoire
        detachModalEvents(modal);

        // Vérifie si la modale est bien active avant de tenter de la fermer
        if (!modal.classList.contains("active")) {
            logEvent("warning", "closeModal : la modale n'était pas active, tentative de fermeture ignorée.");
            return;
        }

        // Déclenche l'animation de fermeture
        modal.classList.remove("active");

        // Ajoute un écouteur d'événement pour supprimer la modale après l'animation
        modal.addEventListener("transitionend", () => {
            try {
                removeModalFromDOM(modal);
            } catch (error) {
                logEvent("error", "closeModal : erreur lors de la suppression de la modale", { message: error.message });
            }
        }, { once: true });

    } catch (error) {
        logEvent("critical", "Erreur critique lors de la fermeture de la modale", { message: error.message });
        throw error;
    }
}

/* ===================================================================
/* 10. Suppression de la Modale du DOM 
/* ====================================================================
/*
/*   Cette fonction gère la suppression de la modale après l'animation.
/*   Vérifie que l'élément existe et est bien attaché avant suppression.
/*   Enregistre les erreurs pour faciliter le débogage.
/*
/*-------------------------------------------------------------------*/

/**
 * Supprime la modale du DOM après la fermeture.
 *
 * - Vérifie que la modale existe et qu'elle est bien attachée avant suppression.
 * - Capture et enregistre les erreurs éventuelles lors de la suppression.
 * - Ajoute des logs pour suivre les actions effectuées.
 *
 * @param {HTMLElement} modal - Élément DOM de la modale à supprimer.
 * @throws {Error} Si la suppression échoue en raison d'un élément invalide.
 */
function removeModalFromDOM(modal) {
    try {
        // Vérifie que la modale est un élément valide et attaché au DOM
        if (!modal || !(modal instanceof HTMLElement)) {
            logEvent("error", "removeModalFromDOM : élément modal invalide ou non fourni.");
            throw new Error("Impossible de supprimer la modale : élément invalide.");
        }

        if (!modal.parentNode) {
            logEvent("warning", "removeModalFromDOM : tentative de suppression d'une modale inexistante dans le DOM.");
            return;
        }

        // Suppression propre de la modale
        modal.remove();
        logEvent("info", "Modale de mot de passe fermée et supprimée du DOM.");

    } catch (error) {
        // Enregistre l'erreur et la remonte pour un traitement en amont si nécessaire
        logEvent("critical", "Erreur critique lors de la suppression de la modale", { message: error.message });
        throw error;
    }
}




