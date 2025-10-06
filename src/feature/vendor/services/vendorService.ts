import axios from 'axios';

export interface ShopType {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface VendorProfile {
  id?: string;
  name: string;
  contact_number: string;
  shop_type: string;
  business_type: string;
  owner_name?: string;
}

export interface VendorOnboardingStatus {
  is_onboarded: boolean;
  step_status: {
    default_branch: boolean;
    contact_details: boolean;
    store_details: boolean;
  };
}

export const BUSINESS_TYPE_CHOICES = [
  { value: "Wholesale", label: "Wholesale" },
  { value: "Retail", label: "Retail" },
  { value: "Wholesale & Retail", label: "Wholesale & Retail" },
  { value: "Service based", label: "Service based" },
] as const;

class VendorService {
  async getShopTypes(): Promise<ShopType[]> {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/vendor/shop-types/`);
    return response.data;
  }

  async createVendor(vendorData: VendorProfile, idToken: string): Promise<VendorProfile> {
    if (!idToken) {
      throw new Error('Firebase token is required');
    }
    try {
      const response = await axios.post('/api/v1/vendor/create/', vendorData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to create vendor profile');
      }
      throw new Error('Failed to create vendor profile');
    }
  }

  async updateVendor(vendorData: Partial<VendorProfile>, idToken: string): Promise<VendorProfile> {
    try {
      const response = await axios.patch('/api/v1/vendor/update/', vendorData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update vendor profile');
      }
      throw new Error('Failed to update vendor profile');
    }
  }

  async getOnboardingStatus(idToken: string): Promise<VendorOnboardingStatus> {
    try {
      const response = await axios.get('/api/v1/vendor/onboarding-status/', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch onboarding status');
    }
  }
}

export const vendorService = new VendorService();
