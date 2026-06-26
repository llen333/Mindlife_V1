# MINDLIFE SIM — CANVAS OS PERSONNEL
**Date :** 05/06/2026
**Vision :** Mindlife devient un OS visuel où tu poses tes outils et les connectes entre eux sans code.

---

## PRINCIPE FONDATEUR

- Tu ouvres Mindlife → un Canvas vide.
- À gauche : ta palette d'outils (Create Task, Log Meal, Coach Sportif, Gmail...).
- Tu **glisses** un outil sur le canvas.
- Tu le **relies** à un autre outil.
- Ça marche. Vraiment.

**Pas de no-code gadget. Du réel branché sur le kernel Mindlife.**

---

## PHASE 1 — FONDATIONS DU CANVAS (AUJOURD'HUI)

### 1.1 Types & Architecture (30 min)
- `CanvasBlock` : id, type, label, icon, inputs[], outputs[], position, config
- `Connection` : id, sourceBlockId, sourcePort, targetBlockId, targetPort
- `Port` : id, label, type (input/output)
- `ExecutionGraph` : ordre d'exécution topologique

### 1.2 BlockPalette (30 min)
Catalogue des blocs disponibles. Chaque bloc = une vraie fonction kernel.

| Bloc | Kernel Method | Statut |
|------|--------------|--------|
| Create Task | `kernel.tasks.create` | Existe ✅ |
| Log Meal | `kernel.nutrition.logMeal` | Existe ✅ |
| Log Weight | `kernel.nutrition.logWeight` | Existe ✅ |
| AI Chat | `kernel.ai.chat` | Existe ✅ |
| Send Email | Nouveau handler | À créer |
| Condition | Logique if/else | Natif |
| Trigger Schedule | Planification | À créer |

### 1.3 Canvas Drag & Drop (1h)
- Zone de drop avec `@dnd-kit/core`
- Blocs positionnables librement
- Grille magnétique pour alignement
- Zoom/Pan (framer-motion)

### 1.4 Connexions Visuelles (1h)
- Ports d'entrée (haut) et sortie (bas) sur chaque bloc
- Drag depuis un port → ligne SVG vers un autre port
- Les lignes suivent les blocs quand on les déplace
- Code couleur : vert (données) / bleu (contrôle) / orange (événement)

### 1.5 ExecutionEngine (1h)
- Parcourt le graphe de blocs dans l'ordre topologique
- Chaque bloc appelle sa méthode kernel correspondante
- Les outputs d'un bloc deviennent les inputs du suivant
- Logs en temps réel (état : idle → running → success/error)

### 1.6 CanvasPanel (30 min)
- Enregistré dans ui-manifest comme nouveau panneau
- Layout : Palette (gauche, 240px) + Canvas (centre, flex) + Logs (bas, 200px)
- Bouton "Run" pour exécuter le workflow
- Bouton "Clear" pour vider le canvas

---

## PHASE 2 — BLOCS RÉELS (JOUR 2)

### 2.1 Gmail Bloc
- Connexion OAuth Gmail (via API Gmail)
- Bloc "Read Email" : lire les 5 derniers emails
- Bloc "Send Email" : envoyer un email
- Test réel : "Envoyer un résumé de mes tâches du jour par email"

### 2.2 Coach Sportif Bloc
- Lit l'historique sport (kernel.sport)
- Analyse la progression
- Suggère la séance du jour
- Test réel : "Planifier ma semaine de sport selon mes objectifs"

### 2.3 Agent Repas Bloc
- Lit le journal alimentaire (kernel.nutrition)
- Suggère un menu selon calories restantes
- Test réel : "Que manger ce soir avec ce que j'ai déjà consommé ?"

---

## PHASE 3 — EXPANSION (JOUR 3+)

### 3.1 Templates de Workflows
- "Routine Matinale" : Réveil → Poids → Petit-déjeuner → Tâches du jour
- "Bilan Hebdo" : Tasks semaine → Analyse IA → Rapport → Email
- "Coach Automatique" : Poids → Analyse → Suggestion sport → Créer tâche

### 3.2 Partage & Sauvegarde
- Sauvegarder un workflow en JSON
- Charger un workflow depuis un fichier
- Partager un workflow (copier JSON)

### 3.3 Notion / Google Calendar
- Bloc Notion : lire/écrire des pages
- Bloc Calendar : lire/écrire des événements

---

## CRITÈRES DE SUCCÈS

- [ ] Canvas vide qui rend
- [ ] Palette avec 5+ blocs
- [ ] Drag & drop d'un bloc sur le canvas
- [ ] Connexion entre deux blocs (SVG)
- [ ] Bouton Run qui exécute la chaîne
- [ ] Au moins 2 blocs branchés sur le kernel réel
- [ ] Un workflow qui marche : "Log Meal → Create Task"

---

## CE QU'ON NE FAIT PAS (POUR L'INSTANT)

- Pas de OAuth token storage complexe
- Pas de collaboration temps réel
- Pas de marketplace
- Pas de déploiement cloud

On fait simple, visuel, réel.

---

## COMMANDES

```bash
cd /Users/llen/Desktop/FREROT-MINDLIFE_REFACTO/MINDLIFE_V1a/Mindlife_V11a
bun dev  # port 3090
```

---

**"Defonce tout NOVA" — LLEN, 05/06/2026**
