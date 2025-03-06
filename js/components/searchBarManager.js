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

let suggestionIndex = -1; // Index de la suggestion sélectionnée
let suggestionList = [];  // Liste des suggestions disponibles
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
export function handleBarSearch(event) {
    try {
        logEvent("test_start", "handleBarSearch : Début de la gestion de la saisie utilisateur.");

        // Vérifie que l'élément `event.target` est valide et contient bien une valeur
        const searchInput = event.target;
        if (!searchInput || typeof searchInput.value !== "string") {
            logEvent("error", "handleBarSearch : Élément input introuvable ou valeur non valide.");
            return;
        }

        // Nettoyage et normalisation de la requête utilisateur (suppression des espaces inutiles, mise en minuscules)
        const query = searchInput.value.trim().toLowerCase();

        // Vérifie si l'utilisateur a tapé 3 caractères ou plus pour activer l'auto-complétion
        if (query.length >= 3) {
            logEvent("info", `handleBarSearch : Activation de l'auto-complétion pour '${query}'.`);
            generateAutoCompletion(query);
        } else {
            // Si moins de 3 caractères, on efface la liste des suggestions
            logEvent("info", "handleBarSearch : Effacement des suggestions (moins de 3 caractères).");
            clearSuggestions();
        }

        // Vérifie si la requête est valide (au moins 3 caractères) avant d'exécuter la recherche
        if (query.length >= 3) {
            logEvent("info", `handleBarSearch : Recherche déclenchée pour '${query}' depuis la barre de recherche.`);
            Search(query, "searchBar");  // On passe "searchBar" comme type de recherche
        }

        logEvent("test_end", "handleBarSearch : Gestion de la saisie utilisateur terminée.");
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

function generateAutoCompletion(query) {
    try {
        logEvent("test_start", `generateAutoCompletion : Début pour '${query}'`);

        // Sélection des éléments DOM nécessaires
        const searchInput = document.querySelector("#search");
        const suggestionBox = document.querySelector("#autocomplete-suggestions");

        if (!searchInput || !suggestionBox) {
            logEvent("error", "generateAutoCompletion : Élément(s) DOM introuvable(s).");
            return;
        }

        // Normalisation de la requête utilisateur
        const normalizedQuery = normalizeText(query.trim());

        if (normalizedQuery.length < 3) {
            suggestionBox.innerHTML = "";
            logEvent("warn", "generateAutoCompletion : Requête trop courte (<3 caractères).");
            return;
        }

        //  Récupération des recettes disponibles
        const recipes = getAllRecipes();
        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("warn", "generateAutoCompletion : Aucune recette disponible.");
            suggestionBox.innerHTML = "<p class='no-suggestion'>Aucune suggestion</p>";
            return;
        }

        //  Récupération du cache des filtres
        const activeTags = getActiveTags();
        
        //  Génération de la liste des suggestions enrichies
        const suggestionSet = new Set();

        recipes.forEach(recipe => {
            // Ajout du nom de la recette si elle correspond à la recherche
            if (normalizeText(recipe.name).includes(normalizedQuery)) {
                suggestionSet.add(recipe.name);
            }

            // Ajout des ingrédients qui correspondent
            recipe.ingredients.forEach(ing => {
                if (normalizeText(ing.ingredient).includes(normalizedQuery)) {
                    suggestionSet.add(ing.ingredient);
                }
            });

            // Ajout de l'appareil si correspondant
            if (normalizeText(recipe.appliance).includes(normalizedQuery)) {
                suggestionSet.add(recipe.appliance);
            }

            // Ajout des ustensiles correspondants
            recipe.ustensils.forEach(ust => {
                if (normalizeText(ust).includes(normalizedQuery)) {
                    suggestionSet.add(ust);
                }
            });

            // Ajout des tags actifs (cache de filtres)
            Object.values(activeTags).flat().forEach(tag => {
                if (normalizeText(tag).includes(normalizedQuery)) {
                    suggestionSet.add(tag);
                }
            });
        });

        // Limite à 10 suggestions max
        suggestionList = Array.from(suggestionSet).slice(0, 10);

        // Vérification si des suggestions ont été trouvées
        if (suggestionList.length === 0) {
            suggestionBox.innerHTML = "<p class='no-suggestion'>Aucune suggestion</p>";
            logEvent("warn", `generateAutoCompletion : Aucune suggestion trouvée pour '${query}'`);
            return;
        }

        //  Mise à jour dynamique des suggestions affichées
        suggestionBox.innerHTML = suggestionList
            .map((suggestion, index) => 
                `<li class="suggestion-item ${index === suggestionIndex ? 'selected' : ''}" data-index="${index}">
                    ${suggestion}
                </li>`
            )
            .join("");

        logEvent("info", `generateAutoCompletion : ${suggestionList.length} suggestion(s) générée(s) pour '${query}'.`);

        // Ajout des événements de sélection
        document.querySelectorAll(".suggestion-item").forEach(item => {
            item.addEventListener("click", () => selectSuggestion(item.textContent));
        });

        logEvent("test_end", "generateAutoCompletion : Auto-complétion terminée.");
    } catch (error) {
        logEvent("error", "generateAutoCompletion : Erreur inattendue.", { error: error.message });
    }
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

        // Réinitialise l'index de la suggestion sélectionnée
        suggestionIndex = -1;

        logEvent("success", "clearSuggestions : Liste des suggestions effacée avec succès.");
        logEvent("test_end", "clearSuggestions : Suppression terminée.");
    } catch (error) {
        logEvent("error", "clearSuggestions : Erreur inattendue.", { error: error.message });
    }
}

/* ==================================================================================== */
/*              SECTION 5: RÉCUPÉRATION DES TAGS ACTIFS                                 */
/* ==================================================================================== */
/**
 * Récupère les tags de filtres actuellement sélectionnés dans l'interface utilisateur.
 *
 * - Sélectionne les tags affichés dans le DOM.
 * - Convertit leur texte en minuscules et supprime les espaces inutiles.
 * - Retourne un objet contenant les filtres actifs classés par type.
 *
 * @returns {Object} Un objet contenant les tags actifs classés par catégories :
 *                   - `ingredients` : Liste des ingrédients sélectionnés.
 *                   - `appliances` : Liste des appareils sélectionnés.
 *                   - `ustensils` : Liste des ustensiles sélectionnés.
 */
function getActiveTags() {
    return {
        // Récupère tous les tags actifs pour chaque catégorie et normalise le texte
        ingredients: [...document.querySelectorAll('.filter-tag[data-filter-type="ingredients"]')]
            .map(tag => tag.textContent.trim().toLowerCase()),

        appliances: [...document.querySelectorAll('.filter-tag[data-filter-type="appliances"]')]
            .map(tag => tag.textContent.trim().toLowerCase()),

        ustensils: [...document.querySelectorAll('.filter-tag[data-filter-type="ustensils"]')]
            .map(tag => tag.textContent.trim().toLowerCase())
    };
}

