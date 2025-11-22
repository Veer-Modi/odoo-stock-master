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
import { receiptAPI, warehouseAPI, productAPI } from '../utils/api';

export default function Receipts() {
  const { user, hasPermission } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [formData, setFormData] = useState({
    supplier: '',
    date: '',
    warehouseId: '',
    items: [{ productId: '', quantity: '' }]
  });

  useEffect(() => {
    loadReceipts();
    loadWarehouses();
    loadProducts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptAPI.getAll();
      setReceipts(response.data);
    } catch (error) {
      toast.error('Failed to load receipts');
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

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    try {
      const items = formData.items
        .filter(item => item.productId && item.quantity)
        .map(item => ({ productId: item.productId, quantity: parseInt(item.quantity) }));

      await receiptAPI.create({
        supplier: formData.supplier,
        warehouseId: formData.warehouseId || user?.warehouseId,
        items,
      });

      toast.success('Receipt created successfully');
      setDialogOpen(false);
      setFormData({ supplier: '', date: '', warehouseId: '', items: [{ productId: '', quantity: '' }] });
      loadReceipts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create receipt');
    }
  };

  const handleValidate = (receipt) => {
    setReceipts(receipts.map(r => 
      r.id === receipt.id ? { ...r, status: 'Done' } : r
    ));
    toast.success(`Receipt ${receipt.ref} validated. Stock increased!`);
  };

  const addProductRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '' }]
    });
  };

  return (
    <div className="space-y-8" data-testid="receipts-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gradient">Receipts</h2>
          <p className="text-slate-500 mt-2 font-medium">Manage incoming stock from suppliers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/30 h-11 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 rounded-xl" data-testid="new-receipt-button">
              <Plus className="w-5 h-5 mr-2" />
              New Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border-green-100/50 bg-gradient-to-br from-white to-green-50/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient">Create New Receipt</DialogTitle>
              <DialogDescription>Record incoming goods from supplier</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReceipt} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Acme Supplier"
                    required
                    data-testid="receipt-supplier-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Scheduled Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    data-testid="receipt-date-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Destination Warehouse *</Label>
                <Select value={formData.warehouseId || undefined} onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}>
                  <SelectTrigger data-testid="receipt-warehouse-select">
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
                  <Button type="button" variant="outline" size="sm" onClick={addProductRow} data-testid="add-product-row">
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
                      <SelectTrigger data-testid={`product-select-${index}`}>
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
                      data-testid={`product-quantity-${index}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="receipt-cancel-button">
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" data-testid="receipt-save-button">
                  Create Receipt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="card-elevated p-6 border-green-100/50">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            <Input
              placeholder="Search by reference, supplier, or warehouse..."
              className="pl-12 h-11 bg-gradient-to-r from-slate-50 to-green-50 border-slate-200 rounded-xl focus:border-green-400 font-medium"
              data-testid="receipts-search-input"
            />
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="table-modern">
        <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-green-50/30">
          <h3 className="text-xl font-bold text-slate-900">Receipt List</h3>
          <p className="text-sm text-slate-500 mt-1">{receipts.length} receipts total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100/50 to-green-100/30 border-b border-slate-200/50">
              <tr>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Reference</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Date</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Supplier</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Warehouse</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Products</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Status</th>
                <th className="text-right text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.map((receipt) => (
                <tr key={receipt._id} className="hover:bg-green-50/50 transition-colors duration-200" data-testid={`receipt-row-${receipt.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 bg-green-50 px-3 py-1 rounded-lg w-fit">{receipt.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{receipt.supplier}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{receipt.warehouseId?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{receipt.items?.length || 0} items</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(receipt.status)} border-0 font-semibold`} data-testid={`receipt-status-${receipt.ref}`}>
                      {receipt.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {receipt.status === 'Draft' && hasPermission('VALIDATE_RECEIPTS') && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                          onClick={async () => {
                            try {
                              await receiptAPI.validate(receipt._id);
                              toast.success('Receipt validated');
                              loadReceipts();
                            } catch (error) {
                              toast.error(error.response?.data?.message || 'Failed to validate receipt');
                            }
                          }}
                          data-testid={`validate-receipt-${receipt.ref}`}
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
