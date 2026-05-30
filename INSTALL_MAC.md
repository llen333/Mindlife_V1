# 🦞 MindLife - Guide d'Installation Local (Mac)

## 📋 PRÉREQUIS

1. **Bun** (gestionnaire de paquets)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc  # ou ~/.zshrc
   ```

2. **Git** (pour cloner le projet)

---

## 🚀 INSTALLATION

### Étape 1: Décompresser le ZIP

```bash
unzip MindLife-Learning-Edition.zip
cd mindlife
```

### Étape 2: Configurer l'environnement

```bash
# Créer le fichier .env
echo 'DATABASE_URL="file:./prisma/db/custom.db"' > .env
```

### Étape 3: Installer les dépendances

```bash
bun install
```

### Étape 4: Initialiser la base de données

```bash
# Créer les tables
bun run db:push

# Seed les patterns et recettes
bun scripts/seed-learning.ts
```

### Étape 5: Démarrer l'application

```bash
bun run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 🎭 FONCTIONNALITÉS

### Système de Personas (SANS LLM)

L'application inclut 5 personas qui fonctionnent **sans appel LLM**:

| Persona | Description | Exemples de déclencheurs |
|---------|-------------|--------------------------|
| **Assistant** | Aide générale | "bonjour", "aide", "merci" |
| **Coach Sport** | Entraînements | "fatigué", "motivation", "muscle" |
| **Nutrition** | Conseils alimentaires | "recette", "protéine", "perte de poids" |
| **Productivité** | Organisation | "procrastination", "priorité", "temps" |
| **Bien-être** | Équilibre mental | "stress", "anxieux", "dormir", "méditation" |

### API Disponibles

#### Agent IA (Patterns)
```bash
# Lister les personas
GET http://localhost:3000/api/ai-agent

# Chat avec un persona
POST http://localhost:3000/api/ai-agent
{
  "message": "bonjour",
  "persona": "assistant"
}

# Voir les stats d'apprentissage
GET http://localhost:3000/api/ai-agent?action=stats
```

#### Scraper (Recettes)
```bash
# Voir les recettes
GET http://localhost:3000/api/scraper?action=recipes

# Ajouter des recettes exemples
POST http://localhost:3000/api/scraper
{
  "action": "seed-examples"
}
```

---

## 📚 ARCHITECTURE D'APPRENTISSAGE

```
┌─────────────────────────────────────────────────────────────┐
│                SYSTÈME D'APPRENTISSAGE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. L'utilisateur envoie un message                         │
│     ↓                                                        │
│  2. Recherche d'un pattern correspondant en BDD             │
│     ↓                                                        │
│  3a. Pattern trouvé → Réponse stockée                       │
│  3b. Pas de pattern → Réponse fallback                      │
│     ↓                                                        │
│  4. Stockage de l'interaction en BDD                        │
│     ↓                                                        │
│  5. L'utilisateur peut noter la réponse                     │
│     ↓                                                        │
│  6. Si note >= 4 → Apprentissage d'un nouveau pattern       │
│     ↓                                                        │
│  7. L'application ÉVOLUE !                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 STRUCTURE DES FICHIERS

```
mindlife/
├── prisma/
│   └── schema.prisma          # Schéma BDD avec tables d'apprentissage
├── scripts/
│   └── seed-learning.ts       # Script d'initialisation
├── src/
│   ├── app/api/
│   │   ├── ai-agent/route.ts  # API Agent IA (SANS LLM)
│   │   └── scraper/route.ts   # API Scraper
│   └── lib/
│       ├── patterns/
│       │   └── learning-system.ts  # Système de patterns
│       └── agents/
│           └── scraper-agent.ts    # Agent de scraping
└── .env                       # Configuration locale
```

---

## 🗃️ TABLES D'APPRENTISSAGE

### PersonaPattern
Stocke les réponses des personas:
- `persona`: Type (assistant, coach, nutrition, etc.)
- `trigger`: Mot-clé déclencheur
- `response`: La réponse à donner
- `useCount`: Nombre d'utilisations
- `avgRating`: Note moyenne

### InteractionHistory
Historique des conversations:
- `userMessage`: Message de l'utilisateur
- `botResponse`: Réponse du bot
- `rating`: Note donnée par l'utilisateur
- `source`: "pattern", "fallback", ou "llm"

### ScrapedRecipe
Recettes récupérées par le scraper:
- `name`, `ingredients`, `instructions`
- `calories`, `protein`, etc.
- `sourceUrl`, `sourceName`

---

## ⚠️ DÉPANNAGE

### Port 3000 déjà utilisé
```bash
# Trouver et tuer le processus
lsof -i :3000
kill -9 <PID>
```

### Base de données corrompue
```bash
# Supprimer et recréer
rm prisma/db/custom.db
bun run db:push
bun scripts/seed-learning.ts
```

### Dépendances manquantes
```bash
rm -rf node_modules
rm bun.lock
bun install
```

---

## 📞 SUPPORT

En cas de problème, consultez les logs:
```bash
# Logs du serveur
tail -f dev.log
```

---

**BIZ FRÉROT ! 🦞**

*Version Learning Edition - Avril 2026*
