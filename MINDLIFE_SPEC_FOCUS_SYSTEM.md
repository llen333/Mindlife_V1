# 🧠 MINDLIFE - Système de Focus Intelligent

> **Date de création :** 17 Mars 2026
> **Auteurs :** NICO & Frérot
> **Statut :** En réflexion - À implémenter après analyse approfondie

---

## 🎯 VISION GLOBALE

### Le Problème

L'utilisateur doit naviguer dans plusieurs pages pour gérer son organisation. **Risque :** Perte de focus, dispersion, découragement.

### La Solution

Un **Système de Focus Intelligent** qui :
- Synchronise automatiquement Objectifs ↔ Tâches ↔ Calendrier
- Calcule le temps réellement disponible
- Propose des ajustements intelligents en temps réel
- Permet de travailler SANS cliquer partout

---

## 💡 L'IDÉE CENTRALE

```
OBJECTIF = Conteneur de tâches synchronisées

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Objectif   │───►│   Tâches    │───►│  Calendrier │
│  (Actif)    │    │  (Étapes)   │    │  (RDV)      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
           ┌─────────────────────────┐
           │   MOTEUR DE SYNC        │
           │  - Temps disponible     │
           │  - Ajustement auto      │
           │  - Découpe intelligente │
           └─────────────────────────┘
                          │
                          ▼
           ┌─────────────────────────┐
           │   ZONE FOCUS ACTIVE     │
           │  "Tâche en cours"       │
           │  + temps + progression  │
           └─────────────────────────┘
```

---

## 📖 EXEMPLE CONCRET

### Situation

| Variable | Valeur |
|----------|--------|
| Heure actuelle | 9h33 |
| RDV Calendrier | 10h00 |
| Tâche à faire | 30 minutes |
| Temps dispo réel | 27 min (9h33 → 10h00) |
| Marge sécurité | 10 min |
| Temps utilisable | 17 min |

### Proposition du système

```
┌────────────────────────────────────────────────────────┐
│  💡 Proposition intelligente :                         │
│                                                        │
│  "Tu as 17 min avant ton RDV de 10h00"                │
│  "Veux-tu démarrer les 17 premières minutes ?"        │
│  "Je garderai les 13 min restantes pour après"        │
│                                                        │
│  [Démarrer 17 min]  [Reporter après RDV]  [Annuler]   │
└────────────────────────────────────────────────────────┘
```

### Après validation
- Timer de 17 min lancé
- Notification "Prépare ton RDV" à 9h50
- Tâche remainder (13 min) créée automatiquement

---

## 🏗️ ARCHITECTURE NÉCESSAIRE

### 1. Données enrichies

```typescript
// Objectif (Goal) enrichi
interface Goal {
  id: string;
  title: string;
  estimatedTotalTime: number;  // Temps total estimé (minutes)
  timeSpent: number;           // Temps déjà passé
  tasks: Task[];               // Tâches liées
  currentTaskId?: string;      // Tâche en cours
}

// Tâche (Task) enrichie
interface Task {
  id: string;
  title: string;
  estimatedDuration: number;   // Temps estimé (minutes)
  timeSpent: number;           // Temps passé
  timeRemaining: number;       // Temps restant
  linkedGoalId?: string;       // Objectif lié
  isSplit: boolean;            // Découpée ?
  parentTaskId?: string;       // Tâche parente si split
}

// Événement (Event) enrichi
interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  bufferBefore: number;        // Marge avant (minutes)
  bufferAfter: number;         // Marge après (minutes)
}

// Session de Focus (nouvelle entité)
interface FocusSession {
  id: string;
  taskId: string;
  startTime: Date;
  plannedDuration: number;
  actualDuration?: number;
  wasAutoAdjusted: boolean;
}
```

### 2. Moteur de calcul

```typescript
// Calculer les créneaux disponibles
function calculateAvailableSlots(
  currentTime: Date,
  calendar: Event[]
): TimeSlot[] {
  // 1. Récupérer les événements du jour
  // 2. Calculer créneaux entre événements (avec buffers)
  // 3. Retourner liste de créneaux disponibles
}

// Ajuster une tâche à un créneau
function adjustTaskToSlot(
  task: Task,
  slot: TimeSlot
): TaskAdjustment {
  // CAS 1: task.timeRemaining <= slot.duration → OK
  // CAS 2: task.timeRemaining > slot.duration → Découper
  // CAS 3: slot trop court → Proposer de reporter
}

// Générer une proposition intelligente
function generateProposal(
  goal: Goal,
  currentTime: Date,
  calendar: Event[]
): FocusProposal {
  // 1. Identifier la tâche courante
  // 2. Calculer le temps disponible
  // 3. Générer les options
}
```

### 3. Workflow utilisateur

```
1. User arrive sur Dashboard
2. Voit "Objectif Actif" (sélectionnable)
3. Clique "Activer"
4. Système vérifie calendrier → calcule temps dispo
5. Affiche proposition intelligente
6. User valide → Timer + Zone Focus
7. Fin de session → Ajustement auto du temps restant
```

---

## 📱 INTERFACE UTILISATEUR

### Dashboard Redesign

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 OBJECTIF ACTIF                    [Changer ▼]           │
│  ─────────────────────────────────────────────────────────  │
│  "Finaliser la présentation client"                         │
│  Progression: ████████░░░░ 65%    Temps: 2h15 / 3h30       │
│  ▶ Tâche en cours: "Créer les slides marketing"            │
│    ⏱️ Reste: 30 min                                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💡 Temps disponible avant votre RDV de 10h00       │   │
│  │     17 minutes (marge de 10 min incluse)            │   │
│  │                                                     │   │
│  │  [▶ Démarrer 17 min]  [⏰ Après le RDV]             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLÉMENTATION - Phases

### Phase 1 : Données (Prisma + Store)
- [ ] Ajouter champs temps aux Tasks
- [ ] Ajouter champs temps aux Goals
- [ ] Ajouter buffers aux Events
- [ ] Créer modèle FocusSession

### Phase 2 : Moteur de calcul
- [ ] Fonction calculateAvailableSlots
- [ ] Fonction adjustTaskToSlot
- [ ] Fonction generateProposal

### Phase 3 : Interface
- [ ] Card Objectif Actif
- [ ] Zone Focus Active
- [ ] Proposition intelligente

### Phase 4 : Session management
- [ ] Timer fonctionnel
- [ ] Notifications
- [ ] Auto-ajustement
- [ ] Création de remainder

---

## ❓ QUESTIONS EN SUSPENS

1. **Activation multiple** - Un seul objectif actif à la fois ?
2. **Gestion des interruptions** - Comment reprendre après ?
3. **Apprentissage** - Le système apprend-il des habitudes ?
4. **Notifications** - Quels canaux ? (In-app, sonore, browser ?)
5. **Mode "Deep Focus"** - Bloquer les autres features ?

---

**Dernière mise à jour :** 17 Mars 2026
**Par :** NICO & Frérot 💚
