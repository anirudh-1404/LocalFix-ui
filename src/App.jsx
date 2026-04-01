import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import "./App.css";
import Home from "./Pages/Home";
import Services from "./Pages/Services";
import Cart from "./Pages/Cart";
import LoginPage from "./Pages/Login";
import RegisterPage from "./Pages/SignIn";
import About from "./Pages/About";
import Profile from "./Pages/Profile";

import { Toaster } from "react-hot-toast";
import ProviderEnrollment from "./Pages/Provider/Enrollment";
import ChangePassword from "./Pages/Provider/ChangePassword";
import ProviderRoute from "./components/Provider/Route";
import ProviderLayout from "./components/Provider/Layout";
import ProviderDashboard from "./Pages/Provider/Dashboard";
import ProviderOrders from "./Pages/Provider/Orders";
import ProviderBookings from "./Pages/Provider/Bookings";
import ProviderProfile from "./Pages/Provider/Profile";
import AuthRoute from "./components/Auth/AuthRoute";

// Admin Dashboard Imports
import AdminRoute from "./components/Admin/Route";
import AdminLayout from "./components/Admin/Layout";
import DashboardOverview from "./Pages/Admin/DashboardOverview";
import UsersManagement from "./Pages/Admin/UsersManagement";
import ProviderApplications from "./Pages/Admin/ProviderApplications";
import ServiceManagement from "./Pages/Admin/ServiceManagement";
import BookingsManagement from "./Pages/Admin/BookingsManagement";
import { ServicePage } from "./Pages/ServicePage";

function AppContent() {
  const location = useLocation();
  const hideNavFooter = location.pathname.startsWith('/admin') || location.pathname.startsWith('/provider');

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {!hideNavFooter && <Navbar />}
      <main className={!hideNavFooter ? "pt-16 md:pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />

          {/* Auth Routes - Protected from logged-in users */}
          <Route element={<AuthRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/provider-enrollment" element={<ProviderEnrollment />} />
          <Route path="/About" element={<About />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Service Provider Routes */}
          <Route element={<ProviderRoute />}>
            <Route path="/provider" element={<ProviderLayout />}>
              <Route index element={<Navigate to="/provider/dashboard" replace />} />
              <Route path="dashboard" element={<ProviderDashboard />} />
              <Route path="orders" element={<ProviderOrders />} />
              <Route path="bookings" element={<ProviderBookings />} />
              <Route path="profile" element={<ProviderProfile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="applications" element={<ProviderApplications />} />
              <Route path="services" element={<ServiceManagement />} />
              <Route path="bookings" element={<BookingsManagement />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {!hideNavFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


export default App;