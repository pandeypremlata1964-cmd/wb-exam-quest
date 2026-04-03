import { useState, useEffect, useRef } from 'react';
import { Search, FileText, GraduationCap, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  type: 'paper' | 'test';
  id: string;
  title: string;
  subtitle: string;
}

export function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const searchTerm = `%${query}%`;

      const [papersRes, testsRes] = await Promise.all([
        supabase
          .from('question_papers')
          .select('id, subject, course, semester, year, universities(short_name)')
          .or(`subject.ilike.${searchTerm},course.ilike.${searchTerm}`)
          .eq('status', 'approved')
          .limit(5),
        supabase
          .from('mock_tests')
          .select('id, title, subject, chapter')
          .or(`title.ilike.${searchTerm},subject.ilike.${searchTerm},chapter.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),
      ]);

      const combined: SearchResult[] = [];

      if (papersRes.data) {
        papersRes.data.forEach((p: any) => {
          combined.push({
            type: 'paper',
            id: p.id,
            title: p.subject,
            subtitle: `${p.universities?.short_name || ''} • ${p.course} • ${p.semester} Sem • ${p.year}`,
          });
        });
      }

      if (testsRes.data) {
        testsRes.data.forEach((t: any) => {
          combined.push({
            type: 'test',
            id: t.id,
            title: t.title,
            subtitle: `${t.subject}${t.chapter ? ' • ' + t.chapter : ''}`,
          });
        });
      }

      setResults(combined);
      setIsOpen(combined.length > 0);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'paper') {
      navigate('/papers');
    } else {
      navigate(`/mock-tests/${result.id}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search papers, tests, subjects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 h-11 bg-muted/50 border-border/50 focus:bg-background"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-2 w-full z-50 glass-strong rounded-xl shadow-lg overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
                    {result.type === 'paper' ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <GraduationCap className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
            {query.length >= 2 && (
              <button
                onClick={() => { navigate('/papers'); setIsOpen(false); setQuery(''); }}
                className="w-full px-4 py-2.5 text-sm text-primary hover:bg-muted/50 transition-colors border-t border-border text-center"
              >
                View all results for "{query}"
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
