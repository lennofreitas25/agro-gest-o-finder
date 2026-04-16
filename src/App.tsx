import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Employees from "./pages/Employees";
import Animals from "./pages/Animals";
import Cultures from "./pages/Cultures";
import CalendarPage from "./pages/CalendarPage";
import Feed from "./pages/Feed";
import Silage from "./pages/Silage";
import Bills from "./pages/Bills";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="employees" element={<Employees />} />
              <Route path="animals" element={<Animals />} />
              <Route path="cultures" element={<Cultures />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="feed" element={<Feed />} />
              <Route path="silage" element={<Silage />} />
              <Route path="bills" element={<Bills />} />
            </Route>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Admin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
