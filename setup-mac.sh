#!/bin/bash
# MindLife - Script d'installation pour Mac
# Usage: chmod +x setup-mac.sh && ./setup-mac.sh

echo "═══════════════════════════════════════════════════════"
echo "🚀 MindLife - Installation pour Mac"
echo "═══════════════════════════════════════════════════════"

# Vérifier que bun est installé
if ! command -v bun &> /dev/null; then
    echo "❌ Bun n'est pas installé!"
    echo "📦 Installation de bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null
fi

echo "✅ Bun détecté: $(bun --version)"
echo ""

# Créer le .env si inexistant
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    echo 'DATABASE_URL="file:./db/mindlife.db"' > .env
fi

# Créer le dossier db
mkdir -p db

# Installer les dépendances
echo "📦 Installation des dépendances..."
bun install

# Générer Prisma
echo "🔧 Génération du client Prisma..."
bunx prisma generate

# Créer la base de données
echo "🗄️ Création de la base de données..."
bunx prisma db push

# Peupler la base de données
echo "🌱 Peuplement de la base de données..."
bun run prisma/seed.ts

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Installation terminée!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "   bun run dev"
echo ""
echo "🌐 L'application sera accessible sur:"
echo "   http://localhost:3000"
echo ""
