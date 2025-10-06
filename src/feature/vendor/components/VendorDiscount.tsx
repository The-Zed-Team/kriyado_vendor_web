import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useAuth} from '@/feature/auth/context/AuthContext';
import vendorAuthService from '@/feature/auth/services/vendorAuthService';
import {AlertCircle, Plus, Trash2} from 'lucide-react';

interface Discount {
  id?: string;
  type: 'total_bill' | 'category_based' | 'special_offer';
  value_type: 'flat' | 'percentage';
  value: string;
  category?: string;
  description?: string;
  branches: string[];
  expiry_date?: string;
}

interface PredefinedDiscount {
  label: string;
  type: 'flat' | 'percentage';
  value: string;
}

const PREDEFINED_DISCOUNTS: PredefinedDiscount[] = [
  {label: '5% off for total bill', type: 'percentage', value: '5'},
  {label: '10% off for total bill', type: 'percentage', value: '10'},
  {label: '15% off for total bill', type: 'percentage', value: '15'},
  {label: '20% off for total bill', type: 'percentage', value: '20'},
  {label: '25% off for total bill', type: 'percentage', value: '25'},
  {label: '₹50 flat off', type: 'flat', value: '50'},
  {label: '₹100 flat off', type: 'flat', value: '100'},
  {label: '₹500 flat off', type: 'flat', value: '500'},
  {label: '₹1000 flat off', type: 'flat', value: '1000'},
  {label: '₹500 off for purchase above ₹2500', type: 'flat', value: '500'}
];

export function VendorDiscount() {
  const {token} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [branches, setBranches] = useState<Array<{id: string; shop_locality?: string; nearby_town?: string}>>([]);

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [newDiscount, setNewDiscount] = useState<Discount>({
    type: 'total_bill',
    value_type: 'flat',
    value: '',
    branches: [],
  });

  useEffect(() => {
    if (!token) {
      setBranches([]);
      return;
    }

    const doLoad = async () => {
      try {
        const data = await vendorAuthService.getBranches(token);
        setBranches(data as Array<{id: string; shop_locality?: string; nearby_town?: string}>);
      } catch (e) {
        console.error('Failed to load branches:', e);
      }
    };

    doLoad();
  }, [token]);


  const handleAddDiscount = () => {
    if (!newDiscount.value || newDiscount.branches.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setDiscounts([...discounts, {...newDiscount, id: Date.now().toString()}]);
    setNewDiscount({
      type: 'total_bill',
      value_type: 'flat',
      value: '',
      branches: [],
    });
    setSuccess('Discount added successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRemoveDiscount = (id: string) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  const handlePredefinedDiscount = (discount: PredefinedDiscount) => {
    setNewDiscount(prev => ({
      ...prev,
      value_type: discount.type as 'flat' | 'percentage',
      value: discount.value
    }));
  };

  const handleBranchToggle = (branchId: string) => {
    setNewDiscount(prev => ({
      ...prev,
      branches: prev.branches.includes(branchId)
        ? prev.branches.filter(id => id !== branchId)
        : [...prev.branches, branchId]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discount Management</h1>
        <p className="text-gray-600 mt-1">Create and manage discounts for your store</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Add New Discount */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Discount</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Discount Type</FieldLabel>
              <Select
                value={newDiscount.type}
                onValueChange={(val: string) => setNewDiscount({...newDiscount, type: val as Discount['type']})}
              >
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total_bill">Total Bill Discount</SelectItem>
                  <SelectItem value="category_based">Category Based Discount</SelectItem>
                  <SelectItem value="special_offer">Special Offer</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {newDiscount.type === 'total_bill' && (
              <div>
                <FieldLabel className="mb-2">Quick Select</FieldLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PREDEFINED_DISCOUNTS.map((discount, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePredefinedDiscount(discount)}
                      className="text-xs"
                    >
                      {discount.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Value Type</FieldLabel>
                <Select
                  value={newDiscount.value_type}
                  onValueChange={(val: string) => setNewDiscount({...newDiscount, value_type: val as Discount['value_type']})}
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Value</FieldLabel>
                <Input
                  type="number"
                  value={newDiscount.value}
                  onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                  placeholder={newDiscount.value_type === 'flat' ? 'Enter amount' : 'Enter percentage'}
                />
              </Field>
            </div>

            {newDiscount.type === 'category_based' && (
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Input
                  value={newDiscount.category || ''}
                  onChange={(e) => setNewDiscount({...newDiscount, category: e.target.value})}
                  placeholder="Enter category name"
                />
              </Field>
            )}

            {newDiscount.type === 'special_offer' && (
              <>
                <Field>
                  <FieldLabel>Offer Description</FieldLabel>
                  <Input
                    value={newDiscount.description || ''}
                    onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})}
                    placeholder="Describe the special offer"
                  />
                </Field>
                <Field>
                  <FieldLabel>Expiry Date</FieldLabel>
                  <Input
                    type="date"
                    value={newDiscount.expiry_date || ''}
                    onChange={(e) => setNewDiscount({...newDiscount, expiry_date: e.target.value})}
                  />
                </Field>
              </>
            )}

            <Field>
              <FieldLabel>Select Branches</FieldLabel>
              <div className="space-y-2">
                {branches.map(branch => (
                  <div key={branch.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newDiscount.branches.includes(branch.id)}
                      onChange={() => handleBranchToggle(branch.id)}
                      className="w-4 h-4"
                    />
                    <label className="text-sm">
                      {branch.shop_locality}, {branch.nearby_town}
                    </label>
                  </div>
                ))}
              </div>
            </Field>

            <div className="flex items-center space-x-2 mt-4">
              <Button onClick={handleAddDiscount}>
                <Plus className="mr-2 h-4 w-4"/> Add Discount
              </Button>
            </div>

          </FieldGroup>
        </CardContent>
      </Card>

      {/* Active Discounts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          {discounts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No discounts added yet</p>
          ) : (
            <div className="space-y-4">
              {discounts.map(discount => (
                <div key={discount.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {discount.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="font-medium">
                          {discount.value_type === 'flat' ? '₹' : ''}{discount.value}{discount.value_type === 'percentage' ? '%' : ''} off
                        </span>
                      </div>
                      {discount.category && (
                        <p className="text-sm text-gray-600">Category: {discount.category}</p>
                      )}
                      {discount.description && (
                        <p className="text-sm text-gray-600">{discount.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Applied to {discount.branches.length} branch(es)
                      </p>
                      {discount.expiry_date && (
                        <p className="text-sm text-gray-500">Expires: {discount.expiry_date}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveDiscount(discount.id!)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VendorDiscount;
