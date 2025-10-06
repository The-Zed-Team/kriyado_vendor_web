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
    const response = await fetch('/api/v1/vendor/shop-types/');
    if (!response.ok) {
      throw new Error('Failed to fetch shop types');
    }
    return response.json();
  }

  async createVendor(vendorData: VendorProfile, idToken: string): Promise<VendorProfile> {
    if (!idToken) {
      throw new Error('Firebase token is required');
    }

    const response = await fetch('/api/v1/vendor/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(vendorData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to create vendor profile');
    }

    return data;
  }

  async updateVendor(vendorData: Partial<VendorProfile>, idToken: string): Promise<VendorProfile> {
    const response = await fetch('/api/v1/vendor/update/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update vendor profile');
    }

    return response.json();
  }

  async getOnboardingStatus(idToken: string): Promise<VendorOnboardingStatus> {
    const response = await fetch('/api/v1/vendor/onboarding-status/', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch onboarding status');
    }

    return response.json();
  }
}

export const vendorService = new VendorService();

