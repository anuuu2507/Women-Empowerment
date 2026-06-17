import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import LanguageSelect from "./pages/LanguageSelect";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import TakeWork from "./pages/TakeWork";
import GiveWork from "./pages/GiveWork";
import Profile from "./pages/Profile";
import WorkHistory from "./pages/WorkHistory";
import Chat from "./pages/Chat";
import MyPostings from "./pages/MyPostings";
import MyTasks from "./pages/MyTasks";
import Settings from "./pages/Settings";
import NearMe from "./pages/NearMe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LanguageSelect />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
      <Route path="/take-work" element={<ProtectedRoute><TakeWork /></ProtectedRoute>} />
      <Route path="/give-work" element={<ProtectedRoute><GiveWork /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><WorkHistory /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/near-me" element={<ProtectedRoute><NearMe /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/my-postings" element={<ProtectedRoute><MyPostings /></ProtectedRoute>} />
      <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
