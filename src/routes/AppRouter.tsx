import { Suspense, lazy, type ComponentType } from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router';
import {AuthProvider} from '@/feature/auth/context/AuthContext';
import {ProtectedRoute} from '@/feature/auth/components/ProtectedRoute';

const makeLoader = (path: string, named?: string) =>
  lazy(() =>
    import(path).then((m) => {
      const mod = m as unknown as Record<string, ComponentType<unknown>>;
      const comp = mod.default ?? (named ? mod[named] : undefined);
      if (!comp) {
        // fallback: pick first exported component
        const first = Object.values(mod).find(v => typeof v === 'function') as ComponentType<unknown> | undefined;
        return { default: first ?? (() => null) };
      }
      return { default: comp };
    })
  );

const LoginPage = makeLoader('@/feature/auth/pages/LoginPage');
const SignUpPage = makeLoader('@/feature/auth/pages/SignUpPage');
const VendorOnboardingPage = makeLoader('@/feature/vendor/pages/VendorOnboardingPage');
const VendorDashboard = makeLoader('@/feature/vendor/pages/VendorDashboard');
const VendorProfile = makeLoader('@/feature/vendor/pages/VendorProfile');
const BranchManagementFull = makeLoader('@/feature/vendor/components/BranchManagementFull', 'BranchManagementFull');
const VendorDiscount = makeLoader('@/feature/vendor/components/VendorDiscount', 'VendorDiscount');
const VendorDeclaration = makeLoader('@/feature/vendor/components/VendorDeclaration', 'VendorDeclaration');
const VendorAppLayout = makeLoader('@/components/VendorAppLayout', 'VendorAppLayout');

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/sign-up" element={<SignUpPage/>}/>

            {/* Onboarding - Requires Authentication Only */}
            <Route
              path="/vendor/onboarding"
              element={
                <ProtectedRoute>
                  <VendorOnboardingPage/>
                </ProtectedRoute>
              }
            />

            {/* Declaration - After Onboarding */}
            <Route
              path="/vendor/declaration"
              element={
                <ProtectedRoute requireOnboarding={true}>
                  <VendorDeclaration/>
                </ProtectedRoute>
              }
            />

            {/* Protected Vendor Routes - Requires Authentication + Onboarding */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute requireOnboarding={true}>
                  <VendorAppLayout/>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<VendorDashboard/>}/>
              <Route path="profile" element={<VendorProfile/>}/>
              <Route path="branches" element={<BranchManagementFull/>}/>
              <Route path="discounts" element={<VendorDiscount/>}/>
              <Route index element={<Navigate to="dashboard" replace/>}/>
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="*" element={<Navigate to="/login" replace/>}/>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}