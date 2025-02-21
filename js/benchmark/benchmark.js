
import { searchRecipesFunctional } from "../components/search/searchFunctional.js";


export function benchmarkSearch(query) {
  const iterations = 1000; // Nombre de répétitions pour mesurer le temps
  let startTime, endTime;

  // Test boucle native
  startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    searchRecipesLoop(query);
  }
  endTime = performance.now();
  console.log(`Boucles natives: ${endTime - startTime}ms`);

  // Test programmation fonctionnelle
  startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    searchRecipesFunctional(query);
  }
  endTime = performance.now();
  console.log(`Programmation fonctionnelle: ${endTime - startTime}ms`);
}
