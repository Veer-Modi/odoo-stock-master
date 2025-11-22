import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, ArrowLeft, Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock OTP send
    setTimeout(() => {
      setOtpSent(true);
      toast.success('OTP sent to your email! (Mock: 123456)');
      setLoading(false);
    }, 800);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock password reset
    setTimeout(() => {
      setResetComplete(true);
      toast.success('Password reset successful!');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">StockMaster</span>
          </div>

          {!resetComplete ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {otpSent ? 'Verify OTP' : 'Forgot Password?'}
              </h2>
              <p className="text-slate-600 mb-6">
                {otpSent 
                  ? 'Enter the OTP sent to your email and set a new password'
                  : 'Enter your email address and we\'ll send you an OTP to reset your password'
                }
              </p>

              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="manager@company.com"
                      data-testid="forgot-password-email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-slate-50 border-slate-200"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={loading}
                    data-testid="send-otp-button"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                    <Mail className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-slate-700 font-medium">OTP Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      data-testid="otp-input"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="h-12 bg-slate-50 border-slate-200 text-center text-2xl tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-700 font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      data-testid="new-password-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-12 bg-slate-50 border-slate-200"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={loading}
                    data-testid="reset-password-button"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Complete</h2>
              <p className="text-slate-600 mb-6">Your password has been successfully reset</p>
              <Link to="/login">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium" data-testid="back-to-login-button">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {!resetComplete && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2" data-testid="back-to-login-link">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
