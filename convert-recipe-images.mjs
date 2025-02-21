import fs from "fs";

// Chemin du fichier contenant les recettes
const filePath = "./recipe1.js";

// Lire le fichier `recipe1.js`
fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
        console.error(" Erreur lors de la lecture du fichier :", err);
        return;
    }

    // Remplace toutes les occurrences de `.jpg` ou `.png` par `.webp`
    const updatedData = data.replace(/\.(jpg|png)/g, ".webp");

    // Écrit le nouveau contenu dans le fichier `recipe1.js`
    fs.writeFile(filePath, updatedData, "utf8", (err) => {
        if (err) {
            console.error("Erreur lors de l'écriture du fichier :", err);
        } else {
            console.log("✅ Mise à jour réussie : toutes les images sont passées en WebP !");
        }
    });
});
