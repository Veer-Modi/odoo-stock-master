import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Users as UsersIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI, warehouseAPI, userAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Users() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    warehouseId: ''
  });

  useEffect(() => {
    loadUsers();
    loadWarehouses();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
    } catch (error) {
      // Ignore error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.update(editingUser._id, formData);
        toast.success('User updated successfully');
      } else {
        await authAPI.registerAdmin(formData);
        toast.success('User created successfully');
      }
      setDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STAFF',
      warehouseId: ''
    });
    setEditingUser(null);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 mt-1">Manage system users</p>
        </div>
        {hasPermission('CREATE_USERS') && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'New User'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update user information' : 'Create a new user account'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                )}
                <div>
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'STAFF' && (
                  <div>
                    <Label>Warehouse (Optional)</Label>
                    <Select
                      value={formData.warehouseId}
                      onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No warehouse</SelectItem>
                        {warehouses.map((w) => (
                          <SelectItem key={w._id} value={w._id}>
                            {w.name} ({w.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{user.warehouseId?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {hasPermission('EDIT_USERS') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setFormData({
                                name: user.name,
                                email: user.email,
                                password: '',
                                role: user.role,
                                warehouseId: user.warehouseId?._id || ''
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

