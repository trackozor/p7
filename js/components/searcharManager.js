import { Search } from "./search.js";
import { logEvent } from "../../utils/utils.js";
import { getAllRecipes } from "../data/dataManager.js";
import { normalizeText } from "../utils/normalize.js"; // 

let suggestionIndex = -1; // Index de la suggestion sélectionnée
let suggestionList = []; // Liste des suggestions

/**
 * Gère la saisie utilisateur dans la barre de recherche.
 *
 * - Vérifie la validité de la requête avant exécution.
 * - Déclenche `Search()` avec la requête normalisée si elle est valide.
 * - Gère les erreurs potentielles pour éviter tout blocage de l'application.
 *
 * @param {Event} event - Événement déclenché lors de la saisie dans la barre de recherche.
 */
export function handleSearch(event) {
    try {
        const searchInput = event.target;
        if (!searchInput || typeof searchInput.value !== "string") {
            logEvent("error", "handleSearch : Élément input introuvable ou valeur non valide.");
            return;
        }

        const query = searchInput.value.trim().toLowerCase();

        // Vérifier si on doit activer l'auto-complétion
        if (query.length >= 3) {
            generateAutoCompletion(query);
        } else {
            clearSuggestions();
        }

        // Vérifier si on exécute la recherche complète
        if (query.length >= 3) {
            logEvent("info", `handleSearch : Recherche déclenchée pour "${query}".`);
            Search(query);
        }
    } catch (error) {
        logEvent("error", "handleSearch : Erreur lors du traitement de la recherche.", { error: error.message });
    }
}

/**
 * Génère des suggestions d'auto-complétion en fonction de la saisie de l'utilisateur.
 *
 * @param {string} query - Texte entré par l'utilisateur.
 */
function generateAutoCompletion(query) {
    try {
        logEvent("test_start", `generateAutoCompletion : Début pour '${query}'`);

        const searchInput = document.querySelector("#search");
        const suggestionBox = document.querySelector("#autocomplete-suggestions");

        if (!searchInput || !suggestionBox) {
            logEvent("error", "generateAutoCompletion : Élément(s) DOM introuvable(s).");
            return;
        }

        // Normaliser la requête utilisateur
        const normalizedQuery = normalizeText(query.trim());

        // Vérifier si la requête est trop courte
        if (normalizedQuery.length < 3) {
            suggestionBox.innerHTML = ""; // Effacer les suggestions
            logEvent("warn", "generateAutoCompletion : Requête trop courte (<3 caractères).");
            return;
        }

        // Récupérer les recettes disponibles
        const recipes = getAllRecipes();

        if (!Array.isArray(recipes) || recipes.length === 0) {
            logEvent("warn", "generateAutoCompletion : Aucune recette disponible.");
            suggestionBox.innerHTML = "<p class='no-suggestion'>Aucune suggestion</p>";
            return;
        }

        // Filtrer les recettes correspondant à la saisie utilisateur
        suggestionList = recipes
            .filter(recipe => normalizeText(recipe.name).includes(normalizedQuery))
            .map(recipe => recipe.name);

        // Vérifier s'il y a des suggestions
        if (suggestionList.length === 0) {
            suggestionBox.innerHTML = "<p class='no-suggestion'>Aucune suggestion</p>";
            logEvent("warn", `generateAutoCompletion : Aucune suggestion trouvée pour '${query}'`);
            return;
        }

        // Limiter le nombre de suggestions affichées (ex : max 10 suggestions)
        suggestionList = suggestionList.slice(0, 10);

        // Générer les éléments HTML des suggestions
        suggestionBox.innerHTML = suggestionList
            .map((suggestion, index) => 
                `<li class="suggestion-item ${index === suggestionIndex ? 'selected' : ''}" data-index="${index}">
                    ${suggestion}
                </li>`
            )
            .join("");

        logEvent("info", `generateAutoCompletion : ${suggestionList.length} suggestion(s) générée(s) pour '${query}'.`);

        // Ajouter les événements click sur les suggestions
        document.querySelectorAll(".suggestion-item").forEach(item => {
            item.addEventListener("click", () => selectSuggestion(item.textContent));
        });

        logEvent("test_end", "generateAutoCompletion : Auto-complétion terminée.");
    } catch (error) {
        logEvent("error", "generateAutoCompletion : Erreur inattendue.", { error: error.message });
    }
}

/**
 * Sélectionne une suggestion et remplit la barre de recherche.
 *
 * @param {string} suggestion - Texte sélectionné.
 */
function selectSuggestion(suggestion) {
    document.querySelector("#search").value = suggestion;
    clearSuggestions(); // Supprimer la liste des suggestions après sélection
    Search(suggestion); // Lancer la recherche avec la suggestion sélectionnée
}

/**
 * Efface la liste des suggestions d'auto-complétion.
 */
function clearSuggestions() {
    document.querySelector("#autocomplete-suggestions").innerHTML = "";
    suggestionIndex = -1;
}

/**
 * Gère la navigation clavier dans les suggestions.
 *
 * @param {KeyboardEvent} event - Événement clavier.
 */
function handleKeyboardNavigation(event) {
    const suggestions = document.querySelectorAll(".suggestion-item");

    if (event.key === "ArrowDown") {
        suggestionIndex = (suggestionIndex + 1) % suggestions.length;
    } else if (event.key === "ArrowUp") {
        suggestionIndex = (suggestionIndex - 1 + suggestions.length) % suggestions.length;
    } else if (event.key === "Enter" && suggestions[suggestionIndex]) {
                 selectSuggestion(suggestions[suggestionIndex].textContent);
           }

    // Mise à jour des styles des suggestions sélectionnées
    suggestions.forEach((item, index) => {
        item.classList.toggle("selected", index === suggestionIndex);
    });
}

// Ajouter les écouteurs d'événements
document.querySelector("#search").addEventListener("input", handleSearch);
document.querySelector("#search").addEventListener("keydown", handleKeyboardNavigation);
