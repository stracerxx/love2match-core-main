import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SolanaWalletProvider } from "@/hooks/useSolanaWallet";
import { AdminRoute } from "@/pages/AdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Auth from "./pages/Auth";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Games from "./pages/Games";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Events from "./pages/Events";
import Gifts from "./pages/Gifts";
import Content from "./pages/Content";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import EventDetail from "./pages/EventDetail";
import VideoCall from "./pages/VideoCall";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SolanaWalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Discover />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Matches />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Wallet />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Games />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Events />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gifts"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Gifts />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/content"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Content />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-call"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VideoCall />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout>
                    <Admin />
                  </Layout>
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SolanaWalletProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
