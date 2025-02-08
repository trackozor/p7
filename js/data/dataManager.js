/**
 * Classe DataManager pour gérer le chargement, la mise en cache et la recherche des recettes.
 * Utilisation de `logEvent()` pour enregistrer tous les événements et erreurs.
 */
class DataManager {
    /**
     * Constructeur de la classe DataManager.
     * Initialise le cache des recettes pour éviter des requêtes répétitives.
     */
    constructor() {
        /** @type {Array<Object>|null} - Stocke les recettes chargées en cache. */
        this.cache = null;
    }

    /**
     * Charge les recettes depuis le fichier JSON et les stocke en cache.
     * Si elles sont déjà en cache, retourne directement les données en mémoire.
     *
     * @async
     * @returns {Promise<Array<Object>>} Promesse avec un tableau de recettes.
     */
    async loadRecipes() {
        if (!this.cache) {
            try {
                logEvent("INFO", "Chargement des recettes depuis le fichier JSON...");
                
                const response = await fetch('/recipes.json'); // Récupération des données
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }

                this.cache = await response.json(); // Stockage des recettes en cache
                logEvent("SUCCESS", "Données chargées en cache avec succès.", { total: this.cache.length });

            } catch (error) {
                logEvent("ERROR", "Échec du chargement des recettes.", { error: error.message });
                throw error; // Remonte l'erreur pour une gestion au niveau supérieur
            }
        }
        return this.cache;
    }

    /**
     * Récupère toutes les recettes disponibles.
     *
     * @async
     * @returns {Promise<Array<Object>>} Promesse avec toutes les recettes.
     */
    async getAllRecipes() {
        try {
            const recipes = await this.loadRecipes();
            logEvent("SUCCESS", "Récupération de toutes les recettes réussie.", { total: recipes.length });
            return recipes;
        } catch (error) {
            logEvent("ERROR", "Impossible de récupérer les recettes.", { error: error.message });
            return []; // Retourne un tableau vide en cas d'erreur
        }
    }

    /**
     * Recherche une recette par son identifiant.
     *
     * @async
     * @param {number} id - L'identifiant unique de la recette.
     * @returns {Promise<Object|null>} Promesse avec la recette trouvée ou `null` si non trouvée.
     */
    async getRecipeById(id) {
        try {
            const recipes = await this.loadRecipes();
            const recipe = recipes.find(recipe => recipe.id === id) || null;
            
            if (recipe) {
                logEvent("SUCCESS", `Recette trouvée : ${recipe.name}`, { id });
            } else {
                logEvent("WARNING", "Aucune recette trouvée avec cet ID.", { id });
            }

            return recipe;
        } catch (error) {
            logEvent("ERROR", `Erreur lors de la récupération de la recette ID ${id}`, { error: error.message });
            return null;
        }
    }

    /**
     * Recherche des recettes en fonction d'un mot-clé.
     * La recherche s'effectue sur le nom de la recette et les ingrédients.
     *
     * @async
     * @param {string} keyword - Terme à rechercher.
     * @returns {Promise<Array<Object>>} Promesse avec une liste de recettes correspondantes.
     */
    async searchRecipes(keyword) {
        try {
            if (!keyword.trim()) {
                logEvent("INFO", "Aucun mot-clé fourni, retour de toutes les recettes.");
                return this.getAllRecipes();
            }

            const recipes = await this.loadRecipes();
            const filteredRecipes = recipes.filter(filterRecipeByKeyword.bind(null, keyword));

            logEvent("SUCCESS", `Recherche terminée : ${filteredRecipes.length} recettes trouvées.`, { keyword });

            return filteredRecipes;
        } catch (error) {
            logEvent("ERROR", `Erreur lors de la recherche de recettes pour '${keyword}'`, { error: error.message });
            return [];
        }
    }
}

/**
 * Filtre une recette en fonction d'un mot-clé.
 * Vérifie si le mot-clé est présent dans le nom de la recette ou parmi les ingrédients.
 *
 * @param {string} keyword - Mot-clé à rechercher.
 * @param {Object} recipe - Objet recette contenant les informations.
 * @returns {boolean} `true` si la recette correspond au mot-clé, sinon `false`.
 */
function filterRecipeByKeyword(keyword, recipe) {
    const lowerKeyword = keyword.toLowerCase();
    return (
        recipe.name.toLowerCase().includes(lowerKeyword) ||
        recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(lowerKeyword))
    );
}

// Exportation de l'instance unique de DataManager pour une utilisation centralisée
export const dataManager = new DataManager();
