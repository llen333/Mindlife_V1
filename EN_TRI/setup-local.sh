#!/bin/bash

# MindLife - Setup Local Installation
# Auteur: NICO 🦞 + Z.ai Frérot

echo "🦞 MindLife - Installation locale"
echo "=================================="

# Vérifier que Bun est installé
if ! command -v bun &> /dev/null; then
    echo "❌ Bun n'est pas installé."
    echo "Installez-le avec: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun détecté: $(bun --version)"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
bun install

# Configurer l'environnement
echo ""
echo "⚙️ Configuration de l'environnement..."
if [ ! -f .env ]; then
    echo "DATABASE_URL=\"file:./prisma/db/custom.db\"" > .env
    echo "✅ Fichier .env créé"
else
    echo "✅ Fichier .env existant"
fi

# Initialiser la base de données
echo ""
echo "🗄️ Initialisation de la base de données..."
bun run db:push

# Générer le client Prisma
echo ""
echo "🔧 Génération du client Prisma..."
bunx prisma generate

# Lancer le seed si nécessaire
echo ""
echo "🌱 Vérification des données..."
bun run prisma/seed.ts

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🚀 Pour démarrer MindLife:"
echo "   bun run dev"
echo ""
echo "📍 L'application sera disponible sur: http://localhost:3000"
echo ""
echo "🦞 BIZ BIZ BIZ ! 💚"
