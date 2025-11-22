import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Login({ setAuth }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock login
    setTimeout(() => {
      localStorage.setItem('stockmaster_auth', 'true');
      localStorage.setItem('stockmaster_user', JSON.stringify({
        name: 'John Manager',
        email: formData.email,
        role: 'Inventory Manager'
      }));
      setAuth(true);
      toast.success('Login successful!');
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzMzNCIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
        
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
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">StockMaster</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Sign in to access your inventory dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@company.com"
                data-testid="login-email-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium" data-testid="forgot-password-link">
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
                required
                className="h-12 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base group"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold" data-testid="signup-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
