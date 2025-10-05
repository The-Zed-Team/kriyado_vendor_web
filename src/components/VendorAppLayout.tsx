import {Outlet, useLocation, useNavigate} from 'react-router';
import {useAuth} from '@/feature/auth/context/AuthContext.tsx';
import {Button} from '@/components/ui/button.tsx';
import {LayoutDashboard, LogOut, MapPin, Menu, Percent, Store, User, X} from 'lucide-react';
import {useState} from 'react';

export default function VendorAppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {vendor, logout} = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {path: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard},
    {path: '/vendor/profile', label: 'Profile', icon: User},
    {path: '/vendor/branches', label: 'Branches', icon: MapPin},
    {path: '/vendor/discounts', label: 'Discounts', icon: Percent},
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-blue-600"/>
          <span className="font-bold text-lg">Kriyado Vendor</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:sticky top-0 left-0 z-40
            w-64 h-screen bg-white border-r
            transition-transform duration-300 ease-in-out
            flex flex-col
          `}
        >
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 p-6 border-b">
            <Store className="w-8 h-8 text-blue-600"/>
            <span className="font-bold text-xl">Kriyado Vendor</span>
          </div>

          {/* Vendor Info */}
          <div className="p-4 border-b">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-semibold">{vendor?.name}</p>
              <p className="text-xs text-gray-500 mt-1">{vendor?.business_type}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                  `}
                >
                  <Icon className="w-5 h-5"/>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="w-5 h-5 mr-3"/>
              Logout
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}