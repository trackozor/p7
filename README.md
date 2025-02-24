# PetitsPlats2.0

# 🍽️ Les Petits Plats - Projet JS

## 📌 Description du Projet
Les Petits Plats est un **moteur de recherche de recettes** optimisé et performant.  
L'objectif est de permettre aux utilisateurs de **rechercher des recettes dynamiquement** à l'aide de **filtres interactifs** sans utiliser d'API externe ni de framework.  

🚀 **Fonctionnalités principales :**
- Recherche instantanée avec filtrage dynamique.
- Gestion avancée des filtres (`ingrédients`, `appareils`, `ustensiles`).
- **Scroll infini** pour le chargement progressif des éléments.
- Mode **Benchmark** pour tester les performances des algorithmes.
- Gestion des erreurs et logs détaillés (`info`, `error`, `test_start`, etc.).

---

## ⚙️ Technologies Utilisées
- **JavaScript (ES6+)** : Manipulation DOM, gestion des événements, optimisations.
- **HTML5/CSS3** : Structure de la page et design des filtres.
- **SCSS** : Organisation avancée des styles.
- **Node.js (pour le développement)** : Lancer un serveur local.
- **JSBench** (optionnel) : Benchmark des performances.

---

## 📂 Architecture du Projet
```plaintext
📦 Les-Petits-Plats
 ┣ 📂 assets/
 ┃ ┣ 📂 images/               # Images utilisées dans le projet
 ┃ ┗ 📂 styles/               # Fichiers CSS/SCSS
 ┣ 📂 data/
 ┃ ┣ 📜 recipe.js             # Données des recettes
 ┃ ┗ 📜 dataManager.js        # Gestion des données et recherche
 ┣ 📂 events/
 ┃ ┣ 📜 eventListener.js      # Gestion centralisée des événements
 ┃ ┣ 📜 eventHandler.js       # Actions liées aux événements utilisateur
 ┣ 📂 components/
 ┃ ┣ 📂 factory/
 ┃ ┃ ┣ 📜 dropdownFactory.js  # Génération dynamique des dropdowns
 ┃ ┃ ┣ 📜 modalFactory.js     # Génération des modals
 ┃ ┃ ┗ 📜 recipeFactory.js    # Génération des cartes de recettes
 ┃ ┣ 📜 filterManager.js      # Gestion et affichage des filtres
 ┣ 📂 utils/
 ┃ ┣ 📜 utils.js              # Fonctions utilitaires (logEvent, debounce...)
 ┃ ┣ 📜 normalize.js          # Nettoyage et normalisation des textes
 ┣ 📜 index.html              # Structure principale de la page
 ┣ 📜 main.js                 # Point d'entrée de l'application
 ┗ 📜 README.md               # Documentation du projet
