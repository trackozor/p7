/* ==================================================================================== */
/*  📌 Gestion dynamique de la modale de mot de passe */
/* ==================================================================================== */

export function createPasswordModal(callback) {
    // 📌 Vérifier si la modale existe déjà
    if (document.getElementById("password-modal")) {
      return;
    }

    // 📌 Création du conteneur principal
    const modal = document.createElement("div");
    modal.id = "password-modal";
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔐 Accès Administrateur</h2>
            <input type="password" id="admin-password" class="password-input" placeholder="Entrez votre mot de passe..." />
            <div class="modal-buttons">
                <button class="validate-btn">Valider</button>
                <button class="cancel-btn">Annuler</button>
            </div>
        </div>
    `;

    // 📌 Ajout de la modale dans le DOM
    document.body.appendChild(modal);

    // 📌 Sélection des éléments
    const passwordInput = modal.querySelector("#admin-password");
    const validateBtn = modal.querySelector(".validate-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");

    //  Affichage de la modale avec animation
    modal.classList.add("active");
    passwordInput.focus();

    // 🎯 Gestion des événements
    validateBtn.addEventListener("click", () => verifyPassword(passwordInput.value, callback));
    cancelBtn.addEventListener("click", closeModal);
    passwordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            verifyPassword(passwordInput.value, callback);
        }
    });

    function verifyPassword(password, callback) {
        if (password === "SuperSecure123") {
            closeModal();
            callback(true);
        } else {
            alert("⛔ Mot de passe incorrect !");
            logEvent("WARNING", "❌ Tentative d'accès non autorisée.");
            passwordInput.value = "";
            passwordInput.focus();
        }
    }

    function closeModal() {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
    }
}
