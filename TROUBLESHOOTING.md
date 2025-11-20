# 🔧 Guide de Résolution - Interview LiveKit

## ✅ Problèmes Résolus

### 1. Erreur "Error logging activity"
**Solution**: Exécutez `supabase/gamification-setup.sql` dans Supabase Dashboard → SQL Editor
- Voir le fichier `SETUP_DB_NOW.md` pour les instructions détaillées

### 2. Page Challenges manquante
**Solution**: ✅ Complété - Hero section ajoutée avec partenariats Mistral, Google, Meta et mention du top 0.01%

### 3. Caméra ne s'allume pas
**Solution**: ✅ Amélioré - Ajout de gestion d'erreur et logging
- La caméra devrait maintenant demander les permissions automatiquement
- Vérifiez la console du navigateur pour les messages ✅/❌

## 🚨 Action Requise: Avatar BeyondPresence

### Problème
L'avatar reste bloqué sur "Connecting to avatar..."

### Cause
L'agent LiveKit n'est pas lancé ou n'a pas démarré en mode `dev`

### Solution

**Étape 1: Redémarrez Next.js**
```bash
# Dans le terminal où tourne npm run dev
Ctrl+C
npm run dev
```

**Étape 2: Lancez l'agent LiveKit**
Dans un NOUVEAU terminal :
```bash
cd /Users/arthurriche/Desktop/FinanceBro
node agents/livekit-agent.mjs dev
```

Vous devriez voir :
```
✅ Environment variables loaded from .env
INFO    Worker started
INFO    Listening for interview sessions...
```

**Étape 3: Test complet**
1. Ouvrez http://localhost:3000/interview/new
2. Créez un nouvel entretien
3. Rejoignez la room
4. **Autorisez la caméra et le micro** quand le navigateur demande
5. Vérifiez la console du navigateur (F12):
   - ✅ LiveKit token received
   - ✅ Connected to LiveKit room
   - ✅ BeyondPresence avatar session created

**Étape 4: Vérifiez l'agent**
Dans le terminal de l'agent, vous devriez voir :
```
INFO    Participant joined: Arthur Riché
INFO    Initializing BeyondPresence avatar: 2ed7477f-3961-4ce1-b331-5e4530c55a57
INFO    BeyondPresence avatar initialized successfully
```

## 🐛 Debugging

### Si la caméra ne marche toujours pas :
1. Vérifiez les permissions du navigateur (🔒 dans la barre d'adresse)
2. Essayez avec Chrome/Edge (meilleur support WebRTC)
3. Vérifiez la console : `navigator.mediaDevices.getUserMedia({ video: true })`

### Si l'avatar ne s'affiche pas :
1. Vérifiez que l'agent tourne : `ps aux | grep livekit-agent`
2. Vérifiez les variables d'environnement dans `.env`:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `BEYOND_PRESENCE_API_KEY`
   - `BEY_AVATAR_ID`
3. Regardez les logs de l'agent pour les erreurs

### Si le token échoue (500 error) :
1. Redémarrez Next.js (les .env changes nécessitent un redémarrage)
2. Vérifiez que TOUTES les variables LIVEKIT_* sont dans `.env`
3. Check logs serveur Next.js pour voir quelle variable manque

## 📝 Checklist Finale

- [ ] SQL gamification exécuté dans Supabase
- [ ] Next.js redémarré (npm run dev)
- [ ] Agent LiveKit lancé (node agents/livekit-agent.mjs dev)
- [ ] Navigateur autorise caméra + micro
- [ ] Console navigateur montre ✅ Connected to LiveKit room
- [ ] Console agent montre participant joined

Une fois tout ✅, vous devriez voir votre caméra ET l'avatar BeyondPresence !
