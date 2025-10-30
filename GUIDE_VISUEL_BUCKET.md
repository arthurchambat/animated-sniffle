# 🎬 GUIDE VISUEL : Créer le bucket CVs en 60 secondes

## 📍 Vous êtes ici avec l'erreur "Bucket not found"

Pas de panique ! Voici la solution en images.

---

## 🎯 ÉTAPE 1 : Aller dans Storage

```
1. Ouvrez https://supabase.com/dashboard
2. Cliquez sur votre projet "FinanceBro"
3. Dans le menu de gauche, cherchez l'icône 📦
4. Cliquez sur "Storage"
```

**Ce que vous verrez :**
```
┌─────────────────────────────────────┐
│ 🏠 Dashboard                        │
│ 🔨 Database                         │
│ 🔐 Authentication                   │
│ 📦 Storage          ← CLIQUEZ ICI  │
│ 🔧 Edge Functions                   │
│ ⚙️  Settings                        │
└─────────────────────────────────────┘
```

---

## 🎯 ÉTAPE 2 : Créer le bucket

```
1. Vous êtes maintenant dans Storage
2. En haut à droite, vous verrez un bouton vert
3. Cliquez sur "Create a new bucket"
```

**Ce que vous verrez :**
```
┌──────────────────────────────────────────┐
│ Storage                                   │
│                                           │
│  [🟢 Create a new bucket]  ← CLIQUEZ ICI │
│                                           │
│  No buckets yet...                        │
└──────────────────────────────────────────┘
```

---

## 🎯 ÉTAPE 3 : Configurer le bucket

**Un formulaire apparaît. Remplissez :**

```
┌──────────────────────────────────┐
│ Create bucket                     │
├──────────────────────────────────┤
│                                   │
│ Name *                            │
│ ┌─────────────────────────────┐  │
│ │ cvs                         │  │ ← Tapez exactement "cvs"
│ └─────────────────────────────┘  │
│                                   │
│ ☐ Public bucket                  │ ← NE PAS COCHER (privé = sécurisé)
│                                   │
│        [Cancel]  [Create bucket] │ ← Cliquez sur "Create bucket"
└──────────────────────────────────┘
```

**IMPORTANT :**
- ✅ Name = `cvs` (exactement, en minuscules)
- ❌ Public bucket = décoché (pour la sécurité)

---

## 🎯 ÉTAPE 4 : Configurer les permissions (SQL)

```
1. Dans le menu de gauche, cliquez sur "SQL Editor"
2. Cliquez sur "New query"
3. Copiez-collez ce code :
```

```sql
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

**Ensuite :**
```
4. Appuyez sur "Run" (ou Ctrl+Enter sur Mac)
5. Vous devriez voir "Success. No rows returned"
```

---

## ✅ VÉRIFICATION FINALE

Retournez dans **Storage** :

```
┌──────────────────────────────────────────┐
│ Storage                                   │
│                                           │
│  Buckets                                  │
│  ├─ 📦 cvs (private)     ← Vous devriez  │
│  │                          voir ça !     │
└──────────────────────────────────────────┘
```

---

## 🎉 C'EST TERMINÉ !

Retournez dans votre application FinanceBro :

1. Allez dans **Mon compte**
2. Essayez d'uploader un CV (PDF, max 5 Mo)
3. L'erreur "Bucket not found" a disparu ! 🎊

---

## 🎬 Les nouvelles fonctionnalités du CV

Une fois uploadé, vous aurez 4 boutons magiques :

```
┌───────────────────────────────────────────┐
│ 👁️  Aperçu rapide  │  ⬇️  Télécharger    │
│ 🔄  Remplacer      │  🗑️   Supprimer      │
└───────────────────────────────────────────┘
```

**👁️ Aperçu rapide** (NOUVEAU !) :
- Ouvre le CV dans un modal élégant
- Pas besoin de télécharger
- Navigation fluide dans le PDF
- Fermer en cliquant en dehors ou sur ❌

**⬇️ Télécharger** :
- Sauvegarde le PDF sur votre ordinateur

**🔄 Remplacer** :
- Upload un nouveau CV
- L'ancien est automatiquement supprimé

**🗑️ Supprimer** :
- Supprime définitivement le CV
- Demande confirmation avant

---

## 🆘 Besoin d'aide ?

Si vous voyez toujours l'erreur après avoir suivi ces étapes :

1. **Vérifiez le nom** : Le bucket doit s'appeler exactement `cvs` (en minuscules)
2. **Vérifiez les policies** : Les 4 requêtes SQL doivent avoir réussi
3. **Rechargez la page** : Faites Ctrl+R ou Cmd+R
4. **Vérifiez la console** : F12 → Console pour voir les erreurs détaillées

---

## 📞 Contact

Si rien ne fonctionne, partagez :
- Le message d'erreur complet
- Une capture d'écran de votre Storage dans Supabase
- Les logs de la console (F12 → Console)
