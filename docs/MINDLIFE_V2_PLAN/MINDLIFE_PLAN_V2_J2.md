# MINDLIFE V2 — Plan J2 (03/06/2026)
## Points 3, 4, 5 : Module Store, Runtime Isolation, Sécurité & Audit

---

## 1. Objectif de la journée

Finaliser les 3 couches fondamentales du **Kernel autonome** après la mise en place de l'Event Bus et du stockage agent (J1) :

| Point | Sujet | Rôle |
|-------|-------|------|
| **3** | **Module Store** | Registre de packages installables, manifeste, dépendances, permissions déclaratives |
| **4** | **Runtime Isolation** | Sandbox par module (rate limiting, timeout, dead letter queue), protection contre les modules bogués |
| **5** | **Sécurité & Audit** | Tokens d'API par module, logs d'audit persistants, révocation de permissions à chaud |

---

## 2. Structure créée

### 2.1 Point 3 — Module Store

**`kernel/store/manager.ts`** — Classe `ModuleStore` avec les opérations CRUD sur les packages :

| Méthode | Description |
|---------|-------------|
| `register(manifest, source?, checksum?)` | Enregistre un package (création ou mise à jour si existant) |
| `markInstalled(name)` | Marque comme installé |
| `markUninstalled(name)` | Marque comme désinstallé |
| `get(name)` | Récupère un package avec son manifest parsé |
| `list(filter?)` | Liste les packages (filtre optionnel par statut installé) |
| `search(query)` | Recherche par nom ou description |
| `remove(name)` | Supprime un package |
| `resolveDependencies(manifest)` | Extrait les dépendances du manifeste |
| `checkDependencies(manifest)` | Vérifie quelles dépendances sont installées |

**Modèle Prisma** `ModulePackage` :
```
id, name (unique), version, description, author,
manifest (JSON), source, checksum, isInstalled, createdAt, updatedAt
```

### 2.2 Point 4 — Runtime Isolation

**`kernel/runtime/ratelimit.ts`** — `RateLimiter` :
- `setLimit(key, maxRequests, windowMs)` — configure une limite
- `check(key)` → `{ allowed, remaining, resetAt }` — vérifie et incrémente
- `getRemaining(key)` — combien de requêtes restantes
- `reset(key)` / `resetAll()` — réinitialise les compteurs
- Par défaut : aucune limite (infini)

**`kernel/runtime/queue.ts`** — `DeadLetterQueue` :
- `enqueue({ fromModule, toModule, messageType, payload, error, maxRetries? })` → stocke dans `AgentMessage` avec préfixe `dead_letter:`
- `list(includeProcessed?)` — liste les DLQ actives (par défaut non-traîtées)
- `retry(messageId)` — incrémente le compteur, marque comme `failed_permanent` si maxRetries dépassé
- `purge(olderThanHours)` — nettoie les vieilles entrées (défaut 24h)

**`kernel/runtime/sandbox.ts`** — `ModuleSandbox` :
- `configure(moduleId, { timeout, rateLimit, allowedIntents })` — configure les règles
- `execute(module, context, executor)` — exécute avec :
  1. Vérification des intents autorisés
  2. Rate limiting
  3. Timeout (Promise.race)
  4. Capture des erreurs vers DeadLetterQueue
- Retourne un `ModuleResponse` standard en cas d'erreur (pas de crash)

### 2.3 Point 5 — Sécurité & Audit

**`kernel/security/tokens.ts`** — `ModuleTokenManager` :
- `generate({ moduleId, name, permissions, expiresInDays? })` → `{ token: 'mrt_<base64url>', info }`
- Stockage : SHA-256 du token (le token brut n'est visible qu'à la création)
- `validate(token)` — vérifie hash + isActive + non-expiré, met à jour `lastUsedAt`
- `revoke(tokenId)` — passe `isActive = false`
- `listForModule(moduleId)` — liste tous les tokens d'un module
- `hasPermission(token, permission)` — vérifie si le token a une permission spécifique (ou `*`)

**Modèle Prisma** `ModuleToken` :
```
id, moduleId, name, tokenHash (unique), permissions (JSON),
expiresAt?, isActive, lastUsedAt?, createdAt
```

**`kernel/security/audit.ts`** — `AuditLogger` :
- `log({ moduleId, action, result, details?, ipcId? })` — enregistre une entrée
- `query({ moduleId?, action?, result?, since?, until?, limit?, offset? })` — requêtes filtrées avec pagination
- `recent(limit?)` — les N dernières entrées
- `purge(olderThanDays?)` — nettoie les entrées de plus de 90 jours

**Modèle Prisma** `AuditLog` :
```
id, timestamp, moduleId, action, result (success/denied/error),
details (JSON), ipcId
```

**`kernel/security/permissions.ts`** — `PermissionManager` :
- `revokePermission(moduleId, permission)` — révoque une permission spécifique à chaud
- `restorePermission(moduleId, permission)` — restaure une permission révoquée
- `revokeAll(moduleId)` — révoque toutes les permissions d'un coup
- `check({ moduleId, permission, action, details? })` → `{ allowed, reason? }` :
  1. Vérifie d'abord si la permission est révoquée à chaud
  2. Sinon, vérifie si elle est déclarée dans le manifeste du module
  3. Log l'action dans AuditLog (success ou denied)

### 2.4 IPC — Nouveaux handlers

**22 nouvelles méthodes IPC** ajoutées à `kernel/main.ts` et typées dans `kernel/ipc/types.ts` :

| Méthode | Handler |
|---------|---------|
| `store.register` | moduleStore.register |
| `store.install` | moduleStore.markInstalled + configure sandbox |
| `store.uninstall` | moduleStore.markUninstalled |
| `store.list` | moduleStore.list |
| `store.search` | moduleStore.search |
| `store.get` | moduleStore.get |
| `store.dependencies` | moduleStore.checkDependencies |
| `store.remove` | moduleStore.remove |
| `runtime.sandbox.configure` | moduleSandbox.configure |
| `runtime.sandbox.status` | moduleSandbox.getOptions |
| `runtime.ratelimit.status` | rateLimiter.getRemaining |
| `runtime.dlq.list` | deadLetterQueue.list |
| `runtime.dlq.retry` | deadLetterQueue.retry |
| `runtime.dlq.purge` | deadLetterQueue.purge |
| `security.token.generate` | moduleTokenManager.generate |
| `security.token.validate` | moduleTokenManager.validate |
| `security.token.revoke` | moduleTokenManager.revoke |
| `security.token.list` | moduleTokenManager.listForModule |
| `security.permission.revoke` | permissionManager.revokePermission |
| `security.permission.restore` | permissionManager.restorePermission |
| `security.audit.query` | auditLogger.query |
| `security.audit.recent` | auditLogger.recent |

---

## 3. Tests

**42 nouveaux tests automatisés** (fichier `src/__tests__/kernel-phase3.test.ts`) :

| Section | Nb tests | Ce qui est testé |
|---------|----------|------------------|
| **Module Store** | 10 | register, list, get, markInstalled/uninstalled, filter, search, resolveDependencies, checkDependencies, remove |
| **RateLimiter** | 5 | unlimited default, within limit, over limit, remaining count, reset |
| **ModuleSandbox** | 6 | success, blocked intents, rate limit, error to DLQ, timeout |
| **DeadLetterQueue** | 4 | enqueue, list, retry + max retries, purge |
| **ModuleTokenManager** | 6 | generate, validate, reject invalid, hasPermission, list, revoke |
| **PermissionManager** | 5 | check manifest, deny undeclared, revoke, restore, revokeAll |
| **AuditLogger** | 5 | log, recent, filter by moduleId, filter by action, filter by date range |
| **IPC Integration** | 3 | store.register, store.list, security.token.generate via WebSocket |

**Résultat global : 190/191 tests passent**
- 1 échec préexistant (`phase2-e2e.ts` — E2E lifecycle avec erreur de markdown import)
- 1 suite ignorée (`module-lifecycle.ts` — utilise `bun:test`, incompatible vitest)
- **Aucune régression** sur les 148 tests existants

---

## 4. Fichiers (22 modifiés/créés)

```
kernel/
├── main.ts                      # Entry point — 50+ handlers IPC
├── store.ts                     # Persistance Prisma (AgentState, AgentMessage)
├── store/
│   └── manager.ts               # ModuleStore — registre de packages
├── ipc/
│   ├── server.ts                # Serveur WebSocket Bun
│   └── types.ts                 # Protocole IPC (60+ method types)
├── runtime/
│   ├── ratelimit.ts             # Rate limiter par module
│   ├── queue.ts                 # Dead letter queue
│   └── sandbox.ts               # Sandbox d'exécution
├── security/
│   ├── tokens.ts                # ModuleTokenManager
│   ├── audit.ts                 # AuditLogger
│   └── permissions.ts           # PermissionManager
└── syscalls/
    ├── fs.ts                    # sys.fs sandboxé
    ├── mem.ts                   # sys.mem wrapper RAG
    └── agent.ts                 # sys.agent inter-agent

src/
├── lib/
│   ├── kernel-client.ts         # KernelClient WebSocket proxy
│   └── module-memory.ts         # ModuleMemory (collection namespace module:<id>)
└── __tests__/
    ├── kernel-ipc.test.ts       # 8 tests IPC (J1)
    ├── kernel-phase3.test.ts    # 42 tests (J2)
    └── module-memory.test.ts    # 9 tests ModuleMemory (J1)

prisma/schema.prisma             # +3 modèles (ModulePackage, ModuleToken, AuditLog)
package.json                     # Scripts dev:kernel, start:kernel, dev:full, start:all
```

---

## 5. Architecture actuelle du Kernel

```
                     ┌──────────────────────┐
                     │     Next.js (3090)    │
                     │   src/lib/kernel-     │
                     │   client.ts           │
                     └─────────┬────────────┘
                               │ WebSocket
                     ┌─────────▼────────────┐
                     │   Kernel IPC Server   │
                     │   (Bun, port 3091)    │
                     │   kernel/ipc/         │
                     └─────────┬────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Systèmes      │  │   Store          │  │   Sécurité       │
│   (syscalls/)   │  │   (store/)       │  │   (security/)    │
│   fs, mem,      │  │   ModuleStore    │  │   tokens, audit, │
│   agent         │  │   registre       │  │   permissions    │
└────────┬────────┘  │   packages       │  └────────┬────────┘
         │           └─────────────────┘           │
         ▼                                         ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Runtime        │  │   Persistance   │  │   Modules       │
│   (runtime/)    │  │   Prisma/        │  │   (src/lib/     │
│   sandbox, del, │  │   PostgreSQL     │  │   modules/*)    │
│   ratelimit     │  │   48 tables      │  │   5 chargés     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 6. Ce que ça change par rapport à Mindlife V1

### Ce qui a été AJOUTÉ (inexistant dans V1)

1. **Kernel autonome** — Un processus IPC dédié qui survit aux redémarrages du serveur web. V1 faisait tout tourner dans Next.js.

2. **Module Store (registre)** — V1 chargeait les modules par imports statiques. Maintenant on a :
   - Un registre persistant des packages
   - Des manifests versionnés
   - Vérification des permissions AVANT l'installation
   - Résolution de dépendances

3. **Runtime Isolation** — V1 exécutait les modules sans aucune protection. Maintenant :
   - Rate limiting : un module bouclé ne peut pas saturer le système
   - Dead Letter Queue : les erreurs ne font pas crash — elles sont capturées, stockées, et peuvent être rejouées
   - Sandbox avec timeout : un module qui ne répond pas est coupé après X ms

4. **Sécurité** — V1 n'avait aucune notion d'authentification ou d'autorisation :
   - Tokens d'API par module (génération, validation, révocation)
   - Audit log complet de toutes les actions
   - Révocation de permissions à chaud (sans redémarrage)

5. **Communication IPC** — V1 utilisait un Event Bus in-process uniquement. Maintenant :
   - Protocole JSON-RPC sur WebSocket
   - 50+ méthodes IPC typées
   - Broadcast d'événements temps réel
   - Auto-reconnect du client

6. **Stockage agent structuré** — V1 mélangeait les mémoires de tous les agents. Maintenant :
   - Collection namespace `module:<id>` par module
   - 8 méthodes dédiées (remember, recall, getContext, getImportantMemories, etc.)
   - Formatage automatique pour prompt LLM

### Ce qui RESTE INCHANGÉ

- Les 5 modules existants (nutrition, sport, organisation, recherche, donnees) — aucun fichier modifié
- Les modèles Prisma existants — seuls 3 nouveaux modèles ont été ajoutés
- L'Event Bus et l'Orchestrator — toujours fonctionnels, le kernel les utilise via import
- Les routes Next.js et l'API — toujours pareilles
- La base PostgreSQL existante (48 tables) — inchangée

### Ce qui CHANGE dans le fonctionnement

1. **Les modules s'enregistrent automatiquement** via side-effect à l'import. Plus besoin d'instanciation manuelle dans l'orchestrator.

2. **Le kernel remplace Next.js comme point d'entrée** pour l'intelligence du système. Next.js devient une simple interface utilisateur (UI shell).

3. **Vision confirmée** : Mindlife = un OS personnel, pas une app. Les modules sont des citoyens avec des droits, pas des plugins jetables.

---

## 7. Prochaines étapes (backend)

### Court terme (prochaine session)

1. **Refonte Frontend Shell**
   - Sidebar dynamique (liste des modules chargés, statut live via WebSocket)
   - Module Renderer (composants React enregistrés par module, rendu dynamique)
   - Interface pour le Module Store (installer/désinstaller depuis l'UI)

2. **Memory Consolidation Service**
   - Service background dans le kernel
   - Pipeline STM → MTM → LTM basé sur : fréquence d'accès, importance, récence
   - Nettoyage automatique des mémoires obsolètes

### Moyen terme

3. **Sandbox durci**
   - Runtime isolé (Worker Bun ou subprocess avec IPC)
   - Limites CPU/mémoire réelles (Bun.nativeBinding ou cgroups-like)
   - Isolation filesystem (chroot-like ou overlayfs)

4. **Module Store distant**
   - `module install @mindlife/module-xxx` (comme npm install)
   - Marketplace : résolution de dépendances distantes
   - Signature et vérification des packages

5. **Sécurité avancée**
   - Rate limiting par IP et par token (pas seulement par module)
   - Chiffrement des tokens au repos (chiffrement symétrique du tokenHash)
   - Alertes en cas de patterns suspects (ex: 10 denied permissions en 5 min)

### Long terme

6. **Distribution multi-dispositifs**
   - Plusieurs kernels synchronisés (phone, desktop, server)
   - Messages cross-kernel via relai NATS/Redis
   - Résolution de conflits sur les mémoires partagées

7. **Système de plugins utilisateur**
   - Modules non-signés en mode bac à sable
   - Approbation par l'utilisateur avant activation
   - Sandbox graphique (accès contrôlé aux APIs)

---

## 8. Statistiques

| Métrique | Valeur |
|----------|--------|
| Fichiers créés aujourd'hui | 15 |
| Lignes de code ajoutées | ~2 900 |
| Tests ajoutés | 42 |
| Tests passant | 190/191 |
| Temps d'exécution des tests | ~3s |
| Nouvelles méthodes IPC | 22 |
| Nouvelles tables Prisma | 3 |
| Tables PostgreSQL totales | 48 |

---

*Rapport généré le 03/06/2026 par NOVA.*
*Projet : Mindlife V11a — "/Users/llen/Desktop/FREROT-MINDLIFE_REFACTO/MINDLIFE_V1a/Mindlife_V11a"*
