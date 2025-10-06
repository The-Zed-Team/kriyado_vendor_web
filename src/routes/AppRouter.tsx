import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from '@/feature/auth/context/AuthContext';
import { ProtectedRoute } from '@/feature/auth/components/ProtectedRoute';

const LoginPage = lazy(() => import('../feature/auth/pages/LoginPage'));
const SignUpPage = lazy(() => import('../feature/auth/pages/SignUpPage'));
const VendorOnboardingPage = lazy(() => import('../feature/vendor/pages/VendorOnboardingPage'));
const VendorDashboard = lazy(() => import('../feature/vendor/pages/VendorDashboard'));
const VendorProfile = lazy(() => import('../feature/vendor/pages/VendorProfile'));
const BranchManagementFull = lazy(() => import('../feature/vendor/components/BranchManagementFull'));
const VendorDiscount = lazy(() => import('../feature/vendor/components/VendorDiscount'));
const VendorDeclaration = lazy(() => import('../feature/vendor/components/VendorDeclaration'));
const VendorAppLayout = lazy(() => import('../components/VendorAppLayout'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />

            {/* Onboarding - Requires Authentication Only */}
            <Route
              path="/vendor/onboarding"
              element={
                <ProtectedRoute>
                  <VendorOnboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Declaration - After Onboarding */}
            <Route
              path="/vendor/declaration"
              element={
                <ProtectedRoute requireOnboarding={true}>
                  <VendorDeclaration />
                </ProtectedRoute>
              }
            />

            {/* Protected Vendor Routes - Requires Authentication + Onboarding */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute requireOnboarding={true}>
                  <VendorAppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="profile" element={<VendorProfile />} />
              <Route path="branches" element={<BranchManagementFull />} />
              <Route path="discounts" element={<VendorDiscount />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}