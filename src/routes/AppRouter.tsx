import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import {AuthProvider} from "@/feature/auth/context/AuthContext.tsx";
import {ProtectedRoute} from "@/feature/auth/components/ProtectedRoute";

// Auth pages
import LoginPage from "@/feature/auth/pages/LoginPage";
import SignUpPage from "@/feature/auth/pages/SignUpPage";
import RegisterPage from "@/feature/auth/pages/RegisterPage";

// App layout
import AppLayout from "@/layout/AppLayout";

// Vendor pages (to be created)
import VendorDashboard from "@/feature/vendor/pages/VendorDashboard";
import VendorOnboarding from "@/feature/vendor/pages/VendorOnboarding";
import {BranchManagement} from "@/feature/vendor/pages/BranchManagement";
// import DiscountManagement from "@/feature/vendor/pages/DiscountManagement";
import VendorProfile from "@/feature/vendor/pages/VendorProfile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/sign-up" element={<SignUpPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>

          Vendor onboarding (requires auth but not onboarding)
          <Route
            path="/vendor/onboarding"
            element={
              <ProtectedRoute>
                <VendorOnboarding/>
              </ProtectedRoute>
            }
          />

          {/* Protected vendor routes (requires auth AND onboarding) */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute requireOnboarding={true}>
                <AppLayout/>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/vendor/dashboard" replace/>}/>
            <Route path="dashboard" element={<VendorDashboard/>}/>
            <Route path="branches" element={<BranchManagement/>}/>
            {/*<Route path="discounts" element={<DiscountManagement/>}/>*/}
            <Route path="profile" element={<VendorProfile/>}/>
          </Route>

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/login" replace/>}/>
          <Route path="*" element={<Navigate to="/login" replace/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}