# MindLife V12 - Installation sur Mac

## 🦞 Application qui grandit avec vous

MindLife est une application de gestion de vie personnelle qui **apprend et évolue** avec vous. Elle fonctionne **SANS LLM obligatoire** grâce à un système de patterns intelligent.

---

## 📋 Prérequis

- **macOS** 10.15 ou supérieur
- **Bun** (recommandé) ou Node.js 18+

### Installer Bun sur Mac

```bash
curl -fsSL https://bun.sh/install | bash
```

Redémarrez votre terminal après l'installation.

---

## 🚀 Installation Rapide

### 1. Décompresser le ZIP

```bash
unzip MindLife_V12.zip
cd mindlife
```

### 2. Installer les dépendances

```bash
bun install
```

### 3. Configurer la base de données

```bash
bun run setup
```

Cette commande:
- Génère le client Prisma
- Crée la base de données SQLite
- Ajoute les données de démo

### 4. Démarrer l'application

```bash
bun run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 📁 Structure du Projet

```
mindlife/
├── convex/                 # Schema Convex (optionnel)
│   ├── schema.ts          # Définition des tables
│   ├── agents.ts          # Fonctions agents
│   └── rag.ts             # Fonctions RAG
├── prisma/
│   ├── schema.prisma      # Modèles SQLite (33 modèles)
│   ├── seed.ts            # Données de démo
│   └── db/                # Base de données
├── src/
│   ├── app/
│   │   ├── api/           # 40+ routes API
│   │   └── page.tsx       # Page principale
│   ├── components/        # Composants React
│   │   ├── ui/           # shadcn/ui components
│   │   ├── nutrition/    # Page nutrition
│   │   ├── sport/        # Page sport
│   │   ├── spirit/       # Page spirituelle
│   │   ├── settings/     # Paramètres
│   │   └── ...
│   └── lib/
│       ├── patterns/      # Système de patterns SANS LLM
│       ├── convex/        # Service de synchronisation
│       └── stores/        # États Zustand
└── package.json
```

---

## 🧠 Système de Patterns (SANS LLM)

MindLife inclut un système intelligent qui fonctionne **sans API externe**:

### 5 Personas disponibles

| Persona | Description | Exemples de triggers |
|---------|-------------|---------------------|
| **Assistant** | Aide générale | "bonjour", "aide", "tâche" |
| **Coach** | Sport & fitness | "motivation", "entraînement" |
| **Nutrition** | Conseils alimentaires | "recette", "protéine" |
| **Productivité** | Organisation | "procrastination", "temps" |
| **Bien-être** | Santé mentale | "stress", "dormir" |

### Comment ça marche

1. L'utilisateur envoie un message
2. Le système cherche un pattern correspondant
3. Si trouvé → Réponse du pattern
4. Sinon → Fallback intelligent
5. L'utilisateur peut noter la réponse
6. Les bonnes réponses sont apprises pour l'utilisateur

---

## 🔄 Convex (Optionnel - Temps Réel)

Pour activer les fonctionnalités temps réel:

### 1. Créer un compte Convex

Allez sur https://convex.dev et créez un projet.

### 2. Ajouter l'URL dans `.env`

```env
CONVEX_URL=https://votre-projet.convex.cloud
```

### 3. Déployer le schema

```bash
npx convex dev
```

### Fonctionnalités Convex

- **Temps réel** : Mises à jour instantanées
- **RAG** : Recherche contextuelle de recettes
- **Agents** : Communication entre agents
- **Notifications** : Push temps réel

**Note**: L'application fonctionne parfaitement SANS Convex en mode local.

---

## 🧪 APIs Disponibles

### APIs Principales

| Endpoint | Description |
|----------|-------------|
| `GET /api/tasks` | Liste des tâches |
| `GET /api/goals` | Liste des objectifs |
| `GET /api/events` | Liste des événements |
| `GET /api/habits` | Liste des habitudes |
| `GET /api/notes` | Liste des notes |
| `GET /api/journal` | Entrées journal |

### APIs Spéciales

| Endpoint | Description |
|----------|-------------|
| `POST /api/ai-agent` | Chat avec les personas SANS LLM |
| `POST /api/scraper` | Scraper des recettes |
| `GET /api/convex?action=status` | Statut Convex |
| `POST /api/convex` | Synchronisation Convex |

### Exemple: Chat avec l'assistant

```bash
curl -X POST http://localhost:3000/api/ai-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "bonjour", "persona": "assistant"}'
```

---

## 📊 Données de Démo

L'application inclut des données de test:

- **Utilisateur**: NICO 🦞
- **Catégories**: 10 (Travail, Personnel, Santé, etc.)
- **Objectifs**: 5 exemples
- **Tâches**: 7 exemples
- **Événements**: 5 exemples
- **Habitudes**: 4 exemples
- **Notes**: 3 exemples
- **Journal**: 2 entrées

---

## ⚙️ Scripts Disponibles

```bash
bun run dev        # Démarrer le serveur de développement
bun run build      # Build de production
bun run start      # Démarrer en production
bun run lint       # Vérifier le code
bun run setup      # Setup complet (install + db + seed)
bun run seed       # Ajouter les données de démo
bun run db:push    # Mettre à jour la base de données
```

---

## 🐛 Dépannage

### Erreur de base de données

```bash
rm -rf prisma/db
bun run setup
```

### Erreur de dépendances

```bash
rm -rf node_modules bun.lock
bun install
```

### Port 3000 déjà utilisé

```bash
lsof -i :3000
kill -9 <PID>
```

---

## 📞 Support

En cas de problème, consultez:
- `worklog.md` - Historique des développements
- `dev.log` - Logs du serveur

---

## 🎉 Bonne utilisation !

**MindLife V12** - L'application qui grandit avec vous 🦞

BIZ FREROT !
