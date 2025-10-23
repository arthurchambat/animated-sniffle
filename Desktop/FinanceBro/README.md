# FinanceBro

Mock interviews finance augmentées (Next.js 15 RC + React 19 RC) avec avatar Beyond Presence, OpenAI Realtime et feedback IA.

## Stack
- Next.js 15.0.0-rc.1 (App Router) + Turbopack dev server
- React 19 RC + TypeScript strict
- Tailwind CSS v4, tailwindcss-animate, clsx, class-variance-authority, tailwind-merge
- Supabase (auth, data), OpenAI Realtime, Beyond Presence S2V avatar
- Recharts, Framer Motion, Sonner notifications, Lucide icons

## Prérequis
- Node.js 20+
- npm 10+

## Installation
```bash
npm install --legacy-peer-deps
```
> Lucide-react n'accepte pas encore la RC React 19 : utilisez l'option ci-dessus.

## Scripts
- `npm run dev` — lance Next.js avec Turbopack
- `npm run build` — build production
- `npm run start` — démarre le serveur production
- `npm run lint` — ESLint via `next lint`

## Variables d'environnement
Copiez `.env.example` vers `.env.local` et remplissez :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(server-only)*
- `OPENAI_API_KEY`
- `BEYOND_PRESENCE_API_KEY`
- `BEYOND_PRESENCE_API_BASE` *(optionnel, défaut = API Beyond Presence officielle)*

## Contenu clé
- `public/flow.excalidraw` — source de vérité des flux “site” et “interview” (nodes & edges).
- `seeds/questions.json` — 30 questions auto-générées par domaine/rôle/niveau.
- `lib/flow.ts` — parseur Excalidraw → routage logique.
- `app/interview/[domain]/[role]/[level]` — scène principale selon le flow interview.
- `app/run/page.tsx` — session temps réel (token OpenAI + Beyond Presence, transcript live, notes, chrono).
- `app/api/*` — endpoints Realtime token, feedback via OpenAI, sessions Supabase, Beyond Presence, suggestions IA.
- `components/header.tsx` — navbar flottante (Framer Motion, menu mobile animée).
- `app/globals.css` — thème finance (gradient, bento & float cards, tokens CSS).

## Notes sur les intégrations
- **OpenAI Realtime** : `/api/token/realtime` signe un token éphémère (`expires_in` < 1 min). Le client `RealtimeSession` simule la connexion et gère toasts + transcript.
- **Beyond Presence** : `lib/bey.ts` centralise la création de session; sans clé API, retour stub pour développer offline.
- **Supabase** : clients `lib/supabase/{client,admin}.ts`. Les routes API basculent en stub si les clés ne sont pas présentes.

## Tests & prochaines étapes
1. Remplir `.env.local` avec vos clés (ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY`).
2. Lancer `npm run dev` et tester le parcours : Home → Pre → Run → Analysis → Feedback.
3. Brancher les vraies API (OpenAI Realtime WebRTC, Beyond Presence) et remplacer les stubs.
4. Ajouter tests d'intégration (Playwright) pour valider démarrage session, upload CV, génération feedback.

## Limites actuelles
- Export PDF basé sur Markdown (Chromium print à implémenter).
- Realtime WebRTC simulé (flux audio/vidéo à brancher via RTCPeerConnection + beyond presence).
- Auth Supabase : UI ok, mais nécessite configuration clé + politiques RLS.

Bon build !
