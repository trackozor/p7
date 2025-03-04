# 🍽️ Les Petits Plats - Moteur de Recherche de Recettes

![Les Petits Plats](https://your-image-link.com) <!-- Remplace par une image si disponible -->

## 📌 Description du Projet  

**Les Petits Plats** est une application web conçue pour permettre une **recherche rapide, interactive et optimisée** de recettes de cuisine.  
Elle repose sur un **moteur de recherche performant en JavaScript Vanilla**, garantissant une **expérience fluide et instantanée** sans recours à une **API externe ni à un framework**.

### 🎯 Objectifs  

✅ **Moteur de recherche ultra-rapide** : Traitement instantané des requêtes utilisateur.  
✅ **Filtrage dynamique avancé** : Recherche précise par **ingrédients, appareils et ustensiles**.  
✅ **Expérience utilisateur immersive** : Interface fluide et **entièrement responsive**.  
✅ **Performance optimisée** : **Détection instantanée des résultats**, gestion efficace du DOM.  
✅ **Autonomie complète** : Exécution **100% locale**, garantissant rapidité et indépendance.  

---

## ⚙️ Technologies Utilisées  

| Technologie | Usage |
|------------|----------------------------------|
| **JavaScript (ES6+)** | Moteur de recherche, manipulation DOM optimisée |
| **HTML5 / CSS3** | Structure et mise en page adaptative |
| **SCSS** | Préprocesseur CSS pour une meilleure gestion des styles |
| **Node.js** | Gestion des dépendances et transpilation SCSS |
| **ESLint & Prettier** | Linting et formatage du code |
| **Git & GitHub** | Versioning et gestion des contributions |
| **Chart.js** | Génération de graphiques pour l’analyse des performances |
| **Nodemon** | Surveillance des fichiers SCSS et rechargement automatique |

---

## 📦 Installation & Lancement  

### 🔹 **1️⃣ Prérequis**  

- **Node.js** (`>= 18.0.0`) & **npm** (`>= 9.0.0`)
- **Git** installé sur le système

📌 **Vérifier l'installation des prérequis**  

```sh
node -v    # Vérifie la version de Node.js
npm -v     # Vérifie la version de npm
git --version  # Vérifie la version de Git
```

### 🔹 **2️⃣ Clonage du projet**  

```sh
git clone https://github.com/trackozor/p7.git
cd p7
```

### 🔹 **3️⃣ Installation des dépendances**  

```sh
npm install
```

📌 **Dépendances clés installées :**  

| Type | Bibliothèques |
|------|-------------|
| **Développement** | `eslint`, `prettier`, `nodemon`, `sass` |
| **Production** | `chart.js`, `chalk`, `ajv` |

### 🚨 **Problèmes courants et solutions**  

| Erreur | Solution |
|--------|----------|
| `EACCES: permission denied` (Linux/Mac) | `sudo npm install --unsafe-perm` |
| `fsevents` error (Windows) | `npm rebuild` |

### 🔹 **4️⃣ Exécution en mode développement**  

```sh
npm run dev
```

### 🔹 **5️⃣ Exécution en mode production**  

```sh
npm start
```

### 🔹 **6️⃣ Commandes complémentaires**  

```sh
npm run sass    # Compilation SCSS
npm run lint    # Vérification du code
npm run format  # Formatage du code
```

---

## 📂 Structure du Projet  

```plaintext
📦 p7-les-petits-plats/
 ┣ 📂 .vscode/                   # Configuration VS Code (si présente)
 ┣ 📂 assets/                     # Ressources graphiques et médias
 ┃  ┣ 📂 icons/                    # Icônes utilisées dans l'interface
 ┃  ┣ 📂 images/                   # Images statiques
 ┃  ┗ 📂 webp/                     # Images converties en WebP
 ┣ 📂 css/                        # Fichiers CSS générés
 ┃  ┣ 📜 main.css                  # Feuille de style principale
 ┃  ┗ 📜 main.css.map              # Source map CSS pour debug
 ┣ 📂 js/                         # Code JavaScript
 ┃  ┣ 📂 components/               # Composants réutilisables
 ┃  ┃  ┣ 📂 count/                  # Gestion des compteurs (ex: nombre de résultats)
 ┃  ┃  ┃  ┗ 📜 count.js
 ┃  ┃  ┣ 📂 factory/                # Génération dynamique des éléments UI
 ┃  ┃  ┃  ┣ 📜 dropdownFactory.js    # Gestion des dropdowns de filtres
 ┃  ┃  ┃  ┗ 📜 recipeFactory.js      # Génération des cartes de recettes
 ┃  ┃  ┣ 📂 search/                 # Moteur de recherche et gestion des résultats
 ┃  ┃  ┃  ┣ 📜 displayResults.js     # Affichage dynamique des résultats
 ┃  ┃  ┃  ┣ 📜 search.js             # Logique principale de recherche
 ┃  ┃  ┃  ┣ 📜 searchFunctional.js   # Variante fonctionnelle de la recherche
 ┃  ┃  ┃  ┗ 📜 searchloopNative.js   # Algorithme de recherche optimisé en natif
 ┃  ┃  ┣ 📜 filterManager.js        # Gestion et affichage des filtres
 ┃  ┃  ┗ 📜 searchbarManager.js      # Gestion avancée de la recherche
 ┃  ┣ 📂 config/                   # Fichiers de configuration
 ┃  ┣ 📂 data/                     # Gestion et chargement des données
 ┃  ┃  ┣ 📜 dataManager.js          # Gestion centralisée des données
 ┃  ┃  ┣ 📜 recipe.js               # Contient les recettes brutes
 ┃  ┃  ┗ 📜 templateManager.js      # Gestion des templates d'affichage
 ┃  ┣ 📂 events/                   # Gestion des événements utilisateur
 ┃  ┃  ┣ 📜 eventHandler.js         # Actions liées aux événements utilisateur
 ┃  ┃  ┗ 📜 eventListener.js        # Ajout des écouteurs d'événements
 ┃  ┣ 📂 utils/                    # Fonctions utilitaires globales
 ┃  ┃  ┣ 📜 accessibility.js        # Améliorations pour l'accessibilité
 ┃  ┃  ┣ 📜 normalize.js            # Nettoyage et normalisation des textes
 ┃  ┃  ┗ 📜 utils.js                # Fonctions d'aide diverses
 ┃  ┗ 📜 main.js                   # Point d'entrée JavaScript
 ┣ 📂 node_modules/               # Dépendances installées via npm (non inclus dans Git)
 ┣ 📂 scss/                       # Fichiers sources SCSS pour le style
 ┃  ┣ 📂 base/                     # Styles de base globaux
 ┃  ┣ 📂 components/               # Styles des composants UI
 ┃  ┃  ┣ 📜 _button.scss            # Styles des boutons
 ┃  ┃  ┣ 📜 _cards.scss             # Styles des cartes de recettes
 ┃  ┃  ┣ 📜 _filters.scss           # Styles des filtres avancés
 ┃  ┃  ┣ 📜 _footer.scss            # Styles du pied de page
 ┃  ┃  ┣ 📜 _grid.scss              # Styles de mise en page en grille
 ┃  ┃  ┣ 📜 _header.scss            # Styles du header
 ┃  ┃  ┗ 📜 _modal.scss             # Styles des modales
 ┣ 📜 .eslint.config.js           # Configuration ESLint
 ┣ 📜 .eslintrc.mjs               # Fichier ESLint (ancien format)
 ┣ 📜 .gitignore                  # Fichiers à exclure de Git
 ┣ 📜 .hintrc                     # Configuration pour HTMLHint
 ┣ 📜 .prettierrc                 # Configuration pour Prettier (formatage du code)
 ┣ 📜 convert-recipe-images.mjs   # Script de conversion d’images en WebP
 ┣ 📜 convertToWebP.sh            # Script Shell pour la conversion WebP
 ┣ 📜 index.html                  # Structure principale de l’application
 ┣ 📜 optimized_recipes.json      # Fichier contenant les recettes optimisées
 ┣ 📜 package.json                # Déclaration des dépendances npm
 ┣ 📜 README.md                   # Documentation principale du projet
```

---

## 🔍 Fonctionnement du Moteur de Recherche  

Le moteur de recherche repose sur un **algorithme optimisé** permettant :  

- **Une recherche en temps réel** avec **filtrage dynamique**.  
- **Un tri intelligent et une mise en cache** pour accélérer les performances.  
- **Une gestion optimisée des événements utilisateur** pour éviter les re-rendus inutiles.  

### 📊 **Optimisation des Performances**  

- **Debounce sur les entrées utilisateur** pour éviter les requêtes excessives.  
- **Manipulation DOM limitée** pour un rendu fluide.  
- **Lazy Loading des données** pour un chargement progressif et optimisé.  

---

## 📞 Contact  

💡 **Développeur** : [@trackozor](https://github.com/trackozor)  
📩 **Email** : [trackozor@gmail.com](mailto:trackozor@gmail.com)  
🌐 **Portfolio** : [trackozor.dev](https://trackozor.dev)  

⭐ **Si ce projet est utile, pensez à lui attribuer une étoile sur GitHub !** ⭐
