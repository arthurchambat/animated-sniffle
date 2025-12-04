# Guide de Configuration - Avatar, Challenges & Streaks

## 🎯 Résumé des améliorations

### ✅ 1. Avatar BeyondPresence + Audio LiveKit
- **Problème résolu** : L'avatar ne se connectait pas au canal audio LiveKit
- **Solution** : Intégration complète avec détection VAD (Voice Activity Detection)
- **Résultat** : L'agent attend maintenant que l'utilisateur termine de parler avant de répondre

### ✅ 2. Système de Challenges
- **Ajouté** : Challenges sponsorisés par Mistral AI, Google et Meta
- **Fonctionnalités** : Classement, récompenses (entretiens, mentorat), suivi de progression
- **Base de données** : Tables Supabase avec RLS activé

### ✅ 3. Système de Streaks
- **Ajouté** : Compteur de jours consécutifs de connexion
- **Fonctionnalités** : Streak actuel, record personnel, suivi automatique
- **Gamification** : Encourage l'engagement quotidien

---

## 📦 Étapes d'installation

### 1. Configuration de la base de données Supabase

#### A. Exécuter les scripts SQL

Connectez-vous à votre dashboard Supabase et exécutez les scripts suivants dans l'éditeur SQL :

1. **Tables d'interviews** (déjà fait normalement) :
   ```bash
   supabase/interviews-setup.sql
   ```

2. **Tables de gamification** (NOUVEAU) :
   ```bash
   supabase/gamification-setup.sql
   ```

Cela créera les tables suivantes :
- `challenges` - Les challenges d'entreprises
- `challenge_participants` - Participation aux challenges
- `user_streaks` - Streaks des utilisateurs
- `daily_activity_log` - Log des activités quotidiennes

#### B. Vérifier les données seed

Le script `gamification-setup.sql` insère automatiquement 4 challenges :
- **Mistral AI** : AI-Powered Financial Analysis (Hard)
- **Google** : Market Sizing Challenge (Medium)
- **Meta** : VR Commerce Valuation Model (Hard)
- **Mistral AI** : LBO Model Sprint (Medium)

Vérifiez dans Supabase → Table Editor → `challenges`

---

### 2. Configuration de l'agent LiveKit

#### A. Installer les dépendances de l'agent

L'agent utilise Node.js avec les packages LiveKit. Vérifiez que vous avez :

```json
{
  "@livekit/agents": "^1.0.15",
  "@livekit/agents-plugin-bey": "^1.0.5",
  "@livekit/agents-plugin-openai": "^1.0.15",
  "@livekit/rtc-node": "^0.13.20"
}
```

Ces packages sont déjà dans votre `package.json`.

#### B. Lancer l'agent LiveKit

Dans un terminal séparé, lancez l'agent :

```bash
node agents/livekit-agent.mjs
```

L'agent va :
1. Se connecter à votre serveur LiveKit
2. Initialiser l'avatar BeyondPresence
3. Configurer OpenAI Realtime avec VAD
4. Attendre les interviews en cours

**Note importante** : L'agent doit tourner en background pour que l'avatar fonctionne pendant les interviews.

---

### 3. Démarrer l'application

```bash
npm run dev
```

Puis visitez :
- **Challenges** : http://localhost:3000/challenges
- **Interview avec avatar** : Créez une nouvelle interview depuis `/interview/new`

---

## 🔧 Configuration des variables d'environnement

Vérifiez que votre `.env` contient toutes les clés nécessaires :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tzosvmhckyefiksopykt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# BeyondPresence (Avatar)
BEYOND_PRESENCE_API_KEY=sk-NGbN7scGUKy5ZwaMs0dPD9tbHITsT4y-UsuL42l1XP0
BEYOND_PRESENCE_API_BASE=https://api.beyondpresence.ai/v1
BEY_AVATAR_ID=2ed7477f-3961-4ce1-b331-5e4530c55a57

# LiveKit (WebRTC)
LIVEKIT_URL=wss://financebro-h5cfu3wl.livekit.cloud
LIVEKIT_REST_URL=https://financebro-h5cfu3wl.livekit.cloud
LIVEKIT_API_KEY=APIm4bvadgGonBB
LIVEKIT_API_SECRET=tCCSLeYpiwRLMYBHSco1bmwIMqucbTfuHLhD6fq06ZoA
LIVEKIT_AGENT_NAME=finance-coach-avatar

# OpenAI (pour l'agent)
OPENAI_API_KEY=...
```

---

## 🧪 Tests à effectuer

### Test 1 : Avatar + Audio synchronisé

1. Créez une nouvelle interview
2. Vérifiez que :
   - ✅ L'avatar BeyondPresence apparaît dans la vidéo
   - ✅ L'agent attend que vous finissiez de parler (silence de 1 sec)
   - ✅ Les lèvres de l'avatar bougent avec l'audio
   - ✅ Pas d'interruptions pendant que vous parlez

**Troubleshooting** :
- Si l'avatar n'apparaît pas : Vérifiez que l'agent `livekit-agent.mjs` tourne
- Si l'audio n'est pas synchro : Vérifiez les logs de l'agent pour des erreurs BeyondPresence
- Si l'agent coupe la parole : Augmentez `silenceDurationMs` dans l'agent (actuellement 1000ms)

### Test 2 : Challenges

1. Visitez `/challenges`
2. Vérifiez que :
   - ✅ Les 4 challenges apparaissent (Mistral, Google, Meta)
   - ✅ Vous pouvez rejoindre un challenge
   - ✅ Le compteur de participants augmente
   - ✅ Le status change à "In Progress"

### Test 3 : Streaks

1. Visitez `/challenges` (ou toute page avec `<StreakCounter />`)
2. Vérifiez que :
   - ✅ Le streak actuel s'affiche (0 ou 1 pour le premier jour)
   - ✅ Le streak augmente si vous revenez le lendemain
   - ✅ Le streak se réinitialise si vous sautez un jour

**Note** : Pour tester le streak manuellement, modifiez la date dans Supabase :
```sql
UPDATE user_streaks 
SET last_activity_date = CURRENT_DATE - INTERVAL '1 day'
WHERE user_id = 'YOUR_USER_ID';
```

---

## 🚀 Architecture technique

### Pipeline Audio/Avatar

```
User parle → LiveKit (WebRTC) → OpenAI Realtime (VAD) → Agent détecte fin de parole
                                                            ↓
BeyondPresence Avatar ← Audio généré ← OpenAI TTS ← Réponse générée
```

**Paramètres VAD importants** :
- `threshold: 0.5` - Sensibilité de détection de voix
- `prefixPaddingMs: 300` - Marge avant la parole
- `silenceDurationMs: 1000` - Temps de silence avant de répondre

### Structure des données

**Challenges** :
```typescript
{
  company: "Mistral AI",
  title: "AI-Powered Financial Analysis",
  difficulty: "Hard",
  reward_type: "interview",
  reward_description: "Fast-track interview with Mistral AI Finance Team"
}
```

**Streaks** :
```typescript
{
  current_streak: 5,      // Jours consécutifs actuels
  longest_streak: 12,     // Record personnel
  total_days_active: 45   // Total de jours actifs
}
```

---

## 📝 Prochaines étapes possibles

### Court terme
- [ ] Ajouter une page de détail pour chaque challenge
- [ ] Implémenter la soumission de solutions aux challenges
- [ ] Afficher les noms d'utilisateur dans le leaderboard (nécessite table `profiles`)

### Moyen terme
- [ ] Système de notifications pour les nouveaux challenges
- [ ] Badges et achievements basés sur les streaks
- [ ] Intégration calendrier pour les deadlines de challenges

### Long terme
- [ ] Partenariats réels avec Mistral, Google, Meta
- [ ] Système de review pour les solutions soumises
- [ ] Classement global avec elo rating

---

## 🐛 Troubleshooting courant

### L'avatar ne se connecte pas
```bash
# Vérifier que l'agent tourne
ps aux | grep livekit-agent

# Vérifier les logs
tail -f agents/logs/livekit-agent.log

# Redémarrer l'agent
node agents/livekit-agent.mjs
```

### Les challenges ne s'affichent pas
```sql
-- Vérifier dans Supabase SQL Editor
SELECT * FROM challenges WHERE is_active = true;

-- Si vide, ré-exécuter le script
\i supabase/gamification-setup.sql
```

### Le streak ne s'incrémente pas
```sql
-- Vérifier la fonction trigger
SELECT proname FROM pg_proc WHERE proname = 'update_user_streak';

-- Vérifier les logs d'activité
SELECT * FROM daily_activity_log WHERE user_id = 'YOUR_USER_ID' ORDER BY activity_date DESC;
```

---

## 💡 Conseils de développement

1. **Mode développement** : L'agent peut tourner localement avec hot-reload
2. **Tests rapides** : Utilisez l'environnement de test de LiveKit pour simuler des participants
3. **Debug audio** : Activez les logs verbose dans l'agent avec `LOG_LEVEL=debug`

---

Bon développement ! 🚀
