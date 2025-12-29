import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import AdminVerification from "./pages/UserManagement";
import { LoginPage } from "./Login/login";
import AdminFleetManagement from "./pages/CarManagement";
import BookingManagement from "./pages/BookingManagement";
import { AuthProvider } from "./authentication/AuthContext";
import ProtectedRoute from "./routeprotector/RouteProtector";
import ProfileSettings from "./pages/Profile";
import NotificationsPage from "./components/NotificationPage";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/test" element={<AdminFleetManagement />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/profile" element={<ProfileSettings />} />
                <Route path="/dashboard/notifications" element={<NotificationsPage />} />
                <Route path="/dashboard/bookings" element={<BookingManagement />} />
                <Route path="/dashboard/customers" element={<AdminVerification />} />
                <Route path="/dashboard/fleet" element={<AdminFleetManagement />} />
                <Route path="/dashboard/history" element={<History />} />
                <Route path="/dashboard/calendar" element={<Calendar />} />
                <Route path="/dashboard/settings" element={<Settings />} />
                <Route path="/dashboard/help" element={<Help />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
