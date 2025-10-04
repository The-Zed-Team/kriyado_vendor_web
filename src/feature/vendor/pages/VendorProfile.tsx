import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Field, FieldDescription, FieldGroup, FieldLabel} from '@/components/ui/field';
import {useAuth} from '@/feature/auth/context/AuthContext.tsx';
import vendorAuthService from '@/feature/auth/services/vendorAuthService';
import {Building2, Globe, Save, User} from 'lucide-react';
import {Alert, AlertDescription} from '@/components/ui/alert';

export function VendorProfile() {
  const {vendor, token, refreshUser} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    ownerName: vendor?.owner_name || '',
    contactNumber: vendor?.contact_number || '',
    website: '',
    facebook: '',
    instagram: '',
    youtube: ''
  });

  const handleSubmit = async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await vendorAuthService.updateVendor(token, {
        name: formData.name,
        owner_name: formData.ownerName || null,
        contact_number: formData.contactNumber,
        website: formData.website || null,
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
        youtube: formData.youtube || null
      });

      await refreshUser();
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Profile</h1>
        <p className="text-gray-600 mt-1">Manage your business information</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2"/>
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Business Name</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your business name"
                />
              </Field>

              <Field>
                <FieldLabel>Owner Name</FieldLabel>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  placeholder="Owner name"
                />
              </Field>

              <Field>
                <FieldLabel>Contact Number</FieldLabel>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  placeholder="+91 98765 43210"
                />
              </Field>

              <Field>
                <FieldLabel>Business Type</FieldLabel>
                <Input
                  value={vendor?.business_type || ''}
                  disabled
                  className="bg-gray-100"
                />
                <FieldDescription>
                  Contact support to change business type
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Online Presence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2"/>
              Online Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Website</FieldLabel>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://www.yourwebsite.com"
                />
              </Field>

              <Field>
                <FieldLabel>Facebook</FieldLabel>
                <Input
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                  placeholder="https://facebook.com/yourpage"
                />
              </Field>

              <Field>
                <FieldLabel>Instagram</FieldLabel>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  placeholder="https://instagram.com/yourpage"
                />
              </Field>

              <Field>
                <FieldLabel>YouTube</FieldLabel>
                <Input
                  value={formData.youtube}
                  onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                  placeholder="https://youtube.com/yourchannel"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2"/>
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vendor ID</p>
              <p className="font-mono text-sm">{vendor?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Shop Type</p>
              <p className="font-medium">{vendor?.shop_type?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Onboarding Status</p>
              <p className={`font-medium ${vendor?.is_onboarded ? 'text-green-600' : 'text-orange-600'}`}>
                {vendor?.is_onboarded ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          <Save className="w-4 h-4 mr-2"/>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

export default VendorProfile;