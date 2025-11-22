import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Package, ArrowRight, Shield, UserCog, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { authAPI, warehouseAPI } from '../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: ROLES.STAFF,
    warehouseId: ''
  });
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { 
      value: 'STAFF', 
      label: 'Staff (Default)', 
      icon: Warehouse, 
      description: 'Warehouse operations - Public registration',
      features: ['View stock in assigned warehouse', 'Create receipts and deliveries', 'Pick and pack orders', 'Create transfers and adjustments'],
      requiresWarehouse: true
    },
    { 
      value: ROLES.MANAGER, 
      label: 'Manager', 
      icon: UserCog, 
      description: 'Manage inventory operations - Admin approval required',
      features: ['Manage products and inventory', 'Validate receipts and deliveries', 'View all warehouses', 'Create and validate adjustments'],
      requiresWarehouse: false
    },
    { 
      value: ROLES.ADMIN, 
      label: 'Admin', 
      icon: Shield, 
      description: 'Full system access - Admin approval required',
      features: ['Full system access', 'Manage users and warehouses', 'All validation operations', 'System configuration'],
      requiresWarehouse: false
    },
  ];

  // Load warehouses on mount
  useEffect(() => {
    const token = localStorage.getItem('stockmaster_token');
    if (!token) return; // Avoid unauthorized request before login
    warehouseAPI.getAll()
      .then(response => setWarehouses(response.data))
      .catch(() => {});
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const minPasswordLength = formData.role === ROLES.ADMIN ? 8 : 6;
    if (formData.password.length < minPasswordLength) {
      toast.error(`Password must be at least ${minPasswordLength} characters${formData.role === ROLES.ADMIN ? ' for admin accounts' : ''}`);
      return;
    }

    setLoading(true);
    
    try {
      const selectedRole = formData.role;
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        warehouseId: formData.warehouseId || null
      });
      console.log(selectedRole)
      
      // If registration succeeds, automatically log in
      const { token, user: userData } = response.data;
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(`Account created successfully! Welcome, ${userData.name}!`);
        // Use window.location for reliable navigation after auth state update
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 300);
      } else {
        // If auto-login fails, still show success and redirect to login
        toast.success('Account created successfully! Please log in.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      
      if (message.includes('already exists') || message.includes('duplicate')) {
        toast.error('An account with this email already exists. Please log in instead.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzMzMyIgb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full -mr-48 -mt-48 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full -ml-48 -mb-48 opacity-10 blur-3xl"></div>
        
        <div className="relative z-10 text-white space-y-8">
          <h2 className="text-4xl font-bold leading-tight">
            Join Thousands of
            <br />
            <span className="text-blue-400">Warehouse Professionals</span>
          </h2>
          <ul className="space-y-4 text-lg text-slate-300">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <span>Real-time stock visibility across all warehouses</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <span>Automated receipts, deliveries, and transfers</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <span>Smart alerts for low stock and discrepancies</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white via-blue-50/30 to-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Package className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">StockMaster</span>
            </div>
            <h2 className="text-4xl font-bold text-gradient mb-3">Create Account</h2>
            <p className="text-slate-600 text-lg">
              {formData.role === ROLES.ADMIN ? 'Create an admin account with full system access' :
               formData.role === ROLES.MANAGER ? 'Create a manager account for inventory operations' :
               'Get started with your inventory management system'}
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 animate-slide-up">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-slate-700 font-bold text-sm">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Manager"
                data-testid="signup-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-700 font-bold text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@company.com"
                data-testid="signup-email-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="role" className="text-slate-700 font-bold text-sm">Select Your Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value, warehouseId: '' })}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md">
                  <SelectValue placeholder="Select role (default: Staff)" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <SelectItem key={role.value || 'default'} value={role.value} className="cursor-pointer">
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex flex-col">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-slate-500">{role.description}</span>
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Role-specific information card */}
            {formData.role !== undefined && (
              <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.role === ROLES.STAFF ? 'bg-green-50 border-green-200' :
                formData.role === ROLES.MANAGER ? 'bg-blue-50 border-blue-200' :
                formData.role === ROLES.ADMIN ? 'bg-purple-50 border-purple-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                {(() => {
                  const selectedRole = roleOptions.find(r => r.value === formData.role) || roleOptions[0];
                  const Icon = selectedRole.icon;
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${
                          formData.role === ROLES.STAFF ? 'text-green-600' :
                          formData.role === ROLES.MANAGER ? 'text-blue-600' :
                          formData.role === ROLES.ADMIN ? 'text-purple-600' :
                          'text-slate-600'
                        }`} />
                        <h4 className="font-bold text-slate-900">{selectedRole.label} Account</h4>
                      </div>
                      <p className="text-sm text-slate-700">{selectedRole.description}</p>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-2">What you can do:</p>
                        <ul className="space-y-1">
                          {selectedRole.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {formData.role && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800 font-semibold">
                            The selected role will be applied to your new account.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Warehouse selection - Only for Staff role */}
            {formData.role === ROLES.STAFF && (
              <div className="space-y-3">
                <Label htmlFor="warehouse" className="text-slate-700 font-bold text-sm">
                  Assign Warehouse <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Select
                  value={formData.warehouseId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, warehouseId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md">
                    <SelectValue placeholder="Select warehouse (optional for staff)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No warehouse assigned</SelectItem>
                    {warehouses.map((w) => (
                      <SelectItem key={w._id} value={w._id}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Staff members are typically assigned to a specific warehouse. You can leave this empty and assign it later.
                </p>
              </div>
            )}

            {/* Additional info for Manager role */}
            {formData.role === ROLES.MANAGER && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 font-semibold mb-1">Manager Account Information:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• You'll have access to all warehouses</li>
                    <li>• You can validate receipts, deliveries, and adjustments</li>
                    <li>• You can manage products and inventory</li>
                    <li>• Warehouse assignment is not required</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Additional info for Admin role */}
            {formData.role === ROLES.ADMIN && (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-800 font-semibold mb-1">Admin Account Information:</p>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Full system access and control</li>
                    <li>• Can create and manage users</li>
                    <li>• Can create and manage warehouses</li>
                    <li>• All validation and administrative operations</li>
                    <li>• Warehouse assignment is not required</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="password" className="text-slate-700 font-bold text-sm">
                Password
                {formData.role === ROLES.ADMIN && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                data-testid="signup-password-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={formData.role === ROLES.ADMIN ? 8 : 6}
                className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md"
              />
              <p className="text-xs text-slate-500 font-medium">
                {formData.role === ROLES.ADMIN 
                  ? 'Admin accounts require at least 8 characters for security'
                  : 'Must be at least 6 characters'}
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-bold text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                data-testid="signup-confirm-password-input"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base group shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 rounded-xl mt-6"
              disabled={loading}
              data-testid="signup-submit-button"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors" data-testid="login-link">
                Sign In
              </Link>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
