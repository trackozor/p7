/** ====================================================================================
 *  FICHIER          : searchBarManager.js
 *  AUTEUR           : Trackozor
 *  VERSION          : 1.2
 *  DESCRIPTION      : Gère la logique de la barre de recherche et l'auto-complétion.
 *                     - Gestion des entrées utilisateur.
 *                     - Génération des suggestions dynamiques.
 *                     - Navigation clavier et sélection d'éléments.
 *                     - Lancement de la recherche en temps réel.
 * ==================================================================================== */

import { Search } from "./search/search.js";
import { logEvent } from "../utils/utils.js";
import { getAllRecipes } from "../data/dataManager.js";
import { normalizeText } from "../utils/normalize.js"; 

let currentSuggestions = new Set(); // Stocke l'état actuel des suggestions

/* ==================================================================================== */
/*                        SECTION 1 : GESTION DE LA SAISIE UTILISATEUR                  */
/* ==================================================================================== */
/**
 * Gère la saisie utilisateur dans la barre de recherche.
 *
 * - Vérifie la validité de la requête avant exécution.
 * - Déclenche `Search()` avec la requête normalisée si elle est valide.
 * - Active l'auto-complétion à partir de 3 caractères.
 *
 * @param {Event} event - Événement déclenché lors de la saisie dans la barre de recherche.
 * @returns {void} Ne retourne rien, mais déclenche la recherche et l’auto-complétion.
 */
export function handleBarSearch() {
    try {
        logEvent("test_start", "handleBarSearch : Début de la gestion de la saisie utilisateur.");

        // Récupérer l'élément input correctement
        const searchInput = document.querySelector("#search");
        
        if (!searchInput || typeof searchInput.value !== "string") {
            logEvent("error", "handleBarSearch : Élément input introuvable ou valeur non valide.");
            return;
        }

        // Nettoyage et normalisation de la requête utilisateur (suppression des espaces inutiles, mise en minuscules)
        const query = searchInput.value.trim().toLowerCase();

        if (query.length >= 3) {
            logEvent("info", `handleBarSearch : Activation de l'auto-complétion pour '${query}'.`);
            generateAutoCompletion(query);
        } else {
            logEvent("info", "handleBarSearch : Effacement des suggestions (moins de 3 caractères).");
            clearSuggestions();
        }

        if (query.length >= 3) {
            logEvent("info", `handleBarSearch : Recherche déclenchée pour '${query}' depuis la barre de recherche.`);
            Search(query, "searchBar");  
        } else if (query.length === 0) {
            logEvent("info", "handleBarSearch : Champ vide, affichage de toutes les recettes.");
            Search("", {}); 
        }

        logEvent("test_end", " handleBarSearch : Gestion de la saisie utilisateur terminée.");
    } catch (error) {
        logEvent("error", "handleBarSearch : Erreur lors du traitement de la recherche.", { error: error.message });
    }
}

/** ====================================================================================
 *  SECTION 2 : AUTO-COMPLÉTION ET SUGGESTIONS
 * ==================================================================================== */
/**
 * Génère des suggestions d'auto-complétion en fonction de la saisie de l'utilisateur.
 *
 * - Normalise la requête utilisateur.
 * - Récupère et filtre les recettes en fonction du texte saisi.
 * - Limite les suggestions affichées à 10 résultats maximum.
 * - Met à jour dynamiquement la liste des suggestions dans le DOM.
 * - Attache un événement `click` sur chaque suggestion pour la sélection.
 *
 * @param {string} query - Texte entré par l'utilisateur.
 * @returns {void} Ne retourne rien, mais met à jour la liste des suggestions affichées.
 */
export function generateAutoCompletion(query) {
    try {
        logEvent("test_start", `generateAutoCompletion : Début pour '${query}'`);

        const searchInput = document.querySelector("#search");
        const suggestionBox = document.querySelector("#autocomplete-suggestions");

        if (!searchInput || !suggestionBox) {
            logEvent("error", "generateAutoCompletion : Élément(s) DOM introuvable(s).");
            return;
        }

        const normalizedQuery = normalizeText(query.trim().toLowerCase());

        if (normalizedQuery.length < 3) {
            clearSuggestions();
            return;
        }

        const recipes = getAllRecipes();
        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("warn", "generateAutoCompletion : Aucune recette disponible.");
            clearSuggestions();
            return;
        }

        // Création d'un nouvel ensemble pour stocker les nouvelles suggestions
        let newSuggestions = new Set();

        recipes.forEach(recipe => {
            if (recipe.name.toLowerCase().includes(normalizedQuery)) {
                newSuggestions.add(recipe.name);
            }
            recipe.ingredients.forEach(ing => {
                if (ing.ingredient.toLowerCase().includes(normalizedQuery)) {
                    newSuggestions.add(ing.ingredient);
                }
            });
            if (recipe.appliance.toLowerCase().includes(normalizedQuery)) {
                newSuggestions.add(recipe.appliance);
            }
            recipe.ustensils.forEach(ust => {
                if (ust.toLowerCase().includes(normalizedQuery)) {
                    newSuggestions.add(ust);
                }
            });
        });

        // Vérifie si les suggestions ont changé
        if (JSON.stringify([...newSuggestions]) !== JSON.stringify([...currentSuggestions])) {
            currentSuggestions = newSuggestions;
            updateSuggestionBox(suggestionBox, currentSuggestions);
        }

        logEvent("success", `generateAutoCompletion : ${currentSuggestions.size} suggestion(s) mise(s) à jour.`);
    } catch (error) {
        logEvent("error", "generateAutoCompletion : Erreur inattendue.", { error: error.message });
    }
}

// Mise à jour du DOM en une seule opération
function updateSuggestionBox(suggestionBox, suggestions) {
    suggestionBox.innerHTML = "";
    const fragment = document.createDocumentFragment();

    suggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.classList.add("suggestion-item");
        li.textContent = suggestion;
        li.addEventListener("click", () => selectSuggestion(suggestion));
        fragment.appendChild(li);
    });

    suggestionBox.appendChild(fragment);
}

/** ====================================================================================
 *  SECTION 3 : SÉLECTION ET VALIDATION DES SUGGESTIONS
 * ==================================================================================== */
/**
 * Sélectionne une suggestion et remplit la barre de recherche.
 *
 * - Vérifie que la suggestion est valide.
 * - Remplit automatiquement la barre de recherche avec la suggestion choisie.
 * - Efface la liste des suggestions après sélection.
 * - Déclenche la recherche avec la suggestion sélectionnée.
 *
 * @param {string} suggestion - Texte de la suggestion sélectionnée.
 * @returns {void} Ne retourne rien, mais met à jour la recherche et l'UI.
 */
function selectSuggestion(suggestion) {
    try {
        logEvent("test_start", `selectSuggestion : Tentative de sélection de '${suggestion}'`);

        // Sélection des éléments du DOM nécessaires
        const searchInput = document.querySelector("#search");
        const suggestionBox = document.querySelector("#autocomplete-suggestions");

        // Vérification que les éléments existent dans le DOM
        if (!searchInput || !suggestionBox) {
            logEvent("error", "selectSuggestion : Élément(s) DOM introuvable(s).");
            return;
        }

        // Vérification que la suggestion est une chaîne de caractères valide
        if (!suggestion || typeof suggestion !== "string" || suggestion.trim().length === 0) {
            logEvent("error", "selectSuggestion : Suggestion invalide ou vide.");
            return;
        }

        // Mettre la suggestion sélectionnée dans la barre de recherche
        searchInput.value = suggestion.trim();
        logEvent("info", `selectSuggestion : Suggestion '${suggestion}' insérée dans le champ de recherche.`);

        // Effacer la liste des suggestions après sélection
        clearSuggestions();
        logEvent("success", "selectSuggestion : Suggestions effacées après sélection.");

        // Déclencher la recherche avec la suggestion sélectionnée
        Search(suggestion);
        logEvent("test_end", "selectSuggestion : Recherche lancée après sélection.");
    } catch (error) {
        logEvent("error", "selectSuggestion : Erreur inattendue.", { error: error.message });
    }
}

/* ==================================================================================== */
/*                        SECTION 4 : NETTOYAGE DES SUGGESTIONS                        */
/* ==================================================================================== */
/**
 * Efface la liste des suggestions d'auto-complétion.
 *
 * - Sélectionne l'élément contenant les suggestions.
 * - Vérifie sa présence avant de vider son contenu.
 * - Réinitialise l'index de sélection des suggestions.
 */
function clearSuggestions() {
    try {
        logEvent("test_start", "clearSuggestions : Début de la suppression des suggestions.");

        // Sélectionne l'élément contenant la liste des suggestions
        const suggestionBox = document.querySelector("#autocomplete-suggestions");

        // Vérifie que l'élément existe avant d'effectuer l'opération
        if (!suggestionBox) {
            logEvent("error", "clearSuggestions : Élément 'autocomplete-suggestions' introuvable.");
            return;
        }

        // Efface le contenu des suggestions
        suggestionBox.innerHTML = "";


        logEvent("success", "clearSuggestions : Liste des suggestions effacée avec succès.");
        logEvent("test_end", "clearSuggestions : Suppression terminée.");
    } catch (error) {
        logEvent("error", "clearSuggestions : Erreur inattendue.", { error: error.message });
    }
}


