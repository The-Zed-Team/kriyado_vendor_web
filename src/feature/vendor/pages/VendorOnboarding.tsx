import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/feature/auth/context/AuthContext";

const BUSINESS_TYPE_CHOICES = [
  { value: "Wholesale", label: "Wholesale" },
  { value: "Retail", label: "Retail" },
  { value: "Wholesale & Retail", label: "Wholesale & Retail" },
  { value: "Service based", label: "Service based" },
] as const;

interface VendorProfile {
  businessName: string;
  description: string;
  contactPhone: string;
  address: string;
  category: string;
  website?: string;
}

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const { updateVendorProfile, isOnboarded, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<VendorProfile>({
    businessName: "",
    description: "",
    contactPhone: "",
    address: "",
    category: "",
    website: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate required fields
    const requiredFields: (keyof VendorProfile)[] = [
      "businessName",
      "description",
      "contactPhone",
      "address",
      "category",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      // Update vendor profile
      await updateVendorProfile(formData);

      // Refresh user data to get latest onboarding status
      await refreshUser();

      // Navigate to dashboard if onboarding is complete
      if (isOnboarded) {
        navigate("/vendor/dashboard");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Please provide your business information to get started
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="businessName">
                    Business Name <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">
                    Business Description <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    rows={4}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">
                    Business Category <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPE_CHOICES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="contactPhone">
                    Contact Phone <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    type="tel"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="address">
                    Business Address <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    rows={2}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="website">Website (Optional)</FieldLabel>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={loading}
                    type="url"
                    placeholder="https://"
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
