# MindLife V6 - Installation

## Prérequis
- Node.js 18+ ou Bun
- npm ou bun

## Installation rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer et peupler la base de données
npm run setup

# 3. Lancer l'application
npm run dev
```

## Détails des commandes

### `npm install`
Installe toutes les dépendances du projet principal et du mini-service socket.

### `npm run setup`
- Crée le fichier `.env` si nécessaire
- Génère le client Prisma
- Crée la base de données SQLite
- Peuple la base avec des données de démonstration

### `npm run dev`
Lance le serveur de développement sur http://localhost:3000

## Structure
- `/src` - Code source Next.js
- `/prisma` - Schéma et seed de la base de données
- `/mini-services/socket-server` - Serveur WebSocket pour le temps réel
- `/public` - Assets statiques

## Fonctionnalités
- Dashboard avec statistiques
- Gestion des tâches et objectifs
- Calendrier
- Suivi nutritionnel
- Programmes sport
- Gestion financière
- Développement personnel (Croissance)
- Page Esprit (méditation, fréquences)
- Assistant IA intégré

## Ports
- 3000: Application principale
- 3003: Serveur Socket.IO (automatique)

---
MindLife V6 - Application de gestion de vie personnelle
