// src/feature/vendor/pages/VendorDashboard.tsx
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useAuth} from '@/feature/auth/context/AuthContext.tsx';
import {Building2, Package, ShoppingCart, TrendingUp} from 'lucide-react';

export function VendorDashboard() {
  const {vendor} = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {vendor?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231</div>
            <p className="text-xs text-green-600 mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-gray-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-gray-600 mt-1">3 pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor?.branches?.length || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Active locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Order #{1000 + i}</p>
                  <p className="text-sm text-gray-600">Customer {i}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(Math.random() * 5000).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{i} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VendorDashboard;