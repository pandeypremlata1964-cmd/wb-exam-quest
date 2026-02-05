import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Clock, LogIn, Mail, Trophy, User, Settings, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestAttempt {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  mock_tests: {
    title: string;
    subject: string;
  };
}

interface BookmarkWithPaper {
  id: string;
  created_at: string;
  question_papers: {
    id: string;
    subject: string;
    course: string;
    year: number;
    universities: {
      short_name: string;
    };
  };
}

const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, isLoading, isAdmin, isModerator, signOut, updateProfile } = useAuth();
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkWithPaper[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    university: '',
    course: '',
    semester: '',
    bio: '',
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || '',
        university: profile.university || '',
        course: profile.course || '',
        semester: profile.semester || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchTestAttempts();
      fetchBookmarks();
    }
  }, [user]);

  const fetchTestAttempts = async () => {
    const { data } = await supabase
      .from('test_attempts')
      .select(`
        id,
        score,
        total_questions,
        completed_at,
        mock_tests (
          title,
          subject
        )
      `)
      .eq('user_id', user!.id)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (data) {
      setTestAttempts(data as unknown as TestAttempt[]);
    }
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        question_papers (
          id,
          subject,
          course,
          year,
          universities (
            short_name
          )
        )
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookmarks(data as unknown as BookmarkWithPaper[]);
    }
  };

  const handleSaveProfile = async () => {
    const { error } = await updateProfile(editData);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      setIsEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const removeBookmark = async (bookmarkId: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId);

    if (!error) {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      toast.success('Bookmark removed');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const avgScore = testAttempts.length > 0
    ? Math.round(testAttempts.reduce((acc, t) => acc + (t.score / t.total_questions) * 100, 0) / testAttempts.length)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold">{profile?.full_name || 'Student'}</h1>
                {(isAdmin || isModerator) && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                    {isAdmin ? 'Admin' : 'Moderator'}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </p>
              {profile?.university && (
                <p className="text-sm text-muted-foreground mt-1">
                  <GraduationCap className="h-4 w-4 inline mr-1" />
                  {profile.university} • {profile.course} • {profile.semester} Semester
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {(isAdmin || isModerator) && (
                <Link to="/admin">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{testAttempts.length}</div>
              <div className="text-sm text-muted-foreground">Tests Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{avgScore}%</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{bookmarks.length}</div>
              <div className="text-sm text-muted-foreground">Bookmarks</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 p-1 mb-6">
            <TabsTrigger value="history" className="flex-1 md:flex-none">
              <Clock className="h-4 w-4 mr-2" />
              Test History
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex-1 md:flex-none">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 md:flex-none">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {testAttempts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tests completed yet</p>
                <Link to="/mock-tests">
                  <Button variant="link" className="mt-2">Take your first test</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {testAttempts.map((attempt, index) => {
                  const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
                  return (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{attempt.mock_tests?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        percentage >= 80 ? 'text-success' : percentage >= 60 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {percentage}%
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks">
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bookmarked papers yet</p>
                <Link to="/papers">
                  <Button variant="link" className="mt-2">Browse question papers</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{bookmark.question_papers?.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {bookmark.question_papers?.universities?.short_name} • {bookmark.question_papers?.course} • {bookmark.question_papers?.year}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeBookmark(bookmark.id)}>
                      Remove
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-6">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={editData.university}
                    onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                    placeholder="e.g. University of Calcutta"
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      value={editData.course}
                      onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                      placeholder="e.g. BSc Honours"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={editData.semester} onValueChange={(v) => setEditData({ ...editData, semester: v })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((s) => (
                          <SelectItem key={s} value={s}>{s} Semester</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                    className="mt-1.5"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="gradient-primary border-0">
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
