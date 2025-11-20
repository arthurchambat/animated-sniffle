-- ============================================================================
-- SUPABASE STORAGE SETUP FOR CVS
-- ============================================================================
-- Ce script configure le bucket de stockage pour les CVs et les policies RLS
-- Exécutez ce script dans l'éditeur SQL de Supabase Dashboard
-- ============================================================================

-- 1. Créer le bucket 'cvs' (privé par défaut)
-- Note: Si le bucket existe déjà, cette commande échouera - c'est normal
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Activer RLS sur storage.objects (normalement déjà activé)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can upload their own CV" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own CV" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own CV" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own CV" ON storage.objects;

-- 4. Policy pour l'upload (INSERT)
CREATE POLICY "Users can upload their own CV"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy pour la lecture (SELECT)
CREATE POLICY "Users can view their own CV"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Policy pour la suppression (DELETE)
CREATE POLICY "Users can delete their own CV"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Policy pour la mise à jour (UPDATE)
CREATE POLICY "Users can update their own CV"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier que le bucket a été créé
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'cvs';

-- Vérifier que les policies sont actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%CV%'
ORDER BY policyname;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Vous devriez voir :
-- 1. Un bucket nommé 'cvs' avec public = false
-- 2. 4 policies actives (INSERT, SELECT, DELETE, UPDATE)
-- ============================================================================
