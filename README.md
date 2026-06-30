# Mindlife V1

**Application de gestion de vie personnelle** — dashboard, calendrier, tâches, objectifs, nutrition, sport, bien-être, notes, habitudes, journal intime, et agents IA conversationnels.

> **Auteurs :** NOVA (architecture & backend) · FREROT (concept & frontend)
> **État :** Base stable V1 — fondation pour la refonte Go V2

---

## 📋 Prérequis

| Technologie | Version | Installation |
|------------|---------|-------------|
| **Bun** | ≥ 1.2 | `curl -fsSL https://bun.sh/install \| bash` |
| **PostgreSQL** | ≥ 18 | `brew install postgresql@18 && brew services start postgresql@18` |
| **pgvector** | ≥ 0.8 | `brew install pgvector` |

### Vérification rapide

```bash
bun --version              # ≥ 1.2
psql --version             # ≥ 18
psql -U postgres -c "SELECT extversion FROM pg_extension WHERE extname='vector';"
```

> ⚠️ **pgvector est obligatoire** pour le RAG vectoriel (mémoires des agents IA).
> Sans lui, les embeddings et la recherche sémantique sont désactivés.

---

## 🚀 Installation

### 1. Cloner

```bash
git clone https://github.com/llen333/Mindlife_V1.git
cd Mindlife_V1
```

### 2. Lancer le script d'installation

```bash
bun run setup
```

Le script vous guide pas à pas :

```
📋 Étape 1/7 — Vérification des prérequis (Bun, PostgreSQL, pgvector)
🛢️  Étape 2/7 — Configuration PostgreSQL (hôte, port, base)
📝 Étape 3/7 — Création du fichier .env
📦 Étape 4/7 — Installation des dépendances (bun install)
🗄️  Étape 5/7 — Création des tables Prisma
🧠 Étape 6/7 — Initialisation du RAG vectoriel (init-vector.sql)
🌱 Étape 7/7 — Peuplement de la base (seed)
```

### 3. Démarrer l'application

```bash
bun run dev
```

Ouvrir dans le navigateur : **http://localhost:3090**

### Comptes de test créés par le seed

| Email | Rôle |
|-------|------|
| admin@mindlife.app | Admin |
| john@mindlife.app | Utilisateur |
| mike@mindlife.app | Utilisateur |
| sarah@mindlife.app | Utilisateur |
| emma@mindlife.app | Utilisateur |

---

## 🔧 Configuration

### Variables d'environnement (`.env`)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_URL` | Connexion PostgreSQL | `postgresql://postgres@localhost:5432/mindlife` |
| `AI_PROVIDER` | Provider IA par défaut | `local` |
| `OPENAI_API_KEY` | Clé OpenAI (pour embeddings RAG) | — |
| `GROQ_API_KEY` | Clé Groq (inférence rapide) | — |
| `ZAI_API_KEY` | Clé Z.ai | — |
| `OPENROUTER_API_KEY` | Clé OpenRouter | — |
| `NODE_ENV` | Environnement | `development` |

### Providers AI disponibles

| Provider | ID | Nécessite |
|----------|----|-----------|
| Local | `local` | Rien (mode dégradé) |
| Z.ai | `zai` | `ZAI_API_KEY` |
| Groq | `groq` | `GROQ_API_KEY` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` |
| OpenAI | `openai` | `OPENAI_API_KEY` |
| HuggingFace | `huggingface` | `PROVIDER_HF_KEY` |
| Google Gemini | `gemini` | `PROVIDER_GEMINI_KEY` |

Les clés API se configurent dans l'interface **Paramètres → Providers** de l'application,
ou directement dans `.env` pour les providers intégrés.

---

## 🧪 Tests

```bash
bun test              # Lance tous les tests (vitest)
bun run test:watch    # Mode watch
```

**Couverture :** 258 tests · 18/20 suites · RAG, kernel, bus, agents, Bifrost.

> Les 2 échecs préexistants sont des tests nécessitant `bun:test` (runtime Bun).

---

## 🏗️ Architecture

```
Mindlife_V1/
├── prisma/                      # Schéma PostgreSQL + migrations
├── src/
│   ├── app/                     # Pages Next.js (App Router)
│   │   ├── api/                 # API routes
│   │   └── (dashboard)/         # Interface utilisateur
│   ├── components/              # Composants React
│   ├── lib/
│   │   ├── bus/                 # Bus de modules (orchestrateur multi-agents)
│   │   ├── kernel/              # Kernel IPC (validation, permissions, audit)
│   │   ├── rag/                 # RAG vectoriel (embeddings, store, search)
│   │   ├── services/            # Services métier (agents, sessions, mémoire)
│   │   └── providers/           # Providers AI (registry, sync)
│   └── data/                    # Données statiques (providers, config)
├── db/
│   └── init-vector.sql          # Initialisation pgvector
├── scripts/
│   ├── setup-fresh.ts           # Script d'installation complet
│   └── seed-db.ts               # Peuplement de la base
└── docs/                        # Documentation technique
```

### Flux clé : validation kernel

```
Message utilisateur
  → AgentService.processMessage()
    → kernel.send('agent:process')   ← validation (agentId, session, taille)
      → si refusé : 403 avec erreur
      → si accepté : continue
    → RAG context (vector_memories)
    → LLM inference (provider configuré)
    → Réponse
```

---

## 📦 Scripts utiles

```bash
bun run dev           # Serveur de développement (port 3090)
bun run build         # Build production
bun start             # Serveur production
bun run seed          # Re-peupler la base
bun run db:push       # Push le schéma Prisma
bun run db:generate   # Régénérer le client Prisma
bun run lint          # ESLint
```

---

## 🔗 Liens

- **Repo GitHub :** https://github.com/llen333/Mindlife_V1
- **Documentation :** `docs/`
- **Rapport d'audit :** `AUDIT_MINDLIFE_COMPLET.md`
- **Plan de refonte Go V2 :** `2_PLAN_CORRECTIONS.md`
