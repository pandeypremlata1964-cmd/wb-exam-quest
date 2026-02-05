import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Search, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface MockTest {
  id: string;
  title: string;
  subject: string;
  chapter: string | null;
  duration: number;
  difficulty: string;
  questions: { count: number }[];
}

const difficultyColors: Record<string, string> = {
  Easy: 'bg-success/20 text-success',
  Medium: 'bg-warning/20 text-warning',
  Hard: 'bg-destructive/20 text-destructive',
};

export default function MockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('mock_tests')
      .select(`
        id,
        title,
        subject,
        chapter,
        duration,
        difficulty,
        questions (count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setTests(data as unknown as MockTest[]);
      const uniqueSubjects = [...new Set(data.map((t) => t.subject))];
      setSubjects(uniqueSubjects);
    }
    setIsLoading(false);
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || test.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Mock Tests</h1>
          <p className="text-muted-foreground mt-2">
            Practice with chapter-wise and subject-wise mock tests
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mock tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Subject Tabs */}
        <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1">
            <TabsTrigger value="all" className="shrink-0">All Subjects</TabsTrigger>
            {subjects.map((subject) => (
              <TabsTrigger key={subject} value={subject} className="shrink-0">
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Tests Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass rounded-2xl p-5 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <Badge className={difficultyColors[test.difficulty] || difficultyColors.Medium}>
                    {test.difficulty}
                  </Badge>
                </div>

                <h3 className="font-semibold text-lg mt-4 group-hover:text-primary transition-colors">
                  {test.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {test.subject} {test.chapter && `• ${test.chapter}`}
                </p>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    {test.questions?.[0]?.count || 0} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    {test.duration} mins
                  </span>
                </div>

                <Link to={`/mock-tests/${test.id}`}>
                  <Button className="w-full mt-4 gradient-primary border-0">
                    Start Test
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {filteredTests.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No mock tests found matching your criteria</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
