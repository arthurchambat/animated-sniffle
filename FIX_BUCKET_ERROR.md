# 🚨 FIX RAPIDE : Erreur "Bucket not found"

## ⚡ Solution en 3 étapes (2 minutes)

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet **FinanceBro**

### Étape 2 : Créer le bucket

1. Dans le menu de gauche, cliquez sur **Storage**
2. Cliquez sur le bouton vert **"Create a new bucket"** (en haut à droite)
3. Remplissez le formulaire :
   ```
   Name:           cvs
   Public bucket:  ❌ (décoché - gardez-le PRIVÉ)
   ```
4. Cliquez sur **"Create bucket"**

### Étape 3 : Configurer les permissions (RLS)

1. Dans le menu de gauche, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez-collez ce code SQL :

```sql
-- Créer les policies pour le bucket CVs
CREATE POLICY "Users can upload their own CV"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own CV"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own CV"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own CV"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

4. Cliquez sur **"Run"** (ou Ctrl+Enter)

### ✅ C'est terminé !

Retournez dans votre app et essayez d'uploader un CV. L'erreur devrait avoir disparu.

---

## 🎥 Aide visuelle

Voici exactement où cliquer :

```
Supabase Dashboard
│
├─ 📁 Storage (dans le menu gauche)
│   │
│   └─ 🟢 Create a new bucket (bouton en haut)
│       │
│       └─ Name: cvs
│          Public: ❌ décoché
│          → Create bucket
│
└─ 📝 SQL Editor (dans le menu gauche)
    │
    └─ New query
        │
        └─ Coller le code SQL ci-dessus
           → Run
```

---

## ❓ Ça ne marche toujours pas ?

### Vérification 1 : Le bucket existe-t-il ?
```
Storage → Vous devriez voir un bucket nommé "cvs"
```

### Vérification 2 : Les policies sont-elles créées ?
```
SQL Editor → Exécutez cette requête :

SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%CV%';

Résultat attendu : 4 lignes (upload, view, delete, update)
```

### Vérification 3 : Variables d'environnement
Vérifiez que vous avez bien ces variables dans votre `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## 🔄 Méthode alternative (automatique)

Si vous préférez une méthode automatique :

1. Ajoutez votre **Service Role Key** dans `.env.local` :
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```
   (Trouvez-la dans : Supabase Dashboard → Settings → API → service_role key)

2. Visitez cette URL dans votre navigateur :
   ```
   http://localhost:3000/api/storage/init
   ```

3. Le bucket sera créé automatiquement (mais vous devrez quand même exécuter le SQL pour les policies)

---

## 📞 Besoin d'aide ?

Si ça ne fonctionne toujours pas, partagez le message d'erreur complet et je vous aiderai !
