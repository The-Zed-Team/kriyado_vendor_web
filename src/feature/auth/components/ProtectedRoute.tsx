// src/feature/auth/components/ProtectedRoute.tsx
// Protected route component with authentication and onboarding checks

import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext.js';

interface ProtectedRouteProps {
    children: ReactNode;
    requireOnboarding?: boolean;
    redirectTo?: string;
}

export const ProtectedRoute = ({
    children,
    requireOnboarding = false,
    redirectTo = '/login'
}: ProtectedRouteProps) => {
    const { isAuthenticated, isOnboarded, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // Redirect to onboarding if required but not completed
    if (requireOnboarding && !isOnboarded) {
        return <Navigate to="/vendor/onboarding" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;