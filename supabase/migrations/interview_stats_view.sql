-- ============================================================================
-- INTERVIEW RECENT STATS VIEW
-- ============================================================================
-- Cette view agrège les statistiques d'interviews pour chaque utilisateur
-- À exécuter après interviews-setup.sql
-- ============================================================================

-- Supprimer la view si elle existe
DROP VIEW IF EXISTS interview_recent_stats;

-- Créer la view
CREATE VIEW interview_recent_stats AS
SELECT 
  s.user_id,
  COUNT(DISTINCT s.id) AS total_sessions,
  COUNT(DISTINCT f.id) AS total_feedbacks,
  ROUND(AVG(f.score_overall), 2) AS average_score,
  MAX(s.ended_at) FILTER (WHERE s.status = 'completed') AS last_completed_session,
  MAX(f.created_at) AS last_feedback_date
FROM interview_sessions s
LEFT JOIN interview_feedback f ON s.id = f.session_id
GROUP BY s.user_id;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire leurs propres stats
GRANT SELECT ON interview_recent_stats TO authenticated;

-- Activer RLS sur la view
ALTER VIEW interview_recent_stats SET (security_invoker = on);

-- Note: Les policies RLS sont héritées des tables sous-jacentes
-- car nous utilisons security_invoker = on

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier que la view existe
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'interview_recent_stats';

-- Tester la view (remplacer USER_ID par un UUID valide)
-- SELECT * FROM interview_recent_stats WHERE user_id = 'USER_ID';

-- ============================================================================
-- UTILISATION
-- ============================================================================
-- Dans votre code Next.js:
-- 
-- const { data: stats } = await supabase
--   .from('interview_recent_stats')
--   .select('*')
--   .eq('user_id', user.id)
--   .single();
--
-- Résultat:
-- {
--   user_id: UUID,
--   total_sessions: number,
--   total_feedbacks: number,
--   average_score: number | null,
--   last_completed_session: timestamp | null,
--   last_feedback_date: timestamp | null
-- }
-- ============================================================================
