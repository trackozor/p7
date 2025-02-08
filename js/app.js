import { fetchRecipes } from "./data/dataManager.js";
import domselectors  from "./config/domSelectors.js";

document.addEventListener("DOMContentLoaded", async () => {
  const recipes = await fetchRecipes();
  displayRecipes(recipes);
});

