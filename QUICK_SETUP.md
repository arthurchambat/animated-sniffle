# 🚀 Configuration rapide du stockage Supabase

## Option 1 : Via l'interface Supabase (Recommandé)

### 1️⃣ Créer le bucket

```
Dashboard Supabase → Storage → Create bucket
├── Name: cvs
├── Public: ❌ (décoché)
└── Create bucket
```

### 2️⃣ Exécuter le script SQL

```
Dashboard Supabase → SQL Editor → New query
├── Coller le contenu de supabase/storage-setup.sql
└── Run
```

✅ **C'est tout !** Vous pouvez maintenant tester l'upload de CV.

---

## Option 2 : Via le CLI Supabase

```bash
# 1. Installer le CLI Supabase (si pas déjà fait)
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
supabase link --project-ref VOTRE_PROJECT_REF

# 4. Exécuter les migrations
supabase db push
```

---

## 🧪 Test de validation

Après la configuration, testez dans votre app :

1. **Login** → Connectez-vous
2. **Mon compte** → Cliquez dans la sidebar
3. **Uploader un CV** → Testez avec un PDF < 5 Mo
4. **Vérifier** → Le CV devrait apparaître avec les boutons :
   - ✅ Consulter
   - ✅ Télécharger
   - ✅ Remplacer
   - ✅ Supprimer

---

## 🔍 Vérification dans Supabase

```
Storage → cvs → Vous devriez voir :
└── [votre-user-id]/
    └── [timestamp].pdf
```

---

## ❌ Erreurs courantes

| Erreur | Solution |
|--------|----------|
| "Bucket not found" | Le bucket 'cvs' n'existe pas → Créez-le dans Storage |
| "RLS policy violation" | Les policies ne sont pas créées → Exécutez le script SQL |
| "File too large" | Votre PDF > 5 Mo → Compressez le PDF |
| "Invalid file type" | Pas un PDF → Utilisez uniquement des fichiers .pdf |

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console browser (F12)
2. Vérifiez les logs Supabase (Dashboard → Logs)
3. Consultez `SUPABASE_SETUP.md` pour le guide détaillé
