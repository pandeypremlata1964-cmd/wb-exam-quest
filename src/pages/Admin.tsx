import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  GraduationCap,
  Plus,
  Settings,
  Trash2,
  Upload,
  Users,
  X,
  Edit,
  Building,
  TrendingUp,
  Database,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { BulkPaperUpload, QuestionBulkImport } from '@/components/admin/BulkImport';

interface University {
  id: string;
  name: string;
  short_name: string;
  location: string;
}

interface QuestionPaper {
  id: string;
  subject: string;
  course: string;
  semester: string;
  year: number;
  pdf_url: string | null;
  universities: { short_name: string };
}

interface MockTest {
  id: string;
  title: string;
  subject: string;
  chapter: string | null;
  duration: number;
  difficulty: string;
  is_active: boolean;
  questions: { count: number }[];
}

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  user_roles: { role: string }[];
}

const courses = ['BA', 'BSc', 'BCom', 'BBA', 'BCA', 'MA', 'MSc', 'MCom', 'MBA', 'MCA', 'BA Honours', 'BSc Honours', 'BCom Honours'];
const subjects = ['English', 'Bengali', 'Hindi', 'History', 'Political Science', 'Economics', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Accounting'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
const difficulties = ['Easy', 'Medium', 'Hard'];

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, isModerator, isLoading: authLoading } = useAuth();
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [stats, setStats] = useState({ users: 0, papers: 0, tests: 0, attempts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [paperDialogOpen, setPaperDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [bulkPaperUploadOpen, setBulkPaperUploadOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Form states
  const [paperForm, setPaperForm] = useState({
    university_id: '',
    course: '',
    subject: '',
    semester: '',
    year: new Date().getFullYear(),
    pdf_url: '',
    is_external_link: true,
  });

  const [testForm, setTestForm] = useState({
    title: '',
    subject: '',
    chapter: '',
    duration: 30,
    difficulty: 'Medium',
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 0,
    explanation: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isModerator))) {
      navigate('/');
      toast.error('Access denied. Admin or moderator role required.');
    }
  }, [user, isAdmin, isModerator, authLoading, navigate]);

  useEffect(() => {
    if (user && (isAdmin || isModerator)) {
      fetchData();
    }
  }, [user, isAdmin, isModerator]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUniversities(),
      fetchPapers(),
      fetchTests(),
      fetchStats(),
      isAdmin && fetchUsers(),
    ]);
    setIsLoading(false);
  };

  const fetchUniversities = async () => {
    const { data } = await supabase.from('universities').select('*').order('name');
    if (data) setUniversities(data);
  };

  const fetchPapers = async () => {
    const { data } = await supabase
      .from('question_papers')
      .select('id, subject, course, semester, year, pdf_url, universities(short_name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setPapers(data as unknown as QuestionPaper[]);
  };

  const fetchTests = async () => {
    const { data } = await supabase
      .from('mock_tests')
      .select('id, title, subject, chapter, duration, difficulty, is_active, questions(count)')
      .order('created_at', { ascending: false });
    if (data) setTests(data as unknown as MockTest[]);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) {
      // Fetch roles for each user
      const userIds = data.map(u => u.user_id);
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const usersWithRoles = data.map(u => ({
        ...u,
        user_roles: rolesData?.filter(r => r.user_id === u.user_id) || [],
      }));

      setUsers(usersWithRoles as unknown as UserWithRole[]);
    }
  };

  const fetchStats = async () => {
    const [usersCount, papersCount, testsCount, attemptsCount] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('question_papers').select('id', { count: 'exact', head: true }),
      supabase.from('mock_tests').select('id', { count: 'exact', head: true }),
      supabase.from('test_attempts').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      users: usersCount.count || 0,
      papers: papersCount.count || 0,
      tests: testsCount.count || 0,
      attempts: attemptsCount.count || 0,
    });
  };

  const handleAddPaper = async () => {
    if (!paperForm.university_id || !paperForm.subject || !paperForm.course) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { error } = await supabase.from('question_papers').insert({
      university_id: paperForm.university_id,
      course: paperForm.course,
      subject: paperForm.subject,
      semester: paperForm.semester,
      year: paperForm.year,
      pdf_url: paperForm.pdf_url || null,
      is_external_link: paperForm.is_external_link,
      uploaded_by: user?.id,
    });

    if (error) {
      toast.error('Failed to add paper');
    } else {
      toast.success('Paper added successfully!');
      setPaperDialogOpen(false);
      setPaperForm({
        university_id: '',
        course: '',
        subject: '',
        semester: '',
        year: new Date().getFullYear(),
        pdf_url: '',
        is_external_link: true,
      });
      fetchPapers();
      fetchStats();
    }
  };

  const handleAddTest = async () => {
    if (!testForm.title || !testForm.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { data, error } = await supabase.from('mock_tests').insert({
      title: testForm.title,
      subject: testForm.subject,
      chapter: testForm.chapter || null,
      duration: testForm.duration,
      difficulty: testForm.difficulty,
      created_by: user?.id,
    }).select().single();

    if (error) {
      toast.error('Failed to add test');
    } else {
      toast.success('Test created! Now add questions.');
      setTestDialogOpen(false);
      setSelectedTestId(data.id);
      setQuestionDialogOpen(true);
      setTestForm({
        title: '',
        subject: '',
        chapter: '',
        duration: 30,
        difficulty: 'Medium',
      });
      fetchTests();
      fetchStats();
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedTestId || !questionForm.question_text) {
      toast.error('Please fill in the question');
      return;
    }

    const options = [
      questionForm.option_a,
      questionForm.option_b,
      questionForm.option_c,
      questionForm.option_d,
    ].filter(Boolean);

    if (options.length < 2) {
      toast.error('Please add at least 2 options');
      return;
    }

    const { error } = await supabase.from('questions').insert({
      mock_test_id: selectedTestId,
      question_text: questionForm.question_text,
      options: options,
      correct_answer: questionForm.correct_answer,
      explanation: questionForm.explanation || null,
    });

    if (error) {
      toast.error('Failed to add question');
    } else {
      toast.success('Question added!');
      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 0,
        explanation: '',
      });
      fetchTests();
    }
  };

  const handleDeletePaper = async (id: string) => {
    const { error } = await supabase.from('question_papers').delete().eq('id', id);
    if (!error) {
      toast.success('Paper deleted');
      fetchPapers();
      fetchStats();
    }
  };

  const handleDeleteTest = async (id: string) => {
    const { error } = await supabase.from('mock_tests').delete().eq('id', id);
    if (!error) {
      toast.success('Test deleted');
      fetchTests();
      fetchStats();
    }
  };

  const handleToggleTestActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('mock_tests').update({ is_active: !isActive }).eq('id', id);
    if (!error) {
      fetchTests();
    }
  };

  const handleAssignRole = async (userId: string, role: 'admin' | 'moderator') => {
    const { error } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: role,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('User already has this role');
      } else {
        toast.error('Failed to assign role');
      }
    } else {
      toast.success(`${role} role assigned`);
      fetchUsers();
    }
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Manage papers, tests, and users
            </p>
          </div>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/20 text-primary">
            {isAdmin ? 'Admin' : 'Moderator'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.users, icon: Users },
            { label: 'Question Papers', value: stats.papers, icon: FileText },
            { label: 'Mock Tests', value: stats.tests, icon: GraduationCap },
            { label: 'Test Attempts', value: stats.attempts, icon: BarChart3 },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <stat.icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 p-1 mb-6 overflow-x-auto flex-nowrap">
            <TabsTrigger value="analytics" className="shrink-0">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="papers" className="shrink-0">
              <FileText className="h-4 w-4 mr-2" />
              Papers
            </TabsTrigger>
            <TabsTrigger value="tests" className="shrink-0">
              <GraduationCap className="h-4 w-4 mr-2" />
              Tests
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="shrink-0">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          {/* Papers Tab */}
          <TabsContent value="papers">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Question Papers</h2>
              <div className="flex gap-2">
                <Dialog open={bulkPaperUploadOpen} onOpenChange={setBulkPaperUploadOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Bulk Paper Upload</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <BulkPaperUpload
                        universities={universities}
                        onComplete={() => { setBulkPaperUploadOpen(false); fetchPapers(); fetchStats(); }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              <Dialog open={paperDialogOpen} onOpenChange={setPaperDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Paper
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Question Paper</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>University *</Label>
                      <Select value={paperForm.university_id} onValueChange={(v) => setPaperForm({ ...paperForm, university_id: v })}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.short_name} - {u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Course *</Label>
                        <Select value={paperForm.course} onValueChange={(v) => setPaperForm({ ...paperForm, course: v })}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Subject *</Label>
                        <Select value={paperForm.subject} onValueChange={(v) => setPaperForm({ ...paperForm, subject: v })}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Semester</Label>
                        <Select value={paperForm.semester} onValueChange={(v) => setPaperForm({ ...paperForm, semester: v })}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {semesters.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Year *</Label>
                        <Input
                          type="number"
                          value={paperForm.year}
                          onChange={(e) => setPaperForm({ ...paperForm, year: parseInt(e.target.value) })}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>PDF URL (external link)</Label>
                      <Input
                        value={paperForm.pdf_url}
                        onChange={(e) => setPaperForm({ ...paperForm, pdf_url: e.target.value })}
                        placeholder="https://..."
                        className="mt-1.5"
                      />
                    </div>
                    <Button onClick={handleAddPaper} className="w-full gradient-primary border-0">
                      <Upload className="h-4 w-4 mr-2" />
                      Add Paper
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            <div className="space-y-3">
              {papers.map((paper) => (
                <div key={paper.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{paper.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {paper.universities?.short_name} • {paper.course} • {paper.semester} Sem • {paper.year}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDeletePaper(paper.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mock Tests</h2>
              <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Mock Test</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={testForm.title}
                        onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                        placeholder="e.g. Calculus Fundamentals"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Subject *</Label>
                        <Select value={testForm.subject} onValueChange={(v) => setTestForm({ ...testForm, subject: v })}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Chapter</Label>
                        <Input
                          value={testForm.chapter}
                          onChange={(e) => setTestForm({ ...testForm, chapter: e.target.value })}
                          placeholder="Optional"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duration (mins)</Label>
                        <Input
                          type="number"
                          value={testForm.duration}
                          onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Difficulty</Label>
                        <Select value={testForm.difficulty} onValueChange={(v) => setTestForm({ ...testForm, difficulty: v })}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleAddTest} className="w-full gradient-primary border-0">
                      Create Test
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Add Questions Dialog */}
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label>Question *</Label>
                    <Textarea
                      value={questionForm.question_text}
                      onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                      placeholder="Enter the question"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Option A</Label>
                      <Input
                        value={questionForm.option_a}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Option B</Label>
                      <Input
                        value={questionForm.option_b}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Option C</Label>
                      <Input
                        value={questionForm.option_c}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Option D</Label>
                      <Input
                        value={questionForm.option_d}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Correct Answer</Label>
                    <Select value={questionForm.correct_answer.toString()} onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: parseInt(v) })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Option A</SelectItem>
                        <SelectItem value="1">Option B</SelectItem>
                        <SelectItem value="2">Option C</SelectItem>
                        <SelectItem value="3">Option D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Explanation (optional)</Label>
                    <Textarea
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                      placeholder="Why is this the correct answer?"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddQuestion} className="flex-1 gradient-primary border-0">
                      Add Question
                    </Button>
                    <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Import Dialog */}
            <Dialog open={bulkImportDialogOpen} onOpenChange={setBulkImportDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bulk Import Questions</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {selectedTestId && (
                    <QuestionBulkImport
                      testId={selectedTestId}
                      onComplete={() => { setBulkImportDialogOpen(false); fetchTests(); }}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-3">
              {tests.map((test) => (
                <div key={test.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{test.title}</h3>
                      {!test.is_active && (
                        <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {test.subject} • {test.questions?.[0]?.count || 0} questions • {test.duration} mins
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTestId(test.id);
                        setBulkImportDialogOpen(true);
                      }}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Import
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTestId(test.id);
                        setQuestionDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Q
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleToggleTestActive(test.id, test.is_active)}
                    >
                      {test.is_active ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteTest(test.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab (Admin only) */}
          {isAdmin && (
            <TabsContent value="users">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="space-y-3">
                {users.map((userData) => (
                  <div key={userData.id} className="glass rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{userData.full_name || 'No name'}</h3>
                        {userData.user_roles?.map((r) => (
                          <span key={r.role} className="px-2 py-0.5 text-xs rounded bg-primary/20 text-primary">
                            {r.role}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAssignRole(userData.id, 'moderator')}>
                        Make Mod
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAssignRole(userData.id, 'admin')}>
                        Make Admin
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
