import React, {createContext, type ReactNode, useContext} from 'react';
import {useVendorAuth} from '../hooks/useVendorAuth';
import type {OnboardingStatus, UserInfo, VendorDetails} from '../services/vendorAuthService';
import { getAuth } from 'firebase/auth';

// Shared types
export interface VendorProfile {
  businessName: string;
  description: string;
  contactPhone: string;
  address: string;
  category: string;
  website?: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  vendor: VendorDetails | null;
  onboardingStatus: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  loginWithFirebase: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateVendorData: (vendor: VendorDetails) => void;
  clearError: () => void;
  updateVendorProfile: (profile: VendorProfile) => Promise<void>;
}

// Create context with undefined default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useVendorAuth();
  const firebaseAuth = getAuth();

  const updateVendorProfile = async (profile: VendorProfile) => {
    if (!firebaseAuth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const idToken = await firebaseAuth.currentUser.getIdToken();
      const response = await fetch('/api/v1/vendor/update/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update vendor profile');
      }

      // Get the updated vendor data from the response
      const updatedData = await response.json();

      // Update vendor data in context
      auth.updateVendorData({
        ...(auth.vendor || {}),
        ...updatedData,
        is_onboarded: true
      });

      // Return the updated data
      return updatedData;
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...auth,
    updateVendorProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
