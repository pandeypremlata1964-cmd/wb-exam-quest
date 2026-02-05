 import { motion } from 'framer-motion';
 import { ChevronRight, Clock, Users, Zap } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { mockTests } from '@/data/mockData';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 
 const difficultyColors = {
   Easy: 'bg-success/20 text-success',
   Medium: 'bg-warning/20 text-warning',
   Hard: 'bg-destructive/20 text-destructive',
 };
 
 export function MockTestSection() {
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
               Practice Tests
             </motion.span>
             <motion.h2
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-2xl md:text-4xl font-bold mt-2"
             >
               Popular Mock Tests
             </motion.h2>
           </div>
           <Link 
             to="/mock-tests" 
             className="hidden md:flex items-center gap-1 text-primary hover:underline"
           >
             View all
             <ChevronRight className="h-4 w-4" />
           </Link>
         </div>
 
         {/* Tests Grid */}
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
           {mockTests.slice(0, 6).map((test, index) => (
             <motion.div
               key={test.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: index * 0.05 }}
               className="glass rounded-2xl p-5 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group"
             >
               <div className="flex items-start justify-between">
                 <Badge className={difficultyColors[test.difficulty]}>
                   {test.difficulty}
                 </Badge>
                 <div className="flex items-center gap-1 text-xs text-muted-foreground">
                   <Users className="h-3 w-3" />
                   {test.attempts.toLocaleString()}
                 </div>
               </div>
               
               <h3 className="font-semibold text-lg mt-4 group-hover:text-primary transition-colors">
                 {test.title}
               </h3>
               <p className="text-sm text-muted-foreground mt-1">
                 {test.subject} {test.chapter && `• ${test.chapter}`}
               </p>
 
               <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                 <span className="flex items-center gap-1">
                   <Zap className="h-4 w-4 text-primary" />
                   {test.questions} Qs
                 </span>
                 <span className="flex items-center gap-1">
                   <Clock className="h-4 w-4 text-primary" />
                   {test.duration} min
                 </span>
               </div>
 
               <Link to={`/mock-tests/${test.id}`}>
                 <Button className="w-full mt-4 gradient-primary border-0">
                   Start Test
                 </Button>
               </Link>
             </motion.div>
           ))}
         </div>
 
         {/* Mobile view all */}
         <div className="mt-6 text-center md:hidden">
           <Link 
             to="/mock-tests" 
             className="inline-flex items-center gap-1 text-primary text-sm font-medium"
           >
             View all mock tests
             <ChevronRight className="h-4 w-4" />
           </Link>
         </div>
       </div>
     </section>
   );
 }