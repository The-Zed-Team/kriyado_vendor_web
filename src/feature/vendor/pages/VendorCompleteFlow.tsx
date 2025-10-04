import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator} from '@/components/ui/field';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Building2, CheckCircle2, MapPin, Phone} from 'lucide-react';

// Mock API service
const api = {
  baseUrl: 'http://localhost:8000',

  async firebaseAuthenticate(idToken, userType) {
    const formData = new FormData();
    formData.append('id_token', idToken);
    formData.append('user_type', userType);

    const response = await fetch(`${this.baseUrl}/api/v1/account/firebase_authenticate/`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async getUserInfo(token) {
    const response = await fetch(`${this.baseUrl}/api/v1/account/user_info/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async getOnboardingStatus(token) {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/onboarding-status/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async createVendor(token, data) {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateVendor(token, data) {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/update/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getShopTypes() {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/shop-types/`);
    return response.json();
  },

  async getCountries() {
    const response = await fetch(`${this.baseUrl}/api/v1/location/countries/`);
    return response.json();
  },

  async getStates(countryId) {
    const response = await fetch(`${this.baseUrl}/api/v1/location/states/?country=${countryId}`);
    return response.json();
  },

  async getDistricts(stateId) {
    const response = await fetch(`${this.baseUrl}/api/v1/location/districts/?state=${stateId}`);
    return response.json();
  },

  async createBranch(token, data) {
    const response = await fetch(`${this.baseUrl}/api/v1/vendor/branches/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export default function VendorLoginFlow() {
  const [currentView, setCurrentView] = useState('login'); // login, signup, wizard, dashboard
  const [wizardStep, setWizardStep] = useState(1);
  const [authToken, setAuthToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [loginForm, setLoginForm] = useState({email: '', password: ''});
  const [signupForm, setSignupForm] = useState({email: '', phone: '', password: ''});
  const [otpForm, setOtpForm] = useState({otp: ''});

  // Wizard form states
  const [locationForm, setLocationForm] = useState({
    shopType: '',
    businessType: '',
    country: '',
    state: '',
    district: '',
    shopLocality: '',
    nearbyTown: '',
    pinCode: '',
    name: '',
    ownerName: '',
    contactNumber: '',
    keyPersonName: '',
    keyPersonContact: ''
  });

  const [contactForm, setContactForm] = useState({
    landPhone: '',
    registeredAddress: '',
    addressLine2: '',
    website: '',
    facebook: '',
    instagram: '',
    googleMap: '',
    youtube: ''
  });

  const [storeForm, setStoreForm] = useState({
    workingHoursFrom: '',
    workingHoursTo: '',
    homeDelivery: false,
    logo: null,
    storePhoto: null
  });

  // Mock data
  const shopTypes = [
    {id: '1', name: 'Book Stall'},
    {id: '2', name: 'Hotels'},
    {id: '3', name: 'Restaurant'}
  ];

  const businessTypes = ['Wholesale', 'Retail', 'Wholesale & Retail', 'Service based'];

  const countries = [{id: '1', name: 'India'}];
  const states = [{id: '1', name: 'Kerala'}, {id: '2', name: 'Tamil Nadu'}];
  const districts = [{id: '1', name: 'Thiruvananthapuram'}, {id: '2', name: 'Kochi'}];

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // In real implementation, this would trigger Firebase Google Sign-In
      // const result = await signInWithGoogle();
      // const idToken = await result.user.getIdToken();

      // Mock Firebase token
      const mockToken = 'mock_firebase_token_' + Date.now();

      // Authenticate with backend
      const authResult = await api.firebaseAuthenticate(mockToken, 'vendor');

      setAuthToken(mockToken);
      setUserInfo(authResult);

      // Check onboarding status
      const onboardingStatus = await api.getOnboardingStatus(mockToken);

      if (onboardingStatus.is_onboarded) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('wizard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Mock login - in real app, use Firebase signInWithEmailAndPassword
      const mockToken = 'mock_token_' + Date.now();
      setAuthToken(mockToken);

      const onboardingStatus = await api.getOnboardingStatus(mockToken);

      if (onboardingStatus.is_onboarded) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('wizard');
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Handle wizard navigation
  const handleWizardNext = async () => {
    setLoading(true);
    try {
      if (wizardStep === 1) {
        // Save location details
        await api.createVendor(authToken, {
          name: locationForm.name,
          contact_number: locationForm.contactNumber,
          shop_type: locationForm.shopType,
          business_type: locationForm.businessType,
          owner_name: locationForm.ownerName
        });
      } else if (wizardStep === 2) {
        // Update with contact details
        await api.updateVendor(authToken, {
          land_phone: contactForm.landPhone,
          website: contactForm.website,
          facebook: contactForm.facebook,
          instagram: contactForm.instagram
        });
      } else if (wizardStep === 3) {
        // Final step - complete onboarding
        setCurrentView('dashboard');
        return;
      }

      setWizardStep(wizardStep + 1);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWizardPrevious = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  // Render Login View
  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Vendor Login</CardTitle>
          <CardDescription>Sign in to manage your store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin}>
            <FieldGroup>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                />
              </Field>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <FieldSeparator>Or continue with</FieldSeparator>

              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>

              <FieldDescription className="text-center">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('signup')}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // Render Registration Wizard
  const renderWizard = () => {
    const steps = [
      {number: 1, title: 'Location Details', icon: MapPin},
      {number: 2, title: 'Contact Information', icon: Phone},
      {number: 3, title: 'Store Details', icon: Building2}
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Vendor Registration</h1>
            <p className="text-gray-600">Complete all steps to start selling</p>
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
                        wizardStep > step.number
                          ? 'bg-green-500 border-green-500 text-white'
                          : wizardStep === step.number
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {wizardStep > step.number ? (
                          <CheckCircle2 className="w-6 h-6"/>
                        ) : (
                          <Icon className="w-6 h-6"/>
                        )}
                      </div>
                      <div className="text-center mt-2">
                        <div className={`text-sm font-medium ${
                          wizardStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-4 ${
                        wizardStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                      }`}/>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardContent className="p-6">
              {wizardStep === 1 && (
                <FieldGroup>
                  <h2 className="text-xl font-semibold mb-4">Location Details</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Shop Type</FieldLabel>
                      <Select
                        value={locationForm.shopType}
                        onValueChange={(val) => setLocationForm({...locationForm, shopType: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shop type"/>
                        </SelectTrigger>
                        <SelectContent>
                          {shopTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Business Type</FieldLabel>
                      <Select
                        value={locationForm.businessType}
                        onValueChange={(val) => setLocationForm({...locationForm, businessType: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type"/>
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Country</FieldLabel>
                      <Select
                        value={locationForm.country}
                        onValueChange={(val) => setLocationForm({...locationForm, country: val})}
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
                      <FieldLabel>State</FieldLabel>
                      <Select
                        value={locationForm.state}
                        onValueChange={(val) => setLocationForm({...locationForm, state: val})}
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
                      <FieldLabel>District</FieldLabel>
                      <Select
                        value={locationForm.district}
                        onValueChange={(val) => setLocationForm({...locationForm, district: val})}
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
                      <FieldLabel>Shop Locality</FieldLabel>
                      <Input
                        value={locationForm.shopLocality}
                        onChange={(e) => setLocationForm({...locationForm, shopLocality: e.target.value})}
                        placeholder="Downtown Market"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Nearby Town</FieldLabel>
                      <Input
                        value={locationForm.nearbyTown}
                        onChange={(e) => setLocationForm({...locationForm, nearbyTown: e.target.value})}
                        placeholder="Springfield"
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>PIN Code</FieldLabel>
                    <Input
                      value={locationForm.pinCode}
                      onChange={(e) => setLocationForm({...locationForm, pinCode: e.target.value})}
                      placeholder="695001"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Organization Name</FieldLabel>
                    <Input
                      value={locationForm.name}
                      onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
                      placeholder="ABC Store"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Owner Name (Optional)</FieldLabel>
                    <Input
                      value={locationForm.ownerName}
                      onChange={(e) => setLocationForm({...locationForm, ownerName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Mobile Number</FieldLabel>
                    <Input
                      value={locationForm.contactNumber}
                      onChange={(e) => setLocationForm({...locationForm, contactNumber: e.target.value})}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Key Person/Manager Name</FieldLabel>
                      <Input
                        value={locationForm.keyPersonName}
                        onChange={(e) => setLocationForm({...locationForm, keyPersonName: e.target.value})}
                        placeholder="Manager Name"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Key Person Contact</FieldLabel>
                      <Input
                        value={locationForm.keyPersonContact}
                        onChange={(e) => setLocationForm({...locationForm, keyPersonContact: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </Field>
                  </div>
                </FieldGroup>
              )}

              {wizardStep === 2 && (
                <FieldGroup>
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                  <Field>
                    <FieldLabel>Land Phone</FieldLabel>
                    <Input
                      value={contactForm.landPhone}
                      onChange={(e) => setContactForm({...contactForm, landPhone: e.target.value})}
                      placeholder="0471-1234567"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Registered Address</FieldLabel>
                    <Textarea
                      value={contactForm.registeredAddress}
                      onChange={(e) => setContactForm({...contactForm, registeredAddress: e.target.value})}
                      placeholder="123 Main Street, City"
                      rows={3}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Website</FieldLabel>
                    <Input
                      value={contactForm.website}
                      onChange={(e) => setContactForm({...contactForm, website: e.target.value})}
                      placeholder="https://www.example.com"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Facebook Link</FieldLabel>
                    <Input
                      value={contactForm.facebook}
                      onChange={(e) => setContactForm({...contactForm, facebook: e.target.value})}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Instagram Link</FieldLabel>
                    <Input
                      value={contactForm.instagram}
                      onChange={(e) => setContactForm({...contactForm, instagram: e.target.value})}
                      placeholder="https://instagram.com/yourpage"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Google Map Link</FieldLabel>
                    <Input
                      value={contactForm.googleMap}
                      onChange={(e) => setContactForm({...contactForm, googleMap: e.target.value})}
                      placeholder="Google Maps URL"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>YouTube Link</FieldLabel>
                    <Input
                      value={contactForm.youtube}
                      onChange={(e) => setContactForm({...contactForm, youtube: e.target.value})}
                      placeholder="https://youtube.com/yourchannel"
                    />
                  </Field>
                </FieldGroup>
              )}

              {wizardStep === 3 && (
                <FieldGroup>
                  <h2 className="text-xl font-semibold mb-4">Store Details</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Working Hours From</FieldLabel>
                      <Input
                        type="time"
                        value={storeForm.workingHoursFrom}
                        onChange={(e) => setStoreForm({...storeForm, workingHoursFrom: e.target.value})}
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Working Hours To</FieldLabel>
                      <Input
                        type="time"
                        value={storeForm.workingHoursTo}
                        onChange={(e) => setStoreForm({...storeForm, workingHoursTo: e.target.value})}
                      />
                    </Field>
                  </div>

                  <Field>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="homeDelivery"
                        checked={storeForm.homeDelivery}
                        onChange={(e) => setStoreForm({...storeForm, homeDelivery: e.target.checked})}
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
                      onChange={(e) => setStoreForm({...storeForm, logo: e.target.files[0]})}
                    />
                    <FieldDescription>Upload your store logo</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Store Photo (Optional)</FieldLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setStoreForm({...storeForm, storePhoto: e.target.files[0]})}
                    />
                    <FieldDescription>Upload a photo of your store</FieldDescription>
                  </Field>
                </FieldGroup>
              )}

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleWizardPrevious}
              disabled={wizardStep === 1 || loading}
            >
              Previous
            </Button>
            <Button onClick={handleWizardNext} disabled={loading}>
              {loading ? 'Saving...' : wizardStep === 3 ? 'Complete Registration' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back! Manage your store here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">124</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹45,890</p>
              <p className="text-sm text-green-600">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">48</p>
              <p className="text-sm text-gray-600">2 pending approval</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20">Add Branch</Button>
            <Button variant="outline" className="h-20">Add Product</Button>
            <Button variant="outline" className="h-20">Manage Discounts</Button>
            <Button variant="outline" className="h-20">View Reports</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Main render
  return (
    <div>
      {currentView === 'login' && renderLogin()}
      {currentView === 'wizard' && renderWizard()}
      {currentView === 'dashboard' && renderDashboard()}
    </div>
  );
}