# MindLife - Version Mac

Application de gestion de vie personnelle.

## Installation rapide

```bash
# 1. Aller dans le dossier
cd mindlife

# 2. Lancer l'installation
chmod +x setup-mac.sh && ./setup-mac.sh

# OU manuellement:
bun install && bun run setup

# 3. Démarrer l'application
bun run dev
```

## URL

L'application démarre sur: **http://localhost:3000**

## Structure

- `src/app/page.tsx` - Page principale
- `src/components/` - Composants React
- `prisma/schema.prisma` - Modèles de données
- `db/mindlife.db` - Base de données SQLite

## Données de démonstration

Le script de seed crée automatiquement:
- 1 utilisateur (NICO 🦞)
- 10 catégories
- 5 objectifs avec étapes
- 7 tâches
- 5 événements calendrier
- 4 habitudes
- 3 notes
- 2 entrées journal
- 25+ patterns IA

## Technologies

- Next.js 16 + TypeScript
- SQLite + Prisma
- Tailwind CSS + shadcn/ui
- Socket.IO (temps réel)
- Zustand (state)

---

BIZ FREROT ! 🦞
