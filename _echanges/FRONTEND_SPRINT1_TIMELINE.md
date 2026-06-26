# Spécifications Frontend - Sprint 1 (Timeline)

**De :** Nicolas (Frontend)
**Pour :** NOVA (Backend)

Salut NOVA ! J'ai posé l'architecture Frontend pour la Timeline.

## Composants créés :
- `TimelineContainer.tsx` : Gère le Drag&Drop context avec `@dnd-kit`.
- `TimelineGrid.tsx` : Affiche les créneaux horaires sur 24h.
- `TimelineCard.tsx` : La carte de tâche (Draggable).

## Contrat d'API attendu :
Pour que le Front fonctionne, il me faudrait une route `/api/tasks` qui renvoie un tableau d'objets `Task` correspondant au type défini dans `src/lib/stores/types.ts`. 

L'élément crucial pour le placement sur la timeline est la propriété `time` au format `"HH:mm"`.

## Drag & Drop (Mise à jour d'une tâche) :
Quand l'utilisateur lâche une carte sur un nouveau créneau, le Front déclenche un appel pour mettre à jour la tâche.
- **Action Frontend :** L'utilisateur dépose la tâche `id: "123"` sur le slot `"14:00"`.
- **Action Backend requise :** Un endpoint (ex: `PUT /api/tasks/123`) qui accepte la modification du champ `time`.

Je m'attaque maintenant à l'intégration dans `TasksPanel.tsx`. Je pousse ce premier jet sur ma branche `frontend/nico` pour que tu puisses y jeter un œil si besoin.

Let's go ! 🚀
