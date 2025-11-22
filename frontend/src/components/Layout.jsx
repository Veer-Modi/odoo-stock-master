import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  TruckIcon, 
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Users,
  Warehouse
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission, isAuthenticated } = useAuth();
  
  // If not authenticated, show default user for demo
  const displayUser = user || {
    name: 'Demo User',
    email: 'demo@stockmaster.com',
    role: 'STAFF'
  };

  const handleLogout = () => {
    if (isAuthenticated) {
      logout();
      toast.success('Logged out successfully');
    }
    navigate('/login');
  };

  // Define all menu items with their required permissions
  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', permission: 'VIEW_DASHBOARD' },
    { icon: Package, label: 'Products', path: '/products', permission: 'VIEW_PRODUCTS' },
    { icon: Warehouse, label: 'Warehouses', path: '/warehouses', permission: 'VIEW_WAREHOUSES' },
    { icon: Package, label: 'Stock', path: '/stock', permission: 'VIEW_STOCK_PAGE' },
    { icon: Package, label: 'My Stock', path: '/stock/my-warehouse', permission: 'VIEW_STOCK_MY_WAREHOUSE' },
    { icon: ArrowDownToLine, label: 'Receipts', path: '/receipts', subtitle: 'Incoming Stock', permission: 'CREATE_RECEIPTS' },
    { icon: ArrowUpFromLine, label: 'Deliveries', path: '/deliveries', subtitle: 'Outgoing Stock', permission: 'CREATE_DELIVERIES' },
    { icon: TruckIcon, label: 'Transfers', path: '/transfers', permission: 'CREATE_TRANSFERS' },
    { icon: History, label: 'Adjustments', path: '/adjustments', permission: 'CREATE_ADJUSTMENTS' },
    { icon: History, label: 'Ledger', path: '/ledger', permission: 'VIEW_LEDGER' },
    { icon: Users, label: 'Users', path: '/users', permission: 'VIEW_USERS' },
    { icon: Settings, label: 'Settings', path: '/settings', permission: 'VIEW_SETTINGS' },
  ];

  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    // If not authenticated, show all menu items for demo
    if (!isAuthenticated) {
      return allMenuItems;
    }
    return allMenuItems.filter(item => {
      return hasPermission(item.permission);
    });
  }, [user, hasPermission, isAuthenticated]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-r border-slate-200/80 shadow-lg lg:shadow-none transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-900">StockMaster</span>
                <span className="block text-xs text-slate-500 font-medium">Inventory Pro</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] animate-slide-up ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold shadow-md shadow-blue-200/50 border border-blue-200/50'
                        : 'text-slate-700 hover:bg-slate-100/80 border border-transparent hover:shadow-sm'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${active ? 'text-blue-600 scale-110' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      {item.subtitle && (
                        <div className="text-xs text-slate-500">{item.subtitle}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100/80 transition-all duration-200 border border-transparent hover:border-slate-200" data-testid="user-menu-trigger">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{displayUser.name}</div>
                    <div className="text-xs text-slate-500">{displayUser.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="profile-menu-item">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} data-testid="settings-menu-item">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="logout-menu-item">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 flex items-center px-6 sticky top-0 z-30 shadow-md shadow-slate-200/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
            data-testid="mobile-menu-button"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gradient">
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
