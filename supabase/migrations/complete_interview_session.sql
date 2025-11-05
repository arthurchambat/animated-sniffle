-- RPC Supabase pour compléter une session d'interview
-- Cette fonction met à jour la session et crée le feedback en une seule transaction

CREATE OR REPLACE FUNCTION complete_interview_session(
  p_session_id UUID,
  p_general TEXT,
  p_went_well TEXT[],
  p_to_improve TEXT[],
  p_per_question JSONB,
  p_score_overall INTEGER
)
RETURNS TABLE (feedback_id UUID) AS $$
DECLARE
  v_feedback_id UUID;
BEGIN
  -- Mettre à jour la session
  UPDATE interview_sessions
  SET 
    status = 'completed',
    ended_at = NOW(),
    updated_at = NOW()
  WHERE id = p_session_id;

  -- Créer le feedback
  INSERT INTO interview_feedback (
    session_id,
    general,
    went_well,
    to_improve,
    per_question,
    score_overall,
    created_at
  ) VALUES (
    p_session_id,
    p_general,
    p_went_well,
    p_to_improve,
    p_per_question,
    p_score_overall,
    NOW()
  )
  RETURNING id INTO v_feedback_id;

  -- Retourner l'ID du feedback créé
  RETURN QUERY SELECT v_feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions: seul le service role peut exécuter cette fonction
REVOKE ALL ON FUNCTION complete_interview_session FROM PUBLIC;
GRANT EXECUTE ON FUNCTION complete_interview_session TO service_role;
