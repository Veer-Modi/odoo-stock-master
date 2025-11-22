import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Package, ArrowRight, Shield, UserCog, Warehouse, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, ROLES } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: ''
  });
  const [loading, setLoading] = useState(false);

  // Demo credentials for each role
  const demoCredentials = [
    {
      role: ROLES.ADMIN,
      email: 'admin@stockmaster.com',
      password: 'admin123',
      name: 'Admin User',
      icon: Shield,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Full system access'
    },
    {
      role: ROLES.MANAGER,
      email: 'manager@stockmaster.com',
      password: 'manager123',
      name: 'Manager User',
      icon: UserCog,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Inventory management'
    },
    {
      role: ROLES.STAFF,
      email: 'staff@stockmaster.com',
      password: 'staff123',
      name: 'Staff User',
      icon: Warehouse,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Warehouse operations'
    }
  ];

  const handleDemoLogin = async (demo) => {
    setLoading(true);
    
    // Create mock user for demo
    const mockUser = {
      id: `demo-${demo.role.toLowerCase()}`,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      warehouseId: demo.role === ROLES.STAFF ? 'warehouse-1' : null,
      warehouseName: demo.role === ROLES.STAFF ? 'Main Warehouse' : null
    };
    
    // Set demo token and user data directly
    localStorage.setItem('stockmaster_token', 'demo-token-' + demo.role);
    localStorage.setItem('stockmaster_user', JSON.stringify(mockUser));
    localStorage.setItem('stockmaster_auth', 'true');
    
    // Force page reload to update auth context
    toast.success(`Demo login successful! Welcome as ${demo.name}!`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 300);
    
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
<<<<<<< HEAD
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(`Login successful! Welcome, ${result.user.name}!`);
        // Use window.location for reliable navigation after auth state update
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 300);
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
=======
    // Connect to backend API
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/api/auth/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
      setLoading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          localStorage.setItem('stockmaster_auth', 'true');
          localStorage.setItem('stockmaster_token', data.token);
          localStorage.setItem('stockmaster_user', JSON.stringify(data.user));
          setAuth(true);
          toast.success('Login successful!');
          navigate('/dashboard');
        } else {
          toast.error(data.message || 'Login failed');
        }
      } catch (error) {
        toast.error('Failed to process response');
      }
    };
    
    xhr.onerror = function() {
      setLoading(false);
      toast.error('Network error. Please check if the server is running.');
    };
    
    xhr.send(JSON.stringify({
      email: formData.email,
      password: formData.password
    }));
>>>>>>> 1235704e972f40cdc6f540431150e95a8c2fc8b7
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzMzMyIgb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full -mr-48 -mt-48 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full -ml-48 -mb-48 opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">StockMaster</h1>
              <p className="text-sm text-slate-400">Inventory Management System</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Streamline Your
            <br />
            <span className="text-blue-400">Inventory Operations</span>
          </h2>
          <p className="text-slate-300 text-lg">
            Real-time stock tracking, smart automation, and powerful insights for modern warehouses.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">500+</div>
            <div className="text-sm text-slate-400 mt-1">Products Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">99.9%</div>
            <div className="text-sm text-slate-400 mt-1">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">24/7</div>
            <div className="text-sm text-slate-400 mt-1">Real-time Sync</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white via-blue-50/30 to-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Package className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">StockMaster</span>
            </div>
            <h2 className="text-4xl font-bold text-gradient mb-3">Welcome Back</h2>
            <p className="text-slate-600 text-lg">Sign in to access your inventory dashboard</p>
          </div>

          {/* Demo Credentials Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Quick Demo Login</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3">Click a button below to login as a specific role:</p>
            <div className="grid grid-cols-1 gap-2">
              {demoCredentials.map((demo) => {
                const Icon = demo.icon;
                return (
                  <Button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoLogin(demo)}
                    disabled={loading}
                    className={`w-full ${demo.color} text-white font-semibold text-sm h-10 justify-start gap-2`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{demo.name}</span>
                    <span className="text-xs opacity-90">{demo.description}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-semibold">Or login manually</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 animate-slide-up">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-700 font-bold text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@stockmaster.com"
                data-testid="login-email-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-bold text-sm">Password</Label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors" data-testid="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                data-testid="login-password-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 bg-gradient-to-r from-white to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium transition-all duration-200 hover:shadow-md"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base group shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 rounded-xl"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-semibold mb-1">📋 Demo Credentials:</p>
            <div className="text-xs text-amber-700 space-y-1">
              <div><strong>Admin:</strong> admin@stockmaster.com / admin123</div>
              <div><strong>Manager:</strong> manager@stockmaster.com / manager123</div>
              <div><strong>Staff:</strong> staff@stockmaster.com / staff123</div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors" data-testid="signup-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
