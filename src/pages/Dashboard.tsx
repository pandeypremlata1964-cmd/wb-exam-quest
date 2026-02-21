import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookmarkCheck, Clock, FileText, Flame, GraduationCap, 
  Target, Trophy, TrendingUp, User 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';

interface TestAttempt {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  time_taken: number | null;
  mock_tests: {
    title: string;
    subject: string;
  };
}

interface BookmarkItem {
  id: string;
  question_papers: {
    subject: string;
    course: string;
    year: number;
    universities: { short_name: string };
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      Promise.all([fetchAttempts(), fetchBookmarks()]).then(() => setIsLoading(false));
    }
  }, [user]);

  const fetchAttempts = async () => {
    const { data } = await supabase
      .from('test_attempts')
      .select('id, score, total_questions, completed_at, time_taken, mock_tests(title, subject)')
      .eq('user_id', user!.id)
      .order('completed_at', { ascending: false })
      .limit(50);
    if (data) setAttempts(data as unknown as TestAttempt[]);
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('id, question_papers(subject, course, year, universities(short_name))')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setBookmarks(data as unknown as BookmarkItem[]);
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  // Calculate stats
  const totalTests = attempts.length;
  const avgScore = totalTests > 0
    ? Math.round(attempts.reduce((a, t) => a + (t.score / t.total_questions) * 100, 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0
    ? Math.round(Math.max(...attempts.map((t) => (t.score / t.total_questions) * 100)))
    : 0;
  const totalTime = attempts.reduce((a, t) => a + (t.time_taken || 0), 0);
  const hoursStudied = Math.round(totalTime / 3600 * 10) / 10;

  // Study streak calculation
  const getStreak = () => {
    if (attempts.length === 0) return 0;
    const dates = [...new Set(attempts.map((a) => new Date(a.completed_at).toDateString()))];
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (dates.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) break;
    }
    return streak;
  };
  const streak = getStreak();

  // Score trend data (last 10 tests, reversed for chronological order)
  const scoreTrend = [...attempts].reverse().slice(-10).map((a, i) => ({
    test: i + 1,
    score: Math.round((a.score / a.total_questions) * 100),
    name: a.mock_tests?.title?.substring(0, 15) || `Test ${i + 1}`,
  }));

  // Subject performance
  const subjectMap = new Map<string, { total: number; score: number; count: number }>();
  attempts.forEach((a) => {
    const subject = a.mock_tests?.subject || 'Unknown';
    const existing = subjectMap.get(subject) || { total: 0, score: 0, count: 0 };
    existing.total += a.total_questions;
    existing.score += a.score;
    existing.count += 1;
    subjectMap.set(subject, existing);
  });
  const subjectData = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject: subject.substring(0, 12),
    avg: Math.round((data.score / data.total) * 100),
    tests: data.count,
  }));

  const stats = [
    { label: 'Tests Taken', value: totalTests, icon: GraduationCap, color: 'text-primary' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: Target, color: 'text-primary' },
    { label: 'Best Score', value: `${bestScore}%`, icon: Trophy, color: 'text-success' },
    { label: 'Study Streak', value: `${streak}d`, icon: Flame, color: 'text-warning' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your study overview
            </p>
          </div>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-5"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Score Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Score Trend
            </h3>
            {scoreTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="test" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                Take more tests to see your trend
              </div>
            )}
          </motion.div>

          {/* Subject Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Subject Performance
            </h3>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="subject" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                No subject data yet
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Tests
            </h3>
            {attempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tests taken yet</p>
                <Link to="/mock-tests">
                  <Button variant="link" size="sm" className="mt-1">Take a test</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.slice(0, 5).map((a) => {
                  const pct = Math.round((a.score / a.total_questions) * 100);
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        pct >= 70 ? 'bg-success/10 text-success' : pct >= 40 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {pct}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.mock_tests?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Progress value={pct} className="w-16 h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Bookmarked Papers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4 text-primary" />
              Bookmarked Papers
            </h3>
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookmarkCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookmarks yet</p>
                <Link to="/papers">
                  <Button variant="link" size="sm" className="mt-1">Browse papers</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.question_papers?.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.question_papers?.universities?.short_name} • {b.question_papers?.course} • {b.question_papers?.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/mock-tests">
            <Button className="gradient-primary border-0">
              <GraduationCap className="h-4 w-4 mr-2" />
              Take a Test
            </Button>
          </Link>
          <Link to="/papers">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Browse Papers
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="outline">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
