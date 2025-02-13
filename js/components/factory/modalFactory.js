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
