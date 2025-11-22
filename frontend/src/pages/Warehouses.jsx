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
import { Warehouse, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { warehouseAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Warehouses() {
  const { hasPermission } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    capacity: ''
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
    } catch (error) {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await warehouseAPI.update(editingWarehouse._id, formData);
        toast.success('Warehouse updated successfully');
      } else {
        await warehouseAPI.create(formData);
        toast.success('Warehouse created successfully');
      }
      setDialogOpen(false);
      resetForm();
      loadWarehouses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
      capacity: warehouse.capacity || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    
    try {
      await warehouseAPI.delete(id);
      toast.success('Warehouse deleted successfully');
      loadWarehouses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete warehouse');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', address: '', capacity: '' });
    setEditingWarehouse(null);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Warehouses</h1>
          <p className="text-slate-600 mt-1">Manage warehouse locations</p>
        </div>
        {hasPermission('CREATE_WAREHOUSES') && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'New Warehouse'}</DialogTitle>
                <DialogDescription>
                  {editingWarehouse ? 'Update warehouse information' : 'Create a new warehouse location'}
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
                  <Label>Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    disabled={!!editingWarehouse}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Capacity (Optional)</Label>
                  <Input
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No warehouses found
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map((warehouse) => (
                  <TableRow key={warehouse._id}>
                    <TableCell className="font-mono font-semibold">{warehouse.code}</TableCell>
                    <TableCell>{warehouse.name}</TableCell>
                    <TableCell>{warehouse.address}</TableCell>
                    <TableCell>{warehouse.capacity || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {hasPermission('EDIT_WAREHOUSES') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(warehouse)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {hasPermission('EDIT_WAREHOUSES') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(warehouse._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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

