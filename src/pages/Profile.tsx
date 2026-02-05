 import { motion } from 'framer-motion';
 import { Bookmark, Clock, LogIn, Mail, Trophy, User } from 'lucide-react';
 import { Layout } from '@/components/layout/Layout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useState } from 'react';
 
 export default function Profile() {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
 
   // Mock logged in user data
   const mockUser = {
     name: 'Rahul Sharma',
     email: 'rahul.sharma@example.com',
     testsCompleted: 12,
     avgScore: 76,
     bookmarkedPapers: 8,
   };
 
   if (!isLoggedIn) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-8 max-w-md">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass rounded-2xl p-8"
           >
             <div className="text-center mb-8">
               <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                 <User className="h-8 w-8 text-primary" />
               </div>
               <h1 className="text-2xl font-bold">
                 {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
               </h1>
               <p className="text-muted-foreground mt-1">
                 {authMode === 'login' 
                   ? 'Sign in to access your saved papers and test history'
                   : 'Join WBExamVault to track your progress'
                 }
               </p>
             </div>
 
             <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
               <div className="space-y-4">
                 {authMode === 'signup' && (
                   <div>
                     <Label htmlFor="name">Full Name</Label>
                     <Input id="name" placeholder="Enter your name" className="mt-1.5" />
                   </div>
                 )}
                 <div>
                   <Label htmlFor="email">Email</Label>
                   <Input id="email" type="email" placeholder="Enter your email" className="mt-1.5" />
                 </div>
                 <div>
                   <Label htmlFor="password">Password</Label>
                   <Input id="password" type="password" placeholder="Enter your password" className="mt-1.5" />
                 </div>
 
                 <Button type="submit" className="w-full gradient-primary border-0">
                   <LogIn className="h-4 w-4 mr-2" />
                   {authMode === 'login' ? 'Sign In' : 'Create Account'}
                 </Button>
               </div>
             </form>
 
             <div className="relative my-6">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-border" />
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
               </div>
             </div>
 
             <Button variant="outline" className="w-full">
               <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                 <path
                   fill="currentColor"
                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                 />
                 <path
                   fill="currentColor"
                   d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                 />
                 <path
                   fill="currentColor"
                   d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                 />
                 <path
                   fill="currentColor"
                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                 />
               </svg>
               Continue with Google
             </Button>
 
             <p className="text-center text-sm text-muted-foreground mt-6">
               {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
               {' '}
               <button
                 type="button"
                 onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                 className="text-primary hover:underline font-medium"
               >
                 {authMode === 'login' ? 'Sign up' : 'Sign in'}
               </button>
             </p>
           </motion.div>
         </div>
       </Layout>
     );
   }
 
   // Logged in view
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
               <h1 className="text-2xl font-bold">{mockUser.name}</h1>
               <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                 <Mail className="h-4 w-4" />
                 {mockUser.email}
               </p>
             </div>
             <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
               Sign Out
             </Button>
           </div>
 
           {/* Stats */}
           <div className="grid grid-cols-3 gap-4 mt-8">
             <div className="text-center">
               <div className="text-2xl md:text-3xl font-bold text-primary">{mockUser.testsCompleted}</div>
               <div className="text-sm text-muted-foreground">Tests Completed</div>
             </div>
             <div className="text-center">
               <div className="text-2xl md:text-3xl font-bold text-primary">{mockUser.avgScore}%</div>
               <div className="text-sm text-muted-foreground">Avg Score</div>
             </div>
             <div className="text-center">
               <div className="text-2xl md:text-3xl font-bold text-primary">{mockUser.bookmarkedPapers}</div>
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
           </TabsList>
 
           <TabsContent value="history">
             <div className="space-y-3">
               {[
                 { title: 'Calculus Fundamentals', score: 84, date: '2 days ago' },
                 { title: 'Mechanics Basics', score: 72, date: '5 days ago' },
                 { title: 'Indian History', score: 90, date: '1 week ago' },
               ].map((test, index) => (
                 <motion.div
                   key={index}
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
                       <h3 className="font-medium">{test.title}</h3>
                       <p className="text-sm text-muted-foreground">{test.date}</p>
                     </div>
                   </div>
                   <div className={`text-lg font-bold ${
                     test.score >= 80 ? 'text-success' : test.score >= 60 ? 'text-warning' : 'text-destructive'
                   }`}>
                     {test.score}%
                   </div>
                 </motion.div>
               ))}
             </div>
           </TabsContent>
 
           <TabsContent value="bookmarks">
             <div className="space-y-3">
               {[
                 { subject: 'Mathematics', university: 'CU', year: 2023 },
                 { subject: 'Physics', university: 'JU', year: 2024 },
                 { subject: 'Computer Science', university: 'CU', year: 2023 },
               ].map((paper, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className="glass rounded-xl p-4 flex items-center justify-between"
                 >
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                       <Bookmark className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                       <h3 className="font-medium">{paper.subject}</h3>
                       <p className="text-sm text-muted-foreground">{paper.university} • {paper.year}</p>
                     </div>
                   </div>
                   <Button size="sm" variant="outline">
                     View
                   </Button>
                 </motion.div>
               ))}
             </div>
           </TabsContent>
         </Tabs>
       </div>
     </Layout>
   );
 }