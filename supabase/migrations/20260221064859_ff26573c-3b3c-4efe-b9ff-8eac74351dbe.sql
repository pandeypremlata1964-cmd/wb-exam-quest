
-- Function to get leaderboard data (security definer to bypass RLS on test_attempts)
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  _limit integer DEFAULT 50,
  _subject text DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  university text,
  total_tests integer,
  avg_score numeric,
  total_score bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ta.user_id,
    p.full_name,
    p.avatar_url,
    p.university,
    COUNT(ta.id)::integer as total_tests,
    ROUND(AVG(ta.score::numeric / NULLIF(ta.total_questions, 0) * 100), 1) as avg_score,
    SUM(ta.score)::bigint as total_score
  FROM test_attempts ta
  JOIN profiles p ON p.user_id = ta.user_id
  LEFT JOIN mock_tests mt ON mt.id = ta.mock_test_id
  WHERE (_subject IS NULL OR mt.subject = _subject)
  GROUP BY ta.user_id, p.full_name, p.avatar_url, p.university
  ORDER BY avg_score DESC, total_tests DESC
  LIMIT _limit
$$;

-- Function to get analytics data for admin
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS TABLE (
  total_users bigint,
  total_papers bigint,
  total_tests bigint,
  total_attempts bigint,
  total_bookmarks bigint,
  recent_signups bigint,
  recent_attempts bigint,
  avg_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM question_papers) as total_papers,
    (SELECT COUNT(*) FROM mock_tests) as total_tests,
    (SELECT COUNT(*) FROM test_attempts) as total_attempts,
    (SELECT COUNT(*) FROM bookmarks) as total_bookmarks,
    (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as recent_signups,
    (SELECT COUNT(*) FROM test_attempts WHERE completed_at > NOW() - INTERVAL '7 days') as recent_attempts,
    (SELECT ROUND(AVG(score::numeric / NULLIF(total_questions, 0) * 100), 1) FROM test_attempts) as avg_score
$$;

-- Function to get popular subjects
CREATE OR REPLACE FUNCTION public.get_popular_subjects(_limit integer DEFAULT 10)
RETURNS TABLE (
  subject text,
  paper_count bigint,
  test_count bigint,
  attempt_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.subject,
    COALESCE(qp.cnt, 0) as paper_count,
    COALESCE(mt.cnt, 0) as test_count,
    COALESCE(ta.cnt, 0) as attempt_count
  FROM (
    SELECT DISTINCT subject FROM question_papers
    UNION
    SELECT DISTINCT subject FROM mock_tests
  ) s
  LEFT JOIN (SELECT subject, COUNT(*) as cnt FROM question_papers GROUP BY subject) qp ON qp.subject = s.subject
  LEFT JOIN (SELECT subject, COUNT(*) as cnt FROM mock_tests GROUP BY subject) mt ON mt.subject = s.subject
  LEFT JOIN (
    SELECT mt2.subject, COUNT(*) as cnt 
    FROM test_attempts ta2 
    JOIN mock_tests mt2 ON mt2.id = ta2.mock_test_id 
    GROUP BY mt2.subject
  ) ta ON ta.subject = s.subject
  ORDER BY attempt_count DESC
  LIMIT _limit
$$;
