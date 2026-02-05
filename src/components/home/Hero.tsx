 import { motion } from 'framer-motion';
 import { ArrowRight, BookOpen, FileText, GraduationCap } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 
 const stats = [
   { label: 'Question Papers', value: '1,500+', icon: FileText },
   { label: 'Universities', value: '8+', icon: BookOpen },
   { label: 'Mock Tests', value: '100+', icon: GraduationCap },
 ];
 
 export function Hero() {
   return (
     <section className="relative overflow-hidden">
       {/* Background gradient */}
       <div className="absolute inset-0 gradient-hero" />
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
       
       {/* Animated shapes */}
       <motion.div
         className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
         animate={{ 
           scale: [1, 1.2, 1],
           opacity: [0.3, 0.5, 0.3],
         }}
         transition={{ duration: 8, repeat: Infinity }}
       />
       <motion.div
         className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
         animate={{ 
           scale: [1.2, 1, 1.2],
           opacity: [0.2, 0.4, 0.2],
         }}
         transition={{ duration: 10, repeat: Infinity }}
       />
 
       <div className="relative container mx-auto px-4 py-20 md:py-32">
         <div className="max-w-4xl mx-auto text-center">
           {/* Badge */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               Trusted by 50,000+ students across West Bengal
             </span>
           </motion.div>
 
           {/* Heading */}
           <motion.h1
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="mt-8 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
           >
             Your Gateway to{' '}
             <span className="text-gradient">Exam Success</span>
           </motion.h1>
 
           {/* Subtitle */}
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
           >
             Access previous year question papers and take mock tests from all 
             West Bengal Government Universities. Prepare smarter, score better.
           </motion.p>
 
           {/* CTAs */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
           >
             <Link to="/papers">
               <Button size="lg" className="gradient-primary border-0 text-primary-foreground shadow-glow px-8 h-12">
                 Browse Papers
                 <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
             </Link>
             <Link to="/mock-tests">
               <Button size="lg" variant="outline" className="px-8 h-12 border-border hover:bg-muted">
                 Start Mock Test
               </Button>
             </Link>
           </motion.div>
 
           {/* Stats */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
           >
             {stats.map((stat, index) => (
               <motion.div
                 key={stat.label}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                 className="glass rounded-2xl p-4 md:p-6"
               >
                 <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                 <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                 <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
               </motion.div>
             ))}
           </motion.div>
         </div>
       </div>
     </section>
   );
 }