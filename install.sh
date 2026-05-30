#!/bin/bash

# ============================================
# MINDLIFE V14 - Installation Mac Intel
# ============================================

echo "🦞 MINDLIFE V14 - Installation"
echo "==============================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Étape 1: Vérifier Bun
echo -e "${YELLOW}[1/4] Vérification de Bun...${NC}"
if ! command -v bun &> /dev/null; then
    echo "❌ Bun n'est pas installé."
    echo "Installe-le avec: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi
echo -e "${GREEN}✓ Bun installé${NC}"

# Étape 2: Installer les dépendances
echo ""
echo -e "${YELLOW}[2/4] Installation des dépendances...${NC}"
bun install
echo -e "${GREEN}✓ Dépendances installées${NC}"

# Étape 3: Setup base de données
echo ""
echo -e "${YELLOW}[3/4] Configuration de la base de données...${NC}"
mkdir -p db
bunx prisma generate
bunx prisma db push
echo -e "${GREEN}✓ Base de données créée${NC}"

# Étape 4: Seed des données
echo ""
echo -e "${YELLOW}[4/4] Import des données initiales...${NC}"
bun run prisma/seed.ts
echo -e "${GREEN}✓ Données importées${NC}"

echo ""
echo "================================"
echo -e "${GREEN}✅ INSTALLATION TERMINÉE !${NC}"
echo "================================"
echo ""
echo "Pour lancer MindLife :"
echo "  bun run dev"
echo ""
echo "Puis ouvre http://localhost:3000"
echo ""
echo "Pour activer Convex Local (optionnel) :"
echo "  npx convex dev --local"
echo ""
echo "🦞 BIZ FREROT !"
