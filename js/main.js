/* ==================================================================================== */
/*  FICHIER          : main.js                                                          */
/*  AUTEUR           : Trackozor                                                        */
/*  VERSION          : 1.0                                                              */
/*  DESCRIPTION      : Point d’entrée principal du script.                              */
/*                     Initialise l’application après le chargement du DOM.            */
/* ==================================================================================== */

//  Importation du gestionnaire d'écouteurs d'événements
import { initEventListeners } from "./events/eventListener.js";

document.addEventListener("DOMContentLoaded", () => {
    logEvent("INFO", "Chargement du DOM terminé. Initialisation des écouteurs...");
    initEventListeners(); // Appelle la fonction qui gère tous les écouteurs d'événements
});
