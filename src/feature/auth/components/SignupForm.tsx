import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  BUSINESS_TYPE_CHOICES,
  type ShopType,
  vendorService,
} from "@/feature/vendor/services/vendorService";

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  contact_number: string;
  shop_type: string;
  business_type: string;
  owner_name: string;
}

export function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithFirebase } = useAuth();
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  const [shopTypes, setShopTypes] = useState<ShopType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get email from location state if coming from login
  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState<SignupFormData>({
    email: initialEmail,
    password: "",
    confirmPassword: "",
    name: "",
    contact_number: "",
    shop_type: "",
    business_type: "",
    owner_name: "",
  });

  useEffect(() => {
    // Fetch shop types when component mounts
    const fetchShopTypes = async () => {
      try {
        const types = await vendorService.getShopTypes();
        setShopTypes(types);
      } catch (err) {
        console.error("Failed to fetch shop types:", err);
        setError("Failed to load shop types. Please try again later.");
      }
    };

    fetchShopTypes();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Pre-fill form with Google user data
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        name: user.displayName || "",
        // Keep other fields empty for user to fill
        contact_number: "",
        shop_type: "",
        business_type: "",
        owner_name: user.displayName || "",
      }));

      // Store the Firebase token in local storage for later use
      localStorage.setItem('googleUserToken', await user.getIdToken(true));

      // Don't create vendor profile yet - let user fill in required fields
      setError("Please fill in your business information to complete registration");
      setLoading(false);
    } catch (err) {
      console.error("Google signup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign up with Google"
      );
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const isGoogleSignup = !!localStorage.getItem('googleUserToken');

    if (!isGoogleSignup && (!formData.email || !formData.password || !formData.confirmPassword)) {
      setError("All fields are required");
      return false;
    }

    if (!isGoogleSignup && formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (!isGoogleSignup && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!formData.name || !formData.contact_number || !formData.shop_type || !formData.business_type) {
      setError("Please fill in all required business information");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let idToken;

      if (formData.password) {
        // If password exists, this is email/password signup
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        idToken = await userCredential.user.getIdToken(true);
      } else {
        // This is Google signup completion
        idToken = localStorage.getItem('googleUserToken');
        if (!idToken) {
          throw new Error('Google authentication token not found');
        }
      }

      // Create vendor profile
      const vendorData = {
        name: formData.name,
        contact_number: formData.contact_number,
        shop_type: formData.shop_type,
        business_type: formData.business_type,
        owner_name: formData.owner_name || "",
      };

      // Login with backend first
      await loginWithFirebase(idToken);

      // Then create vendor profile
      await vendorService.createVendor(vendorData, idToken);

      // Clean up stored token
      localStorage.removeItem('googleUserToken');

      // Navigate to onboarding
      navigate("/vendor/onboarding");
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  const isGoogleSignup = !!localStorage.getItem('googleUserToken');

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground text-balance">
                Enter your business information to get started
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isGoogleSignup && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleGoogleSignup}
                  className="w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </Button>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with email
                </FieldSeparator>
              </>
            )}

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="m@example.com"
                disabled={loading || isGoogleSignup}
                required
              />
            </Field>

            {!isGoogleSignup && (
              <>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                  />
                  <FieldDescription>
                    Must be at least 6 characters long
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                  />
                </Field>
              </>
            )}

            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Business Information
            </FieldSeparator>

            <Field>
              <FieldLabel htmlFor="name">Business Name</FieldLabel>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="owner_name">Owner Name</FieldLabel>
              <Input
                id="owner_name"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="contact_number">Contact Number</FieldLabel>
              <Input
                id="contact_number"
                name="contact_number"
                type="tel"
                value={formData.contact_number}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="shop_type">Shop Type</FieldLabel>
              <Select
                value={formData.shop_type}
                onValueChange={(value) =>
                  handleSelectChange("shop_type", value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shop type" />
                </SelectTrigger>
                <SelectContent>
                  {shopTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="business_type">Business Type</FieldLabel>
              <Select
                value={formData.business_type}
                onValueChange={(value) =>
                  handleSelectChange("business_type", value)
                }
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Account..." : isGoogleSignup ? "Complete Registration" : "Create Account"}
            </Button>

            {!isGoogleSignup && (
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                  Login
                </a>
              </FieldDescription>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
