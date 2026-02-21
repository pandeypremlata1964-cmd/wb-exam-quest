import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Trophy, Users, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  total_tests: number;
  avg_score: number;
  total_score: number;
}

const rankIcons = [Crown, Medal, Trophy];
const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const { data } = await supabase
      .from('mock_tests')
      .select('subject')
      .eq('is_active', true);
    if (data) {
      const unique = [...new Set(data.map((d) => d.subject))];
      setSubjects(unique);
    }
  };

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_leaderboard', {
      _limit: 50,
      _subject: selectedSubject === 'all' ? null : selectedSubject,
    });

    if (data) {
      setEntries(data as LeaderboardEntry[]);
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Top performers across all mock tests
          </p>
        </div>

        {/* Subject Filter */}
        <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1">
            <TabsTrigger value="all" className="shrink-0">All Subjects</TabsTrigger>
            {subjects.map((s) => (
              <TabsTrigger key={s} value={s} className="shrink-0">{s}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No test attempts yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {entries.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[1, 0, 2].map((rankIndex) => {
                  const entry = entries[rankIndex];
                  if (!entry) return null;
                  const isFirst = rankIndex === 0;
                  const RankIcon = rankIcons[rankIndex];
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rankIndex * 0.1 }}
                      className={`glass rounded-2xl p-4 text-center ${
                        isFirst ? 'md:-mt-4 border-primary/30' : ''
                      } ${entry.user_id === user?.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <RankIcon className={`h-6 w-6 mx-auto mb-2 ${rankColors[rankIndex]}`} />
                      <Avatar className="h-12 w-12 mx-auto mb-2">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(entry.full_name || '?')[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-sm truncate">
                        {entry.full_name || 'Anonymous'}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.university || 'Unknown'}
                      </p>
                      <div className="text-xl font-bold text-primary mt-2">
                        {entry.avg_score}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.total_tests} tests
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full List */}
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`glass rounded-xl p-4 flex items-center gap-4 ${
                    entry.user_id === user?.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="w-8 text-center font-bold text-muted-foreground">
                    {index < 3 ? (
                      (() => {
                        const Icon = rankIcons[index];
                        return <Icon className={`h-5 w-5 mx-auto ${rankColors[index]}`} />;
                      })()
                    ) : (
                      <span>#{index + 1}</span>
                    )}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {(entry.full_name || '?')[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {entry.full_name || 'Anonymous'}
                      {entry.user_id === user?.id && (
                        <span className="text-xs text-primary ml-2">(You)</span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.university || 'Unknown'} • {entry.total_tests} tests
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{entry.avg_score}%</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {entry.total_score} pts
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
