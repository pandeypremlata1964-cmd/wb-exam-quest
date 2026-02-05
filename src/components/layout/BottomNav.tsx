 import { Home, FileText, GraduationCap, User } from 'lucide-react';
 import { Link, useLocation } from 'react-router-dom';
 import { motion } from 'framer-motion';
 
 const navItems = [
   { href: '/', icon: Home, label: 'Home' },
   { href: '/papers', icon: FileText, label: 'Papers' },
   { href: '/mock-tests', icon: GraduationCap, label: 'Tests' },
   { href: '/profile', icon: User, label: 'Profile' },
 ];
 
 export function BottomNav() {
   const location = useLocation();
 
   return (
     <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border safe-bottom">
       <div className="flex items-center justify-around h-16 px-2">
         {navItems.map((item) => {
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