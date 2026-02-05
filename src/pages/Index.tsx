import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { UniversitySection } from '@/components/home/UniversitySection';
import { RecentPapers } from '@/components/home/RecentPapers';
import { MockTestSection } from '@/components/home/MockTestSection';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <UniversitySection />
      <RecentPapers />
      <MockTestSection />
    </Layout>
  );
};

export default Index;
