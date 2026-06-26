# PLAN JOURNÉE INTENSE — J+1
**Date :** 05/06/2026  
**Objectif :** Avancer MAX sur Mindlife

---

## Matin (9h00 — 12h00) — 3h

### 09:00 — 09:30 (30 min) — Setup & Recap
- [ ] Démarrer le serveur : `bun dev` (vérifier que tout tourne)
- [ ] Lancer les tests : `bun test` (verifier 110p·6s)
- [ ] Relire ce plan + commits d'hier
- [ ] Vérifier que Sim Studio tourne sur `http://localhost:4000`

### 09:30 — 12:00 (2h30) — Phase 6 : Architecture Visuelle

#### 09:30 — 10:15 (45 min) — Sim.ai → Inspiration Mindlife
**Objectif :** Comprendre le workflow builder de Sim.ai

**Actions :**
- [ ] Lancer Sim Studio : `http://localhost:4000`
- [ ] Explorer le "Workflow Builder" de Sim.ai
- [ ] Identifier les patterns : blocks, connections, tools
- [ ] Noter dans `docs/SIM_AI_INSPIRATION.md` :
  - Qu'est-ce que "Mothership" ?
  - Comment les tools se branchent ?
  - Y a-t-il des templates d'agents ?
  - Quelle est la logique du "visual routing" ?

#### 10:15 — 10:45 (30 min) — Architecture OS Personnel Mindlife
**Objectif :** Convertir l'inspiration en plan concret

**Fichier :** `docs/ARCHITECTURE_OS_PERSONNEL.md`

**Contenu à produire :**
```
- Sim.ai fait : Workflow builder + Tools + Agents
- Mindlife fera : même pattern mais pour la vie personnelle

À construire :
1. "Dashboard d'OS" — comme le shell Linux mais graphique
   - Gauche : Modules actifs (Nutrition, Sport, etc.)
   - Centre : Workflow en cours (drag & drop)
   - Droite : Logs + Stats

2. "Visual Workflow Builder" — drag & drop d'actions
   - Bloc "Action" : Create task, Log weight, etc.
   - Bloc "Condition" : Si poids > X alors alerte
   - Bloc "Loop" : Tous les matins
   - Bloc "AI" : Demander conseil à l'IA

3. "Modules Registry" — comme Sim.ai Tools
   - Chaque module expose des "actions"
   - Les actions sont connectables
   - Registry dynamique (npm install mindlife-module-xxx)
```

#### 10:45 — 12:00 (1h15) — Design du Visual Builder
**Objectif :** Créer l'interface du workflow builder

**Fichiers à créer :**
- [ ] `src/components/workflow-builder/WorkflowCanvas.tsx`
  - Zone de drop (100% largeur, min-height 600px)
  - Drag & drop de blocks
  
- [ ] `src/components/workflow-builder/WorkflowBlock.tsx`
  - Représente un block (Input → Action → Output)
  - Connecteurs sur chaque côté
  - Draggable
  
- [ ] `src/components/workflow-builder/BlockRegistry.tsx`
  - Liste des blocks disponibles
  - Catégorisation : "Actions", "Conditions", "Loops", "AI"
  
- [ ] `src/lib/workflow/types.ts`
  - `WorkflowNode`, `WorkflowConnection`, `WorkflowState`
  
**À la fin de cette session :**
- Un canvas vide avec drag & drop fonctionnel
- 3 types de blocks affichés dans la registry
- Un block draggable sur le canvas

---

## Pause Déjeuner (12h00 — 13h00)

---

## Après-midi (13h00 — 17h00) — 4h

### 13:00 — 14:30 (1h30) — MCP Server Phase 1

**Objectif :** Créer le protocole Mindlife → Externe

**Fichier :** `src/mindlife-mcp/`

**Structure :**
```
src/mindlife-mcp/
├── server.ts           — Serveur MCP (protocol)
├── handlers/           — Endpoints exposés
│   ├── tasks.ts
│   ├── nutrition.ts
│   └── events.ts
├── types.ts           — Types MCP
└── index.ts           — Export
```

**À créer :**
- [ ] `src/mindlife-mcp/server.ts`
  ```typescript
  export function startMcpServer(port: number = 3080)
  ```
- [ ] `src/mindlife-mcp/handlers/tasks.ts`
  ```typescript
  export async function handleGetTasks(userId: string)
  export async function handleCreateTask(task: Task)
  ```
- [ ] `src/mindlife-mcp/index.ts`
  - Export tous les handlers
  - Documentation des endpoints JSON-RPC 2.0

**Documentation :** `docs/MCP_SERVER_V1.md`
```
Mindlife MCP Server
===================

Port : 3080
Protocol : JSON-RPC 2.0

Endpoints :
- mindlife.getTasks({ userId }) → Task[]
- mindlife.createTask({ task }) → Task
- mindlife.logWeight({ userId, weight, date }) → WeightEntry
- mindlife.getMeals({ userId, dateRange }) → Meal[]
```

### 14:30 — 16:00 (1h30) — Stitch → Mindlife Integration

**Objectif :** Connecter Stitch au MCP

**Actions :**
- [ ] Créer `src/mindlife-mcp/handlers/stitch.ts`
  ```typescript
  export async function handleStitchWebhook(payload: any)
  // Traite les webhooks venant de Stitch
  // -> routes vers les handlers mindlife
  ```

- [ ] Ajouter webhook endpoint dans `src/app/api/webhooks/stitch/route.ts`
  ```typescript
  export async function POST(req) {
    const payload = await req.json();
    await handleStitchWebhook(payload);
  }
  ```

**Documentation :** `docs/STITCH_INTEGRATION.md`
```
Stitch → Mindlife
=================

Webhook : POST /api/webhooks/stitch
Headers : X-Stitch-Signature

Events :
- task.created → mindlife.createTask
- task.completed → mindlife.updateTask
- weight.logged → mindlife.logWeight
```

### 16:00 — 17:00 (1h) — Tests + Documentation

**Tests :**
- [ ] `src/__tests__/workflow-builder.test.ts`
  - Drag & drop blocks
  - Connection entre blocks
  
- [ ] `src/__tests__/mcp-server.test.ts`
  - startMcpServer
  - handleGetTasks
  - handleCreateTask

**Documentation :**
- [ ] `docs/MINDLIFE_V2_PLAN.md`
  - Roadmap vers Mindlife OS Personnel
  - Timeline estimée
  
- [ ] `docs/QUICK_START_DEV.md`
  - Comment démarrer le projet
  - Comment lancer les tests
  - Comment utiliser le MCP server

---

## Checkpoint Fin de Journée

**Critères de succès :**
- [ ] Sim.ai analysé + noté
- [ ] Architecture OS Personnel documentée
- [ ] Workflow Builder MVP fonctionnel (drag & drop)
- [ ] MCP Server démarrable (port 3080)
- [ ] Handlers tasks, nutrition, events créés
- [ ] Stitch webhook endpoint créé
- [ ] 2 nouveaux fichiers de tests
- [ ] 2 nouveaux fichiers de documentation

**Commits estimés :** 6-7 commits

---

## Bonus si avance (Optionnel)

### Si avant 17h00 :

1. **Frontend — Le "Dashboard OS"** (1h)
   - Créer `src/components/dashboard/OsDashboard.tsx`
   - Gauche : Panel latéral avec icônes des modules
   - Centre : WorkflowCanvas
   - Droite : Stats en temps réel (kernel stats)

2. **Kernel — Rate Limiting** (30 min)
   - Intégrer le rate limiting dans le middleware
   - Configurer : 100 req/min par IP

3. **Sim.ai — Templates** (30 min)
   - Créer 2 templates de workflows :
     - "Routine matinale" : Réveil → Poids → Petit déjeuner
     - "Analyse hebdo" : Récupérer tasks → Générer rapport IA

---

## Commandes de rappel

```bash
# Démarrer le projet
cd /Users/llen/Desktop/Mindlife_V11a
bun dev  # port 3090

# Tests
bun test
bun test src/__tests__/kernel-*.test.ts  # nos nouveaux tests

# Sim Studio
cd /Users/llen/Desktop/MINDLIFE\ EN\ TRI/
# déjà lancé sur http://localhost:4000

# MCP Server (quand prêt)
node src/mindlife-mcp/server.ts  # port 3080
```

---

**Last commit :** `00a2b1c` — Phase 5 + Sécurité v1  
**Nombre de tests :** 110 pass · 6 skip · 3 fail (préexistants)  
**Fichiers créés hier :** 13

Let's go full speed. 💪