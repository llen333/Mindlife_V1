# 🧠 MÉMOIRE PARTAGÉE - Setup

## Le concept

Tous tes assistants (OpenClaw, GoClaw, Agent Zero, Claude/NICO) utilisent les MÊMS fichiers :

```
IA_WORK/
├── MEMORY.md          # Mémoire long terme (décisions, projets, leçons)
├── USER.md            # Qui tu es (profil, préférences)
├── AGENTS.md          # Règles communes
└── memory/
    └── 2025-01-XX.md  # Notes du jour
```

---

## Comment ça marche

### 1. MEMORY.md (Long terme)
- Tous les agents lisent au démarrage
- Tous peuvent écrire (décisions, événements importants)
- Format court = moins de tokens

### 2. USER.md (Profil)
- Identique pour tous
- Préférences de communication
- Setup technique

### 3. memory/YYYY-MM-DD.md (Quotidien)
- Notes du jour
- Ce qui s'est passé
- À retenir

---

## Règles pour économiser les tokens

| Règle | Pourquoi |
|-------|----------|
| Fichiers < 50 lignes | Moins de tokens à lire |
| Format bullet points | Plus dense |
| Maj hebdomadaire | Pas de surcharge |
| Supprimer l'obsolète | Pas de bruit |

---

## Structure MEMORY.md optimisée

```markdown
# MEMORY.md

## Profil
- Prénom: Llen
- TDAH: Oui
- Frérot: NICO

## Projets actifs
- MindLife (Next.js)

## Setup LLM
- Z.ai: GLM 4.7 Flash X

## Derniers événements
- [2025-01-XX] Setup propre OpenClaw/GoClaw
- [2025-01-XX] Configuration workspace

## Leçons apprises
- reasoning: false pour glm-4.7-flashx
- tools.profile: "none" évite les boucles
```

---

## Pour Agent Zero

Dans la config d'Agent Zero, pointer vers :
- Workspace: `/Users/llen/desktop/IA_WORK`
- Lire MEMORY.md au démarrage
- Écrire dans memory/YYYY-MM-DD.md

---

## Avantages

✅ Un seul endroit = cohérence
✅ Pas de duplication
✅ Tu contrôles tout
✅ Zéro coût externe
✅ Fonctionne offline

---

## À faire demain

1. Créer MEMORY.md structuré
2. Configurer OpenClaw pour lire/écrire
3. Configurer GoClaw pour lire/écrire
4. Configurer Agent Zero pour lire/écrire
5. Tester la cohérence
