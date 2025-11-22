import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { deliveryAPI, warehouseAPI, productAPI } from '../utils/api';

export default function Deliveries() {
  const { user, hasPermission } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    date: '',
    warehouseId: '',
    items: [{ productId: '', quantity: '' }]
  });

  useEffect(() => {
    loadDeliveries();
    loadWarehouses();
    loadProducts();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getAll();
      setDeliveries(response.data);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
    } catch (error) {
      // ignore
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      // ignore
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Ready': 'bg-green-100 text-green-700',
      'Done': 'bg-blue-100 text-blue-700',
      'Waiting': 'bg-amber-100 text-amber-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    try {
      const items = formData.items
        .filter(item => item.productId && item.quantity)
        .map(item => ({ productId: item.productId, quantity: parseInt(item.quantity) }));

      await deliveryAPI.create({
        customer: formData.customer,
        warehouseId: formData.warehouseId || user?.warehouseId,
        items,
      });

      toast.success('Delivery order created successfully');
      setDialogOpen(false);
      setFormData({ customer: '', date: '', warehouseId: '', items: [{ productId: '', quantity: '' }] });
      loadDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create delivery');
    }
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
      items: [...formData.items, { productId: '', quantity: '' }]
    });
  };

  return (
    <div className="space-y-8" data-testid="deliveries-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gradient">Deliveries</h2>
          <p className="text-slate-500 mt-2 font-medium">Manage outgoing stock to customers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg shadow-purple-500/30 h-11 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 rounded-xl" data-testid="new-delivery-button">
              <Plus className="w-5 h-5 mr-2" />
              New Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border-purple-100/50 bg-gradient-to-br from-white to-purple-50/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient">Create New Delivery</DialogTitle>
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
                <Select value={formData.warehouseId || undefined} onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}>
                  <SelectTrigger data-testid="delivery-warehouse-select">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w._id} value={w._id}>
                        {w.name} ({w.code})
                      </SelectItem>
                    ))}
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
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <Select
                      value={item.productId || undefined}
                      onValueChange={(val) => {
                        const newItems = [...formData.items];
                        newItems[index].productId = val;
                        setFormData({ ...formData, items: newItems });
                      }}
                    >
                      <SelectTrigger data-testid={`delivery-product-select-${index}`}>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.name} ({p.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].quantity = e.target.value;
                        setFormData({ ...formData, items: newItems });
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
      <div className="card-elevated p-6 border-purple-100/50">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <Input
              placeholder="Search by reference, customer, or warehouse..."
              className="pl-12 h-11 bg-gradient-to-r from-slate-50 to-purple-50 border-slate-200 rounded-xl focus:border-purple-400 font-medium"
              data-testid="deliveries-search-input"
            />
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="table-modern">
        <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-purple-50/30">
          <h3 className="text-xl font-bold text-slate-900">Delivery Orders</h3>
          <p className="text-sm text-slate-500 mt-1">{deliveries.length} deliveries total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100/50 to-purple-100/30 border-b border-slate-200/50">
              <tr>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Reference</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Date</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Customer</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Warehouse</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Products</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Status</th>
                <th className="text-right text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.map((delivery) => (
                <tr key={delivery._id} className="hover:bg-purple-50/50 transition-colors duration-200" data-testid={`delivery-row-${delivery.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 bg-purple-50 px-3 py-1 rounded-lg w-fit">{delivery.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{delivery.customer}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{delivery.warehouseId?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{delivery.items?.length || 0} items</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(delivery.status)} border-0 font-semibold`} data-testid={`delivery-status-${delivery.ref}`}>
                      {delivery.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {delivery.status === 'Packed' && hasPermission('VALIDATE_DELIVERIES') && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                          onClick={async () => {
                            try {
                              await deliveryAPI.validate(delivery._id);
                              toast.success('Delivery validated');
                              loadDeliveries();
                            } catch (error) {
                              toast.error(error.response?.data?.message || 'Failed to validate delivery');
                            }
                          }}
                          data-testid={`validate-delivery-${delivery.ref}`}
                        >
                          Validate
                        </Button>
                      )}
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
