-- ============================================================================
-- CLEANUP ET INSERTION DES CHALLENGES BANQUES D'INVESTISSEMENT
-- ============================================================================
-- Exécutez ce script UNIQUEMENT si vous voulez remplacer les anciens challenges
-- Sinon, exécutez directement gamification-setup.sql
-- ============================================================================

-- Supprimer les anciens challenges (optionnel)
DELETE FROM challenge_participants;
DELETE FROM challenges;

-- Réinitialiser les séquences
ALTER SEQUENCE IF EXISTS challenges_id_seq RESTART WITH 1;

-- Insérer les nouveaux challenges
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
  );

-- Vérifier les challenges insérés
SELECT company, title, difficulty, reward_type FROM challenges ORDER BY company, difficulty;
