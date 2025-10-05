import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Field, FieldDescription, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertCircle, Building2, CheckCircle2, MapPin, Phone} from 'lucide-react';
import {useAuth} from '@/feature/auth/context/AuthContext';
import vendorAuthService, { type Country, type State, type District } from '@/feature/auth/services/vendorAuthService';

interface LocationFormData {
  country: string;
  state: string;
  district: string;
  shop_locality: string;
  nearby_town: string;
  pin_code: string;
  key_person_name: string;
  key_person_contact_number: string;
  land_phone: string;
}

interface ContactFormData {
  registered_address: string;
  website: string;
  facebook_link: string;
  instagram_link: string;
  google_map_link: string;
  youtube_link: string;
}

interface StoreFormData {
  working_hours_from: string;
  working_hours_to: string;
  home_delivery: boolean;
  logo: File | null;
  store_photo: File | null;
}

export function VendorWizard() {
  const navigate = useNavigate();
  const {token, vendor, refreshUser} = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Location data
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Form states
  const [locationForm, setLocationForm] = useState<LocationFormData>({
    country: '',
    state: '',
    district: '',
    shop_locality: '',
    nearby_town: '',
    pin_code: '',
    key_person_name: '',
    key_person_contact_number: '',
    land_phone: ''
  });

  const [contactForm, setContactForm] = useState<ContactFormData>({
    registered_address: '',
    website: '',
    facebook_link: '',
    instagram_link: '',
    google_map_link: '',
    youtube_link: ''
  });

  const [storeForm, setStoreForm] = useState<StoreFormData>({
    working_hours_from: '',
    working_hours_to: '',
    home_delivery: false,
    logo: null,
    store_photo: null
  });

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (locationForm.country) {
      loadStates(locationForm.country);
    }
  }, [locationForm.country]);

  // Load districts when state changes
  useEffect(() => {
    if (locationForm.state) {
      loadDistricts(locationForm.state);
    }
  }, [locationForm.state]);

  const loadCountries = async () => {
    try {
      const data = await vendorAuthService.getCountries();
      setCountries(data);
    } catch (err) {
      console.error('Failed to load countries:', err);
    }
  };

  const loadStates = async (countryId: string) => {
    try {
      const data = await vendorAuthService.getStates(countryId);
      setStates(data);
    } catch (err) {
      console.error('Failed to load states:', err);
    }
  };

  const loadDistricts = async (stateId: string) => {
    try {
      const data = await vendorAuthService.getDistricts(stateId);
      setDistricts(data);
    } catch (err) {
      console.error('Failed to load districts:', err);
    }
  };

  const handleLocationChange = (field: keyof LocationFormData, value: string) => {
    setLocationForm(prev => ({...prev, [field]: value}));
  };

  const handleContactChange = (field: keyof ContactFormData, value: string) => {
    setContactForm(prev => ({...prev, [field]: value}));
  };

  const handleStoreChange = (field: keyof StoreFormData, value: StoreFormData[keyof StoreFormData]) => {
    setStoreForm(prev => ({...prev, [field]: value}));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const required = ['country', 'state', 'district', 'shop_locality', 'nearby_town', 'pin_code', 'key_person_name', 'key_person_contact_number'];
      for (const field of required) {
        if (!locationForm[field as keyof LocationFormData]) {
          setError(`Please fill in ${field.replace(/_/g, ' ')}`);
          return false;
        }
      }
    } else if (step === 2) {
      if (!contactForm.registered_address) {
        setError('Please fill in registered address');
        return false;
      }
    } else if (step === 3) {
      if (!storeForm.working_hours_from || !storeForm.working_hours_to) {
        setError('Please fill in working hours');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    setError(null);

    if (!validateStep(currentStep)) {
      return;
    }

    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);

    try {
      if (currentStep === 1) {
        // Create default branch
        if (!vendor || !vendor.id) {
          throw new Error('Vendor must exist to create a branch');
        }

        const branchData = {
          vendor: vendor.id,
          country: locationForm.country,
          state: locationForm.state,
          district: locationForm.district,
          shop_locality: locationForm.shop_locality,
          nearby_town: locationForm.nearby_town,
          pin_code: locationForm.pin_code,
          key_person_name: locationForm.key_person_name,
          key_person_contact_number: locationForm.key_person_contact_number,
          land_phone: locationForm.land_phone || null
        };

        await vendorAuthService.createBranch(token, branchData);

        // Update vendor profile with default branch
        await vendorAuthService.updateVendor(token, {
          land_phone: locationForm.land_phone || null
        });

        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Update contact details
        await vendorAuthService.updateVendor(token, {
          website: contactForm.website || null,
          facebook: contactForm.facebook_link || null,
          instagram: contactForm.instagram_link || null,
          youtube: contactForm.youtube_link || null
        });

        setCurrentStep(3);
      } else if (currentStep === 3) {
        // Complete onboarding - update store details
        await vendorAuthService.updateVendor(token, {});

        // Refresh user to get updated onboarding status
        await refreshUser();

        // Navigate to dashboard
        navigate('/vendor/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
     if (currentStep > 1) {
       setCurrentStep(currentStep - 1);
       setError(null);
     }
   };

  const steps = [
    {number: 1, title: 'Location Details', icon: MapPin},
    {number: 2, title: 'Contact Information', icon: Phone},
    {number: 3, title: 'Store Details', icon: Building2}
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Registration</h1>
          <p className="text-gray-600">Fill in the details to start selling</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      currentStep > step.number
                        ? 'bg-green-500 border-green-500 text-white'
                        : currentStep === step.number
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <CheckCircle2 className="w-6 h-6"/>
                      ) : (
                        <Icon className="w-6 h-6"/>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                    }`}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <FieldGroup>
                <h2 className="text-xl font-semibold mb-4">Location Details</h2>

                <div className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel>Country *</FieldLabel>
                    <Select
                      value={locationForm.country}
                      onValueChange={(val) => handleLocationChange('country', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country"/>
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>State *</FieldLabel>
                    <Select
                      value={locationForm.state}
                      onValueChange={(val) => handleLocationChange('state', val)}
                      disabled={!locationForm.country}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state"/>
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>District *</FieldLabel>
                    <Select
                      value={locationForm.district}
                      onValueChange={(val) => handleLocationChange('district', val)}
                      disabled={!locationForm.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district"/>
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Shop Locality *</FieldLabel>
                    <Input
                      value={locationForm.shop_locality}
                      onChange={(e) => handleLocationChange('shop_locality', e.target.value)}
                      placeholder="Downtown Market"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Nearby Town *</FieldLabel>
                    <Input
                      value={locationForm.nearby_town}
                      onChange={(e) => handleLocationChange('nearby_town', e.target.value)}
                      placeholder="Springfield"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>PIN Code *</FieldLabel>
                  <Input
                    value={locationForm.pin_code}
                    onChange={(e) => handleLocationChange('pin_code', e.target.value)}
                    placeholder="695001"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Key Person/Manager Name *</FieldLabel>
                    <Input
                      value={locationForm.key_person_name}
                      onChange={(e) => handleLocationChange('key_person_name', e.target.value)}
                      placeholder="Manager Name"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Key Person Contact *</FieldLabel>
                    <Input
                      value={locationForm.key_person_contact_number}
                      onChange={(e) => handleLocationChange('key_person_contact_number', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Land Phone (Optional)</FieldLabel>
                  <Input
                    value={locationForm.land_phone}
                    onChange={(e) => handleLocationChange('land_phone', e.target.value)}
                    placeholder="0471-1234567"
                  />
                </Field>
              </FieldGroup>
            )}

            {currentStep === 2 && (
              <FieldGroup>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                <Field>
                  <FieldLabel>Registered Address *</FieldLabel>
                  <Textarea
                    value={contactForm.registered_address}
                    onChange={(e) => handleContactChange('registered_address', e.target.value)}
                    placeholder="123 Main Street, City"
                    rows={3}
                  />
                </Field>

                <Field>
                  <FieldLabel>Website</FieldLabel>
                  <Input
                    value={contactForm.website}
                    onChange={(e) => handleContactChange('website', e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </Field>

                <Field>
                  <FieldLabel>Facebook Link</FieldLabel>
                  <Input
                    value={contactForm.facebook_link}
                    onChange={(e) => handleContactChange('facebook_link', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </Field>

                <Field>
                  <FieldLabel>Instagram Link</FieldLabel>
                  <Input
                    value={contactForm.instagram_link}
                    onChange={(e) => handleContactChange('instagram_link', e.target.value)}
                    placeholder="https://instagram.com/yourpage"
                  />
                </Field>

                <Field>
                  <FieldLabel>Google Map Link</FieldLabel>
                  <Input
                    value={contactForm.google_map_link}
                    onChange={(e) => handleContactChange('google_map_link', e.target.value)}
                    placeholder="Google Maps URL"
                  />
                </Field>

                <Field>
                  <FieldLabel>YouTube Link</FieldLabel>
                  <Input
                    value={contactForm.youtube_link}
                    onChange={(e) => handleContactChange('youtube_link', e.target.value)}
                    placeholder="https://youtube.com/yourchannel"
                  />
                </Field>
              </FieldGroup>
            )}

            {currentStep === 3 && (
              <FieldGroup>
                <h2 className="text-xl font-semibold mb-4">Store Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Working Hours From *</FieldLabel>
                    <Input
                      type="time"
                      value={storeForm.working_hours_from}
                      onChange={(e) => handleStoreChange('working_hours_from', e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Working Hours To *</FieldLabel>
                    <Input
                      type="time"
                      value={storeForm.working_hours_to}
                      onChange={(e) => handleStoreChange('working_hours_to', e.target.value)}
                    />
                  </Field>
                </div>

                <Field>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="homeDelivery"
                      checked={storeForm.home_delivery}
                      onChange={(e) => handleStoreChange('home_delivery', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <FieldLabel htmlFor="homeDelivery" className="mb-0">
                      Home Delivery/Home Service Available
                    </FieldLabel>
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Store Logo (Optional)</FieldLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleStoreChange('logo', e.target.files?.[0] || null)}
                  />
                  <FieldDescription>Upload your store logo</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Store Photo (Optional)</FieldLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleStoreChange('store_photo', e.target.files?.[0] || null)}
                  />
                  <FieldDescription>Upload a photo of your store</FieldDescription>
                </Field>
              </FieldGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
          >
            Previous
          </Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? 'Saving...' : currentStep === 3 ? 'Complete Registration' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}