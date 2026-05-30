#!/bin/bash
# ============================================================
# MindLife V1.1 - Script d'Installation
# ============================================================
# Usage: ./setup.sh
# Nécessite: Bun (https://bun.sh)
# ============================================================

set -e

echo "═══════════════════════════════════════════════════════"
echo "🦞 MINDLIFE V1.1 - Installation"
echo "═══════════════════════════════════════════════════════"

# Vérifier que Bun est installé
if ! command -v bun &> /dev/null; then
    echo "❌ Bun n'est pas installé!"
    echo "   Installez Bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun détecté: $(bun --version)"
echo ""

# 1. Désactiver les variables d'environnement existantes
unset DATABASE_URL

# 2. Créer le fichier .env si nécessaire
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "✅ Fichier .env créé"
else
    echo "✅ Fichier .env déjà présent"
fi

# 3. Afficher le contenu de .env pour vérification
echo ""
echo "📋 Configuration .env:"
cat .env
echo ""

# 4. Créer le dossier db si nécessaire
if [ ! -d db ]; then
    echo "📁 Création du dossier db..."
    mkdir -p db
fi

# 5. Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
bun install

# 6. Générer le client Prisma
echo ""
echo "⚙️  Génération du client Prisma..."
bunx prisma generate

# 7. Créer la base de données
echo ""
echo "🗄️  Création de la base de données..."
bunx prisma db push

# 8. Peupler la base de données
echo ""
echo "🌱 Peuplement de la base de données..."
bun run prisma/seed.ts

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ INSTALLATION TERMINÉE!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "   bun run dev"
echo ""
echo "🌐 Ouvrez ensuite: http://localhost:3000"
echo ""
echo "═══════════════════════════════════════════════════════"
