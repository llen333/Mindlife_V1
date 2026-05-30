# 📋 CAHIER DES CHARGES - MINDLIFE

## 🚀 RÈGLES DE VERSIONING ET PUSH GIT

### Règle #1 : Pas de fusion, créer des sections séparées
**STRICTEMENT INTERDIT** d'utiliser `--force` ou d'écraser l'historique existant.

### Règle #2 : Numérotation incrémentale des versions
Chaque push doit créer une nouvelle version avec un tag incrémental :
- `MINDLIFE_v1` (première version)
- `MINDLIFE_v2` (deuxième version)
- `MINDLIFE_v3` (troisième version)
- etc.

### Règle #3 : Procédure de push obligatoire
```
1. Vérifier l'état du code (lint, tests)
2. Vérifier la cohérence de la base de données
3. Identifier le prochain numéro de version
4. Commit avec message descriptif
5. Créer le tag incrémental
6. Push normal (sans --force)
7. Push des tags
```

### Règle #4 : Structure de l'historique GitHub
```
main branch (historique complet préservé)
├── MINDLIFE_v1
├── MINDLIFE_v2
├── MINDLIFE_v3
├── MINDLIFE_v4
└── etc.
```

### Règle #5 : Avantages de cette approche
- ✅ Historique complet préservé
- ✅ Possibilité de revenir à n'importe quelle version
- ✅ Chaque version est un snapshot indépendant
- ✅ Traçabilité totale des modifications

---

## 📁 STRUCTURE DU PROJET

### Technologies utilisées
- **Framework** : Next.js 16.1.3 avec App Router
- **Langage** : TypeScript 5
- **Style** : Tailwind CSS 4 + shadcn/ui
- **Base de données** : Prisma ORM + SQLite
- **State Management** : Zustand

### Pages principales
| Page | Description |
|------|-------------|
| Dashboard | Vue d'ensemble avec statistiques |
| Calendrier | Gestion des événements |
| Alimentation | Suivi nutritionnel |
| Sport | Suivi des activités sportives |
| Sommeil | Analyse du sommeil |
| Croissance | Évolution personnelle |
| Profil Alimentaire | Préferences nutritionnelles |
| Esprit | Bien-être mental |
| Paramètres | Configuration et gestion utilisateurs |

### Fonctionnalités clés
- ✅ Multi-utilisateurs (création, suppression, basculement)
- ✅ Toutes sections déployées par défaut
- ✅ Design glassmorphism avec effets néon
- ✅ Calculs automatiques (BMR, TDEE, IMC)
- ✅ Persistance des données utilisateur

---

## 🗄️ GESTION DE LA BASE DE DONNÉES

### Schéma User (utilisateur)
```prisma
model User {
  id                  String   @id
  email               String?
  name                String?
  avatar              String?
  bio                 String?
  phone               String?
  birthDate           DateTime?
  timezone            String   @default("Europe/Paris")
  country             String?
  city                String?
  
  // Corpus
  weight              Float?
  height              Float?
  gender              String?
  
  // Nutrition
  mainGoal            String?
  activityLevel       String?
  dietaryPreferences  String?
  allergies           String?
  favoriteCuisines    String?
  targetCalories      Int?
  proteinTarget       Int?
  carbsTarget         Int?
  fatTarget           Int?
  
  // Sport
  sportLevel          String?
  preferredSports     String?
  sportGoals          String?
  
  // Calculs automatiques
  bmr                 Float?
  tdee                Float?
  imc                 Float?
  
  // Application
  theme               String   @default("system")
  language            String   @default("fr")
  notifications       Json?
  preferences         Json?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relations
  tasks               Task[]
  goals               Goal[]
  notes               Note[]
  habits              Habit[]
  events              Event[]
  categories          Category[]
}
```

### Utilisateur principal
- **ID** : `user-1`
- **Nom** : MindLife User
- **Protection** : Ne peut PAS être supprimé
- **Rôle** : Utilisateur par défaut du système

---

## 🎨 DESIGN SYSTEM

### Couleurs principales
- **Primaire** : Dégradé violet/rose
- **Secondaire** : Cyan/Turquoise
- **Accent** : Orange/Amber
- **Fond** : Sombre avec glassmorphism

### Effets visuels
- Glassmorphism : `backdrop-filter: blur(20px) saturate(180%)`
- Bordures lumineuses : `border: 1px solid rgba(255,255,255,0.1)`
- Ombres colorées : `box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3)`

### Composants UI
- Utiliser exclusivement shadcn/ui
- Icônes : Lucide React
- Animations : Transitions subtiles

---

## ✅ CHECKLIST AVANT CHAQUE PUSH

- [ ] Code compile sans erreur
- [ ] `bun run lint` passe
- [ ] Base de données cohérente
- [ ] Fonctionnalités testées
- [ ] Message de commit descriptif
- [ ] Tag incrémental créé
- [ ] Push sans --force

---

## 📌 VERSIONS EXISTANTES

| Version | Tag | Date | Description |
|---------|-----|------|-------------|
| v1 | MINDLIFE_SETTINGS_OK_2 | Session précédente | Settings multi-utilisateurs |
| v1 | MINDLIFE_SETTING_2 | Session précédente | Alias |

**Prochaine version** : `MINDLIFE_v1` (nouvelle numérotation)

---

*Document créé le : $(date)*
*Dernière mise à jour : Session actuelle*
