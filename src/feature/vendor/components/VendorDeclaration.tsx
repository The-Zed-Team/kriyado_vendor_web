import {useState} from 'react';
import {useNavigate} from 'react-router';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertCircle, CheckCircle} from 'lucide-react';
import {useAuth} from '@/feature/auth/context/AuthContext';
import vendorServiceExtended from '@/feature/vendor/services/vendorServiceExtended';

const DECLARATION_TEXT = `
I hereby declare that:

1. All information provided during registration is true and accurate to the best of my knowledge.

2. I agree to comply with all Kriyado platform policies and guidelines.

3. I will maintain accurate inventory and pricing information.

4. I will honor all discounts and offers displayed on the platform.

5. I will provide quality products/services and maintain customer satisfaction.

6. I understand that false information may result in account suspension or termination.

7. I agree to the terms and conditions of the Kriyado vendor agreement.

8. I will respond to customer queries and complaints in a timely manner.

9. I authorize Kriyado to display my business information on the platform.

10. I agree to pay all applicable fees and commissions as per the agreement.
`;

export function VendorDeclaration() {
  const navigate = useNavigate();
  const {token, vendor, refreshUser} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      setError('Please agree to the declaration before proceeding');
      return;
    }

    if (!token || !vendor) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await vendorServiceExtended.submitDeclaration(token, {
        vendor: vendor.id,
        agreed_to_terms: true,
        declaration_text: DECLARATION_TEXT,
        signed_date: new Date().toISOString(),
      });

      // Refresh user data
      await refreshUser();

      // Navigate to dashboard
      navigate('/vendor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit declaration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Vendor Declaration & Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4"/>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="prose prose-sm">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {DECLARATION_TEXT}
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <label htmlFor="agree" className="text-sm">
                  <span className="font-medium">I have read and agree to the above declaration.</span>
                  <p className="text-gray-600 mt-1">
                    By checking this box, I confirm that I understand and accept all terms and conditions
                    outlined in the vendor agreement.
                  </p>
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !agreed}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Accept & Continue'}
                  {agreed && <CheckCircle className="w-4 h-4 ml-2"/>}
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>By proceeding, you acknowledge that you have read, understood, and agree to be bound by these
                terms.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VendorDeclaration;
