
import { useState, useEffect, useCallback } from 'react';
import vendorAuthService, {
    type UserInfo,
    type VendorDetails,
    type OnboardingStatus
} from '../services/vendorAuthService';

interface AuthState {
    token: string | null;
    user: UserInfo | null;
    vendor: VendorDetails | null;
    onboardingStatus: OnboardingStatus | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isOnboarded: boolean;
}

const STORAGE_KEY = 'vendor_auth_token';

export const useVendorAuth = () => {
    const [state, setState] = useState<AuthState>({
        token: null,
        user: null,
        vendor: null,
        onboardingStatus: null,
        loading: true,
        error: null,
        isAuthenticated: false,
        isOnboarded: false,
    });

    // Initialize auth from storage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem(STORAGE_KEY);
                if (storedToken) {
                    await loadUserData(storedToken);
                } else {
                    setState(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                console.error('Auth initialization failed:', err);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to initialize authentication'
                }));
            }
        };

        initAuth();
    }, []);

    // Load user data
    const loadUserData = async (token: string) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const [userInfo, onboardingStatus] = await Promise.all([
                vendorAuthService.getUserInfo(token),
                vendorAuthService.getOnboardingStatus(token),
            ]);

            let vendorData: VendorDetails | null = null;
            if (userInfo.has_vendor_account) {
                try {
                    vendorData = await vendorAuthService.getVendorDetails(token);
                } catch (err) {
                    console.error('Failed to load vendor details:', err);
                }
            }

            setState({
                token,
                user: userInfo,
                vendor: vendorData,
                onboardingStatus,
                loading: false,
                error: null,
                isAuthenticated: true,
                isOnboarded: onboardingStatus.is_onboarded,
            });
        } catch (err: any) {
            console.error('Failed to load user data:', err);
            localStorage.removeItem(STORAGE_KEY);
            setState({
                token: null,
                user: null,
                vendor: null,
                onboardingStatus: null,
                loading: false,
                error: err.message || 'Failed to load user data',
                isAuthenticated: false,
                isOnboarded: false,
            });
        }
    };

    // Login with Firebase
    const loginWithFirebase = useCallback(async (idToken: string) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const authResult = await vendorAuthService.firebaseAuthenticate(idToken, 'vendor');

            // Store token
            localStorage.setItem(STORAGE_KEY, idToken);

            // Load user data
            await loadUserData(idToken);

            return authResult;
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
            throw new Error(errorMessage);
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setState({
            token: null,
            user: null,
            vendor: null,
            onboardingStatus: null,
            loading: false,
            error: null,
            isAuthenticated: false,
            isOnboarded: false,
        });
    }, []);

    // Refresh user data
    const refreshUser = useCallback(async () => {
        if (state.token) {
            await loadUserData(state.token);
        }
    }, [state.token]);

    // Update vendor data
    const updateVendorData = useCallback((vendor: VendorDetails) => {
        setState(prev => ({ ...prev, vendor }));
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        loginWithFirebase,
        logout,
        refreshUser,
        updateVendorData,
        clearError,
    };
};

export default useVendorAuth;