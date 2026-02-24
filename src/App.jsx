import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import "./App.css";
import Home from "./Pages/Home";
import Services from "./Pages/Services";
import Cart from "./Pages/Cart";
import LoginPage from "./Pages/Login";
import RegisterPage from "./Pages/SignIn";
import About from "./Pages/About";

import { Toaster } from "react-hot-toast";
import ProviderEnrollment from "./Pages/ProviderEnrollment";

// Admin Dashboard Imports
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import DashboardOverview from "./Pages/Admin/DashboardOverview";
import UsersManagement from "./Pages/Admin/UsersManagement";
import ProviderApplications from "./Pages/Admin/ProviderApplications";
import ServiceManagement from "./Pages/Admin/ServiceManagement";
import { ServicePage } from "./Pages/ServicePage";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <main className="pt-16 md:pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/provider-enrollment" element={<ProviderEnrollment />} />
          <Route path="/About" element={<About />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="applications" element={<ProviderApplications />} />
              <Route path="services" element={<ServiceManagement />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}


export default App;