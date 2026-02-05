import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface University {
  id: string;
  name: string;
  short_name: string;
  location: string;
  question_papers: { count: number }[];
}

export default function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('universities')
      .select(`
        id,
        name,
        short_name,
        location,
        question_papers (count)
      `)
      .order('name');

    if (data) {
      setUniversities(data as unknown as University[]);
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Universities</h1>
          <p className="text-muted-foreground mt-2">
            Browse question papers by university
          </p>
        </div>

        {/* Universities Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {universities.map((university, index) => (
              <motion.div
                key={university.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/papers?university=${university.id}`}
                  className="block glass rounded-2xl p-6 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group h-full"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
                    {university.short_name}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {university.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {university.location}
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                    <FileText className="h-4 w-4" />
                    {university.question_papers?.[0]?.count || 0} papers available
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
