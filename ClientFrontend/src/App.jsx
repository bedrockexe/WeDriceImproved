import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./pages/components/routeprotector";
import "react-datepicker/dist/react-datepicker.css"
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/register";

// Customer Dashboard
import DashboardLayout from "./pages/components/Dashboard/components/Layout/DashboardLayout";
import Dashboard from './pages/components/Dashboard/pages/Dashboard';
import ViewProfile from './pages/components/Dashboard/pages/ViewProfile';
import EditAccount from './pages/components/Dashboard/pages/EditAccount';
import Settings from './pages/components/Dashboard/pages/Settings';
import MyBookings from './pages/components/Dashboard/pages/MyBookings';
import AvailableCars from './pages/components/Dashboard/pages/AvailableCars';
import PaymentHistory from './pages/components/Dashboard/pages/PaymentHistory';
import Support from './pages/components/Dashboard/pages/Support';
import BookCar from './pages/components/Dashboard/pages/bookcar';
import VerifyIdentity from './pages/components/Dashboard/pages/verifyidentity';
import CarDetails from './pages/components/Dashboard/pages/CarDetails';
import ChangePassword from "./pages/components/Dashboard/pages/ChangePassword";
import BookingDetails from "./pages/components/Dashboard/pages/BookingDetails";
import ModifyBooking from "./pages/components/Dashboard/pages/ModifyBooking";
import NotFound from "./pages/components/Dashboard/pages/NotFound";
import NotificationsPage from "./pages/components/Dashboard/pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CancelBooking from "./pages/components/Dashboard/pages/CancelBooking";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/Policy";
import { NotificationProvider } from "./NotificationWrapper";
import Test from "./Test";
import DeleteAccount from "./pages/components/Dashboard/pages/DeleteAccount";


export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/test" element={<Test />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="car/:id" element={<CarDetails />} />
              <Route path="verify-identity" element={<VerifyIdentity />} />
              <Route path="book-car" element={<BookCar />} />
              <Route path="profile" element={<ViewProfile />} />
              <Route path="edit-account" element={<EditAccount />} />
              <Route path="settings" element={<Settings />} />
              <Route path="delete-account" element={<DeleteAccount />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="bookingdetails/:bookingId" element={<BookingDetails />} />
              <Route path="bookings/:bookingId/cancel" element={<CancelBooking />} />
              <Route path="bookingdetails/modify/:bookingId" element={<ModifyBooking />} />
              <Route path="cars" element={<AvailableCars />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="support" element={<Support />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </NotificationProvider>
  );
}
