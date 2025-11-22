import { useState } from 'react';
import { Plus, Search, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([
    { id: 1, ref: 'WH/OUT/0001', date: '12/24/2025', customer: 'John Corp', warehouse: 'Main Warehouse', status: 'Ready', products: 2 },
    { id: 2, ref: 'WH/OUT/0002', date: '12/23/2025', customer: 'BuildCo', warehouse: 'Rack A', status: 'Ready', products: 3 },
    { id: 3, ref: 'WH/OUT/0003', date: '12/22/2025', customer: 'TechStart Inc', warehouse: 'Main Warehouse', status: 'Done', products: 1 },
    { id: 4, ref: 'WH/OUT/0004', date: '12/21/2025', customer: 'Global Solutions', warehouse: 'Storage', status: 'Draft', products: 4 }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    warehouse: '',
    date: '',
    products: [{ product: '', quantity: '' }]
  });

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Ready': 'bg-green-100 text-green-700',
      'Done': 'bg-blue-100 text-blue-700',
      'Waiting': 'bg-amber-100 text-amber-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const handleCreateDelivery = (e) => {
    e.preventDefault();
    const newDelivery = {
      id: Date.now(),
      ref: `WH/OUT/${String(deliveries.length + 1).padStart(4, '0')}`,
      date: formData.date,
      customer: formData.customer,
      warehouse: formData.warehouse,
      status: 'Draft',
      products: formData.products.length
    };
    setDeliveries([newDelivery, ...deliveries]);
    toast.success('Delivery order created successfully');
    setDialogOpen(false);
    setFormData({ customer: '', warehouse: '', date: '', products: [{ product: '', quantity: '' }] });
  };

  const handleValidate = (delivery) => {
    setDeliveries(deliveries.map(d => 
      d.id === delivery.id ? { ...d, status: 'Done' } : d
    ));
    toast.success(`Delivery ${delivery.ref} validated. Stock decreased!`);
  };

  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { product: '', quantity: '' }]
    });
  };

  return (
    <div className="space-y-6" data-testid="deliveries-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Deliveries</h2>
          <p className="text-slate-600 mt-1">Manage outgoing stock to customers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700" data-testid="new-delivery-button">
              <Plus className="w-5 h-5 mr-2" />
              New Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Delivery</DialogTitle>
              <DialogDescription>Record outgoing goods to customer</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDelivery} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Input
                    id="customer"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="John Corp"
                    required
                    data-testid="delivery-customer-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Delivery Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    data-testid="delivery-date-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Source Warehouse *</Label>
                <Select value={formData.warehouse} onValueChange={(val) => setFormData({ ...formData, warehouse: val })}>
                  <SelectTrigger data-testid="delivery-warehouse-select">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                    <SelectItem value="Rack A">Rack A</SelectItem>
                    <SelectItem value="Rack B">Rack B</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Products</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addProductRow} data-testid="add-delivery-product-row">
                    <Plus className="w-4 h-4 mr-1" /> Add Product
                  </Button>
                </div>
                {formData.products.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <Select
                      value={item.product}
                      onValueChange={(val) => {
                        const newProducts = [...formData.products];
                        newProducts[index].product = val;
                        setFormData({ ...formData, products: newProducts });
                      }}
                    >
                      <SelectTrigger data-testid={`delivery-product-select-${index}`}>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DESK-001">Office Desk</SelectItem>
                        <SelectItem value="CHAIR-001">Office Chair</SelectItem>
                        <SelectItem value="BOLT-001">Bolts M10</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => {
                        const newProducts = [...formData.products];
                        newProducts[index].quantity = e.target.value;
                        setFormData({ ...formData, products: newProducts });
                      }}
                      data-testid={`delivery-product-quantity-${index}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="delivery-cancel-button">
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" data-testid="delivery-save-button">
                  Create Delivery
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by reference, customer, or warehouse..."
              className="pl-10 h-11 bg-slate-50 border-slate-200"
              data-testid="deliveries-search-input"
            />
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Reference</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Customer</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Warehouse</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Products</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-slate-50 transition-colors" data-testid={`delivery-row-${delivery.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{delivery.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {delivery.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{delivery.customer}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{delivery.warehouse}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{delivery.products} items</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(delivery.status)} border-0`} data-testid={`delivery-status-${delivery.ref}`}>
                      {delivery.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {delivery.status === 'Ready' && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleValidate(delivery)}
                          data-testid={`validate-delivery-${delivery.ref}`}
                        >
                          Validate
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" data-testid={`view-delivery-${delivery.ref}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
