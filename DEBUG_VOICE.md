# 🔍 Guide de Débogage - Pourquoi l'IA ne parle pas?

## Étape 1: Ouvre la Console du Navigateur

1. Sur la page de l'interview, appuie sur **F12** (ou Cmd+Option+I sur Mac)
2. Clique sur l'onglet **"Console"**
3. Active le mode vocal
4. **Cherche les messages d'erreur en rouge**

## Messages à Chercher:

### ✅ Messages de Succès (bon signe):
```
[VoiceAgent] Connected to room: financebro-bey-xxxxx
[VoiceAgent] Agent audio track subscribed
[VoiceAgent] Voice agent ready
```

### ❌ Messages d'Erreur (problème):
- `Failed to connect`
- `WebSocket connection failed`
- `Permission denied`
- `Microphone not available`

## Étape 2: Vérifie le Statut Visuel

Quand tu cliques sur "Voice Mode (Beta)", que vois-tu?

- **🔵 "Connecting"** (bleu, qui tourne) → Normal au début
- **🟢 "Listening"** (vert, pulse) → ✅ BON! Parle maintenant!
- **🔴 "Error"** (rouge) → ❌ Problème de connexion
- **⚫ "Idle"** (gris) → Pas démarré

## Étape 3: Test Simple

Si tu vois **"Listening"** (vert):

1. **Parle fort et clairement**: "Bonjour, je suis prêt"
2. **Attends 3-5 secondes**
3. **Vérifie le terminal de l'agent** - devrait afficher:
   ```
   ✅ Connected to room
   ✅ Participant joined
   ```

## Étape 4: Vérifie les Permissions

1. Dans Chrome/Edge: `chrome://settings/content/microphone`
2. Vérifie que **localhost:3000** a la permission
3. Vérifie que le bon micro est sélectionné (pas "Système par défaut")

## Étape 5: Test Audio Complet

### Dans le Navigateur (Console F12):
Copie-colle ce code et appuie sur Entrée:

```javascript
// Test si le micro fonctionne
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log("✅ Microphone OK:", stream.getAudioTracks());
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error("❌ Erreur micro:", err));
```

### Résultat attendu:
```
✅ Microphone OK: [MediaStreamTrack]
```

### Si erreur:
```
❌ Erreur micro: NotAllowedError: Permission denied
```
→ Accorde la permission micro au site

## Étape 6: Que Faire selon les Erreurs

### "Permission denied" / "NotAllowedError"
1. Clique sur l'icône 🔒 dans la barre d'adresse
2. Autorise le microphone
3. Rafraîchis la page (F5)

### "Device not found" / "NotFoundError"
1. Branche un micro ou utilise le micro intégré
2. Vérifie dans les paramètres système que le micro fonctionne
3. Redémarre le navigateur

### "WebSocket failed" / "Connection refused"
1. Vérifie que l'agent tourne (`npm run agent`)
2. Vérifie les credentials LiveKit dans `.env.local`
3. Essaye de redémarrer l'agent

### Pas d'erreur mais l'IA ne parle pas
1. **Monte le volume** de ton ordinateur
2. **Utilise des écouteurs** au lieu des hauts-parleurs
3. **Parle plus fort** - l'IA attend de t'entendre d'abord
4. **Attends 5 secondes** après avoir parlé

## Étape 7: Checklist Rapide

Avant de tester:
- [ ] Terminal 1: `npm run dev` tourne
- [ ] Terminal 2: `npm run agent` tourne (pas d'erreur)
- [ ] Navigateur: Sur http://localhost:3000
- [ ] Page rafraîchie (F5)
- [ ] Permission micro accordée
- [ ] Volume activé
- [ ] Cliqué sur "Voice Mode (Beta)"
- [ ] Statut = "Listening" (vert)
- [ ] Dit quelque chose à voix haute

## Ce que Tu Devrais Voir/Entendre:

### Dans le Navigateur:
1. Clique "Voice Mode" → Statut "Connecting"
2. Autoriser micro → Statut "Listening" (vert)
3. Dis "Bonjour" → Attends 3 sec
4. **Tu devrais ENTENDRE une voix** qui répond
5. Transcription apparaît en bas

### Dans le Terminal Agent:
```
✅ Connected to room: financebro-bey-xxxxx
✅ Participant joined: financebro-viewer-xxxxx
✅ OpenAI Realtime session started
🎤 First user activity detected
📊 Question 1/5 asked
```

## Étape 8: Envoie-moi les Infos

Si ça ne marche toujours pas, envoie-moi:

1. **Console navigateur** (F12): Screenshot des erreurs en rouge
2. **Terminal agent**: Copie tout ce qui s'affiche
3. **Statut affiché**: "Connecting", "Listening", "Error", etc.
4. **Navigateur utilisé**: Chrome, Firefox, Safari, Edge?

---

## Test Ultra-Simple

**Fais exactement ceci:**

1. Ouvre http://localhost:3000
2. Crée un nouvel entretien
3. Sur la page interview, appuie sur **F12**
4. Clique "Voice Mode (Beta)"
5. **REGARDE LA CONSOLE** - qu'est-ce qui s'affiche?
6. Si statut "Listening" → **DIS "HELLO" TRÈS FORT**
7. **Envoie-moi un screenshot** de la console

C'est tout! 🎯
