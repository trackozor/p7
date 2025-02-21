#!/bin/bash

# Définition du chemin vers cwebp
CWEBP_PATH="C:/webp/bin/cwebp.exe"

# Dossiers contenant les images à convertir
INPUT_DIRS=("assets/" "assets/icons" "assets/images")
OUTPUT_SUBDIR="webp"

# Vérifie si cwebp existe
if [[ ! -f "$CWEBP_PATH" ]]; then
    echo "❌ ERREUR : cwebp non trouvé à $CWEBP_PATH"
    exit 1
fi

# Boucle sur chaque dossier source
for BASE_DIR in "${INPUT_DIRS[@]}"; do
    if [[ -d "$BASE_DIR" ]]; then
        # Trouver tous les sous-dossiers récursivement
        find "$BASE_DIR" -type d | while read SUB_DIR; do
            OUTPUT_DIR="$SUB_DIR/$OUTPUT_SUBDIR"
            mkdir -p "$OUTPUT_DIR"

            # Convertir chaque image JPG/PNG du sous-dossier
            find "$SUB_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" \) | while read file; do
                filename=$(basename -- "$file")
                filename_no_ext="${filename%.*}"
                output_file="$OUTPUT_DIR/$filename_no_ext.webp"

                # Exécute cwebp avec son chemin absolu
                "$CWEBP_PATH" -q 80 "$file" -o "$output_file"
                echo "✅ Converti : $file → $output_file"
            done
        done

        echo "📂 Conversion terminée pour : $BASE_DIR"
    else
        echo "⚠️ Dossier introuvable : $BASE_DIR"
    fi
done

echo "🎯 Toutes les conversions sont terminées !"
