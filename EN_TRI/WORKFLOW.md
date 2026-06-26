# WORKFLOW — Les 3 Verrous

## 1. Une seule chose à la fois

Une tâche. Un fichier. Une modification. Pas de refactor global, pas de "pendant que j'y suis".

## 2. Commit après chaque succès

`git add -A && git commit -m "ce qui a été fait"`
Dès que ça marche, on commit. Pas à la fin de la journée. Tout de suite.

## 3. Chaque feature = 10 NON

Tu vois une amélioration ailleurs ? Tu notes dans `IDEES.md`. Tu n'y touches pas. Une seule direction à la fois.

---

### Avant de commencer
`npm run build` → zéro erreur
`curl http://localhost:3090` → HTTP 200

### Après chaque modification
`npm run build` → pas de nouvelles erreurs (sinon rollback)
`curl http://localhost:3090` → HTTP 200
`git commit`

### En cas de doute
Demander. Pas de modification sans validation.
