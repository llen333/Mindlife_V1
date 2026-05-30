# ✅ FONCTIONS À VALIDER — MindLife V11
> Checklist de tests manuels pour valider chaque fonctionnalité
> Mettre à jour après chaque session de test

---

## 🔵 CORE — Données & Persistance

- [x] Création d'un utilisateur → sauvegardé en BDD ?
- [x] Changement d'utilisateur → les données changent bien ?
- [x] Reload de la page → les données sont rechargées depuis BDD ?
- [x] Profil utilisateur → modifications sauvegardées ?

---

## 📋 TÂCHES

- [x] Créer une tâche → apparaît dans la liste ?
- [x] Créer une tâche avec calendrier → événement créé automatiquement ?
- [x] Modifier une tâche → modifications persistées ?
- [x] Supprimer une tâche → disparaît de la liste ET du calendrier ?
- [x] Marquer comme complété → progression mise à jour ?
- [x] Tâche avec chapitres → chapitres sauvegardés ?

---

## 🎯 OBJECTIFS

- [x] Créer un objectif → apparaît dans la liste ?
- [x] Générer des étapes automatiquement → milestones créés ?
- [x] Cocher une étape → progression mise à jour ?
- [x] Sync milestones → calendrier → événements créés ?
- [x] Modifier un objectif → modifications persistées ?
- [x] Supprimer un objectif → événements liés supprimés ?

---

## 📅 CALENDRIER

- [x] Vue jour → événements du jour affichés ?
- [x] Vue semaine → navigation semaine correcte ?
- [x] Vue mois → tous les événements visibles ?
- [x] Créer un événement depuis le calendrier → sauvegardé ?
- [x] Modifier un événement → modifications persistées ?
- [x] Supprimer un événement → disparaît ?

---

## 💪 HABITUDES

- [x] Créer une habitude → apparaît dans la liste ?
- [x] Cocher une habitude → log créé en BDD (bon userId ?) ?
- [x] Streak calculé correctement ?
- [x] Habitude avec fréquence hebdomadaire → fonctionne ?

---

## 📓 JOURNAL

- [x] Créer une entrée → sauvegardée en BDD ?
- [x] Modifier une entrée → modifications persistées ?
- [x] Mood, gratitude, wins, challenges → sauvegardés ?

---

## 📝 NOTES

- [x] Créer une note → sauvegardée ?
- [x] Épingler une note → reste en haut ?
- [x] Archiver une note → disparaît de la liste principale ?
- [x] Recherche dans les notes → fonctionne ?

---

## 🍽️ HUB ALIMENTAIRE

- [x] Profil nutritionnel → sauvegardé ?
- [x] BMR/TDEE calculés automatiquement ?
- [x] Préférences alimentaires → sauvegardées ?
- [x] toggleCuisine → fonctionne ?

---

## 🌙 SOMMEIL

- [x] Saisir une nuit de sommeil → sauvegardé ?
- [x] Vue historique → données affichées ?
- [x] Score de sommeil calculé ?

---

## 🥗 NUTRITION

- [x] Génération de repas IA → fonctionne ?
- [x] Saisir un repas manuellement → calories enregistrées ?
- [x] Total journalier vs objectif → affiché ?

---

## 🧘 SPIRIT / MIND *(SANCTUAIRE)*

- [x] Conversation avec archétype → sauvegardée ?
- [x] Historique des conversations → persisté ?
- [x] Changer d'archétype → nouvelle conversation ?

---

## 🏋️ SPORT *(SANCTUAIRE)*

- [x] Profil sport → sauvegardé ?
- [x] Programme hebdomadaire → créé et sauvegardé ?
- [x] Session d'entraînement → enregistrée ?
- [x] Données biométriques → enregistrées ?

---

## ⚙️ PARAMÈTRES

- [x] Modifier le profil → sauvegardé ?
- [x] Changer de thème → appliqué immédiatement ?
- [x] Changer de langue → appliquée ?
- [x] Créer un nouvel utilisateur → fonctionne ?
- [x] Supprimer un utilisateur → supprimé avec toutes ses données ?

---

## 📊 Suivi des Validations

| Catégorie | Total | Validées | % |
|-----------|-------|----------|---|
| Core | 4 | 4 | 100% |
| Tâches | 7 | 7 | 100% |
| Objectifs | 6 | 6 | 100% |
| Calendrier | 5 | 5 | 100% |
| Habitudes | 4 | 4 | 100% |
| Journal | 3 | 3 | 100% |
| Notes | 4 | 4 | 100% |
| Hub Alimentaire | 4 | 4 | 100% |
| Sommeil | 3 | 3 | 100% |
| Nutrition | 3 | 3 | 100% |
| Spirit | 3 | 3 | 100% |
| Sport | 4 | 4 | 100% |
| Paramètres | 5 | 5 | 100% |
| **TOTAL** | **55** | **55** | **100%** |
