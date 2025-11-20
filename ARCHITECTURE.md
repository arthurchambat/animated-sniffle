# 🎯 FinanceBro - Architecture Complète

## 📚 Vue d'ensemble

FinanceBro est une plateforme de préparation aux entretiens en finance avec :
- 🤖 **Avatar IA** : Interviewer virtuel avec BeyondPresence + LiveKit
- 🏆 **Challenges** : Compétitions sponsorisées par des entreprises (Mistral, Google, Meta)
- 🔥 **Streaks** : Système de gamification pour l'engagement quotidien

---

## 🏗️ Architecture Technique

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Interview   │  │  Challenges  │  │   Streaks    │         │
│  │   Player     │  │     Page     │  │   Counter    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │           LiveKit Components React               │          │
│  └──────────────┬───────────────────────────────────┘          │
│                 │                                               │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  /api/livekit/token      │  /api/bey/session                    │
│  ├─ Generate LiveKit     │  ├─ Create BeyondPresence session    │
│  │  access token         │  │                                    │
│  └─ Return to client     │  └─ Return session ID + LiveKit info │
└──────────┬─────────────────────────┬────────────────────────────┘
           │                         │
┌──────────▼─────────────────────────▼────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌───────────────────┐                   │
│  │   LiveKit Cloud  │  │ BeyondPresence AI │                   │
│  │   (WebRTC)       │  │   (Avatar API)    │                   │
│  └────────┬─────────┘  └─────────┬─────────┘                   │
│           │                       │                             │
│           └───────────┬───────────┘                             │
│                       │                                         │
│           ┌───────────▼──────────┐                              │
│           │  LiveKit Agent Node  │                              │
│           │  ├─ OpenAI Realtime  │                              │
│           │  ├─ BeyondPresence   │                              │
│           │  └─ VAD Detection    │                              │
│           └──────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   PostgreSQL    │  │   Auth (Users)   │  │  Storage (CV)  │ │
│  │  ├─ interviews  │  │  └─ RLS Policies │  │                │ │
│  │  ├─ challenges  │  │                  │  │                │ │
│  │  ├─ streaks     │  │                  │  │                │ │
│  │  └─ feedback    │  │                  │  │                │ │
│  └─────────────────┘  └──────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow Détaillés

### 1. Interview avec Avatar

```
┌─ User ─────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Visite /interview/new → Remplit le formulaire              │
│  2. Clique "Start Interview"                                   │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Frontend (Next.js)                           │
│                                                                 │
│  3. POST /interview/create → Supabase                           │
│     └─ Créer interview_session (status: 'live')                │
│                                                                 │
│  4. GET /api/livekit/token                                      │
│     └─ Reçoit access token LiveKit                             │
│                                                                 │
│  5. POST /api/bey/session                                       │
│     └─ Reçoit session ID BeyondPresence                        │
│                                                                 │
│  6. Connect to LiveKit Room                                     │
│     └─ <LiveKitRoom token={token} serverUrl={...} />           │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  LiveKit Agent (Node.js)                        │
│                                                                 │
│  7. Détecte nouveau participant                                 │
│     └─ waitForParticipant()                                     │
│                                                                 │
│  8. Initialise BeyondPresence Avatar                            │
│     └─ beyPresence.start(room)                                  │
│                                                                 │
│  9. Configure OpenAI Realtime avec VAD                          │
│     └─ silenceDurationMs: 1000 (attend 1 sec)                  │
│                                                                 │
│  10. Écoute l'audio utilisateur                                 │
│      └─ Transcrit avec Whisper                                  │
│      └─ VAD détecte fin de parole                               │
│      └─ Envoie à GPT-4o                                         │
│                                                                 │
│  11. Génère réponse + audio                                     │
│      └─ TTS (text-to-speech)                                    │
│      └─ Envoie audio à BeyondPresence pour lip-sync             │
│      └─ Stream vers LiveKit Room                                │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  User voit/entend                               │
│                                                                 │
│  12. Avatar vidéo avec lèvres synchronisées                     │
│  13. Audio clair de la réponse de l'IA                          │
│  14. Pas d'interruption si l'user parle                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Challenges & Leaderboard

```
┌─ User ─────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Visite /challenges                                          │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Frontend (Next.js)                           │
│                                                                 │
│  2. getActiveChallenges()                                       │
│     └─ Supabase: SELECT * FROM challenges WHERE is_active=true  │
│                                                                 │
│  3. Pour chaque challenge:                                      │
│     └─ getChallengeParticipation(challengeId, userId)           │
│        └─ Vérifier si déjà rejoint                              │
│                                                                 │
│  4. Affiche 4 challenges:                                       │
│     ├─ Mistral AI: AI-Powered Financial Analysis                │
│     ├─ Google: Market Sizing Challenge                          │
│     ├─ Meta: VR Commerce Valuation                              │
│     └─ Mistral AI: LBO Model Sprint                             │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│              User clique "Start Challenge"                      │
│                                                                 │
│  5. joinChallenge(challengeId)                                  │
│     └─ INSERT INTO challenge_participants                       │
│        (challenge_id, user_id, status='in_progress')            │
│                                                                 │
│  6. Redirect to challenge detail page (TODO)                    │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│              User complète le challenge                         │
│                                                                 │
│  7. Soumet la solution + score                                  │
│     └─ updateChallengeParticipation()                           │
│        └─ UPDATE challenge_participants                         │
│           SET status='completed', score=X, completed_at=NOW()   │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                     Leaderboard Update                          │
│                                                                 │
│  8. getGlobalLeaderboard(limit=5)                               │
│     └─ SELECT * FROM challenge_participants                     │
│        WHERE status='completed'                                 │
│        ORDER BY score DESC, time_taken_seconds ASC              │
│                                                                 │
│  9. Affiche classement en temps réel                            │
│     └─ #1 🥇, #2 🥈, #3 🥉, etc.                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Streaks Quotidiens

```
┌─ User ─────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Se connecte à l'app (n'importe quelle page)                 │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    App Layout                                   │
│                                                                 │
│  2. <ActivityTracker /> s'initialise                            │
│     └─ useActivityTracker() hook                                │
│                                                                 │
│  3. logDailyActivity("page_visit")                              │
│     └─ Supabase RPC: log_user_activity()                        │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  Supabase PostgreSQL                            │
│                                                                 │
│  4. INSERT INTO daily_activity_log                              │
│     (user_id, activity_date=CURRENT_DATE)                       │
│     ON CONFLICT DO NOTHING  ← Pas de doublon par jour           │
│                                                                 │
│  5. TRIGGER update_user_streak()                                │
│     └─ IF last_activity_date = hier → streak++                  │
│     └─ IF last_activity_date < hier → streak = 1 (reset)        │
│     └─ UPDATE longest_streak si nécessaire                      │
│                                                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  Frontend Update                                │
│                                                                 │
│  6. <StreakCounter /> re-fetch getUserStreak()                  │
│     └─ SELECT * FROM user_streaks WHERE user_id=...             │
│                                                                 │
│  7. Affiche:                                                    │
│     ├─ "Current Streak: 5 days 🔥"                              │
│     ├─ "Best: 12 days"                                          │
│     └─ Animation flamme si streak > 0                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma de Base de Données

```sql
┌─────────────────────────────────────────────────────────────────┐
│                       auth.users                                │
│  (Géré par Supabase Auth)                                       │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ user_id FK
              │
    ┌─────────┴────────┬─────────────┬─────────────┬──────────────┐
    │                  │             │             │              │
┌───▼──────────┐  ┌────▼─────────┐  │  ┌──────────▼──┐  ┌────────▼────────┐
│ interviews   │  │  challenges  │  │  │ user_streaks │  │ daily_activity  │
│              │  │              │  │  │              │  │      _log       │
│ - id         │  │ - id         │  │  │ - id         │  │ - id            │
│ - user_id    │  │ - company    │  │  │ - user_id    │  │ - user_id       │
│ - title      │  │ - title      │  │  │ - current    │  │ - activity_date │
│ - status     │  │ - difficulty │  │  │ - longest    │  │ - activity_type │
│ - cv_path    │  │ - reward     │  │  │ - last_date  │  └─────────────────┘
└──────────────┘  │ - is_active  │  │  └──────────────┘
                  └────┬─────────┘  │
                       │            │
                       │            │ user_id FK
                       │            │
                       │  ┌─────────▼───────────┐
                       │  │ challenge_          │
                       │  │   participants      │
                       │  │                     │
                       └──┤ - id                │
                          │ - challenge_id (FK) │
                          │ - user_id (FK)      │
                          │ - status            │
                          │ - score             │
                          │ - time_taken        │
                          └─────────────────────┘
```

---

## 📦 Structure des Fichiers

```
FinanceBro/
├── app/
│   ├── (app)/                      # Routes protégées
│   │   ├── layout.tsx              # Layout avec ActivityTracker
│   │   ├── dashboard/
│   │   ├── interview/
│   │   │   ├── new/
│   │   │   └── live/[sessionId]/
│   │   └── ...
│   ├── challenges/
│   │   └── page.tsx                # Page des challenges 🏆
│   ├── api/
│   │   ├── livekit/
│   │   │   └── token/route.ts      # Generate LiveKit tokens
│   │   └── bey/
│   │       └── session/route.ts    # Create avatar sessions
│   └── ...
│
├── agents/
│   └── livekit-agent.mjs           # 🤖 Agent IA avec avatar
│
├── components/
│   ├── app/
│   │   └── ActivityTracker.tsx     # Auto-log activité
│   ├── interview/
│   │   ├── LiveInterviewClient.tsx # Client LiveKit
│   │   └── InterviewPlayer.tsx     # Affichage vidéo
│   └── gamification/
│       ├── StreakCounter.tsx       # 🔥 Compteur streaks
│       └── Leaderboard.tsx         # 🏆 Classement
│
├── lib/
│   ├── bey.ts                      # Helper BeyondPresence
│   ├── gamification/
│   │   ├── types.ts
│   │   ├── challenges.ts           # CRUD challenges
│   │   ├── streaks.ts              # Gestion streaks
│   │   └── useActivityTracker.ts   # Hook tracking
│   └── ...
│
├── supabase/
│   ├── interviews-setup.sql        # Tables interviews
│   └── gamification-setup.sql      # Tables gamification 🆕
│
├── start-agent.sh                  # Script lancement agent
├── QUICKSTART.md                   # Guide démarrage rapide
├── SETUP_AVATAR_CHALLENGES.md      # Doc technique complète
├── CHANGELOG_AVATAR_CHALLENGES.md  # Résumé modifications
└── EXAMPLES_API_USAGE.md           # Exemples code
```

---

## 🚀 Commandes de Développement

```bash
# Installation
npm install

# Setup BDD (dans Supabase Dashboard)
# 1. Exécuter supabase/interviews-setup.sql
# 2. Exécuter supabase/gamification-setup.sql

# Lancer l'application
npm run dev                    # Next.js sur :3000

# Lancer l'agent avatar (terminal séparé)
npm run agent                  # OU ./start-agent.sh

# Lancer app + agent ensemble
npm run dev:full               # (nécessite concurrently)

# Build production
npm run build
npm run start

# Tests
npm run test
```

---

## 🔐 Variables d'Environnement Requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LiveKit
LIVEKIT_URL=wss://...
LIVEKIT_REST_URL=https://...
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...
LIVEKIT_AGENT_NAME=finance-coach-avatar

# BeyondPresence (Avatar)
BEYOND_PRESENCE_API_KEY=sk-...
BEYOND_PRESENCE_API_BASE=https://api.beyondpresence.ai/v1
BEY_AVATAR_ID=2ed7477f-...

# OpenAI
OPENAI_API_KEY=sk-proj-...
```

---

## 📊 Métriques & KPIs

### Engagement
- **Daily Active Users** : Users avec `daily_activity_log` aujourd'hui
- **Streak Retention** : % users avec streak ≥ 7 jours
- **Challenge Completion Rate** : Complétés / Rejoints

### Performance
- **Avatar Response Time** : Temps entre fin parole user et début réponse IA
- **VAD Accuracy** : % fois où VAD détecte correctement la fin de parole
- **Leaderboard Load Time** : Temps pour charger top 10

### Business
- **Challenges Joined** : Total participations
- **Interview to Reward Conversion** : % users qui gagnent une récompense
- **Retention Week 2** : % users qui reviennent après 7 jours

---

## 🎓 Concepts Clés

### Voice Activity Detection (VAD)
- Détecte quand l'utilisateur **commence** et **termine** de parler
- `threshold: 0.5` = sensibilité (0-1)
- `silenceDurationMs: 1000` = attend 1 sec de silence avant de considérer "fini"
- Empêche l'IA d'interrompre l'utilisateur

### Row Level Security (RLS)
- Politique Supabase pour sécuriser les données
- `auth.uid()` = ID de l'utilisateur connecté
- Ex: `USING (auth.uid() = user_id)` → User ne voit que ses données

### LiveKit Room
- "Room" = espace virtuel pour WebRTC
- Chaque interview = 1 room unique (room ID = session ID)
- Participants : User + Agent IA

### Trigger SQL
- Code qui s'exécute automatiquement après INSERT/UPDATE
- Ex: `update_user_streak()` s'exécute après chaque `daily_activity_log` insert

---

## 🐛 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| Avatar ne s'affiche pas | Vérifier que `npm run agent` tourne |
| Audio décalé | Redémarrer l'agent, vérifier OPENAI_API_KEY |
| IA interrompt | Augmenter `silenceDurationMs` dans agent |
| Challenges vides | Ré-exécuter `gamification-setup.sql` |
| Streak pas incrémenté | Vérifier trigger avec `SELECT * FROM pg_trigger` |
| Token LiveKit expiré | Régénérer token (expiration par défaut 1h) |

---

## 📚 Ressources

### Documentation Externe
- [LiveKit Docs](https://docs.livekit.io/)
- [BeyondPresence API](https://docs.beyondpresence.ai/)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Supabase Docs](https://supabase.com/docs)

### Documentation Projet
- `QUICKSTART.md` - Démarrer en 5 minutes
- `SETUP_AVATAR_CHALLENGES.md` - Setup détaillé
- `EXAMPLES_API_USAGE.md` - Exemples de code
- `CHANGELOG_AVATAR_CHALLENGES.md` - Historique des changements

---

**Happy Coding! 🚀**
