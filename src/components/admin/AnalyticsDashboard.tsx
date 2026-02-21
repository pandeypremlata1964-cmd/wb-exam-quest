import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookmarkCheck, FileText, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

interface Analytics {
  total_users: number;
  total_papers: number;
  total_tests: number;
  total_attempts: number;
  total_bookmarks: number;
  recent_signups: number;
  recent_attempts: number;
  avg_score: number;
}

interface SubjectStat {
  subject: string;
  paper_count: number;
  test_count: number;
  attempt_count: number;
}

const COLORS = [
  'hsl(173, 80%, 40%)', 'hsl(190, 80%, 50%)', 'hsl(210, 70%, 50%)',
  'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)',
  'hsl(270, 70%, 60%)', 'hsl(320, 70%, 50%)',
];

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchSubjects()]).then(() => setIsLoading(false));
  }, []);

  const fetchAnalytics = async () => {
    const { data } = await supabase.rpc('get_admin_analytics');
    if (data && data.length > 0) {
      setAnalytics(data[0] as unknown as Analytics);
    }
  };

  const fetchSubjects = async () => {
    const { data } = await supabase.rpc('get_popular_subjects', { _limit: 10 });
    if (data) {
      setSubjects(data as unknown as SubjectStat[]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = analytics ? [
    { label: 'Total Users', value: analytics.total_users, icon: Users, change: `+${analytics.recent_signups} this week` },
    { label: 'Question Papers', value: analytics.total_papers, icon: FileText, change: '' },
    { label: 'Mock Tests', value: analytics.total_tests, icon: GraduationCap, change: '' },
    { label: 'Test Attempts', value: analytics.total_attempts, icon: BarChart3, change: `+${analytics.recent_attempts} this week` },
    { label: 'Bookmarks', value: analytics.total_bookmarks, icon: BookmarkCheck, change: '' },
    { label: 'Avg Score', value: `${analytics.avg_score || 0}%`, icon: TrendingUp, change: '' },
  ] : [];

  const pieData = subjects.slice(0, 6).map((s) => ({
    name: s.subject,
    value: Number(s.attempt_count) || 1,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <stat.icon className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            {stat.change && (
              <div className="text-xs text-success mt-1">{stat.change}</div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Popular Subjects Bar Chart */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Popular Subjects</h3>
          {subjects.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjects.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" fontSize={10} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={60} />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="attempt_count" name="Attempts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paper_count" name="Papers" fill="hsl(190, 80%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              No data yet
            </div>
          )}
        </div>

        {/* Subject Distribution Pie */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Test Attempt Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              No data yet
            </div>
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
