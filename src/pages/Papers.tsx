import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Download, FileText, Filter, Search, X, Eye } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PDFViewer } from '@/components/PDFViewer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface University {
  id: string;
  name: string;
  short_name: string;
}

interface QuestionPaper {
  id: string;
  course: string;
  subject: string;
  semester: string;
  year: number;
  pdf_url: string | null;
  downloads: number;
  universities: University;
}

const courses = [
  'BA', 'BSc', 'BCom', 'BBA', 'BCA',
  'MA', 'MSc', 'MCom', 'MBA', 'MCA',
  'BA Honours', 'BSc Honours', 'BCom Honours',
];

const subjects = [
  'English', 'Bengali', 'Hindi', 'History', 'Political Science',
  'Economics', 'Philosophy', 'Sociology', 'Geography', 'Education',
  'Mathematics', 'Physics', 'Chemistry', 'Botany', 'Zoology',
  'Computer Science', 'Statistics', 'Accounting', 'Business Law',
];

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

export default function Papers() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfViewer, setPdfViewer] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });
  const [filters, setFilters] = useState({
    university: '',
    course: '',
    subject: '',
    semester: '',
    year: '',
  });

  useEffect(() => {
    fetchUniversities();
    fetchPapers();
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchUniversities = async () => {
    const { data } = await supabase
      .from('universities')
      .select('id, name, short_name')
      .order('name');
    if (data) setUniversities(data);
  };

  const fetchPapers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
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
          id,
          name,
          short_name
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setPapers(data as unknown as QuestionPaper[]);
    }
    setIsLoading(false);
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('question_paper_id')
      .eq('user_id', user!.id);

    if (data) {
      setBookmarkedIds(new Set(data.map((b) => b.question_paper_id)));
    }
  };

  const toggleBookmark = async (paperId: string) => {
    if (!user) {
      toast.error('Please sign in to bookmark papers');
      return;
    }

    if (bookmarkedIds.has(paperId)) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('question_paper_id', paperId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(paperId);
        return next;
      });
      toast.success('Bookmark removed');
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, question_paper_id: paperId });
      setBookmarkedIds((prev) => new Set(prev).add(paperId));
      toast.success('Paper bookmarked!');
    }
  };

  const openPdfViewer = (paper: QuestionPaper) => {
    if (paper.pdf_url) {
      setPdfViewer({
        isOpen: true,
        url: paper.pdf_url,
        title: `${paper.subject} - ${paper.universities.short_name} ${paper.year}`,
      });
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.universities.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUniversity = !filters.university || paper.universities.id === filters.university;
    const matchesCourse = !filters.course || paper.course === filters.course;
    const matchesSubject = !filters.subject || paper.subject === filters.subject;
    const matchesSemester = !filters.semester || paper.semester === filters.semester;
    const matchesYear = !filters.year || paper.year.toString() === filters.year;

    return matchesSearch && matchesUniversity && matchesCourse && matchesSubject && matchesSemester && matchesYear;
  });

  const clearFilters = () => {
    setFilters({ university: '', course: '', subject: '', semester: '', year: '' });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">University</label>
        <Select value={filters.university || "all"} onValueChange={(v) => setFilters({ ...filters, university: v === "all" ? "" : v })}>
          <SelectTrigger>
            <SelectValue placeholder="All Universities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Universities</SelectItem>
            {universities.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.short_name} - {u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Course</label>
        <Select value={filters.course || "all"} onValueChange={(v) => setFilters({ ...filters, course: v === "all" ? "" : v })}>
          <SelectTrigger>
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Subject</label>
        <Select value={filters.subject || "all"} onValueChange={(v) => setFilters({ ...filters, subject: v === "all" ? "" : v })}>
          <SelectTrigger>
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Semester</label>
        <Select value={filters.semester || "all"} onValueChange={(v) => setFilters({ ...filters, semester: v === "all" ? "" : v })}>
          <SelectTrigger>
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s} value={s}>{s} Semester</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Year</label>
        <Select value={filters.year || "all"} onValueChange={(v) => setFilters({ ...filters, year: v === "all" ? "" : v })}>
          <SelectTrigger>
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {[2024, 2023, 2022, 2021, 2020].map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Question Papers</h1>
          <p className="text-muted-foreground mt-2">
            Browse and download previous year question papers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden shrink-0">
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="glass rounded-2xl p-5 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h3>
              <FilterContent />
            </div>
          </div>

          {/* Papers List */}
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-4">
              {filteredPapers.length} papers found
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPapers.map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="glass rounded-xl p-4 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {paper.subject}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {paper.course} • {paper.semester} Semester • {paper.year}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {paper.universities.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleBookmark(paper.id)}
                              className="shrink-0"
                            >
                              {bookmarkedIds.has(paper.id) ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                            {paper.pdf_url && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openPdfViewer(paper)}
                                  className="shrink-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="shrink-0 gradient-primary border-0"
                                  onClick={() => window.open(paper.pdf_url!, '_blank')}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Download</span>
                                </Button>
                              </>
                            )}
                          </div>
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

                {filteredPapers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No papers found matching your criteria</p>
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PDFViewer
        isOpen={pdfViewer.isOpen}
        onClose={() => setPdfViewer({ ...pdfViewer, isOpen: false })}
        pdfUrl={pdfViewer.url}
        title={pdfViewer.title}
      />
    </Layout>
  );
}
