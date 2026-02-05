import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface QuestionPaper {
  id: string;
  course: string;
  subject: string;
  semester: string;
  year: number;
  pdf_url: string | null;
  downloads: number;
  universities: {
    name: string;
    short_name: string;
  };
}

export function RecentPapers() {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    const { data } = await supabase
      .from('question_papers')
      .select(`
        id,
        course,
        subject,
        semester,
        year,
        pdf_url,
        downloads,
        universities (
          name,
          short_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(6);

    if (data) {
      setPapers(data as unknown as QuestionPaper[]);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-medium"
            >
              Latest Additions
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-bold mt-2"
            >
              Recent Question Papers
            </motion.h2>
          </div>
          <Link 
            to="/papers" 
            className="hidden md:flex items-center gap-1 text-primary hover:underline"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Papers Grid */}
        <div className="grid gap-4">
          {papers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-4 md:p-5 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {paper.subject}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {paper.course} • {paper.semester} Semester • {paper.year}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paper.universities?.name}
                      </p>
                    </div>
                    {paper.pdf_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-primary hover:text-primary"
                        onClick={() => window.open(paper.pdf_url!, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {paper.downloads.toLocaleString()} downloads
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 text-center md:hidden">
          <Link 
            to="/papers" 
            className="inline-flex items-center gap-1 text-primary text-sm font-medium"
          >
            View all papers
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
