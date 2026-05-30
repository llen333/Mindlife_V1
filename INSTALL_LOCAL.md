# 🏠 Guide d'Installation Locale - MindLife

## 📋 Table des matières

1. [Pourquoi installer en local ?](#pourquoi-installer-en-local-)
2. [Prérequis](#prérequis)
3. [Installation rapide](#installation-rapide)
4. [Installation manuelle](#installation-manuelle)
5. [Configuration](#configuration)
6. [Fonctionnalités](#fonctionnalités)
7. [Commandes utiles](#commandes-utiles)
8. [Dépannage](#dépannage)

---

## Pourquoi installer en local ?

| Avantage | Description |
|----------|-------------|
| ✅ Données persistantes | Plus de perte quotidienne |
| ✅ Mode hors-ligne | Fonctionne sans internet (fallbacks locaux) |
| ✅ Confidentialité | Vos données restent sur votre machine |
| ✅ Performance | Pas de latence réseau |
| ✅ Personnalisation | Modifiez l'app à votre guise |

---

## Prérequis

### 1. Bun (gestionnaire de paquets)

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Vérifier l'installation
bun --version
```

### 2. Git (optionnel, pour versionner)

```bash
git --version
```

---

## Installation rapide

```bash
# 1. Naviguer vers le dossier du projet
cd /chemin/vers/mindlife

# 2. Lancer l'installation automatique
bun run setup

# 3. Démarrer l'application
bun run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## Installation manuelle

### Étape 1: Installer les dépendances

```bash
bun install
```

### Étape 2: Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer si nécessaire
nano .env
```

### Étape 3: Initialiser la base de données

```bash
# Générer le client Prisma
bun run db:generate

# Créer la base de données
bun run db:push

# Peupler avec les données initiales
bun run seed:complete
```

### Étape 4: Démarrer

```bash
bun run dev
```

---

## Configuration

### Mode local (par défaut)

L'application fonctionne en mode local sans clés API :

| Fonctionnalité | Mode local | Description |
|----------------|------------|-------------|
| 🤖 Chat/AI | ✅ Fallback intelligent | Réponses contextuelles locales |
| 🍽️ Nutrition | ✅ Recettes locales | Base de recettes intégrée |
| 🏋️ Sport | ✅ Programmes locaux | Programmes d'entraînement prédéfinis |
| 🔊 TTS | ⚠️ Web Speech API | Synthèse vocale du navigateur |
| 🎤 ASR | ⚠️ Web Speech API | Reconnaissance vocale du navigateur |
| 🔍 Recherche web | ❌ Non disponible | Nécessite une clé API |

### Activer les fonctionnalités AI avancées

Pour utiliser de vraies réponses IA, ajoutez une clé API dans `.env` :

```env
# Option 1: Groq (rapide et gratuit)
GROQ_API_KEY=gsk_votre-cle-ici
AI_PROVIDER=groq

# Option 2: OpenAI
OPENAI_API_KEY=sk-votre-cle-ici
AI_PROVIDER=openai

# Option 3: OpenRouter (multi-modèles)
OPENROUTER_API_KEY=sk-or-votre-cle-ici
AI_PROVIDER=openrouter
```

#### Obtenir une clé API gratuite

| Provider | URL | Avantages |
|----------|-----|-----------|
| Groq | https://console.groq.com | Gratuit, très rapide |
| OpenRouter | https://openrouter.ai | Multi-modèles |
| HuggingFace | https://huggingface.co | Gratuit, limité |

---

## Fonctionnalités

### 📊 Dashboard
- Vue d'ensemble des activités
- Statistiques et graphiques
- Raccourcis rapides

### 📋 Tâches
- Gestion des tâches avec catégories
- Priorités et dates d'échéance
- Suivi de progression

### 📅 Calendrier
- Événements et rendez-vous
- Vue mensuelle/hebdomadaire
- Synchronisation avec les tâches

### 🍽️ Nutrition
- Génération de repas (fallback local)
- Profils nutritionnels
- Calories et macros

### 🏋️ Sport
- Programmes d'entraînement
- Suivi des séances
- Objectifs sportifs

### ✨ Spirit
- 3 archétypes : Psychologue, Ami, Stoïcien
- Conversations sauvegardées
- Fallback intelligent

### 🎤 Notes vocales
- Enregistrement audio
- Transcription (nécessite API ou Web Speech)
- Catégorisation

---

## Commandes utiles

```bash
# Développement
bun run dev              # Démarrer en développement
bun run build            # Build de production
bun run lint             # Vérifier le code

# Base de données
bun run db:push          # Mettre à jour le schéma
bun run db:generate      # Régénérer Prisma
bun run db:backup        # Sauvegarder la DB
bun run db:restore       # Restaurer la DB
bun run seed:complete    # Reseed complet

# Sauvegardes
bun run dev:backup       # Sauvegarder en JSON
bun run dev:restore      # Restaurer depuis JSON
bun run dev:status       # Voir le statut
```

---

## Dépannage

### L'application ne démarre pas

```bash
# Réinstaller les dépendances
rm -rf node_modules bun.lock
bun install

# Régénérer Prisma
bun run db:generate
bun run db:push
```

### Base de données corrompue

```bash
# Restaurer depuis le backup
bun run db:restore

# Ou resseed
bun run seed:complete
```

### Erreur "Prisma Client could not be found"

```bash
bun run db:generate
```

### Le mode AI ne fonctionne pas

1. Vérifiez que vous avez une clé API dans `.env`
2. Vérifiez que `AI_PROVIDER` correspond à votre clé
3. Redémarrez l'application

### TTS/ASR ne fonctionne pas

En mode local, TTS et ASR utilisent Web Speech API :
- Fonctionne dans Chrome, Edge, Safari
- Nécessite HTTPS en production
- Peut nécessiter des permissions navigateur

---

## 📁 Structure du projet

```
mindlife/
├── db/
│   └── custom.db          # Base SQLite
├── backups/               # Backups automatiques
├── public/
│   └── images/            # Images statiques
├── src/
│   ├── app/
│   │   ├── api/           # Routes API
│   │   └── page.tsx       # Page principale
│   ├── components/        # Composants React
│   └── lib/
│       ├── ai-fallback.ts # Fallbacks AI
│       ├── nutrition-fallback.ts
│       └── sport-fallback.ts
├── scripts/               # Scripts utilitaires
├── .env                   # Configuration
└── package.json
```

---

## 🔐 Sécurité

- Les données sont stockées localement dans SQLite
- Aucune donnée n'est envoyée à des serveurs externes (sauf si vous configurez une API)
- Les clés API sont stockées dans `.env` (ne pas commit)

---

## 📞 Support

En cas de problème :
1. Consultez ce guide
2. Vérifiez les logs avec `cat dev.log`
3. Essayez les commandes de dépannage

---

*Dernière mise à jour : Mars 2026*
