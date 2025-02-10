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

/*-------------------------------------------------------------------
/*   Création Modale
/*-------------------------------------------------------------------*/

/**
 * Crée et affiche une modale de saisie de mot de passe pour l'accès administrateur.
 *
 * - Vérifie si une modale est déjà ouverte pour éviter les doublons.
 * - Insère dynamiquement la modale dans le DOM.
 * - Gère les événements liés à la validation et à l'annulation.
 *
 * @param {function} callback - Fonction exécutée après validation du mot de passe.
 */
export function createPasswordModal(callback) {
    if (!callback || typeof callback !== "function") {
        logEvent("error", "createPasswordModal : callback invalide ou non fourni");
        throw new Error("Un callback valide est requis pour la validation du mot de passe.");
    }

    if (document.getElementById("password-modal")) {
        logEvent("info", "modale de mot de passe déjà présente");
        return;
    }

    try {
        // Création et insertion de la modale
        const modal = document.createElement("div");
        modal.id = "password-modal";
        modal.innerHTML = getModalTemplate();
        document.body.appendChild(modal);
        modal.classList.add("active");

        // Sélection des éléments de la modale
        const passwordInput = modal.querySelector("#admin-password");
        const validateBtn = modal.querySelector(".validate-btn");
        const cancelBtn = modal.querySelector(".cancel-btn");

        if (!passwordInput || !validateBtn || !cancelBtn) {
            throw new Error("Échec de l'initialisation des éléments de la modale.");
        }

        passwordInput.focus();

        // Ajout des événements
        attachModalEvents(passwordInput, validateBtn, cancelBtn, callback, modal);

        logEvent("success", "modale de mot de passe créée avec succès");
    } catch (error) {
        logEvent("error", "erreur lors de la création de la modale", { message: error.message });
    }
}

/*-------------------------------------------------------------------
/*    Génération html modale
/*-------------------------------------------------------------------*/

/** 
 * Génère le code HTML de la modale de saisie de mot de passe.
 *
 * - Structure claire et accessible pour améliorer l'expérience utilisateur.
 * - Ajout d'attributs pour une meilleure accessibilité (`aria-label`, `autocomplete`).
 * - Facilite la maintenabilité en centralisant la structure HTML.
 *
 * @returns {string} Structure HTML de la modale sous forme de chaîne de caractères.
 */
export function getModalTemplate() {
    return `
        <div class="modal-content" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
            <h2 id="modal-title">Accès Administrateur</h2>
            <p id="modal-description">Veuillez entrer votre mot de passe pour accéder à cette section.</p>
            <input 
                type="password" 
                id="admin-password" 
                class="password-input" 
                placeholder="Entrez votre mot de passe..." 
                autocomplete="current-password" 
                aria-label="Champ de saisie du mot de passe"
            />
            <div class="modal-buttons">
                <button class="validate-btn" aria-label="Valider l'accès">Valider</button>
                <button class="cancel-btn" aria-label="Annuler et fermer la modale">Annuler</button>
            </div>
        </div>
    `;
}

/*----------------------------------------------------------------
 *    Gestion des événements
/*----------------------------------------------------------------*/

/**
 * Attache les événements de validation et d'annulation à la modale.
 *
 * - Vérifie la présence des éléments avant d'attacher les événements.
 * - Ajoute la validation sur le bouton et la touche "Enter".
 * - Nettoie les événements à la fermeture de la modale.
 *
 * @param {HTMLElement} passwordInput - Champ de saisie du mot de passe.
 * @param {HTMLElement} validateBtn - Bouton de validation.
 * @param {HTMLElement} cancelBtn - Bouton d'annulation.
 * @param {function} callback - Fonction exécutée après validation.
 * @param {HTMLElement} modal - Élément DOM de la modale.
 */
function attachModalEvents(passwordInput, validateBtn, cancelBtn, callback, modal) {
    try {
        if (!passwordInput || !validateBtn || !cancelBtn || !modal) {
            logEvent("error", "attachModalEvents : Un ou plusieurs éléments sont manquants.", {
                passwordInput,
                validateBtn,
                cancelBtn,
                modal
            });
            return;
        }

        const handleValidation = () => verifyPassword(passwordInput.value, callback, modal);
        const handleClose = () => closeModal(modal);
        const handleEnterKey = (event) => {
            if (event.key === "Enter") {
                handleValidation();
            }
        };

        validateBtn.addEventListener("click", handleValidation);
        cancelBtn.addEventListener("click", handleClose);
        passwordInput.addEventListener("keydown", handleEnterKey);

        // Nettoyage des événements à la fermeture de la modale
        modal.cleanup = () => {
            validateBtn.removeEventListener("click", handleValidation);
            cancelBtn.removeEventListener("click", handleClose);
            passwordInput.removeEventListener("keydown", handleEnterKey);
        };

        logEvent("success", "Écouteurs attachés à la modale avec succès.");
    } catch (error) {
        logEvent("error", "Erreur lors de l'attachement des événements à la modale.", { error: error.message });
    }
}

/*----------------------------------------------------------------
/*    Validation Mot de Passe
/*----------------------------------------------------------------*/

/**  
 * Vérifie la validité du mot de passe administrateur.
 *
 * - Vérifie si le champ est vide et empêche la validation.
 * - Compare le mot de passe avec une valeur sécurisée.
 * - Ferme la modale et exécute le `callback` si la validation réussit.
 * - Réinitialise le champ de saisie en cas d'échec.
 *
 * @param {string} password - Mot de passe entré par l'utilisateur.
 * @param {function} callback - Fonction exécutée après validation.
 * @param {HTMLElement} modal - Modale à fermer si l'authentification réussit.
 */
export function verifyPassword(password, callback, modal) {
    if (!callback || typeof callback !== "function") {
        logEvent("error", "verifyPassword : callback invalide ou non fourni");
        throw new Error("Un callback valide est requis pour la validation du mot de passe.");
    }

    if (!modal || !(modal instanceof HTMLElement)) {
        logEvent("error", "verifyPassword : élément modal invalide");
        throw new Error("L'élément modal fourni est invalide.");
    }

    const trimmedPassword = password.trim();
    const passwordInput = document.getElementById("admin-password");

    if (!passwordInput) {
        logEvent("error", "verifyPassword : champ de saisie du mot de passe introuvable");
        return;
    }

    if (trimmedPassword === "") {
        logEvent("warning", "tentative de validation avec un champ vide");
        alert("Le champ mot de passe ne peut pas être vide.");
        passwordInput.focus();
        return;
    }

    // Vérification du mot de passe sécurisé (idéalement stocké dans une variable sécurisée)
    const storedPassword = "SuperSecure123"; // Remplacer par une gestion sécurisée

    if (trimmedPassword === storedPassword) {
        logEvent("success", "authentification administrateur réussie");
        closeModal(modal);
        callback(true);
    } else {
        logEvent("warning", "tentative d'accès non autorisée");
        alert("Mot de passe incorrect.");
        passwordInput.value = "";
        passwordInput.focus();
    }
}

/*-------------------------------------------------------------------
/*   Fermeture Modale
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
 */
export function closeModal(modal) {
    if (!modal || !(modal instanceof HTMLElement)) {
        logEvent("error", "closeModal : élément modal invalide ou non fourni");
        throw new Error("L'élément modal fourni est invalide ou inexistant.");
    }

    logEvent("info", "fermeture de la modale de mot de passe en cours");

    // Suppression des événements pour éviter les fuites mémoire
    if (typeof modal.cleanup === "function") {
        modal.cleanup();
    }

    // Déclenche l'animation de fermeture
    modal.classList.remove("active");

    // Suppression de la modale après un court délai
    setTimeout(() => {
        modal.remove();
        logEvent("info", "modale de mot de passe fermée");
    }, 300);
}

