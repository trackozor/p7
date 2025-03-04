# 🍽️ Les Petits Plats - Moteur de Recherche de Recettes

![Les Petits Plats](https://your-image-link.com) <!-- Remplace par un lien d’image si disponible -->

## 📌 Description du Projet

**Les Petits Plats** est une application web permettant une recherche **rapide et interactive** de recettes.  
L’objectif est de fournir une **expérience utilisateur fluide**, en utilisant un **moteur de recherche performant** qui fonctionne **sans API externe ni framework**.

### 🎯 Objectifs :
- **Recherche dynamique et instantanée** des recettes.
- **Filtres interactifs avancés** sur **ingrédients, appareils et ustensiles**.
- **Optimisation des performances** avec un moteur de recherche optimisé.
- **Expérience utilisateur responsive et ergonomique**.

### 🚀 Fonctionnalités principales :
✅ **Moteur de recherche avancé** : Affichage instantané des résultats.  
✅ **Filtres interactifs** : Ingrédients, appareils, ustensiles.  
✅ **Interface moderne et responsive** : Adaptée à tous les écrans.  
✅ **Gestion des erreurs et logs détaillés**.  
✅ **Performance optimisée** : Algorithmes garantissant une navigation fluide.  

---

## ⚙️ Technologies Utilisées

| Technologie | Usage |
|------------|----------------------------------|
| **JavaScript (ES6+)** | Manipulation DOM et gestion des événements |
| **HTML5 / CSS3** | Structure et mise en page |
| **SCSS** | Organisation avancée des styles |
| **Node.js (dev only)** | Gestion des dépendances et outils de développement |
| **Git & GitHub** | Versioning et collaboration |

---

## 📂 Architecture du Projet

```plaintext
📦 Les-Petits-Plats/
 ┣ 📂 assets/                # Images et ressources graphiques
 ┣ 📂 css/                   # Styles CSS
 ┣ 📂 js/                    # Code JavaScript
 ┃ ┣ 📂 components/          # Composants réutilisables
 ┃ ┃ ┣ 📂 factory/           # Génération dynamique des éléments UI
 ┃ ┃ ┣ 📂 search/            # Modules liés à la recherche
 ┃ ┃ ┣ 📜 filterManager.js   # Gestion et affichage des filtres
 ┃ ┃ ┣ 📜 searchManager.js   # Moteur de recherche
 ┃ ┣ 📂 config/              # Paramètres et configurations globales
 ┃ ┣ 📂 data/                # Données des recettes
 ┃ ┣ 📂 events/              # Gestion des événements utilisateur
 ┃ ┣ 📂 utils/               # Fonctions utilitaires
 ┃ ┗ 📜 main.js              # Point d'entrée principal
 ┣ 📂 scss/                  # Styles SCSS
 ┣ 📜 index.html             # Page principale du projet
 ┣ 📜 optimized_recipes.json # Données des recettes optimisées
 ┣ 📜 package.json           # Fichier de configuration npm
 ┣ 📜 .eslintrc.mjs          # Configuration ESLint
 ┣ 📜 .prettierrc            # Configuration Prettier
 ┗ 📜 README.md              # Documentation du projet
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

### 🔧 Étapes pour contribuer :
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

### ⭐ **Si ce projet vous a été utile, n'oubliez pas de le "starrer" sur GitHub !** ⭐
