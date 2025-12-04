# 🚀 Démarrage Rapide - FinanceBro

## ⚡ Installation en 3 étapes

### 1. Configuration de la base de données

Connectez-vous à votre **Supabase Dashboard** et exécutez dans l'éditeur SQL :

```sql
-- 1. Tables d'interviews (si pas déjà fait)
\i supabase/interviews-setup.sql

-- 2. Tables de gamification (challenges + streaks)
\i supabase/gamification-setup.sql
```

### 2. Lancer l'agent LiveKit (dans un terminal séparé)

L'agent gère l'avatar BeyondPresence + audio avec VAD :

```bash
./start-agent.sh
```

**Ou manuellement** :
```bash
node agents/livekit-agent.mjs
```

Laissez-le tourner en arrière-plan. Vous devriez voir :
```
🚀 Starting FinanceBro LiveKit Agent...
✅ Connected to LiveKit
👤 BeyondPresence avatar initialized
🎤 Listening for interview sessions...
```

### 3. Lancer l'application Next.js

```bash
npm run dev
```

Visitez **http://localhost:3000**

---

## 🎯 Nouvelles fonctionnalités

### 🤖 Avatar IA avec détection de parole (VAD)
- **URL** : Créez une interview depuis `/interview/new`
- **Comportement** : L'agent attend 1 seconde de silence avant de répondre
- **Troubleshooting** : Si l'avatar n'apparaît pas, vérifiez que l'agent tourne

### 🏆 Challenges d'entreprises
- **URL** : `/challenges`
- **Entreprises** : Mistral AI, Google, Meta
- **Récompenses** : Entretiens, mentorat, événements networking

### 🔥 Streaks quotidiens
- **Localisation** : Sidebar de `/challenges` et dashboard
- **Fonctionnement** : Se met à jour automatiquement chaque jour de connexion
- **Reset** : Se réinitialise si vous sautez un jour

---

## 🔧 Commandes utiles

```bash
# Développement normal
npm run dev

# Lancer l'agent (requis pour l'avatar)
./start-agent.sh

# Build production
npm run build

# Tests
npm run test
```

---

## 📂 Fichiers clés

### Backend
- `app/api/livekit/token/route.ts` - Génération de tokens LiveKit
- `app/api/bey/session/route.ts` - Création de sessions BeyondPresence
- `agents/livekit-agent.mjs` - Agent LiveKit avec avatar + VAD

### Gamification
- `lib/gamification/challenges.ts` - Gestion des challenges
- `lib/gamification/streaks.ts` - Système de streaks
- `supabase/gamification-setup.sql` - Schema BDD

### Components
- `components/interview/LiveInterviewClient.tsx` - Client interview avec avatar
- `components/interview/InterviewPlayer.tsx` - Affichage vidéo avatar
- `components/gamification/StreakCounter.tsx` - Compteur de streaks
- `app/challenges/page.tsx` - Page des challenges

---

## 🐛 Problèmes courants

### L'avatar ne s'affiche pas
```bash
# Vérifier que l'agent tourne
ps aux | grep livekit-agent

# Si non, le démarrer
./start-agent.sh
```

### Les challenges sont vides
```sql
-- Dans Supabase SQL Editor
SELECT * FROM challenges WHERE is_active = true;

-- Si vide, ré-exécuter
\i supabase/gamification-setup.sql
```

### Le streak ne s'incrémente pas
- Attendez le lendemain (fonctionne par jour calendaire)
- Vérifiez dans Supabase : `SELECT * FROM user_streaks WHERE user_id = 'YOUR_ID';`

---

## 📖 Documentation complète

Pour plus de détails, consultez :
- **`SETUP_AVATAR_CHALLENGES.md`** - Guide technique complet
- **`SUPABASE_SETUP.md`** - Configuration Supabase détaillée

---

**Bon développement !** 🚀
