import { useState } from 'react';
import { User, Mail, Briefcase, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('stockmaster_user') || '{}');
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      name: formData.name,
      email: formData.email,
      role: formData.role
    };
    localStorage.setItem('stockmaster_user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password changed successfully');
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl space-y-6" data-testid="profile-page">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        <p className="text-slate-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    data-testid="profile-name-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    data-testid="profile-email-input"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="pl-10"
                  data-testid="profile-role-input"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="save-profile-button">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="••••••••"
                data-testid="current-password-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  data-testid="new-password-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  data-testid="confirm-password-input"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="change-password-button">
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Your usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">24</div>
              <div className="text-sm text-slate-600">Receipts Created</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">18</div>
              <div className="text-sm text-slate-600">Deliveries Processed</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">142</div>
              <div className="text-sm text-slate-600">Products Managed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
