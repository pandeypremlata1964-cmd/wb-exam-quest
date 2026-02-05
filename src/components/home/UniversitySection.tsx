import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface University {
  id: string;
  name: string;
  short_name: string;
  location: string;
  question_papers: { count: number }[];
}

export function UniversitySection() {
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const { data } = await supabase
      .from('universities')
      .select(`
        id,
        name,
        short_name,
        location,
        question_papers (count)
      `)
      .order('name')
      .limit(8);

    if (data) {
      setUniversities(data as unknown as University[]);
    }
  };

  return (
    <section className="py-16 md:py-24">
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
              Universities
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-bold mt-2"
            >
              Browse by University
            </motion.h2>
          </div>
          <Link 
            to="/universities" 
            className="hidden md:flex items-center gap-1 text-primary hover:underline"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {universities.map((university, index) => (
            <motion.div
              key={university.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/papers?university=${university.id}`}
                className="block glass rounded-2xl p-5 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                  {university.short_name}
                </div>
                <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {university.name}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {university.location}
                </div>
                <div className="mt-3 text-xs text-primary font-medium">
                  {university.question_papers?.[0]?.count || 0} papers
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 text-center md:hidden">
          <Link 
            to="/universities" 
            className="inline-flex items-center gap-1 text-primary text-sm font-medium"
          >
            View all universities
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
