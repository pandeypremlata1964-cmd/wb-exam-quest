 import { Home, FileText, GraduationCap, Trophy, User } from 'lucide-react';
 import { Link, useLocation } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { useAuth } from '@/hooks/useAuth';
 
 const navItems = [
   { href: '/', icon: Home, label: 'Home' },
   { href: '/papers', icon: FileText, label: 'Papers' },
   { href: '/mock-tests', icon: GraduationCap, label: 'Tests' },
   { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
   { href: '/dashboard', icon: User, label: 'Me', auth: true },
   { href: '/profile', icon: User, label: 'Profile', auth: false },
 ];
 
 export function BottomNav() {
   const location = useLocation();
   const { user } = useAuth();
 
   const visibleItems = navItems.filter((item) => {
     if ('auth' in item) {
       return item.auth ? !!user : !user;
     }
     return true;
   });
 
   return (
     <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border safe-bottom">
       <div className="flex items-center justify-around h-16 px-2">
         {visibleItems.map((item) => {
           const isActive = location.pathname === item.href;
           const Icon = item.icon;
 
           return (
             <Link
               key={item.href}
               to={item.href}
               className="relative flex flex-col items-center justify-center flex-1 h-full"
             >
               {isActive && (
                 <motion.div
                   layoutId="bottomNavIndicator"
                   className="absolute inset-x-2 top-0 h-0.5 bg-primary rounded-full"
                   transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                 />
               )}
               <motion.div
                 animate={{ scale: isActive ? 1.1 : 1 }}
                 transition={{ type: 'spring', stiffness: 500, damping: 30 }}
               >
                 <Icon 
                   className={`h-5 w-5 transition-colors ${
                     isActive ? 'text-primary' : 'text-muted-foreground'
                   }`} 
                 />
               </motion.div>
               <span 
                 className={`text-xs mt-1 transition-colors ${
                   isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                 }`}
               >
                 {item.label}
               </span>
             </Link>
           );
         })}
       </div>
     </nav>
   );
 }