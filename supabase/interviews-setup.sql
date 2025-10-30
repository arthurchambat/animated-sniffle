-- ============================================================================
-- INTERVIEW SYSTEM SETUP FOR FINANCEBRO
-- ============================================================================
-- Ce script crée les tables et policies pour le système d'interviews
-- Exécutez ce script dans l'éditeur SQL de Supabase Dashboard
-- ============================================================================

-- ============================================================================
-- TABLE: interview_sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position_round TEXT NOT NULL, -- screening, tech, final
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  focus_areas TEXT[], -- valuation, accounting, markets, fit
  cv_path TEXT, -- chemin dans storage
  job_offer_path TEXT, -- chemin dans storage
  status TEXT NOT NULL DEFAULT 'draft', -- draft, live, completed
  duration_minutes INT DEFAULT 30,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'live', 'completed')),
  CONSTRAINT valid_round CHECK (position_round IN ('screening', 'tech', 'final', 'case', 'fit'))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at DESC);

-- ============================================================================
-- TABLE: interview_feedback
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  general TEXT,
  went_well TEXT[],
  to_improve TEXT[],
  per_question JSONB, -- [{question, summary, tips, score}]
  score_overall NUMERIC(4,2), -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_score CHECK (score_overall IS NULL OR (score_overall >= 0 AND score_overall <= 100))
);

-- Index
CREATE INDEX IF NOT EXISTS idx_interview_feedback_session_id ON interview_feedback(session_id);

-- ============================================================================
-- FUNCTION: Auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour interview_sessions
DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON interview_sessions;
CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view their own sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON interview_sessions;

DROP POLICY IF EXISTS "Users can view feedback for their sessions" ON interview_feedback;
DROP POLICY IF EXISTS "Users can create feedback for their sessions" ON interview_feedback;
DROP POLICY IF EXISTS "System can create feedback" ON interview_feedback;

-- ============================================================================
-- POLICIES: interview_sessions
-- ============================================================================

CREATE POLICY "Users can view their own sessions"
ON interview_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON interview_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON interview_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
ON interview_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- POLICIES: interview_feedback
-- ============================================================================

CREATE POLICY "Users can view feedback for their sessions"
ON interview_feedback FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM interview_sessions
    WHERE interview_sessions.id = interview_feedback.session_id
    AND interview_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "System can create feedback"
ON interview_feedback FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM interview_sessions
    WHERE interview_sessions.id = interview_feedback.session_id
    AND interview_sessions.user_id = auth.uid()
  )
);

-- ============================================================================
-- STORAGE: Bucket pour interviews
-- ============================================================================

-- Créer le bucket (privé)
INSERT INTO storage.buckets (id, name, public)
VALUES ('interviews', 'interviews', false)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes policies storage
DROP POLICY IF EXISTS "Users can upload their interview files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their interview files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their interview files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their interview files" ON storage.objects;

-- Policy pour upload
CREATE POLICY "Users can upload their interview files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'interviews' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour lecture
CREATE POLICY "Users can view their interview files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'interviews' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour suppression
CREATE POLICY "Users can delete their interview files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'interviews' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy pour mise à jour
CREATE POLICY "Users can update their interview files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'interviews' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('interview_sessions', 'interview_feedback');

-- Vérifier les policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('interview_sessions', 'interview_feedback')
ORDER BY tablename, policyname;

-- Vérifier le bucket
SELECT id, name, public
FROM storage.buckets
WHERE id = 'interviews';

-- Vérifier les policies storage
SELECT policyname
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%interview%'
ORDER BY policyname;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Tables: interview_sessions, interview_feedback
-- Policies RLS: 4 pour sessions, 2 pour feedback
-- Bucket: interviews (privé)
-- Policies Storage: 4 (upload, view, delete, update)
-- ============================================================================
