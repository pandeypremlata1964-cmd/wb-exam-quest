 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { Download, FileText, Filter, Search, X } from 'lucide-react';
 import { Layout } from '@/components/layout/Layout';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
 import { universities, courses, subjects, semesters, questionPapers } from '@/data/mockData';
 
 export default function Papers() {
   const [searchQuery, setSearchQuery] = useState('');
   const [filters, setFilters] = useState({
     university: '',
     course: '',
     subject: '',
     semester: '',
     year: '',
   });
 
   const filteredPapers = questionPapers.filter((paper) => {
     const matchesSearch = 
       paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
       paper.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
       paper.course.toLowerCase().includes(searchQuery.toLowerCase());
     
     const matchesUniversity = !filters.university || paper.universityId === filters.university;
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
         <Select value={filters.university} onValueChange={(v) => setFilters({ ...filters, university: v })}>
           <SelectTrigger>
             <SelectValue placeholder="All Universities" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="">All Universities</SelectItem>
             {universities.map((u) => (
               <SelectItem key={u.id} value={u.id}>{u.shortName} - {u.name}</SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       <div>
         <label className="text-sm font-medium mb-2 block">Course</label>
         <Select value={filters.course} onValueChange={(v) => setFilters({ ...filters, course: v })}>
           <SelectTrigger>
             <SelectValue placeholder="All Courses" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="">All Courses</SelectItem>
             {courses.map((c) => (
               <SelectItem key={c} value={c}>{c}</SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       <div>
         <label className="text-sm font-medium mb-2 block">Subject</label>
         <Select value={filters.subject} onValueChange={(v) => setFilters({ ...filters, subject: v })}>
           <SelectTrigger>
             <SelectValue placeholder="All Subjects" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="">All Subjects</SelectItem>
             {subjects.map((s) => (
               <SelectItem key={s} value={s}>{s}</SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       <div>
         <label className="text-sm font-medium mb-2 block">Semester</label>
         <Select value={filters.semester} onValueChange={(v) => setFilters({ ...filters, semester: v })}>
           <SelectTrigger>
             <SelectValue placeholder="All Semesters" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="">All Semesters</SelectItem>
             {semesters.map((s) => (
               <SelectItem key={s} value={s}>{s} Semester</SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>
 
       <div>
         <label className="text-sm font-medium mb-2 block">Year</label>
         <Select value={filters.year} onValueChange={(v) => setFilters({ ...filters, year: v })}>
           <SelectTrigger>
             <SelectValue placeholder="All Years" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="">All Years</SelectItem>
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
                             {paper.university}
                           </p>
                         </div>
                         <Button size="sm" className="shrink-0 gradient-primary border-0">
                           <Download className="h-4 w-4 mr-1" />
                           <span className="hidden sm:inline">Download</span>
                         </Button>
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
           </div>
         </div>
       </div>
     </Layout>
   );
 }