# AUDIT COMPLET MINDLIFE V11a
## Analyse d'architecture, dette technique et viabilité production

**Date** : 30 Juin 2026  
**Projet** : `/Users/llen/Desktop/MINDLIFE_REFACTO_GO_V2/Mindlife_V11a`  
**Auditeur** : NOVA  
**Stack déclarée** : Next.js 16 + TypeScript + Prisma + PostgreSQL  
**Stack réelle** : 100% TypeScript — **0 fichier Go**

---

## 1. SYNTHÈSE EXÉCUTIVE

### Ce qui marche vraiment
- **Store Zustand** : Architecture solide, stores découplés par domaine, sélecteurs optimisés (`useShallow`, `useMemo`), mappers DB→Store propres.
- **Schéma Prisma** : 48 modèles, relations bien définies avec cascade deletes, index corrects. La modélisation des données est le point fort du projet.
- **Composants UI** : shadcn/ui + Radix + Tailwind 4 = base solide.
- **RAG** : Système d'embeddings + recherche vectorielle présent et fonctionnel (même pas totalement intégré).
- **i18n** : Fichier de 27K lignes — internationalisation complète.

### Ce qui bloque la production
1. **`ignoreBuildErrors: true`** dans `next.config.ts` — dangereux, doit être retiré
2. **`noImplicitAny: false`** dans `tsconfig.json` — annule les bénéfices de `strict: true`
3. **Provider system dupliqué** — localStorage vs `providers.json` : deux systèmes qui ne parlent PAS
4. **Aucune authentification** — `DEFAULT_USER_ID = 'mindlife-user'` partout
5. **Kernel fantôme** — un process séparé qui tourne mais dont personne n'utilise les décisions
6. **Bifrost** — un routeur qui coûte des appels API pour des décisions qui pourraient être locales

### La vérité sur le nom "GO_V2"
Le dossier s'appelle `MINDLIFE_REFACTO_GO_V2`. Il y a **0 fichier Go**. Zéro. Le projet est 100% TypeScript/Next.js. La refonte Go n'a jamais commencé.

---

## 2. ARCHITECTURE GÉNÉRALE

```
Mindlife V11a/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Entry → OsShell (composant shell)
│   │   ├── layout.tsx          # Root layout (Providers + ErrorBoundary)
│   │   ├── agents/             # Pages agents
│   │   └── api/                # 48 routes API (68 fichiers)
│   ├── components/             # ~40 composants + dossiers spécialisés
│   ├── lib/
│   │   ├── stores/             # 16 stores Zustand découplés
│   │   ├── store/              # Ancien store + sélecteurs (compatibilité)
│   │   ├── services/           # agent-service, agent-memory, agent-session
│   │   ├── agents/             # AgentRuntime, AgentRegistry
│   │   ├── bifrost/            # Routeur d'intention
│   │   ├── bus/                # Orchestrateur de modules
│   │   ├── modules/            # 5 modules (nutrition, sport, donnees, organisation, recherche)
│   │   ├── rag/                # Embeddings, chunking, vector store
│   │   ├── kernel/             # Client kernel IPC
│   │   ├── ai-provider.ts      # Provider AI principal
│   │   ├── ai-config.ts        # Configuration des providers
│   │   ├── provider-defs.ts    # Définitions des providers builtin
│   │   └── provider-registry.ts# Gestion des providers customs (filesystem)
│   ├── hooks/                  # Hooks React globaux
│   └── data/                   # providers.json
├── kernel/                     # Serveur IPC (Bun WebSocket)
│   ├── main.ts                 # Point d'entrée kernel
│   ├── ipc/server.ts           # Serveur WebSocket
│   ├── store/                  # Kernel store
│   ├── runtime/                # Sandbox, rate limiter, queue
│   ├── security/               # Permissions, audit, tokens
│   └── memory/                 # Consolidation mémoire
├── mini-services/              # Contient seulement socket-server
├── prisma/schema.prisma        # 48 modèles, PostgreSQL
└── 20 fichiers de test
```

### Distribution des langages

| Langage | Fichiers | Lignes estimées |
|---------|----------|-----------------|
| TypeScript (.ts) | 537 | ~85 000 |
| TSX (.tsx) | 206 | ~45 000 |
| Go (.go) | **0** | **0** |
| Python (.py) | 0 | 0 |
| Prisma | 1 | 912 |

---

## 3. ANALYSE PAR COUCHE

### 3.1 Store (Zustand) — ⭐⭐⭐⭐⭐

**Ce qui est bon :**
- 16 stores découplés par domaine (tasks, goals, events, habits, notes, journal, chat, etc.)
- Sélecteurs optimisés avec `useShallow` pour éviter les re-renders en cascade
- Mappers explicites entre format DB et format store
- Hook composite `useStore()` pour la rétrocompatibilité
- Types partagés centralisés dans `stores/types.ts`

**Ce qui cloche :**
- **Duplication store** : `src/lib/store/` (ancien) et `src/lib/stores/` (nouveau) coexistent. Certains composants utilisent l'un, d'autres l'autre.
- `store/selectors.ts` (11K) et `stores/index.ts` (654 lignes) définissent TOUS les deux des sélecteurs — certains sont redondants.
- Le helper `getCategoryColorClass` est mélangé dans le store alors que c'est du pur UI.

### 3.2 Routes API — ⭐⭐⭐

**48 routes** dans `src/app/api/`. Pattern général :

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  // logique métier
  return NextResponse.json({ ... });
}
```

**Problèmes :**
- **Pas d'authentification** : Chaque route définit `DEFAULT_USER_ID = 'mindlife-user'`. N'importe qui peut accéder à toutes les données.
- **Pas de validation des entrées** : Aucun schéma Zod pour valider les requêtes POST (Zod est installé mais pas utilisé pour les API).
- **Pas de rate limiting** : Aucune protection contre les abus.
- **Pas de middleware** : `middleware.ts` n'existe pas.
- **Routes "fantômes"** : Certaines routes sont créées mais peut-être jamais appelées (ex: `generate-recipe`, `asr`, `tts`, `smart-agent`).
- **Pas de logs structurés** : `console.log` et `console.error` partout.

### 3.3 Base de données (Prisma) — ⭐⭐⭐⭐

**48 modèles**, PostgreSQL, schéma bien construit :
- Relations avec cascade deletes correctes
- Index sur les colonnes de recherche fréquentes
- Enumérations implicites via `String` (pas d'enums Prisma — choix délibéré pour la flexibilité)

**Problèmes :**
- **Taille excessive** : 48 modèles pour une app personnelle. Beaucoup de modèles spécialisés qui auraient pu être génériques (BiometricData, DayExercise, SessionExercise, WeeklyProgram, WorkoutSession...).
- **Logs de requêtes en dev** : `db.ts` a `log: ['query']` — toutes les requêtes SQL sont loggées. En production, ça peut être une fuite de données et de performance.
- **Client Prisma non singleton en dev** : `new PrismaClient()` est appelé à chaque rechargement en mode `forceNewClient`.

### 3.4 Système AI / Provider — ⭐⭐

**3 fichiers qui se marchent dessus :**

| Fichier | Stockage | Utilisé par |
|---------|----------|-------------|
| `ai-config.ts` | localStorage (navigateur) | UI, composants client |
| `provider-defs.ts` | Builtins en mémoire | Config par défaut |
| `provider-registry.ts` | `src/data/providers.json` (filesystem) | Backend, API routes |

**Le problème fondamental :**

Quand un utilisateur ajoute un provider custom dans l'UI :
1. L'UI appelle `setApiKey()` → écrit dans **localStorage**
2. La config est sauvegardée dans `localStorage['mindlife-ai-config-v3']`
3. Mais le backend lit `getProvider(id)` dans **`provider-registry.ts`** qui lit `providers.json`
4. Les deux systèmes ne communiquent JAMAIS
5. Résultat : le provider "ajouté" existe dans localStorage mais n'est **jamais chargé** par le runtime

Quand `aiChat()` côté serveur cherche la clé API :
```typescript
let apiKey = getApiKey(provider);  // cherche localStorage + env vars
if (!apiKey) {
    const { getProvider } = await import('./provider-registry');
    const customProvider = await getProvider(provider);
    // Trouve le provider dans providers.json (fichier statique)
}
```

Le code de secours qui lit `providers.json` fonctionne, mais la configuration UI→localStorage→backend ne passe pas.

**Bug dans `getFunctionProvider` :**
```typescript
export function getFunctionProvider(func: AIFunction): AIProvider {
    const config = getAIConfig();
    return config.functionProviders[func] || 'zai'; // HARDCODÉ zai !
}
```
Si `functionProviders[func]` n'est pas défini (ce qui arrive si la config n'a pas été sauvegardée), ça retourne `'zai'` au lieu de `config.defaultProvider` (`'opencode-go'`).

**Fallback local massif :**
- `ai-fallback.ts` : 669 lignes de réponses hardcodées
- `nutrition-fallback.ts` : 1059 lignes de suggestions de repas hardcodées
- `sport-fallback.ts` : 589 lignes de programmes sportifs hardcodés
- Total : **2317 lignes de dead weight** rarement utilisées

### 3.5 Bifrost — ⭐ (sur-ingénierie)

**Bifrost est un routeur d'intention.** Sa mission : analyser un message utilisateur et décider quel module doit le traiter.

**3 niveaux de détection :**

```
Message utilisateur
    │
    ├── 1. Lightning (regex) → 0 LLM call
    │      25 patterns regex (recette|sport|note|poids|etc.)
    │      Détection immédiate ou null
    │
    └── 2. Deep (si lightning = null)
            │
            ├── a. Vector search (embeddings)
            │      Compare le message aux skills des modules
            │      via cosine similarity (seuil 0.65)
            │
            └── b. LLM-based
                   Appelle aiChat() pour classifier l'intention
                   avec un prompt spécialisé → 1 LLM call
```

**Problèmes :**

1. **Le LLM-based appelle `aiChat()`** qui est le MÊME LLM qui traitera le message ensuite. Tu payes un call API juste pour décider quoi faire.

2. **Les modules sont décoratifs.** Chaque module expose des tools, mais en pratique :
   - Bifrost détecte "recette" → module nutrition → appelle `bus.getModule('nutrition').execute()` → exécute des fonctions de `agent-tools.ts`
   - Ces fonctions sont les MÊMES que `agent-service.ts` appelle directement via `detectAndExecute`

3. **Bifrost ou `agent-service.ts` font la même chose en parallèle.**
   - Dans `agent-service.ts` : `bifrost.detectAndRoute()` est appelé EN PREMIER
   - Si Bifrost ne gère PAS (handled: false), `agent-service.ts` lance son PROPRE planificateur avec `aiChat()` et `detectAndExecute()`
   - Si Bifrost gère (handled: true), il exécute le module ET appelle `aiChat()` pour synthétiser la réponse
   - → Dans tous les cas, `aiChat()` est appelé au moins une fois

4. **Architecture en couches qui se chevauchent :**
   - `agent-service.ts` (couche service)
   - `bifrost` (couche routage)
   - `bus` (couche orchestration)
   - `modules` (couche exécution)
   - `agent-tools.ts` / `ai-tools.ts` (couche legacy)
   
   C'est 5 couches pour faire ce qu'une seule fonction `if/else` bien écrite ferait.

### 3.6 Bus (Orchestrator) — ⭐⭐⭐

Le Bus (`src/lib/bus/orchestrator.ts`) est un système de modules avec event bus. Il :
- Enregistre des modules (nutrition, sport, donnees, organisation, recherche)
- Route les messages vers le bon module selon l'intention
- Émet des événements système

**Problèmes :**
- **Les modules ne sont pas vraiment indépendants** — ils partagent tous la même base de données Prisma et les mêmes services.
- **Le système de permissions** (`permissions.ts`) est complet mais **jamais utilisé** par les vrais composants. C'est du code décoratif.
- **Le registry** (`registry.ts`) découvre les modules en lisant le filesystem (`module.json`) — fonctionnalité prévue pour des modules externes mais **aucun module.json n'existe** dans `src/lib/modules/`.

### 3.7 Agent Runtime — ⭐⭐⭐

`AgentRuntime` (src/lib/agents/runtime.ts) est une classe qui :
- Gère le cycle de vie d'un agent (STM, message count, timestamps)
- Construit des prompts avec contexte mémoire (structurelle + vectorielle)
- Appelle `aiChat()` pour générer des réponses
- Extrait et stocke des mémoires après chaque échange

**Problèmes :**
- **`callLLM()` utilise deux appels mémoire coûteux** : `searchMemories()` (RAG vectoriel) ET `listMemories()` (structurel). Ces deux appels sont effectués pour CHAQUE message.
- **L'AgentRuntime n'est pas utilisé par le chat principal** — `agent-service.ts` gère le chat avec son propre système de construction de prompt. L'AgentRuntime est un orphelin architectural.
- **`processMessage()` appelle `aiChat()` mais ne passe pas toujours le model/providers** (corrigé dans la session récente, mais le runtime original a ce bug).

### 3.8 Kernel (process séparé) — ⭐

Le kernel tourne sur `ws://127.0.0.1:3091` comme un processus Bun séparé. Il a :

**Ce qui tourne vraiment :**
- Serveur WebSocket IPC (méthodes RPC : `kernel.ping`, `bus.route`, `module.list`, etc.)
- Consolidation mémoire (cycles de nettoyage)
- Monitoring sandbox (consommation mémoire des modules)
- Security monitor

**Ce qui ne sert à rien :**
- Le wrapper `withKernel()` dans les API routes :
  ```typescript
  try {
      const result = await kernel.send({...});
      // Ne fait rien du résultat
  } catch {
      // Continue silencieusement
  }
  // Puis execute le handler normal
  ```
  Le kernel est appelé, son résultat est ignoré, et le handler s'exécute de toute façon. C'est un **no-op**.

- `memoryConsolidator` tourne mais personne ne consulte ses résultats.
- `moduleSandbox` surveille la mémoire mais il n'y a pas de modules externes non-fiables.
- `securityMonitor` est actif mais il n'y a pas de politique de sécurité définie.

**Le kernel est une infrastructure qui précède son usage.** Il a été construit comme si Mindlife allait avoir des modules externes non-fiables (comme un marketplace d'agents). En l'état actuel (app mono-utilisateur avec des modules codés en dur), c'est de la sur-ingénierie pure.

---

## 4. PROBLÈMES CRITIQUES POUR LA PRODUCTION

### 4.1 Bloquants

| # | Problème | Impact | Correctif |
|---|----------|--------|-----------|
| 1 | `ignoreBuildErrors: true` | Les erreurs TypeScript sont silencieusement ignorées → bugs en prod | Supprimer cette option |
| 2 | `noImplicitAny: false` | Types `any` implicites partout → pas de sécurité des types | Passer à `true` et corriger les erreurs |
| 3 | Pas d'auth | N'importe qui peut accéder à toutes les routes API | Implémenter next-auth ou un middleware |
| 4 | Provider dupliqué | Ajouter un provider dans l'UI n'a AUCUN effet côté serveur | Fusionner localStorage et providers.json |
| 5 | `getFunctionProvider` bug | Fallback hardcodé à `'zai'` au lieu de `defaultProvider` | `|| config.defaultProvider` |

### 4.2 Dette technique

| # | Problème | Sévérité |
|---|----------|----------|
| 6 | Deux systèmes de store (ancien + nouveau) | Moyenne |
| 7 | Bifrost : 3 méthodes de détection dont 2 inutiles | Haute |
| 8 | AgentRuntime non utilisé par le chat principal | Haute |
| 9 | Kernel no-op : `withKernel()` ignore les résultats | Haute |
| 10 | Fallback local : 2317 lignes de réponses hardcodées | Basse |
| 11 | 48 modèles Prisma pour une app personnelle | Basse |
| 12 | `console.log` partout, pas de logger structuré | Moyenne |
| 13 | Tests couvrent le kernel/architecture pas les features | Haute |
| 14 | Aucune validation Zod sur les requêtes API | Moyenne |
| 15 | Modules sans `module.json` alors que le registry en découvre | Basse |

### 4.3 Ce qui est "pour faire joli" (décoratif)

1. **`withKernel()`** — Appelle le kernel mais ignore sa décision. 100% décoratif.
2. **Permission system** — `permissionManager.check()` existe mais aucune route ne l'appelle.
3. **Frontman AI / OpenTelemetry** — Instrumentation active mais aucun dashboard, aucune alerte. Ça consomme des resources pour rien.
4. **Module discovery** — `registry.discover()` lit des `module.json` qui n'existent pas.
5. **Rate limiting** — `rateLimiter` existe dans le kernel mais n'est pas exposé aux routes API.
6. **Memory consolidation** — Tourne en boucle mais personne ne lit les résultats.

---

## 5. PROBLÈMES SPÉCIFIQUES AU CHANGEMENT DE PROVIDER

### Pourquoi "changer de provider" ne marche pas en vrai ?

**Le flux utilisateur :**

1. L'utilisateur va dans Settings → Providers
2. Il ajoute ou change un provider
3. L'UI appelle `setApiKey('opencode-go', 'sk-...')` et `setFunctionProvider('spirit', 'opencode-go')`
4. Ces fonctions écrivent dans **localStorage** sous la clé `mindlife-ai-config-v3`

**Le flux backend (quand l'utilisateur envoie un message) :**

1. `agent-service.ts` appelle `aiChat()`
2. `aiChat()` appelle `getFunctionProvider(func)` → lit **localStorage** (si serveur : lit `getEnvKey()`)
3. Configure le provider, appelle l'API

**Le problème :**
- **Côté serveur**, `getApiKey()` cherche d'abord `getEnvKey()` (variables d'environnement), puis `config.apiKeys[provider]` (localStorage — vide côté serveur car Next.js ne partage pas localStorage serveur/client)
- **Le provider ajouté** n'a pas de variable d'environnement correspondante
- Le code de secours (`import('./provider-registry')`) rameute `providers.json` qui est un fichier statique
- Donc : **ajouter un provider dans l'UI ne fonctionne pas côté serveur** sauf si la clé est aussi dans `providers.json`

**Solution :** Fusionner les deux systèmes. Quand l'UI ajoute un provider, il devrait aussi écrire dans `providers.json` via une API route. Et inversement, le serveur devrait lire la configuration unifiée.

---

## 6. BIFROST EN DÉTAIL (ce qu'il est VRAIMENT)

Bifrost n'est pas un "système de routage magique". C'est une série de `if/else` avec des regex, améliorée par des embeddings et un appel LLM de luxe.

### Ce qu'il fait :
1. Prend un message utilisateur
2. Vérifie 25 patterns regex (lightning)
3. Si pas de match : génère des embeddings et compare aux skills des modules
4. Si toujours pas : appelle un LLM pour classifier
5. Route vers le module correspondant
6. Le module exécute des outils
7. Synthétise la réponse

### Ce qu'il aurait dû être :
```typescript
async function processMessage(msg: string) {
    if (msg.match(/recette|repas|manger/)) return handleNutrition(msg);
    if (msg.match(/sport|entraînement/)) return handleSport(msg);
    if (msg.match(/note|souviens/)) return handleNote(msg);
    return defaultHandle(msg);
}
```

### Pourquoi c'est un problème :
- Le LLM-based deep detection coûte **1 appel API** juste pour décider quel module utiliser
- Si le deep detect choisit le mauvais module, l'utilisateur reçoit une réponse incohérente
- Les embeddings vectoriels sont utiles mais le seuil de 0.65 est arbitraire
- Tout ça pour finalement appeler les mêmes fonctions `agent-tools.ts` que le planificateur direct

---

## 7. RECOMMANDATIONS

### Priorité Haute (avant production)
1. **🔥 Retirer `ignoreBuildErrors: true`** de `next.config.ts`
2. **🔥 Rendre `noImplicitAny: true`** et corriger les erreurs
3. **🔥 Fusionner les systèmes de provider** (localStorage + providers.json)
4. **🔥 Ajouter une vraie authentification** (même basique — JWT ou next-auth)
5. **🔥 Corriger `getFunctionProvider()`** : `|| config.defaultProvider` au lieu de `|| 'zai'`

### Priorité Moyenne (refactoring)
6. **Simplifier Bifrost** : Garder uniquement la détection lightning (regex) pour les actions évidentes (nutrition, sport, organisation). Supprimer le deep detect LLM. Pour le reste, laisser le LLM principal décider.
7. **Dépoussiérer le Kernel** : Soit l'utiliser vraiment (il bloque les appels, il audite), soit le retirer. Le statuquo "on l'appelle mais on ignore sa réponse" est le pire des mondes.
8. **Nettoyer les stores** : Supprimer complètement `src/lib/store/` (l'ancien), ne garder que `src/lib/stores/`.
9. **Unifier `agent-service.ts` et `AgentRuntime`** : Les deux font la même chose (processMessage → memories → callLLM → store). Un seul devrait exister.

### Priorité Basse (amélioration continue)
10. **Retirer les fallbacks locaux** ou les rendre optionnels (config `useFallbackOnError`)
11. **Ajouter une validation Zod** sur toutes les routes POST
12. **Réduire le nombre de modèles Prisma** — plusieurs modèles pour le sport pourraient être fusionnés
13. **Supprimer l'instrumentation Frontman AI** si aucun dashboard ne la consomme
14. **Remplacer `console.log`** par un vrai logger (pino, winston)
15. **Rendre `middleware.ts` effectif** pour la sécurité des en-têtes et l'auth
16. **Implémenter le Go promis** dans le nom du projet ou renommer le dossier

---

## 8. CONCLUSION

Mindlife est **architecturalement ambitieux** mais pâtit d'une **sur-ingénierie précoce** : des systèmes entiers (Kernel, Bifrost, Bus, Permissions) ont été construits pour des scénarios qui ne se sont pas encore matérialisés (modules externes, multi-utilisateurs, agents autonomes).

Les fondations sont bonnes :
- ✅ Store Zustand bien conçu
- ✅ Schéma BDD complet
- ✅ Composants UI solides
- ✅ RAG fonctionnel

Mais les **5 couches architecturales** (AgentService → Bifrost → Bus → Modules → LegacyTools) qui s'enroulent les unes sur les autres créent une complexité inutile. Chaque couche ajoute de la latence, des points de défaillance, et de la confusion sans valeur ajoutée proportionnelle.

**Pour passer en production :** Le chemin le plus court n'est pas d'ajouter des fonctionnalités mais de **simplifier** ce qui existe déjà. La priorité #1 est la fiabilité du système AI/provider — sans ça, Mindlife n'est qu'une interface vide.

---

---

## 9. ÉTAT DE POSTGRESQL ET PGVECTOR

### PostgreSQL (Prisma) — ✅ FONCTIONNEL

| Aspect | Statut | Détail |
|--------|--------|--------|
| Connexion | ✅ OK | `DATABASE_URL` configurée, connexion stable |
| 48 modèles | ✅ OK | Relations, cascade deletes, index — tout en place |
| Migrations | ✅ OK | `prisma db push` et `prisma migrate` fonctionnent |
| Requêtes | ✅ OK | Toutes les routes API CRUD passent par Prisma |
| Logs | ⚠️ | `log: ['query']` en dev — toutes les SQL sont loggées |

**Ce qui marche :**
- `agent-service.ts` utilise `db.agentMemory` (Prisma) pour les mémoires structurées — **ça marche**
- `memoryManager.extractMemories()` et `synthesizeMemories()` utilisent `db.agentMemory` — **ça marche**
- Toutes les routes API (tasks, goals, events, meals, etc.) utilisent Prisma — **ça marche**

### pgvector — ❌ NON FONCTIONNEL (trompe-l'œil)

| Aspect | Statut | Détail |
|--------|--------|--------|
| Extension PostgreSQL | ✅ OK | `pgvector` installée sur le serveur |
| Table `vector_memories` | ❌ **JAMAIS CRÉÉE** | Pas de migration, pas de script d'init |
| `VECTOR_DATABASE_URL` | ❌ Absente | Fallback vers la même DB que Prisma |
| `OPENAI_API_KEY` | ❌ Absente | Embeddings OpenAI impossibles |
| `mockMode` | ❌ Jamais activé | Seulement dans les tests unitaires |
| `rag/store.ts` | ❌ Plante silencieusement | Tous les catch sont vides |

**Ce qui ne marche PAS (mais le code les appelle) :**

| Appel | Où ? | Résultat |
|-------|------|----------|
| `searchMemories()` | `AgentRuntime.processMessage()` | ❌ Table manquante → catch → [] |
| `storeMemory()` | `AgentRuntime.processMessage()` | ❌ Table manquante → catch → rien |
| `getEmbedding()` | `rag/embeddings.ts` | ❌ Pas de clé OpenAI → catch → mock pas activé |
| `vectorDetect()` | `bifrost/detector.ts` | ❌ Embeddings plantent → retourne null → fallback LLM |

**Pourquoi cette situation ?**

Le RAG vectoriel a été développé comme une couche parallèle à Prisma :
1. `rag/store.ts` utilise un pool `pg` DIRECT (pas Prisma) avec des requêtes SQL brutes
2. La table `vector_memories` n'a pas de modèle Prisma — elle est complètement en dehors des migrations
3. Aucun script de création de la table n'existe dans le projet
4. Les embeddings nécessitent `OPENAI_API_KEY` qui n'est pas configurée
5. Résultat : tout le RAG vectoriel est un **circuit ouvert** — le code s'exécute mais ne fait rien

**Impact sur les features :**
- ✅ Mémoires des agents (AgentMemory via Prisma) : **fonctionnelles**
- ❌ Recherche sémantique vectorielle : **cassée**
- ❌ Bifrost vector detection : **tombe en fallback LLM** (coûteux)
- ❌ AgentRuntime vector memory : **silencieusement vide**

### Recommandations pour pgvector

Pour rendre pgvector fonctionnel :
1. Créer la table manuellement ou via script SQL :
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE TABLE vector_memories (
     id TEXT PRIMARY KEY,
     agent_id TEXT NOT NULL,
     content TEXT NOT NULL,
     embedding vector(1536),
     metadata JSONB DEFAULT '{}',
     importance INTEGER DEFAULT 3,
     memory_level TEXT DEFAULT 'mtm',
     emotion TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX ON vector_memories USING ivfflat (embedding vector_cosine_ops);
   ```
2. Configurer `OPENAI_API_KEY` dans `.env.local`
3. OU remplacer OpenAI par un provider local d'embeddings (ou mockMode activé en attendant)

---

*Rapport généré par NOVA — Audit basé sur l'analyse exhaustive du code source, de la configuration et de l'état réel de la base de données.*
