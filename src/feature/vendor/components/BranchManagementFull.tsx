import {useEffect, useState, useCallback} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useAuth} from '@/feature/auth/context/AuthContext';
import vendorAuthService from '@/feature/auth/services/vendorAuthService';
import {Edit, MapPin, Phone, Plus, Trash2, X} from 'lucide-react';

interface BranchForm {
  country: string;
  state: string;
  district: string;
  shop_locality: string;
  nearby_town: string;
  pin_code: string;
  key_person_name: string;
  key_person_contact_number: string;
  land_phone: string;
  latitude?: string;
  longitude?: string;
}

import type { Country, State, District } from '@/feature/auth/services/vendorAuthService';

interface Branch {
  id: string;
  vendor?: string;
  country: string;
  state: string;
  district: string;
  shop_locality: string;
  nearby_town: string;
  pin_code: string;
  key_person_name?: string;
  key_person_contact_number?: string;
  land_phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function BranchManagementFull() {
  const {token, vendor} = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Location data
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [formData, setFormData] = useState<BranchForm>({
    country: '',
    state: '',
    district: '',
    shop_locality: '',
    nearby_town: '',
    pin_code: '',
    key_person_name: '',
    key_person_contact_number: '',
    land_phone: '',
  });

  const loadBranches = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await vendorAuthService.getBranches(token);
      setBranches(data as Branch[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load branches';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadCountries = useCallback(async () => {
    try {
      const data = await vendorAuthService.getCountries();
      setCountries(data as Country[]);
    } catch (err: unknown) {
      console.error('Failed to load countries:', err);
    }
  }, []);

  // loadBranches and loadCountries are stable (useCallback). Explicitly allow this dependency array.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void loadBranches();
    void loadCountries();
  }, [loadBranches, loadCountries]);

  useEffect(() => {
    if (formData.country) {
      loadStates(formData.country);
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      loadDistricts(formData.state);
    }
  }, [formData.state]);

  const loadStates = useCallback(async (countryId: string) => {
    try {
      const data = await vendorAuthService.getStates(countryId);
      setStates(data as State[]);
    } catch (err: unknown) {
      console.error('Failed to load states:', err);
    }
  }, []);

  const loadDistricts = useCallback(async (stateId: string) => {
    try {
      const data = await vendorAuthService.getDistricts(stateId);
      setDistricts(data as District[]);
    } catch (err: unknown) {
      console.error('Failed to load districts:', err);
    }
  }, []);

  const handleFormChange = (field: keyof BranchForm, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const validateForm = (): boolean => {
    const required = [
      'country', 'state', 'district', 'shop_locality',
      'nearby_town', 'pin_code', 'key_person_name', 'key_person_contact_number'
    ];

    for (const field of required) {
      if (!formData[field as keyof BranchForm]) {
        setError(`Please fill in ${field.replace(/_/g, ' ')}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!token || !vendor) return;

    setLoading(true);
    setError('');

    try {
      const branchData = {
        vendor: vendor.id,
        ...formData,
        land_phone: formData.land_phone || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (editingBranch) {
        await vendorAuthService.updateBranch(token, editingBranch.id, branchData);
        setSuccess('Branch updated successfully');
      } else {
        await vendorAuthService.createBranch(token, branchData);
        setSuccess('Branch added successfully');
      }

      await loadBranches();
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save branch';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      country: branch.country,
      state: branch.state,
      district: branch.district,
      shop_locality: branch.shop_locality,
      nearby_town: branch.nearby_town,
      pin_code: branch.pin_code,
      key_person_name: branch.key_person_name || '',
      key_person_contact_number: branch.key_person_contact_number || '',
      land_phone: branch.land_phone || '',
      latitude: branch.latitude?.toString() || '',
      longitude: branch.longitude?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (branchId: string) => {
    if (!token || !confirm('Are you sure you want to delete this branch?')) return;

    try {
      await vendorAuthService.deleteBranch(token, branchId);
      setSuccess('Branch deleted successfully');
      await loadBranches();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete branch';
      setError(message);
    }
  };

  const resetForm = () => {
    setFormData({
      country: '',
      state: '',
      district: '',
      shop_locality: '',
      nearby_town: '',
      pin_code: '',
      key_person_name: '',
      key_person_contact_number: '',
      land_phone: '',
    });
    setEditingBranch(null);
    setShowForm(false);
    setError('');
  };

  if (loading && branches.length === 0) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Branch Management</h1>
          <p className="text-gray-600 mt-1">Manage your business locations</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2"/>
            Add Branch
          </Button>
        )}
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

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</CardTitle>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="w-4 h-4"/>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>Country *</FieldLabel>
                  <Select
                    value={formData.country}
                    onValueChange={(val) => handleFormChange('country', val)}
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
                    value={formData.state}
                    onValueChange={(val) => handleFormChange('state', val)}
                    disabled={!formData.country}
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
                    value={formData.district}
                    onValueChange={(val) => handleFormChange('district', val)}
                    disabled={!formData.state}
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
                    value={formData.shop_locality}
                    onChange={(e) => handleFormChange('shop_locality', e.target.value)}
                    placeholder="Downtown Market"
                  />
                </Field>

                <Field>
                  <FieldLabel>Nearby Town *</FieldLabel>
                  <Input
                    value={formData.nearby_town}
                    onChange={(e) => handleFormChange('nearby_town', e.target.value)}
                    placeholder="Springfield"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>PIN Code *</FieldLabel>
                <Input
                  value={formData.pin_code}
                  onChange={(e) => handleFormChange('pin_code', e.target.value)}
                  placeholder="695001"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Key Person Name *</FieldLabel>
                  <Input
                    value={formData.key_person_name}
                    onChange={(e) => handleFormChange('key_person_name', e.target.value)}
                    placeholder="Manager Name"
                  />
                </Field>

                <Field>
                  <FieldLabel>Key Person Contact *</FieldLabel>
                  <Input
                    value={formData.key_person_contact_number}
                    onChange={(e) => handleFormChange('key_person_contact_number', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Land Phone</FieldLabel>
                <Input
                  value={formData.land_phone}
                  onChange={(e) => handleFormChange('land_phone', e.target.value)}
                  placeholder="0471-1234567"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Latitude</FieldLabel>
                  <Input
                    value={formData.latitude}
                    onChange={(e) => handleFormChange('latitude', e.target.value)}
                    placeholder="28.7041"
                    type="number"
                    step="any"
                  />
                </Field>

                <Field>
                  <FieldLabel>Longitude</FieldLabel>
                  <Input
                    value={formData.longitude}
                    onChange={(e) => handleFormChange('longitude', e.target.value)}
                    placeholder="77.1025"
                    type="number"
                    step="any"
                  />
                </Field>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : editingBranch ? 'Update Branch' : 'Add Branch'}
                </Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* Branches List */}
      {branches.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
            <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
            <p className="text-gray-600 mb-4">Add your first branch to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2"/>
              Add Branch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((branch: Branch) => (
            <Card key={branch.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{branch.shop_locality}</CardTitle>
                    <CardDescription>{branch.nearby_town}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(branch)}>
                      <Edit className="w-4 h-4"/>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(branch.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600"/>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-600"/>
                  <span>{branch.pin_code}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-600"/>
                  <span>{branch.key_person_contact_number}</span>
                </div>
                {branch.key_person_name && (
                  <div className="text-sm text-gray-600">
                    Manager: {branch.key_person_name}
                  </div>
                )}
                {branch.land_phone && (
                  <div className="text-sm text-gray-600">
                    Land Phone: {branch.land_phone}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BranchManagementFull;
