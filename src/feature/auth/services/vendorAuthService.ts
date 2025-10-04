
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface FirebaseAuthResponse {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  phone_verified: boolean;
  providers: Array<{
    provider: string;
    provider_uid: string;
    extra_data: Record<string, any>;
  }>;
  new_user: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  phone_number: string | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  auth_provider: string;
  email_verified: boolean;
  phone_verified: boolean;
  has_vendor_account: boolean;
  has_customer_account: boolean;
}

export interface OnboardingStatus {
  is_onboarded: boolean;
  step_status: {
    default_branch: boolean;
    contact_details: boolean;
    store_details: boolean;
  };
}

export interface VendorCreateData {
  name: string;
  contact_number: string;
  shop_type: string;
  business_type: 'Wholesale' | 'Retail' | 'Wholesale & Retail' | 'Service based';
  owner_name?: string | null;
}

export interface VendorUpdateData {
  name?: string;
  contact_number?: string;
  shop_type?: string;
  business_type?: string;
  owner_name?: string | null;
  land_phone?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  google_map?: string | null;
}

export interface VendorDetails {
  id: string;
  name: string;
  contact_number: string;
  shop_type: {
    id: string;
    name: string;
    code: string;
    description: string;
  };
  business_type: string;
  owner_name: string | null;
  is_onboarded: boolean;
  profile: any;
  branches: any[];
}

export interface BranchCreateData {
  vendor: string;
  country: string;
  state: string;
  district: string;
  shop_locality: string;
  nearby_town: string;
  pin_code: string;
  key_person_name: string;
  key_person_contact_number: string;
  land_phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
}

export interface ShopType {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

export interface Country {
  id: string;
  name: string;
}

export interface State {
  id: string;
  name: string;
  country: string;
  datetime_created: string;
  datetime_updated: string;
}

export interface District {
  id: string;
  name: string;
  state: string;
  datetime_created: string;
  datetime_updated: string;
}

class VendorAuthService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication
  async firebaseAuthenticate(idToken: string, userType: 'vendor' | 'customer' = 'vendor'): Promise<FirebaseAuthResponse> {
    const formData = new FormData();
    formData.append('id_token', idToken);
    formData.append('user_type', userType);

    const response = await fetch(`${this.baseUrl}/api/v1/account/firebase_authenticate/`, {
      method: 'POST',
      body: formData,
    });

    return this.handleResponse<FirebaseAuthResponse>(response);
  }

  async getUserInfo(token: string): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/api/v1/account/user_info/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<UserInfo>(response);
  }

  // Vendor Operations
  async getOnboardingStatus(token: string): Promise<OnboardingStatus> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/onboarding-status/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<OnboardingStatus>(response);
  }

  async createVendor(token: string, data: VendorCreateData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async updateVendor(token: string, data: VendorUpdateData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/update/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async getVendorDetails(token: string): Promise<VendorDetails> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/details/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<VendorDetails>(response);
  }

  // Shop Types
  async getShopTypes(): Promise<ShopType[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/shop-types/`);
    return this.handleResponse<ShopType[]>(response);
  }

  // Location APIs
  async getCountries(): Promise<Country[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/location/countries/`);
    return this.handleResponse<Country[]>(response);
  }

  async getStates(countryId: string): Promise<State[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/location/states/?country=${countryId}`);
    return this.handleResponse<State[]>(response);
  }

  async getDistricts(stateId: string): Promise<District[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/location/districts/?state=${stateId}`);
    return this.handleResponse<District[]>(response);
  }

  // Branch Operations
  async createBranch(token: string, data: BranchCreateData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/branches/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async getBranches(token: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/branches/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<any[]>(response);
  }

  async getBranchById(token: string, branchId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/branches/${branchId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse(response);
  }

  async updateBranch(token: string, branchId: string, data: Partial<BranchCreateData>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/branches/${branchId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async deleteBranch(token: string, branchId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/branches/${branchId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status}`);
    }
  }
}

export const vendorAuthService = new VendorAuthService();
export default vendorAuthService;