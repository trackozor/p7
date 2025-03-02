/* ====================================================================================
/*  FICHIER          : templateManager.js
/*  AUTEUR           : Trackozor
/*  VERSION          : 2.0
/*  DATE DE CRÉATION : 08/02/2025
/*  DERNIÈRE MAJ     : 26/02/2025
/*  DESCRIPTION      : Gère l'affichage des recettes et optimise la gestion du DOM.
/* ==================================================================================== */

import { getAllRecipes } from "../data/dataManager.js";
import { RecipeFactory } from "../components/factory/recipeFactory.js";
import { logEvent } from "../utils/utils.js";

/* ====================================================================================
/*                        FONCTIONS UTILITAIRES D'AFFICHAGE
/* ==================================================================================== */
/* ------------------------------- */
/*  Affichage du message de chargement  */
/* ------------------------------- */
/**
 * Affiche un message de chargement dans un conteneur donné.
 * Vérifie la validité du conteneur avant d'insérer le message.
 *
 * @param {HTMLElement} container - Le conteneur où afficher le message.
 * @returns {void} Ne retourne rien, met à jour le DOM avec un message de chargement.
 */
function showLoadingMessage(container) {
    try {
        logEvent("info", "showLoadingMessage : Vérification du conteneur avant affichage.");

        // Vérifie si le conteneur est bien un élément HTML valide
        if (!(container instanceof HTMLElement)) {
            throw new Error("showLoadingMessage : Le conteneur fourni n'est pas un élément HTML valide.");
        }

        // Ajoute le message de chargement dans le conteneur
        container.innerHTML = `<p class="loading">Chargement des recettes...</p>`;

        logEvent("info", "showLoadingMessage : Message de chargement affiché avec succès.");
    } catch (error) {
        logEvent("error", "showLoadingMessage : Erreur lors de l'affichage du message de chargement.", { error: error.message });
    }
}

/* ------------------------------- */
/*  Affichage du message "Aucune recette trouvée"  */
/* ------------------------------- */
/**
 * Affiche un message lorsque aucune recette n'est trouvée.
 * Vérifie que le conteneur est valide avant d'insérer le message.
 *
 * @param {HTMLElement} container - Le conteneur où afficher le message.
 * @returns {void} Ne retourne rien, met à jour le DOM avec un message d'alerte.
 */
function showNoRecipesMessage(container) {
    try {
        logEvent("info", "showNoRecipesMessage : Vérification du conteneur avant affichage.");

        // Vérifie si le conteneur est bien un élément HTML valide
        if (!(container instanceof HTMLElement)) {
            throw new Error("showNoRecipesMessage : Le conteneur fourni n'est pas un élément HTML valide.");
        }

        // Ajoute le message d'absence de recettes au conteneur
        container.innerHTML = `<p class="no-recipes">Aucune recette trouvée.</p>`;
        
        logEvent("warn", "showNoRecipesMessage : Aucun résultat trouvé, message affiché.");
    } catch (error) {
        logEvent("error", "showNoRecipesMessage : Erreur lors de l'affichage du message.", { error: error.message });
    }
}

/* ====================================================================================
/*                     GÉNÉRATION ET AFFICHAGE DES RECETTES
/* ==================================================================================== */
/* ------------------------------- */
/*  Génération des cartes de recettes  */
/* ------------------------------- */
/**
 * Génère et insère toutes les recettes dans un conteneur donné.
 * Utilise un cache pour éviter de recréer des cartes déjà affichées.
 *
 * @param {HTMLElement} container - Le conteneur où afficher les recettes.
 * @param {Array<Object>} recipes - Liste des recettes à afficher.
 * @param {Map<number, HTMLElement>} cardCache - Cache des cartes pour éviter les re-rendus inutiles.
 * @returns {void} Ne retourne rien, met à jour le DOM.
 */
function renderRecipes(container, recipes, cardCache) {
    try {
        logEvent("info", `renderRecipes : Démarrage de l'affichage de ${recipes.length} recettes.`);

        // Vérifie si le conteneur est un élément HTML valide
        if (!(container instanceof HTMLElement)) {
            throw new Error("Le conteneur fourni n'est pas un élément HTML valide.");
        }

        // Vérifie que recipes est bien un tableau
        if (!Array.isArray(recipes)) {
            throw new Error("La liste des recettes est invalide.");
        }

        const fragment = document.createDocumentFragment();

        recipes.forEach(recipeData => {
            try {
                // Vérifie si la recette est déjà dans le cache
                if (cardCache.has(recipeData.id)) {
                    fragment.appendChild(cardCache.get(recipeData.id)); // Utilisation du cache
                } else {
                    const recipe = RecipeFactory(recipeData);

                    // Vérifie si la fabrique de recette retourne un objet valide
                    if (!recipe || typeof recipe.generateCard !== "function") {
                        logEvent("error", "RecipeFactory a retourné une valeur invalide.", { recipeData });
                        return;
                    }

                    const recipeCard = recipe.generateCard();

                    // Vérifie si l'élément retourné est bien une carte HTML
                    if (!(recipeCard instanceof HTMLElement)) {
                        logEvent("error", "generateCard() n'a pas retourné un élément valide.", { recipeData });
                        return;
                    }

                    // Ajoute la carte au cache pour éviter les re-rendus inutiles
                    cardCache.set(recipeData.id, recipeCard);
                    fragment.appendChild(recipeCard);
                }
            } catch (error) {
                logEvent("error", "renderRecipes : Erreur lors de la création d'une recette.", { error: error.message, recipeData });
            }
        });

        // Nettoie le conteneur avant d'ajouter les nouvelles cartes
        container.innerHTML = "";
        container.appendChild(fragment);

        logEvent("success", `renderRecipes : ${recipes.length} recettes affichées avec succès.`);
    } catch (error) {
        logEvent("error", "renderRecipes : Erreur lors de la génération des recettes.", { error: error.message });
    }
}

/* ------------------------------- */
/*  Mise à jour du mode d'affichage  */
/* ------------------------------- */
/**
 * Change la classe du conteneur pour basculer entre l'affichage en Grille et en Liste.
 * Cette fonction met à jour dynamiquement les classes CSS du conteneur pour refléter le mode d'affichage choisi.
 *
 * @param {HTMLElement} container - Conteneur des recettes.
 * @param {string} mode - Mode d'affichage ("grid" ou "list").
 * @returns {void} Ne retourne rien, met à jour le DOM.
 */
function updateViewMode(container, mode) {
    try {
        logEvent("info", `updateViewMode : Tentative de changement en mode '${mode}'.`);

        // Vérifie que l'élément passé est valide
        if (!(container instanceof HTMLElement)) {
            throw new Error("updateViewMode : Le conteneur fourni n'est pas un élément HTML valide.");
        }

        // Vérifie si le mode est valide
        if (mode !== "grid" && mode !== "list") {
            throw new Error(`updateViewMode : Mode d'affichage invalide ('${mode}').`);
        }

        // Met à jour la classe CSS du conteneur pour refléter le mode d'affichage
        if (!container.classList.contains(mode)) {
            container.classList.toggle("list-view", mode === "list");
            logEvent("success", `updateViewMode : Mode d'affichage changé en '${mode}'.`);
        } else {
            logEvent("info", `updateViewMode : Aucun changement nécessaire, le mode '${mode}' est déjà appliqué.`);
        }
    } catch (error) {
        logEvent("error", "updateViewMode : Erreur lors du changement de mode d'affichage.", { error: error.message });
    }
}

/* ====================================================================================
/*                     CLASSE TemplateManager
/* ==================================================================================== */

class TemplateManager {
    /* ------------------------------- */
    /*  Constructeur et initialisation  */
    /* ------------------------------- */
    /**
     * Initialise le TemplateManager avec un mode d'affichage par défaut et un cache.
     * Cette classe gère l'affichage des recettes et permet de stocker en cache les cartes générées
     * pour éviter des re-rendus inutiles et optimiser les performances.
     */
    constructor() {
        try {
            logEvent("info", "TemplateManager : Démarrage de l'initialisation...");

            // Définition du mode d'affichage par défaut (grille)
            this.viewMode = "grid";

            // Sélection du conteneur principal où afficher les recettes
            this.recipeContainer = document.querySelector("#recipes-list");

            // Initialisation du cache pour stocker les cartes de recettes déjà générées
            this.cardCache = new Map();

            // Vérifie si le conteneur des recettes est bien trouvé dans le DOM
            if (!this.recipeContainer) {
                throw new Error("TemplateManager : Conteneur des recettes introuvable.");
            }

            logEvent("success", "TemplateManager : Initialisation réussie.");
        } catch (error) {
            logEvent("error", "TemplateManager : Erreur lors de l'initialisation.", { error: error.message });
        }
    }

    /* ------------------------------- */
    /*  Affichage des recettes  */
    /* ------------------------------- */
    /**
     * Affiche toutes les recettes disponibles et retourne le nombre de recettes affichées.
     * Cette fonction récupère les recettes, les affiche dans le conteneur spécifié,
     * et met à jour les logs pour assurer un suivi détaillé.
     *
     * @param {string} containerSelector - Sélecteur du conteneur où afficher les recettes.
     * @returns {Promise<number>} - Nombre de recettes affichées.
     */
    async displayAllRecipes(containerSelector) {
        try {
            logEvent("info", `displayAllRecipes : Début du chargement des recettes dans '${containerSelector}'.`);

            // Sélectionne le conteneur où les recettes seront affichées
            const container = document.querySelector(containerSelector);

            // Vérifie si le conteneur spécifié existe dans le DOM
            if (!container) {
                throw new Error(`Le conteneur ${containerSelector} est introuvable.`);
            }

            showLoadingMessage(container); // Affiche un message de chargement temporaire

            // Récupération des recettes
            const recipes = await getAllRecipes();

            // Vérifie que `getAllRecipes()` retourne bien un tableau valide
            if (!Array.isArray(recipes)) {
                logEvent("error", "displayAllRecipes : Données invalides reçues depuis getAllRecipes.", { recipes });
                showNoRecipesMessage(container);
                return 0;
            }

            // Vérifie si des recettes sont disponibles
            if (recipes.length === 0) {
                logEvent("warn", "displayAllRecipes : Aucune recette disponible pour l'affichage.");
                showNoRecipesMessage(container);
                return 0;
            }

            logEvent("info", `displayAllRecipes : ${recipes.length} recettes récupérées.`);

            // Génération et affichage des recettes avec gestion du cache
            renderRecipes(container, recipes, this.cardCache);

            logEvent("success", `displayAllRecipes : ${recipes.length} recettes affichées avec succès.`);
            return recipes.length;
        } catch (error) {
            logEvent("error", "displayAllRecipes : Erreur lors de l'affichage des recettes.", { error: error.message });
            return 0;
        }
    }

    /* ------------------------------- */
    /*  Gestion du mode d'affichage  */
    /* ------------------------------- */
    /**
     * Bascule entre le mode "Grille" et "Liste".
     * Cette fonction permet de modifier dynamiquement l'affichage des recettes
     * en alternant entre une présentation en grille et une présentation en liste.
     *
     * @returns {void} Ne retourne rien, met à jour l'affichage en fonction du mode actuel.
     */
    toggleViewMode() {
        try {
            logEvent("info", "toggleViewMode : Tentative de changement de mode d'affichage.");

            // Vérifie si le conteneur des recettes est disponible
            if (!this.recipeContainer) {
                throw new Error("Le conteneur des recettes est introuvable, impossible de changer l'affichage.");
            }

            // Détermine le nouveau mode d'affichage
            const previousMode = this.viewMode;
            this.viewMode = this.viewMode === "grid" ? "list" : "grid";

            // Applique la mise à jour du mode d'affichage
            updateViewMode(this.recipeContainer, this.viewMode);

            logEvent("success", `toggleViewMode : Mode d'affichage changé de '${previousMode}' à '${this.viewMode}'.`);
        } catch (error) {
            logEvent("error", "toggleViewMode : Erreur lors du changement de mode d'affichage.", { error: error.message });
        }
    }
}

/* ====================================================================================
/*                     EXPORT DU MODULE
/* ==================================================================================== */

export const templateManager = new TemplateManager();

/* ====================================================================================
/*                     EXPORT DU MODULE
/* ==================================================================================== */


