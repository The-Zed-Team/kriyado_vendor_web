// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//     Field,
//     FieldDescription,
//     FieldGroup,
//     FieldLabel,
//     FieldSeparator,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { type ComponentProps, useState } from "react";
// import { useNavigate } from "react-router";
// import { useAuth } from "../context/AuthContext";
// import { AlertCircle } from "lucide-react";

// For Firebase integration (install: npm install firebase)
import {initializeApp} from 'firebase/app';
import {getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup} from 'firebase/auth';
import {type ComponentProps, useState} from 'react';
import {useNavigate} from 'react-router';

import {cn} from '@/lib/utils';
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator} from "@/components/ui/field.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {AlertCircle} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useAuth} from "@/feature/auth/context/AuthContext.tsx";

// Firebase configuration (replace with your config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface FirebaseError {
  message?: string;
  code?: string;
}

export function LoginForm({className, ...props}: ComponentProps<"div">) {
  const navigate = useNavigate();
  const {loginWithFirebase, isOnboarded} = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle email/password login
  const handleEmailLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      try {
        // Authenticate with backend
        await loginWithFirebase(idToken);

        // Navigate based on onboarding status
        if (isOnboarded) {
          navigate("/vendor/dashboard");
        } else {
          navigate("/vendor/onboarding");
        }
      } catch (err: unknown) {
        const error = err as FirebaseError;
        // If backend indicates this is a new user, redirect to sign up
        if (error.message?.includes('Password is required for email sign up')) {
          navigate('/sign-up', { 
            state: { 
              email: formData.email,
              idToken: idToken
            }
          });
          return;
        }
        setError(error.message || "Authentication failed");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as FirebaseError;
      setError(
        error.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);

      // Get Firebase ID token
      const idToken = await result.user.getIdToken();

      try {
        // Authenticate with backend
        await loginWithFirebase(idToken);

        // Navigate based on onboarding status
        if (isOnboarded) {
          navigate("/vendor/dashboard");
        } else {
          navigate("/vendor/onboarding");
        }
      } catch (err: unknown) {
        const error = err as FirebaseError;
        // If backend indicates this is a new user, redirect to sign up
        if (error.message?.includes('Password is required for email sign up')) {
          navigate('/sign-up', { 
            state: { 
              email: result.user.email,
              idToken: idToken
            }
          });
          return;
        }
        setError(error.message || "Authentication failed");
      }
    } catch (err: unknown) {
      console.error("Google login error:", err);
      const error = err as FirebaseError;
      setError(error.message || "Failed to login with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your vendor account
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4"/>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({...formData, email: e.target.value})
                  }
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({...formData, password: e.target.value})
                  }
                  required
                  disabled={loading}
                />
              </Field>

              <Field>
                <Button
                  type="button"
                  onClick={handleEmailLogin}
                  disabled={loading || !formData.email || !formData.password}
                  className="w-full"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
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
                  <span>Login with Google</span>
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <a href="/sign-up" className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </FieldDescription>
            </FieldGroup>
          </div>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop"
              alt="Store"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}

export default LoginForm;