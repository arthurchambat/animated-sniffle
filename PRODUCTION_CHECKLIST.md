# ✅ Checklist Pré-Production

## 🔒 Sécurité

### Variables d'Environnement
- [ ] Toutes les clés API sont dans `.env` (pas hardcodées)
- [ ] `.env` est dans `.gitignore`
- [ ] Les clés de production sont différentes des clés de dev
- [ ] `SUPABASE_SERVICE_ROLE_KEY` n'est jamais exposée côté client
- [ ] Les tokens LiveKit ont une expiration raisonnable (1h par défaut)

### Supabase RLS
- [ ] RLS activé sur toutes les tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Policies testées pour chaque table :
  - [ ] `challenges` - Public read, admin write
  - [ ] `challenge_participants` - Users can view/update their own
  - [ ] `user_streaks` - Users can view their own
  - [ ] `daily_activity_log` - Users can insert/view their own
  - [ ] `interview_sessions` - Users can view/update their own
  - [ ] `interview_feedback` - Users can view feedback for their sessions

### Auth
- [ ] Email verification activée (Supabase Auth settings)
- [ ] Rate limiting configuré (Supabase Dashboard)
- [ ] Redirect URLs configurées (callback, sign-out)

---

## 🗄️ Base de Données

### Schema
- [ ] `supabase/interviews-setup.sql` exécuté
- [ ] `supabase/gamification-setup.sql` exécuté
- [ ] Vérifier que les 4 challenges seed existent :
```sql
SELECT company, title FROM challenges WHERE is_active = true;
```

### Indexes
- [ ] Indexes créés sur les colonnes fréquemment requêtées :
  - [ ] `interview_sessions(user_id, status, created_at)`
  - [ ] `challenge_participants(challenge_id, user_id, score)`
  - [ ] `user_streaks(user_id, current_streak)`
  - [ ] `daily_activity_log(user_id, activity_date)`

### Triggers & Functions
- [ ] Trigger `update_user_streak()` fonctionne
- [ ] Function `log_user_activity()` est SECURITY DEFINER
- [ ] Function `get_challenge_rank()` testée

---

## 🤖 Agent LiveKit

### Déploiement
- [ ] Agent tourne en background (pm2, systemd, ou Docker)
- [ ] Logs configurés (`agents/logs/`)
- [ ] Redémarrage automatique en cas de crash
- [ ] Monitoring CPU/RAM de l'agent

### Configuration
- [ ] `OPENAI_API_KEY` valide et avec crédits
- [ ] `BEYOND_PRESENCE_API_KEY` valide
- [ ] `BEY_AVATAR_ID` correct
- [ ] `LIVEKIT_URL` et credentials corrects
- [ ] VAD settings testés :
  - [ ] `silenceDurationMs` optimisé (1000ms par défaut)
  - [ ] `threshold` optimisé (0.5 par défaut)

### Tests
- [ ] L'avatar se connecte et apparaît dans les interviews
- [ ] L'audio est synchronisé avec les lèvres
- [ ] L'agent attend la fin de parole (pas d'interruptions)
- [ ] Le persona est correct selon le type d'interview

---

## 🎨 Frontend

### Performance
- [ ] Images optimisées (next/image)
- [ ] Lazy loading des composants lourds
- [ ] Bundle size raisonnable (`npm run build` < 500KB)
- [ ] Lighthouse score > 90 (Performance, Accessibility)

### UX
- [ ] Messages d'erreur clairs (toasts Sonner)
- [ ] Loading states partout (spinners, skeletons)
- [ ] Mobile responsive testé
- [ ] Formulaires avec validation côté client

### Features
- [ ] `/challenges` affiche les 4 challenges
- [ ] Rejoindre un challenge fonctionne
- [ ] Leaderboard se met à jour
- [ ] StreakCounter affiche le bon nombre
- [ ] Interview Player affiche l'avatar
- [ ] Controls (mute, video, end) fonctionnent

---

## 🧪 Tests

### Unitaires
- [ ] `lib/gamification/challenges.ts` - CRUD operations
- [ ] `lib/gamification/streaks.ts` - Streak logic
- [ ] `lib/bey.ts` - BeyondPresence API calls

### Intégration
- [ ] Créer interview → Lancer → Terminer → Feedback
- [ ] Rejoindre challenge → Status "In Progress"
- [ ] Se connecter 2 jours consécutifs → Streak = 2
- [ ] Se connecter, sauter 1 jour, revenir → Streak = 1

### E2E
- [ ] Parcours complet d'un utilisateur :
  1. Sign up
  2. Créer interview
  3. Parler avec l'avatar
  4. Terminer et voir feedback
  5. Rejoindre un challenge
  6. Revenir le lendemain pour le streak

---

## 📊 Monitoring & Analytics

### Logs
- [ ] Application logs configurés (Vercel, Railway, etc.)
- [ ] Agent logs accessibles
- [ ] Supabase logs vérifiés (lent queries, errors)

### Métriques
- [ ] Tracking activité utilisateurs (Posthog, Mixpanel, etc.)
- [ ] Événements clés trackés :
  - [ ] `interview_started`
  - [ ] `interview_completed`
  - [ ] `challenge_joined`
  - [ ] `challenge_completed`
  - [ ] `streak_updated`

### Alertes
- [ ] Email si l'agent crash
- [ ] Slack/Discord si erreur critique (>10 errors/min)
- [ ] Notification si BDD pleine (>80% capacity)

---

## 🚀 Déploiement

### Infrastructure
- [ ] Next.js déployé (Vercel, Railway, ou autre)
- [ ] Agent déployé sur serveur dédié (ou cloud function)
- [ ] Supabase en production (pas Sandbox)
- [ ] LiveKit Cloud configuré (ou self-hosted)

### DNS & Domaine
- [ ] Domaine custom configuré
- [ ] HTTPS activé (Let's Encrypt ou autre)
- [ ] Redirections HTTP → HTTPS

### Environnement
- [ ] Variables d'environnement de prod configurées
- [ ] Secrets stockés de manière sécurisée (pas en clair)
- [ ] Build de production testé (`npm run build && npm run start`)

---

## 📝 Documentation

### Pour les utilisateurs
- [ ] README.md à jour
- [ ] FAQ pour problèmes courants
- [ ] Guide "Comment créer une interview"
- [ ] Guide "Comment rejoindre un challenge"

### Pour les développeurs
- [ ] QUICKSTART.md complet
- [ ] ARCHITECTURE.md à jour
- [ ] EXAMPLES_API_USAGE.md avec exemples fonctionnels
- [ ] Commentaires dans le code pour parties complexes

---

## 🎯 Business

### Challenges
- [ ] Contacts établis avec Mistral AI, Google, Meta (ou clarifier que c'est une démo)
- [ ] Process de review des soumissions défini
- [ ] Critères de notation clairs
- [ ] Timeline pour distribution des récompenses

### Legal
- [ ] CGU (Terms of Service)
- [ ] Politique de confidentialité (RGPD compliant)
- [ ] Cookies consent (si analytics)
- [ ] Mentions légales

---

## 🔄 Post-Lancement

### Jour 1-7
- [ ] Monitorer erreurs 24/7
- [ ] Répondre aux premiers utilisateurs
- [ ] Itérer sur feedback rapide
- [ ] Vérifier que les streaks s'incrémentent correctement

### Semaine 2-4
- [ ] Analyser métriques d'engagement
- [ ] Ajuster difficulté des challenges
- [ ] Optimiser VAD si nécessaire
- [ ] Ajouter nouveaux challenges

### Mois 2+
- [ ] Partenariats avec entreprises
- [ ] Système de badges/achievements
- [ ] API publique pour entreprises
- [ ] Mobile app (React Native)

---

## 🆘 Rollback Plan

Si problème critique après déploiement :

1. **Revenir à la version précédente**
   ```bash
   git revert HEAD
   npm run build
   # Redéployer
   ```

2. **Désactiver les challenges temporairement**
   ```sql
   UPDATE challenges SET is_active = false;
   ```

3. **Arrêter l'agent si bugs**
   ```bash
   pm2 stop livekit-agent
   ```

4. **Rediriger vers page maintenance**
   - Créer `app/maintenance/page.tsx`
   - Rediriger tous les users temporairement

---

## 📞 Contacts Importants

| Service | Contact | URL Support |
|---------|---------|-------------|
| Supabase | support@supabase.io | https://supabase.com/support |
| LiveKit | support@livekit.io | https://livekit.io/support |
| BeyondPresence | support@beyondpresence.ai | https://beyondpresence.ai/contact |
| OpenAI | help.openai.com | https://help.openai.com |

---

## ✅ Validation Finale

Avant de lancer en production, vérifier :

```bash
# 1. Build sans erreurs
npm run build
✅ Build successful

# 2. Tests passent
npm run test
✅ All tests passed

# 3. TypeScript sans erreurs
npx tsc --noEmit
✅ No errors found

# 4. Linter sans warnings
npm run lint
✅ No linting errors

# 5. Bundle size acceptable
npm run build
✅ First Load JS < 500KB

# 6. Agent démarre correctement
./start-agent.sh
✅ Connected to LiveKit
✅ BeyondPresence avatar initialized
```

---

**Bon lancement ! 🚀**

*Si tout est coché, vous êtes prêt pour la production !*
