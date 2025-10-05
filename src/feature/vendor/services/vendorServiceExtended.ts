const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Types
export interface Discount {
  id?: string;
  vendor: string;
  type: 'total_bill' | 'category_based' | 'special_offer';
  value_type: 'flat' | 'percentage';
  value: number;
  category?: string;
  description?: string;
  branches: string[];
  expiry_date?: string;
  is_active: boolean;
}

export interface VendorProfileUpdate {
  default_branch?: string;
  registered_address?: string;
  website?: string;
  facebook_link?: string;
  instagram_link?: string;
  google_map_link?: string;
  youtube_link?: string;
  working_hours_from?: string;
  working_hours_to?: string;
  home_delivery?: boolean;
  logo?: File;
  store_photo?: File;
}

export interface Declaration {
  vendor: string;
  agreed_to_terms: boolean;
  declaration_text: string;
  signed_date: string;
}

class VendorServiceExtended {
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

  // Vendor Profile Operations
  async updateVendorProfile(token: string, data: VendorProfileUpdate): Promise<any> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${this.baseUrl}/api/v1/vendor/profile/update/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Discount Operations
  async createDiscount(token: string, data: Omit<Discount, 'id'>): Promise<Discount> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/discounts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<Discount>(response);
  }

  async getDiscounts(token: string): Promise<Discount[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/discounts/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse<Discount[]>(response);
  }

  async updateDiscount(token: string, discountId: string, data: Partial<Discount>): Promise<Discount> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/discounts/${discountId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<Discount>(response);
  }

  async deleteDiscount(token: string, discountId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/discounts/${discountId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete discount: ${response.status}`);
    }
  }

  // Declaration Operations
  async submitDeclaration(token: string, data: Declaration): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/declaration/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async getDeclaration(token: string): Promise<Declaration | null> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/declaration/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    return this.handleResponse<Declaration>(response);
  }

  // Analytics and Reports
  async getVendorAnalytics(token: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/analytics/?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse(response);
  }

  async getRevenueReport(token: string, startDate: string, endDate: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/vendor/reports/revenue/?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return this.handleResponse(response);
  }

  // Verification Status
  async checkVerificationStatus(token: string): Promise<{
    verified: boolean;
    pending_changes: boolean;
    verification_message: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/verification-status/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return this.handleResponse(response);
  }

  // Request Edit Approval
  async requestEditApproval(token: string, changes: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/request-edit/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    });

    return this.handleResponse(response);
  }
}

export const vendorServiceExtended = new VendorServiceExtended();
export default vendorServiceExtended;