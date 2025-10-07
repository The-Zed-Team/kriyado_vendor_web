import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithFirebase } = useAuth();
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState<SignupFormData>({
    email: initialEmail,
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Google signup and backend auth
  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken(true);

      // Login/register on Django backend
      await loginWithFirebase(idToken);

      navigate("/vendor/dashboard");
    } catch (err) {
      console.error("Google signup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sign up with Google"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const idToken = await userCredential.user.getIdToken(true);

      await loginWithFirebase(idToken);
      navigate("/vendor/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground text-balance">
                Sign up with Google or create an account using email
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* --- Google Signup --- */}
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

            {/* --- Email Signup --- */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="m@example.com"
                disabled={loading}
                required
              />
            </Field>

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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <FieldDescription className="text-center">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
