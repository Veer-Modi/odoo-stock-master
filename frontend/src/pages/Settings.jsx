import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function Settings() {
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: 'Main Warehouse', code: 'WH-MAIN', address: '123 Industrial Ave, City, State 12345', capacity: '10,000 sqft' },
    { id: 2, name: 'Rack A', code: 'WH-RACK-A', address: '123 Industrial Ave, Section A, City', capacity: '2,500 sqft' },
    { id: 3, name: 'Rack B', code: 'WH-RACK-B', address: '123 Industrial Ave, Section B, City', capacity: '2,500 sqft' },
    { id: 4, name: 'Storage', code: 'WH-STOR', address: '456 Storage Lane, City, State 12345', capacity: '5,000 sqft' },
    { id: 5, name: 'Production Floor', code: 'WH-PROD', address: '789 Manufacturing Rd, City, State 12345', capacity: '15,000 sqft' }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    capacity: ''
  });

  const handleOpenDialog = (warehouse = null) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData(warehouse);
    } else {
      setEditingWarehouse(null);
      setFormData({ name: '', code: '', address: '', capacity: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingWarehouse) {
      setWarehouses(warehouses.map(w => w.id === editingWarehouse.id ? { ...formData, id: w.id } : w));
      toast.success('Warehouse updated successfully');
    } else {
      setWarehouses([...warehouses, { ...formData, id: Date.now() }]);
      toast.success('Warehouse created successfully');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
    toast.success('Warehouse deleted');
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Warehouse Settings</h2>
          <p className="text-slate-600 mt-1">Manage your warehouse locations and configurations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenDialog()} data-testid="create-warehouse-button">
              <Plus className="w-5 h-5 mr-2" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
              <DialogDescription>
                {editingWarehouse ? 'Update warehouse information' : 'Create a new warehouse location'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Main Warehouse"
                    required
                    data-testid="warehouse-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Warehouse Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="WH-MAIN"
                    required
                    data-testid="warehouse-code-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Industrial Ave, City, State 12345"
                  required
                  rows={3}
                  data-testid="warehouse-address-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="10,000 sqft"
                  data-testid="warehouse-capacity-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="warehouse-cancel-button">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="warehouse-save-button">
                  {editingWarehouse ? 'Update Warehouse' : 'Add Warehouse'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div
            key={warehouse.id}
            className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all group"
            data-testid={`warehouse-card-${warehouse.code}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{warehouse.name}</h3>
                  <p className="text-sm text-slate-500 font-mono">{warehouse.code}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Address</div>
                <div className="text-sm text-slate-700">{warehouse.address}</div>
              </div>
              {warehouse.capacity && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Capacity</div>
                  <div className="text-sm font-medium text-slate-900">{warehouse.capacity}</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => handleOpenDialog(warehouse)}
                data-testid={`edit-warehouse-${warehouse.code}`}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(warehouse.id)}
                data-testid={`delete-warehouse-${warehouse.code}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
