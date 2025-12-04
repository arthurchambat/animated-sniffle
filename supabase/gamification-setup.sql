-- ============================================================================
-- GAMIFICATION SYSTEM: CHALLENGES & STREAKS
-- ============================================================================
-- Tables pour les challenges d'entreprises et le système de streaks
-- Exécutez ce script dans l'éditeur SQL de Supabase Dashboard
-- ============================================================================

-- ============================================================================
-- TABLE: challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  reward_type TEXT NOT NULL, -- 'interview', 'mentorship', 'resume_review', 'networking_event'
  reward_description TEXT NOT NULL,
  max_participants INT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_challenges_company ON challenges(company);
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_ends_at ON challenges(ends_at);

-- ============================================================================
-- TABLE: challenge_participants
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score NUMERIC(5,2), -- Score de 0 à 100
  time_taken_seconds INT, -- Temps pris pour compléter
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(challenge_id, user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_score ON challenge_participants(score DESC);

-- ============================================================================
-- TABLE: user_streaks
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  total_days_active INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_streak ON user_streaks(current_streak DESC);

-- ============================================================================
-- TABLE: daily_activity_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT, -- 'interview', 'challenge', 'login', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, activity_date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_id ON daily_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON daily_activity_log(activity_date DESC);

-- ============================================================================
-- FUNCTION: Update streak on activity
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_date DATE := CURRENT_DATE;
  streak_record RECORD;
BEGIN
  -- Get or create streak record
  SELECT * INTO streak_record FROM user_streaks WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_days_active)
    VALUES (NEW.user_id, 1, 1, current_date, 1);
  ELSE
    last_date := streak_record.last_activity_date;
    
    IF last_date IS NULL OR last_date < current_date THEN
      -- Check if it's consecutive day
      IF last_date = current_date - INTERVAL '1 day' THEN
        -- Continue streak
        UPDATE user_streaks
        SET 
          current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = current_date,
          total_days_active = total_days_active + 1,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSIF last_date < current_date - INTERVAL '1 day' THEN
        -- Streak broken, reset
        UPDATE user_streaks
        SET 
          current_streak = 1,
          last_activity_date = current_date,
          total_days_active = total_days_active + 1,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
      END IF;
      -- If same day, do nothing (streak already counted)
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on daily activity
DROP TRIGGER IF EXISTS update_streak_on_activity ON daily_activity_log;
CREATE TRIGGER update_streak_on_activity
  AFTER INSERT ON daily_activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for challenges (public read, admin write)
CREATE POLICY "Anyone can view active challenges"
ON challenges FOR SELECT
TO authenticated
USING (is_active = true);

-- Policies for challenge_participants
CREATE POLICY "Users can view their own participations"
ON challenge_participants FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard (top scores)"
ON challenge_participants FOR SELECT
TO authenticated
USING (true); -- Everyone can see the leaderboard

CREATE POLICY "Users can join challenges"
ON challenge_participants FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations"
ON challenge_participants FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policies for user_streaks
CREATE POLICY "Users can view their own streak"
ON user_streaks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard streaks"
ON user_streaks FOR SELECT
TO authenticated
USING (true);

-- Policies for daily_activity_log
CREATE POLICY "Users can view their own activity"
ON daily_activity_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can log their own activity"
ON daily_activity_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: Initial Challenges
-- ============================================================================

INSERT INTO challenges (company, title, description, difficulty, reward_type, reward_description, starts_at, ends_at, is_active)
VALUES 
  (
    'Goldman Sachs',
    'M&A Valuation Challenge',
    'Analyse complète d''une fusion-acquisition : valorisation DCF, analyse de synergies, structuration de l''offre. Les 3 meilleurs candidats (top 0.01%) reçoivent un entretien prioritaire avec l''équipe M&A de Goldman Sachs Paris.',
    'Hard',
    'interview',
    'Entretien Fast-Track avec Goldman Sachs M&A Team',
    NOW(),
    NOW() + INTERVAL '45 days',
    true
  ),
  (
    'JP Morgan',
    'Trading Strategy: Fixed Income',
    'Développez une stratégie de trading sur le marché obligataire en période de volatilité des taux. Présentez votre approche de gestion du risque et vos prévisions macro. Le top 1% gagne un mentorat exclusif avec un Managing Director de JP Morgan.',
    'Hard',
    'mentorship',
    'Mentorat 1-on-1 avec MD de JP Morgan Trading Desk',
    NOW(),
    NOW() + INTERVAL '30 days',
    true
  ),
  (
    'Bank of America',
    'Leveraged Finance Case Study',
    'Structurez un financement LBO pour une acquisition dans le secteur tech. Analysez la capacité d''endettement, les covenants, et le profil de remboursement. Les 5 meilleurs (top 0.01%) sont invités au BofA Investment Banking Day à Londres.',
    'Medium',
    'networking_event',
    'Invitation exclusive au BofA Investment Banking Day (Londres)',
    NOW(),
    NOW() + INTERVAL '60 days',
    true
  ),
  (
    'Goldman Sachs',
    'Equity Research Sprint',
    'Rédigez un rapport d''analyse d''une entreprise du CAC 40 avec recommandation d''investissement (Buy/Hold/Sell), target price, et analyse des risques. Temps limité : 3 heures. Les meilleurs reçoivent une revue professionnelle de leur CV par les RH de Goldman Sachs.',
    'Medium',
    'resume_review',
    'Revue professionnelle du CV par Goldman Sachs Recruiting',
    NOW(),
    NOW() + INTERVAL '21 days',
    true
  ),
  (
    'JP Morgan',
    'Private Equity Case Competition',
    'Évaluez une opportunité d''investissement en private equity : due diligence, business plan sur 5 ans, stratégie de sortie. Le top 0.01% rencontre les associés du fonds de JP Morgan Asset Management.',
    'Hard',
    'interview',
    'Rencontre avec les associés de JP Morgan Asset Management',
    NOW(),
    NOW() + INTERVAL '40 days',
    true
  ),
  (
    'Bank of America',
    'ESG & Sustainable Finance',
    'Créez un framework d''évaluation ESG pour une entreprise cotée et proposez des green bonds. Analysez l''impact sur le coût du capital. Les gagnants participent au BofA Sustainable Finance Summit.',
    'Medium',
    'networking_event',
    'Participation au BofA Sustainable Finance Summit (New York)',
    NOW(),
    NOW() + INTERVAL '35 days',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS: Helper functions for gamification
-- ============================================================================

-- Function to get user's current rank in a challenge
CREATE OR REPLACE FUNCTION get_challenge_rank(challenge_uuid UUID, user_uuid UUID)
RETURNS INT AS $$
DECLARE
  user_rank INT;
BEGIN
  SELECT rank INTO user_rank FROM (
    SELECT 
      user_id,
      RANK() OVER (ORDER BY score DESC, time_taken_seconds ASC) as rank
    FROM challenge_participants
    WHERE challenge_id = challenge_uuid AND status = 'completed'
  ) ranked
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to log daily activity (call this from your app)
CREATE OR REPLACE FUNCTION log_user_activity(activity_type_param TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_activity_log (user_id, activity_date, activity_type)
  VALUES (auth.uid(), CURRENT_DATE, activity_type_param)
  ON CONFLICT (user_id, activity_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
