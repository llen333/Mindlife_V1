# Audit Sécurité — Mindlife v1.1.0

**Date :** 04/06/2026  
**Périmètre :** `/src/app/api/` (60+ routes), `/src/lib/`, Prisma, next-auth  
**Méthode :** Analyse statique du code source

---

## Résumé

| Niveau | Nombre |
|--------|--------|
| Critique | 2 |
| Élevé | 3 |
| Moyen | 2 |
| Faible | 2 |

---

## Critique

### C1 — Aucune authentification sur les routes API

**Fichier :** Tous les fichiers `src/app/api/*/route.ts`  
**Description :** Aucune route API ne vérifie l'identité du caller. `userId` est fourni par le client et accepté sans validation.

```typescript
// Exemple dans tasks/route.ts
const userId = searchParams.get('userId') || 'mindlife-user';
```

**Risque :** Tout client peut lire/écrire les données de n'importe quel utilisateur.  
**Remédiation :** Ajouter `middleware.ts` avec validation de session next-auth, ou token HMAC en en-tête `X-Mindlife-Token`.

---

### C2 — Aucune validation des entrées utilisateur

**Fichier :** `src/app/api/*/route.ts` (40+ routes)  
**Description :** Les corps de requêtes sont passés directement à Prisma sans validation `zod` ni sanitization.

```typescript
const body = await request.json();
// body.title, body.description, etc. sont utilisés sans validation
```

**Risque :** Injection de données malformées, pollution de la BDD, crash silencieux.  
**Remédiation :** Ajouter des schémas `zod` sur chaque route POST/PUT.

---

## Élevé

### E1 — `dangerouslySetInnerHTML` sur contenu IA

**Fichier :** `src/components/youtube/YouTubeAISection.tsx:321`  
**Description :** Le rendu HTML issu de l'IA utilise `dangerouslySetInnerHTML` sans sanitization.

```tsx
<div dangerouslySetInnerHTML={{ __html: analysis }} />
```

**Risque :** XSS si l'IA génère du JavaScript malveillant.  
**Remédiation :** Ajouter DOMPurify ou `sanitize-html` avant le rendu.

---

### E2 — Clé API Z.ai dans `.env` commitée

**Fichier :** `.env` (présent dans le dépôt)  
**Description :** La clé API Z.ai est stockée dans `.env` qui est commitée (pas de `.gitignore`).

```
ZAI_API_KEY="9fd42f5cf2df48f4955f77a48519150a.Hd427mUP8G9YWYMe"
```

**Risque :** Exposition de la clé sur GitHub.  
**Remédiation :** Ajouter `.env` à `.gitignore`, utiliser `.env.example` à la place.

---

### E3 — Aucun rate limiting

**Description :** Aucune protection contre les abus. 1000 requêtes/s possibles sans blocage.  
**Remédiation :** Utiliser le `KernelIPC` nouvellement créé pour implémenter un rate limiter dans le middleware.

---

## Moyen

### M1 — Aucun en-tête de sécurité HTTP

**Description :** Pas de CSP, pas de X-Frame-Options, pas de HSTS.  
**Fichier :** `next.config.ts`, `middleware.ts` (inexistant)  
**Remédiation :** Ajouter les en-têtes dans `next.config.ts` :

```typescript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

---

### M2 — `NEXT_PUBLIC_*` expose des URLs

**Fichier :** `.env.local`  
**Description :** `NEXT_PUBLIC_OPENAI_BASE_URL` est accessible côté client.

**Risque :** Fuite d'information sur les providers AI utilisés.  
**Remédiation :** Renommer sans le préfixe `NEXT_PUBLIC_` si non nécessaire côté client.

---

## Faible

### F1 — CORS Socket.IO large

**Fichier :** `mini-services/socket-server/`  
**Description :** Le serveur Socket.IO autorise toutes les origines.

**Risque :** Faible car les sockets ne gèrent pas de données sensibles.  
**Remédiation :** Restreindre aux origines connues.

---

### F2 — Pas de validation des IDs

**Description :** Les IDs (`task-xxx`, `event-xxx`) sont générés côté client sans vérification.  
**Remédiation :** Vérifier que les IDs au format attendu ou générés côté serveur.

---

## Recommandations immédiates

1. Ajouter `middleware.ts` avec validation de session (next-auth ou token HMAC)
2. Ajouter des schémas `zod` sur toutes les routes POST/PUT
3. Fixer le `dangerouslySetInnerHTML` avec DOMPurify
4. Ajouter `.env` au `.gitignore`
5. Implémenter le rate limiting via `KernelIPC` dans le middleware

## Score de sécurité global

```
Authentification    ░░░░░░░░░░  0/10
Validation         ░░░░░░░░░░  0/10
Rate Limiting      ░░░░░░░░░░  0/10
Headers sécurité   ░░░░░░░░░░  0/10
Sanitization XSS   ██████░░░░  6/10
SQL Injection      ██████████  10/10
Gestion secrets    ██████░░░░  6/10
```

**Score global : 3/10** — Nécessite des actions correctives avant déploiement.
