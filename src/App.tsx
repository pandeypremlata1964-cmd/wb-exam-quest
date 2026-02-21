import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Papers from "./pages/Papers";
import MockTests from "./pages/MockTests";
import MockTestDetail from "./pages/MockTestDetail";
import Universities from "./pages/Universities";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/papers" element={<Papers />} />
              <Route path="/mock-tests" element={<MockTests />} />
              <Route path="/mock-tests/:id" element={<MockTestDetail />} />
              <Route path="/universities" element={<Universities />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
