import {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useAuth} from '@/feature/auth/context/AuthContext.js';
import vendorAuthService from '@/feature/auth/services/vendorAuthService';
import {Edit, MapPin, Phone, Plus, Trash2} from 'lucide-react';
import {Alert, AlertDescription} from '@/components/ui/alert';

export function BranchManagement() {
    const {token} = useAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const data = await vendorAuthService.getBranches(token);
            setBranches(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (branchId: string) => {
        if (!token || !confirm('Are you sure you want to delete this branch?')) return;

        try {
            await vendorAuthService.deleteBranch(token, branchId);
            await loadBranches();
        } catch (err: any) {
            setError(err.message || 'Failed to delete branch');
        }
    };

    if (loading) {
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
                <Button>
                    <Plus className="w-4 h-4 mr-2"/>
                    Add Branch
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {branches.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                        <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
                        <p className="text-gray-600 mb-4">Add your first branch to get started</p>
                        <Button>
                            <Plus className="w-4 h-4 mr-2"/>
                            Add Branch
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branches.map((branch: any) => (
                        <Card key={branch.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{branch.shop_locality}</CardTitle>
                                        <CardDescription>{branch.nearby_town}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}