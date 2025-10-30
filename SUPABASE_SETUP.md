# Configuration Supabase pour FinanceBro

## 🗄️ Création du bucket de stockage pour les CVs

### Étape 1 : Créer le bucket

1. Allez sur votre [dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet FinanceBro
3. Dans le menu latéral, cliquez sur **Storage**
4. Cliquez sur **Create a new bucket**
5. Configurez le bucket :
   - **Name** : `cvs`
   - **Public** : Décochez (bucket privé recommandé pour la sécurité)
   - Cliquez sur **Create bucket**

### Étape 2 : Configurer les Row Level Security (RLS) policies

Pour que les utilisateurs puissent gérer leurs CVs, vous devez ajouter des policies RLS.

1. Dans Supabase Dashboard, allez dans **Storage** > **Policies**
2. Sélectionnez le bucket `cvs`
3. Cliquez sur **New Policy** et créez les 3 policies suivantes :

#### Policy 1 : Upload de CV (INSERT)

```sql
CREATE POLICY "Users can upload their own CV"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2 : Lecture de CV (SELECT)

```sql
CREATE POLICY "Users can view their own CV"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3 : Suppression de CV (DELETE)

```sql
CREATE POLICY "Users can delete their own CV"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4 : Mise à jour de CV (UPDATE)

```sql
CREATE POLICY "Users can update their own CV"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Étape 3 : Vérifier la configuration

1. Les policies sont maintenant actives
2. Testez l'upload d'un CV depuis la page "Mon compte"
3. Vérifiez que le CV apparaît dans Storage > cvs > [votre-user-id]

## 📋 Structure des fichiers dans le bucket

Les CVs sont organisés par utilisateur :
```
cvs/
  ├── [user-id-1]/
  │   └── 1729867200000.pdf
  ├── [user-id-2]/
  │   └── 1729867300000.pdf
  └── ...
```

Cette structure garantit que :
- Chaque utilisateur a son propre dossier
- Les fichiers sont horodatés pour éviter les conflits
- Les policies RLS empêchent l'accès aux CVs des autres utilisateurs

## 🔒 Sécurité

- **Bucket privé** : Les CVs ne sont accessibles que par leur propriétaire
- **RLS activé** : Les policies garantissent l'isolation des données
- **Validation côté client** : Seuls les PDFs de max 5 Mo sont acceptés
- **Validation côté serveur** : Supabase vérifie les permissions via RLS

## 🧪 Test rapide

Pour tester la configuration :

1. Connectez-vous à votre app
2. Allez dans **Mon compte**
3. Uploadez un PDF de test
4. Vérifiez dans Supabase Storage > cvs que le fichier est bien uploadé
5. Testez les boutons : Consulter, Télécharger, Remplacer, Supprimer

## ❓ Troubleshooting

### Erreur "Bucket not found"
- Vérifiez que le bucket `cvs` existe bien dans Storage
- Vérifiez l'orthographe exacte du nom

### Erreur "Row level security policy violation"
- Vérifiez que les 4 policies sont bien créées
- Vérifiez que l'utilisateur est bien authentifié

### Le CV ne s'upload pas
- Vérifiez la taille du fichier (max 5 Mo)
- Vérifiez le format (PDF uniquement)
- Vérifiez les logs de la console browser

### Le téléchargement ne fonctionne pas
- Si bucket privé : utilisez la fonction download()
- Si bucket public : utilisez getPublicUrl()
- Vérifiez les policies SELECT

## 🎯 Fonctionnalités disponibles

✅ Upload de CV (PDF, max 5 Mo)  
✅ **Aperçu rapide** du CV (modal intégré sans téléchargement)  
✅ Consultation du CV (ouverture dans nouvel onglet)  
✅ Téléchargement du CV  
✅ Remplacement du CV (l'ancien est automatiquement supprimé)  
✅ Suppression du CV avec confirmation  
✅ Organisation par utilisateur  
✅ Sécurité via RLS  

