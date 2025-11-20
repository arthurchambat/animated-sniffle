# 🚨 ACTION REQUISE: Setup Base de Données

## Étape 1: Exécuter le SQL dans Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **tzosvmhckyefiksopykt**
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New Query**
5. Copiez-collez TOUT le contenu du fichier `supabase/gamification-setup.sql`
6. Cliquez sur **RUN** (ou Ctrl+Enter)

## Étape 2: Vérifier que ça a fonctionné

Dans le SQL Editor, exécutez cette requête de vérification :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('challenges', 'challenge_participants', 'user_streaks', 'daily_activity_log');

-- Vérifier les challenges
SELECT company, title FROM challenges;

-- Vérifier la fonction
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'log_user_activity';
```

Vous devriez voir :
- ✅ 4 tables
- ✅ 4 challenges (Mistral x2, Google, Meta)
- ✅ La fonction log_user_activity

## Problèmes actuels liés à cette DB manquante :

1. ❌ Erreur "Error logging activity: {}" 
2. ❌ Page /challenges vide ou erreur
3. ❌ Streaks ne fonctionnent pas

**Une fois le SQL exécuté, tous ces problèmes seront résolus !**
