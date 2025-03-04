# 🍽️ Les Petits Plats - Moteur de Recherche de Recettes

![Les Petits Plats](https://your-image-link.com) <!-- Remplace par un lien d’image si disponible -->

## 📌 Description du Projet

**Les Petits Plats** est une application web permettant une recherche dynamique et optimisée de recettes.  
Ce projet met l’accent sur la **performance**, la **fluidité** et une **expérience utilisateur avancée** grâce à un **moteur de recherche interne sans API externe ni framework**.

### 🎯 Objectifs

- Fournir une **recherche ultra-rapide et interactive**.
- Mettre en place des **filtres avancés** sur les ingrédients, appareils et ustensiles.
- Garantir une **optimisation des performances** avec des algorithmes efficaces.

### 🚀 Fonctionnalités principales

✅ **Recherche dynamique** : Affichage instantané des recettes filtrées.  
✅ **Filtres avancés** : Sélection par **ingrédients, appareils, ustensiles**.  
✅ **Interface fluide et responsive** : Design optimisé pour tous les écrans.  
✅ **Gestion des erreurs** : Logs détaillés pour un debug efficace.  
✅ **Optimisation des performances** : Algorithmes optimisés pour un temps de réponse minimal.  

---

## ⚙️ Technologies Utilisées

| Technologie | Usage |
|------------|----------------------------------|
| **JavaScript (ES6+)** | Manipulation DOM, gestion des événements |
| **HTML5 / CSS3** | Structure et mise en page |
| **SCSS** | Organisation avancée des styles |
| **Node.js (dev only)** | Gestion des dépendances, serveur local |
| **JSBench (optionnel)** | Benchmark des performances |

---

## 📂 Architecture du Projet

```plaintext
📦 Les-Petits-Plats/
 ┣ 📂 assets/                # Ressources graphiques et styles
 ┣ 📂 css/                   # Fichiers CSS
 ┣ 📂 js/                    # Scripts JavaScript
 ┃ ┣ 📂 components/          # Composants réutilisables
 ┃ ┃ ┣ 📂 factory/           # Factories pour générer les éléments
 ┃ ┃ ┣ 📂 search/            # Modules liés à la recherche
 ┃ ┃ ┣ 📜 filterManager.js   # Gestion et affichage des filtres
 ┃ ┃ ┣ 📜 searchManager.js   # Moteur de recherche
 ┃ ┣ 📂 config/              # Paramètres et configuration
 ┃ ┣ 📂 data/                # Données des recettes
 ┃ ┣ 📂 events/              # Gestion des événements utilisateur
 ┃ ┣ 📂 utils/               # Fonctions utilitaires (formatage, logs, etc.)
 ┃ ┗ 📜 main.js              # Point d'entrée principal
 ┣ 📂 scss/                  # Styles SCSS
 ┣ 📜 index.html             # Structure principale de l'application
 ┣ 📜 optimized_recipes.json # Données optimisées des recettes
 ┣ 📜 package.json           # Gestion des dépendances npm
 ┣ 📜 .eslintrc.mjs          # Configuration ESLint
 ┣ 📜 .prettierrc            # Configuration Prettier
 ┗ 📜 README.md              # Documentation du projet
 ```

## 📦 Installation & Lancement  

🔧 1️⃣ Cloner le projet  

```sh
git clone https://github.com/trackozor/p7.git
cd p7
```

## 🔧 2️⃣ Installer les dépendances

sh
Copier
npm install
🔧 3️⃣ Lancer le projet en local

sh
Copier
npm start

### 💡 Remarque : L’application est statique et fonctionne directement dans le navigateur

## 🏗️ Fonctionnement du Moteur de Recherche

L’algorithme de recherche est conçu pour être performant et précis, avec une approche optimisée pour éviter les ralentissements.

## 🔍 Étapes du filtrage

Filtrage principal : Recherche textuelle dans les recettes disponibles.
Filtrage avancé : Tri dynamique par ingrédients, appareils et ustensiles.
Optimisation : Suppression des doublons, tri intelligent et mise en cache des résultats.

## 🚀 Optimisation des Performances

Debounce sur les entrées utilisateur pour éviter les requêtes inutiles.
Tri et filtrage progressifs pour améliorer la rapidité.
Utilisation du DOM minimaliste pour un rendu plus fluide.

## 🎨 UI & Expérience Utilisateur

✅ Design épuré et ergonomique pour une navigation intuitive.
✅ Interface entièrement responsive adaptée aux mobiles, tablettes et desktops.
✅ Effets visuels fluides pour améliorer l’expérience utilisateur.

## 🖼️ Optimisation des Images

Le projet intègre une optimisation automatique des images en WebP afin d’améliorer les performances.

### 📌 Pourquoi WebP ?

  🏎️ Temps de chargement réduit grâce à un format optimisé.
  📉 Compression avancée sans perte significative de qualité.
  🚀 Amélioration des performances et du SEO.

🛠️ Bonnes Pratiques de Développement

Outil / Méthode Explication
ESLint Analyse et correction du code JS
Prettier Formatage automatique du code
Modularité MVC Organisation en Models / Views / Controllers
GitHub Issues Suivi des tâches et gestion des améliorations
❓ FAQ
🔹 Pourquoi ce projet ?
L’objectif est de démontrer la gestion avancée des filtres et la recherche optimisée en JavaScript Vanilla, sans framework.

🔹 Comment ajouter de nouvelles recettes ?
Ajoutez simplement une nouvelle entrée dans recipe.js au format JSON.

🔹 Pourquoi ne pas utiliser React ou Vue.js ?
Le projet est conçu pour explorer les performances en JS Vanilla, sans dépendances externes.

🤝 Contribuer au Projet
Les contributions sont les bienvenues ! 🚀

🔧 Étapes pour contribuer :
1️⃣ Forker le projet 🍴
2️⃣ Créer une branche (feature/ajout-fonctionnalité)
3️⃣ Faire les modifications nécessaires 🔨
4️⃣ Créer une Pull Request 📌

Merci pour votre aide et vos suggestions ! 😊

📜 Licence
Ce projet est sous licence MIT. Vous êtes libre de l'utiliser et de le modifier.

📞 Contact & Liens Utiles

💡 Développeur : @trackozor
📩 Email : <trackozor@gmail.com>
🌐 Portfolio : trackozor.dev

⭐ Si ce projet vous a été utile, n'oubliez pas de le "report" sur GitHub ! ⭐

## ✅ Pourquoi ce README est ultra-optimisé ?

1️⃣ Présentation claire et professionnelle avec des sections bien définies.
2️⃣ Explication technique approfondie (architecture, algorithme, UI, optimisation).
3️⃣ Installation et utilisation détaillées avec des commandes précises.
4️⃣ Optimisation des performances et bonnes pratiques mises en avant.
5️⃣ Appel à contribution et contact bien intégrés.
