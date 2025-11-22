import { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
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
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { adjustmentAPI, productAPI, warehouseAPI } from '../utils/api';

export default function Adjustments() {
  const { user, hasPermission } = useAuth();
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    previousQty: '',
    countedQty: '',
    reason: ''
  });

  useEffect(() => {
    loadAdjustments();
    loadProducts();
    loadWarehouses();
  }, []);

  const loadAdjustments = async () => {
    try {
      const response = await adjustmentAPI.getAll();
      setAdjustments(response.data);
    } catch (error) {
      toast.error('Failed to load adjustments');
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

  const loadWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
    } catch (error) {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adjustmentAPI.create({
        productId: formData.productId,
        warehouseId: formData.warehouseId || user?.warehouseId,
        previousQty: parseInt(formData.previousQty),
        countedQty: parseInt(formData.countedQty),
        reason: formData.reason,
      });
      toast.success('Stock adjustment recorded');
      setDialogOpen(false);
      setFormData({ productId: '', warehouseId: '', previousQty: '', countedQty: '', reason: '' });
      loadAdjustments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record adjustment');
    }
  };

  return (
    <div className="space-y-8" data-testid="adjustments-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gradient">Inventory Adjustments</h2>
          <p className="text-slate-500 mt-2 font-medium">Fix stock discrepancies from physical counts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg shadow-indigo-500/30 h-11 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 rounded-xl" data-testid="new-adjustment-button">
              <Plus className="w-5 h-5 mr-2" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl border-indigo-100/50 bg-gradient-to-br from-white to-indigo-50/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient">Create Stock Adjustment</DialogTitle>
              <DialogDescription>Record physical count and adjust inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select value={formData.productId || undefined} onValueChange={(val) => setFormData({ ...formData, productId: val })}>
                    <SelectTrigger data-testid="adjustment-product-select">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.warehouseId || undefined} onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}>
                    <SelectTrigger data-testid="adjustment-location-select">
                      <SelectValue placeholder="Select location" />
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recordedQty">Recorded Quantity *</Label>
                  <Input
                    id="recordedQty"
                    type="number"
                    value={formData.previousQty}
                    onChange={(e) => setFormData({ ...formData, previousQty: e.target.value })}
                    placeholder="1200"
                    required
                    data-testid="adjustment-recorded-qty-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countedQty">Counted Quantity *</Label>
                  <Input
                    id="countedQty"
                    type="number"
                    value={formData.countedQty}
                    onChange={(e) => setFormData({ ...formData, countedQty: e.target.value })}
                    placeholder="1197"
                    required
                    data-testid="adjustment-counted-qty-input"
                  />
                </div>
              </div>
              {formData.previousQty && formData.countedQty && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Difference: {parseInt(formData.countedQty) - parseInt(formData.previousQty)} units
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Adjustment *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Damaged items, Missing items, Found in storage..."
                  required
                  rows={3}
                  data-testid="adjustment-reason-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="adjustment-cancel-button">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" data-testid="adjustment-save-button">
                  Record Adjustment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="card-elevated p-6 border-indigo-100/50">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Search by reference, product, or location..."
              className="pl-12 h-11 bg-gradient-to-r from-slate-50 to-indigo-50 border-slate-200 rounded-xl focus:border-indigo-400 font-medium"
              data-testid="adjustments-search-input"
            />
          </div>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="table-modern">
        <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <h3 className="text-xl font-bold text-slate-900">Adjustment History</h3>
          <p className="text-sm text-slate-500 mt-1">{adjustments.length} adjustments recorded</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100/50 to-indigo-100/30 border-b border-slate-200/50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Reference</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Product</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Location</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Recorded</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Counted</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Difference</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {adjustments.map((adj) => (
                <tr key={adj._id} className="hover:bg-slate-50 transition-colors" data-testid={`adjustment-row-${adj.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{adj.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{new Date(adj.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 font-medium">{adj.productId?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{adj.warehouseId?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{adj.previousQty}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{adj.countedQty}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${(adj.countedQty - adj.previousQty) < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} border-0`} data-testid={`adjustment-diff-${adj.ref}`}>
                      {(adj.countedQty - adj.previousQty) > 0 ? '+' : ''}{adj.countedQty - adj.previousQty}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{adj.reason}</div>
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
