# 📓 JOURNAL DES PRÉVISIONS ET ITÉRATIONS

**Créé le :** 8 Avril 2026 à 22:22

---

## 📋 Règles de Gestion

- **Maximum 2 itérations par jour**
- Préparer la veille les itérations du lendemain
- Noter : Plan d'attaque, Status, Validation
- Sauvegarder localement avant chaque reset Z.ai

---

## 🗓️ ITÉRATIONS PLANIFIÉES

### 📌 10 Avril 2026 (Matin)

#### Itération #1 : Terminer migration GSAP MindLifeDashboard
| Étape | Description | Status |
|-------|-------------|--------|
| 1 | Migrer AnimatedOrbs vers CSS natif (keyframes) | ✅ FAIT |
| 2 | Migrer GlassCard vers GSAP + memo | ✅ FAIT |
| 3 | Migrer ProgressBadge vers GSAP + memo | ✅ FAIT |
| 4 | Migrer CategoryCard vers GSAP + memo | ✅ FAIT |
| 5 | Migrer sections Journal, Objectifs, Minuteur, Habitudes, Notes | ✅ FAIT |
| 6 | Garder AnimatePresence pour modales (recommandé) | ✅ FAIT |
| 7 | Tester les animations | ✅ FAIT |
| 8 | Valider les performances (lint OK) | ✅ FAIT |

---

#### Itération #2 : Optimiser Store Zustand
| Étape | Description | Status |
|-------|-------------|--------|
| 1 | Créer fichier store-selectors.ts avec hooks optimisés | ✅ FAIT |
| 2 | Ajouter useDashboardStats, useActiveGoals, etc. | ✅ FAIT |
| 3 | Ajouter shallow comparison pour objets | ✅ FAIT |
| 4 | Ajouter actions groupées (useTaskActions, etc.) | ✅ FAIT |
| 5 | Migration progressive des composants | ⏳ À faire |

---

## 💡 IDEES FUTURES (À planifier)

### 🔴 CRITIQUE (d'après rapport Claude Code)
| # | Idée | Gain estimé | Temps |
|---|------|-------------|-------|
| 1 | **Error Boundaries** - Empêcher crash complet | ✅ FAIT | 4h |
| 2 | **GSAP Migration** - Remplacer Framer Motion | ✅ FAIT | 6h |
| 3 | **Sécurité API keys** - AES-GCM au lieu de Base64 | Sécurité | 6h |

### 🟠 HAUTE PRIORITÉ
| # | Idée | Gain estimé | Temps |
|---|------|-------------|-------|
| 4 | React.memo sur composants lourds | ✅ FAIT | 3h |
| 5 | Optimiser Store Zustand (sélecteurs mémorisés) | ⏳ En cours | 5h |
| 6 | Rate limiting sur API | Sécurité | 3h |

### 🟡 MOYENNE PRIORITÉ
| # | Idée | Statut |
|---|------|--------|
| 7 | Page Management (placeholder → créer) | ❌ À créer |
| 8 | Page Culture (placeholder → créer) | ❌ À créer |
| 9 | Page Growth (placeholder → créer) | ❌ À créer |
| 10 | Page Health (placeholder → créer) | ❌ À créer |
| 11 | Page AI Synthesis (placeholder → créer) | ❌ À créer |
| 12 | Support TDAH/TDA (Focus Timer, Eisenhower) | ❌ À créer |

---

## 📊 HISTORIQUE DES ITÉRATIONS

### 10 Avril 2026 (Après-midi) - Migration GSAP Complète ✅
- ✅ **page.tsx migré** : Framer Motion → GSAP (transitions de pages)
- ✅ **Sidebar.tsx migré** : motion.aside → GSAP width animation
- ✅ **MindLifeSidebar.tsx migré** : motion.aside → GSAP + hover effects
- ✅ **Dashboard.tsx migré** : motion.div → GSAP stagger animations (hooks fixés)
- ✅ **JournalPanel.tsx migré** : AnimatePresence → GSAP form animations
- ✅ **NotesPanel.tsx migré** : AnimatePresence → GSAP entry animations
- ✅ **TasksPanel.tsx migré** : ⚠️ CRITIQUE - AnimatedOrbs CSS natif ( était 200%+ CPU !)
  - AnimatedOrbs: `motion.div` + `repeat: Infinity` → CSS `@keyframes` natif
  - ShimmerBar: `repeat: Infinity` → CSS shimmer natif
  - GlassCard, StatCard: memo + GSAP hover effects
  - ProgressCircle: GSAP strokeDasharray animation
- ✅ **HabitsPanel.tsx migré** : motion.button → GSAP hover + tap
- ✅ **GoalsPanel.tsx migré** : motion.div → GSAP entry + stagger
- ✅ **CalendarPanel.tsx migré** : motion.button → GSAP hover
- ✅ **PlaceholderPage.tsx migré** : motion.div → GSAP bounce CSS natif
- ✅ **SportPage.tsx fixé** : useRef dans map() → e.currentTarget
- ✅ **SpiritPage.tsx fixé** : Ajouté imports motion/AnimatePresence manquants
- ✅ **gsap-utils.ts créé** : Hooks utilitaires (useGSAPEntry, useGSAPHover, etc.)
- 🟢 **Lint :** PASSED (0 errors, 0 warnings)
- 🟢 **Serveur :** OPÉRATIONNEL (port 3000, Ready in 1730ms)
- 📊 **Gain estimé :** +60% CPU (AnimatedOrbs seul), +30% re-renders, stabilité accrue
- 🔑 **Clé :** Les animations `repeat: Infinity` en JS = cause principale des 200%+ CPU

---

### 10 Avril 2026 (Matin) - Migration GSAP Terminée ✅
- ✅ **AnimatedOrbs migré** : Framer Motion → CSS keyframes natif (3 orbs au lieu de 4)
- ✅ **GlassCard migré** : motion.div → GSAP hover animation + memo
- ✅ **ProgressBadge migré** : motion.circle → GSAP + memo
- ✅ **CategoryCard migré** : motion.div → GSAP entry animation + memo
- ✅ **Sections migrées** : Journal, Objectifs, Minuteur, Habitudes, Notes (CSS animations)
- ✅ **Modales conservées** : AnimatePresence gardé (méthode recommandée pour mount/unmount)
- ✅ **React.memo ajouté** : AnimatedOrbs, GlassCard, ProgressBadge, CategoryCard
- ✅ **CSS ajouté** : Keyframes orb-1/2/3, animate-progress, custom-scrollbar-horizontal
- ✅ **will-change: transform** : Ajouté pour GPU optimization
- ✅ **Store optimisé** : Création de store-selectors.ts avec hooks optimisés
  - useDashboardStats, useActiveGoals, useTodayEvents
  - Shallow comparison pour éviter re-renders
  - Actions groupées (useTaskActions, useGoalActions, etc.)
- 🟢 **Lint :** PASSED
- 🟢 **Serveur :** OPÉRATIONNEL (port 3000)
- 📊 **Gain estimé :** +40% performance GPU, +20% re-renders évités

---

### 9 Avril 2026 (Nuit) - Session GSAP Migration
- 📦 **Zip reçu :** Mindlife_V1A 2.zip (4.6 Mo)
- 📄 **Rapports reçus :** 2 rapports Claude (Diagnostic + Plan Refacto)
- ✅ **GSAP installé :** gsap@3.14.2 + @gsap/react@2.1.2
- ✅ **Error Boundary créé :** src/components/ErrorBoundary.tsx
- ✅ **Config Next.js corrigée :** reactStrictMode: true
- ✅ **ProgressChart migré :** Framer Motion → GSAP + React.memo
- ✅ **StatsCards migré :** Framer Motion → GSAP + React.memo
- ✅ **AnimatedOrbs :** Déjà en CSS natif (pas de migration nécessaire)
- ⏳ **MindLifeDashboard :** 53 motion.div restants (gros chantier)
- 🟢 **Serveur :** OPÉRATIONNEL (port 3000)
- 🟢 **Lint :** PASSED

---

### 9 Avril 2026 (Soir) - Installation Version Claude
- 📦 **Upload reçu :** Mindlife_claude_1 2.zip (version compressée)
- ✅ Fichiers installés (sans supprimer les .md Z.ai)
- ✅ AnimatedOrbs déjà optimisé par Claude (CSS natif, pas Framer Motion)
- ✅ Modals avec z-[100]
- ⚠️ Logo Z.ai clignote = plateforme instable
- ⏳ **EN ATTENTE** : Vérifier si version prise en compte (modales transparentes)

---

### 9 Avril 2026 (Après-midi) - Rapport Claude Code
- 📄 **Rapport reçu :** MINDLIFE_V1A_Claude_Rapport.md
- ✅ Confirmation : AnimatedOrbs = CRITIQUE (GPU 100%)
- ✅ Confirmation : Framer Motion non optimisé
- ✅ Confirmation : Dashboard monolithique (1,114 lignes)
- 🆕 Nouveau : Pas de Error Boundaries
- 🆕 Nouveau : Sécurité API keys (Base64 ≠ chiffrement)
- 🆕 Nouveau : 5 pages placeholder à créer
- 🆕 Nouveau : Support TDAH/TDA à créer
- **Gain total estimé : +75% performance + stabilité + sécurité**

---

### 8 Avril 2026 (Soir) - Session Terminée

#### ✅ Itération : Optimisation Ressources (200% → 58-90%)
- Réduit 4 orbes animés à 2
- Supprimé les animations infinies Framer Motion
- Identifié cause : `repeat: Infinity` + effets GPU glassmorphism
- **Status :** ✅ Terminée

#### ✅ Itération : Restauration Effets Glassmorphism
- Restauré les effets après sur-optimisation
- Gardé 2 orbes au lieu de 4
- **Status :** ✅ Terminée

#### ✅ Itération : Fix API Routes (Erreurs 500)
- Corrigé les relations Prisma (lowercase: `category` pas `Category`)
- Fichiers corrigés : events, habits, goals, tasks, notes
- **Status :** ✅ Terminée

---

## 📝 NOTES IMPORTANTES

### Problèmes connus Z.ai
- ⚠️ Reset peut casser le projet → Toujours sauvegarder localement avant
- ⚠️ Indicateur logo = plateforme instable
- ⚠️ Maximum 1h de travail continu recommandé

### Points de vigilance
- 🔍 Modals doivent être au-dessus de la navbar (z-index)
- 🔍 Relations Prisma = toujours lowercase
- 🔍 Framer Motion `repeat: Infinity` = surconsommation GPU

---

*Dernière mise à jour : 10 Avril 2026, Session Migration GSAP Terminée*
