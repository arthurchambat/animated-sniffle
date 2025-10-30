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
- `npm run test` — tests unitaires (Vitest + Testing Library)

## Variables d'environnement
Copiez `.env.example` vers `.env.local` et remplissez :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(server-only)*
- `OPENAI_API_KEY`
- `BEYOND_PRESENCE_API_KEY`
- `BEYOND_PRESENCE_API_BASE` *(optionnel, défaut = API Beyond Presence officielle)*
- `NEXT_PUBLIC_ENABLE_AUTH_MOCK` *(optionnel : `true` pour simuler une session en développement si Supabase n'est pas configuré)*

## Contenu clé
- `public/flow.excalidraw` — source de vérité des flux “site” et “interview” (nodes & edges).
- `seeds/questions.json` — 30 questions auto-générées par domaine/rôle/niveau.
- `lib/flow.ts` — parseur Excalidraw → routage logique.
- `app/interview/[domain]/[role]/[level]` — scène principale selon le flow interview.
- `app/run/page.tsx` — session temps réel (token OpenAI + Beyond Presence, transcript live, notes, chrono).
- `app/api/*` — endpoints Realtime token, feedback via OpenAI, sessions Supabase, Beyond Presence, suggestions IA.
- `app/(public)` — landing publique narrative (HeroVideoPinned, sections épinglées, rail de chapitres).
- `app/(app)/home` — landing connectée personnalisée, actions rapides & feedbacks récents.
- `app/auth` — accès unifié avec onglets login / création de compte, wizard en 2 étapes.
- `components/marketing/*` — navigation publique, chapitres, sections Pricing/Team/Contact & CTA finale.
- `components/auth/*` — AuthTabs, SignIn, SignUpWizard, dropzone PDF & composants UI.
- `lib/scroll/*` — hooks smooth scroll (`useLenis`) et observer de sections (`useSectionObserver`).
- `app/components/shared/Navbar.tsx` — navigation sticky adaptative selon la session utilisateur.
- `middleware.ts` — redirection / → /home quand l’utilisateur est authentifié (et blocage inverse).
- `app/globals.css` — thème finance (gradient, bento & float cards, tokens CSS).

## Accueil public vs connecté
- `/` : landing marketing narratif (vidéo takeover, sections épinglées, rail de progression) accessible sans connexion.
- `/auth` : onglets Se connecter / Créer un compte, wizard inscription en 2 étapes avec persistance locale.
- `/home` : hub connecté (CTA produit, feedbacks, panneaux de progression) protégé par Supabase.
- `Navbar` détecte la session et ajuste CTA + avatar; fallback mock activable via `NEXT_PUBLIC_ENABLE_AUTH_MOCK=true`. `NavbarPublic` écoute les événements de chapitres pour changer de thème et surligner la section active.
- Middleware redirige un utilisateur connecté qui visite `/` vers `/home` et renvoie un invité de `/home` vers `/`.

## Remplacer la vidéo du héros
1. Déposez votre fichier dans `public/videos/finance-hero.mp4` (format MP4 optimisé web, idéalement <10 Mo).
2. Ajoutez un poster statique (image 16:9) dans `public/images/hero-poster.svg` ou remplacez-le par votre visuel.
3. La vidéo est chargée via `next/video` (`HeroVideoPinned`), autoplay/muted/loop avec fallback image quand `prefers-reduced-motion` ou `prefers-reduced-data` est actif.
4. Pour désactiver temporairement la vidéo, remplacez-la par une image dans `HeroVideoPinned` ou supprimez le fichier vidéo.

## Scroll narratif & fallbacks
- Les sections sont épinglées via `position: sticky` + `scroll-snap` (pas de dépendance GSAP) pour garantir 60 fps.
- `useLenis` active Lenis uniquement si l’utilisateur n’a pas demandé de réduction de mouvement/data; sinon le scroll reste natif.
- `useSectionObserver` pilote la barre latérale et la navbar via `IntersectionObserver` (tests unitaires inclus).
- `ChaptersRail` reste desktop-only (>1024px) pour limiter le bruit sur mobile, où le menu burger reprend les ancres.

## Auth & profils Supabase
- Auth email/password Supabase (`auth.signUp` étape 1) puis enrichissement optionnel étape 2.
- Table `profiles` (RLS activé) remplie dès l’étape 1 avec `id = auth.users.id` + champs identité.
- Étape 2 : upload CV (`bucket cv/cv/${userId}.pdf`), LinkedIn, école, secteur (`sector_enum`), referral (`referral_enum`).
- Les policies Supabase doivent limiter SELECT/INSERT/UPDATE à `auth.uid() = id`. Le bucket `cv` doit être privé (INSERT autorisé si chemin commence par `cv/${auth.uid()}`).
- Les données de l’étape 2 sont sauvegardées dans `localStorage` (`financebro-signup-step2`) pour permettre une reprise ultérieure ; elles sont vidées une fois l’étape terminée ou passée.

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
