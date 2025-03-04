# 🍽️ Les Petits Plats - Moteur de Recherche de Recettes

![Les Petits Plats](https://your-image-link.com) <!-- Remplace par un lien d’image si disponible -->

## 📌 Description du Projet  

**Les Petits Plats** est une application web avancée qui permet une **recherche ultra-rapide et interactive** de recettes de cuisine.  
Elle repose sur un **moteur de recherche optimisé en JavaScript Vanilla**, garantissant une **expérience utilisateur fluide et instantanée** sans nécessiter de **connexion à une API externe ni l'utilisation d'un framework**.  

### 🏆 **Caractéristiques et Innovations**  

- 🚀 **Performances maximisées** : Algorithme de recherche **100% en local**, optimisé pour traiter rapidement de grands ensembles de données.  
- 🔍 **Filtrage dynamique avancé** : Affinage des résultats en temps réel grâce à des critères spécifiques (**ingrédients, appareils, ustensiles**).  
- 💡 **Expérience utilisateur fluide** : Interface **réactive et sans latence**, avec une **mise à jour instantanée des résultats**.  
- 📡 **Zéro dépendance externe** : Fonctionnement **autonome et hors ligne**, idéal pour une **exécution rapide sur tous types de navigateurs**.  
- ⚡ **Architecture modulaire et scalable** : Organisation du code en **composants réutilisables**, facilitant la maintenance et l'extension du projet.  
- 📱 **Interface entièrement responsive** : Adaptée aux **mobiles, tablettes et écrans larges**, garantissant une navigation optimale sur tous les appareils.  

### 🔬 **Technologie et Optimisations**  

**Les Petits Plats** exploite des **optimisations algorithmiques avancées** pour offrir une **rapidité de recherche inégalée** :  

- **Détection instantanée des correspondances** via une normalisation et un prétraitement des données.  
- **Mise en cache intelligente** des résultats pour éviter les recalculs inutiles et améliorer la réactivité.  
- **Déclenchement optimisé des événements utilisateur** avec un **système de debounce**, évitant les requêtes excessives et améliorant la fluidité.  
- **Gestion fine du DOM** pour limiter les re-rendus et accélérer le chargement de l’interface.  

### 🏗 **Pourquoi ce projet ?**  

Dans un contexte où la rapidité et l'efficacité sont essentielles, **Les Petits Plats** offre une alternative aux moteurs de recherche classiques en **supprimant toute dépendance externe** et en **optimisant au maximum les performances**.  
Son objectif est de permettre aux passionnés de cuisine de **trouver instantanément la recette idéale**, sans latence, sur une interface intuitive et moderne.

---

### 🎯 Objectifs  

✅ **Moteur de recherche ultra-performant** : Algorithme optimisé permettant une **recherche instantanée** même sur un grand volume de recettes.  
✅ **Filtrage dynamique intelligent** : Affinage précis des résultats en **temps réel** via des **filtres interactifs avancés** (ingrédients, appareils, ustensiles).  
✅ **Expérience utilisateur immersive** : Interface **réactive, ergonomique et intuitive**, offrant une **navigation fluide et rapide**.  
✅ **Performance et optimisation** : Chargement rapide, gestion efficace du **DOM**, et **mise en cache des résultats** pour une navigation sans latence.  
✅ **Accessibilité et compatibilité** : Interface **100% responsive**, garantissant une expérience optimale sur **mobiles, tablettes et desktops**.  
✅ **Zéro dépendance externe** : Moteur de recherche **entièrement autonome**, sans appel API ni framework, pour une **exécution ultra-rapide en local**.  

---

## ⚙️ Technologies Utilisées  

| Technologie | Usage & Avantages |
|------------|----------------------------------------------|
| **JavaScript (ES6+)** | Moteur de recherche performant, manipulation DOM optimisée, gestion avancée des événements. |
| **HTML5 / CSS3** | Structure sémantique et responsive, optimisée pour le SEO et la compatibilité multi-navigateurs. |
| **SCSS** | Préprocesseur CSS permettant une meilleure modularité et une gestion efficace des styles. |
| **Node.js (Dev Only)** | Utilisé pour la gestion des dépendances (`npm`), le développement en local |
| **ESLint & Prettier** | Outils de linting et formatage pour garantir un code propre, maintenable et homogène. |
| **Git & GitHub** | Versioning du projet, collaboration avec les Pull Requests et gestion des versions. |
| **Nodemon** | Surveillance automatique des fichiers SCSS pour un développement plus rapide et efficace. |
| **Chart.js** | Intégration de graphiques interactifs pour l'analyse des performances du moteur de recherche. |

---

## 📂 Architecture du Projet

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

## 📦 Installation & Lancement

### 🔧 1️⃣ Cloner le projet

```sh
git clone https://github.com/trackozor/p7.git
cd p7
```

### 🔧 2️⃣ Installer les dépendances

```sh
npm install
```

### 🔧 3️⃣ Lancer le projet en local

```sh
npm start
```

💡 **Remarque :** L’application est **statique** et fonctionne directement dans un navigateur.

---

## 🏗️ Fonctionnement du Moteur de Recherche

L’algorithme de recherche est conçu pour être **rapide et efficace**, tout en évitant les ralentissements.

### 🔍 **Étapes du filtrage**

1. **Recherche principale** : Recherche textuelle parmi les recettes disponibles.
2. **Filtrage avancé** : Sélection dynamique par **ingrédients, appareils et ustensiles**.
3. **Optimisation** : Suppression des doublons, tri intelligent et mise en cache des résultats.

### 🚀 **Optimisation des Performances**

- **Debounce sur les entrées utilisateur** pour éviter les requêtes inutiles.
- **Tri et filtrage progressifs** pour améliorer la rapidité.
- **Utilisation du DOM minimaliste** pour améliorer la fluidité.

---

## 🎨 UI & Expérience Utilisateur

✅ **Design épuré et ergonomique** pour une navigation intuitive.  
✅ **Interface responsive** adaptée aux **mobiles, tablettes et desktops**.  
✅ **Effets visuels fluides** pour une meilleure expérience utilisateur.  

---

## 🖼️ Optimisation des Images

Le projet inclut une **optimisation automatique des images** en **WebP**, permettant **un temps de chargement réduit et un affichage plus rapide**.

📌 **Pourquoi WebP ?**

- 🏎️ **Performance accrue** grâce à une compression optimisée.
- 📉 **Taille des fichiers réduite** sans perte de qualité.
- 🚀 **Meilleur SEO et affichage plus fluide**.

---

## 🛠️ Bonnes Pratiques de Développement

| Outil / Méthode | Explication |
|----------------|----------------------------------|
| **ESLint** | Analyse et correction des erreurs JS |
| **Prettier** | Formatage automatique du code |
| **Modularité MVC** | Organisation en **Models / Views / Controllers** |
| **GitHub Issues** | Suivi des tâches et amélioration continue |

---

## ❓ FAQ

### 🔹 Pourquoi ce projet ?

L’objectif est de démontrer la **gestion avancée des filtres et la recherche optimisée** en **JavaScript Vanilla**, sans framework.

### 🔹 Comment ajouter de nouvelles recettes ?

Ajoutez simplement une nouvelle entrée dans `optimized_recipes.json` en respectant le format JSON existant.

### 🔹 Pourquoi ne pas utiliser React ou Vue.js ?

Le projet est conçu pour **explorer les performances en JavaScript natif**, sans dépendances externes.

---

## 🤝 Contribuer au Projet

Les contributions sont **les bienvenues** ! 🚀

### 🔧 Étapes pour contribuer

1️⃣ **Forker le projet** 🍴  
2️⃣ **Créer une branche** (`feature/ajout-fonctionnalité`)  
3️⃣ **Faire les modifications nécessaires** 🔨  
4️⃣ **Créer une Pull Request** 📌  

Merci pour votre aide et vos suggestions ! 😊  

---

## 📜 Licence

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser et de le modifier.

---

## 📞 Contact & Liens Utiles

💡 **Développeur** : [@trackozor](https://github.com/trackozor)  
📩 **Email** : [trackozor@gmail.com](mailto:trackozor@gmail.com)  
🌐 **Portfolio** : [trackozor.dev](https://trackozor.dev)  

---

### ⭐ **Si ce projet vous a été utile, n'oubliez pas de le "report" sur GitHub !** ⭐
