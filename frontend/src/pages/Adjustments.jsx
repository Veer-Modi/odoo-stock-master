import { useState } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([
    { id: 1, ref: 'ADJ/0001', date: '12/24/2025', product: 'Steel Rods', location: 'Main Warehouse', recorded: 1200, counted: 1197, difference: -3, reason: 'Damaged items' },
    { id: 2, ref: 'ADJ/0002', date: '12/23/2025', product: 'Office Chair', location: 'Rack A', recorded: 12, counted: 15, difference: +3, reason: 'Found in storage' },
    { id: 3, ref: 'ADJ/0003', date: '12/22/2025', product: 'Bolts M10', location: 'Rack B', recorded: 5000, counted: 4998, difference: -2, reason: 'Missing items' }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    location: '',
    recordedQty: '',
    countedQty: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const difference = parseInt(formData.countedQty) - parseInt(formData.recordedQty);
    const newAdjustment = {
      id: Date.now(),
      ref: `ADJ/${String(adjustments.length + 1).padStart(4, '0')}`,
      date: new Date().toLocaleDateString('en-US'),
      product: formData.product,
      location: formData.location,
      recorded: parseInt(formData.recordedQty),
      counted: parseInt(formData.countedQty),
      difference,
      reason: formData.reason
    };
    setAdjustments([newAdjustment, ...adjustments]);
    toast.success('Stock adjustment recorded');
    setDialogOpen(false);
    setFormData({ product: '', location: '', recordedQty: '', countedQty: '', reason: '' });
  };

  return (
    <div className="space-y-6" data-testid="adjustments-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Adjustments</h2>
          <p className="text-slate-600 mt-1">Fix stock discrepancies from physical counts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="new-adjustment-button">
              <Plus className="w-5 h-5 mr-2" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Adjustment</DialogTitle>
              <DialogDescription>Record physical count and adjust inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select value={formData.product} onValueChange={(val) => setFormData({ ...formData, product: val })}>
                    <SelectTrigger data-testid="adjustment-product-select">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Steel Rods">Steel Rods</SelectItem>
                      <SelectItem value="Office Desk">Office Desk</SelectItem>
                      <SelectItem value="Office Chair">Office Chair</SelectItem>
                      <SelectItem value="Bolts M10">Bolts M10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(val) => setFormData({ ...formData, location: val })}>
                    <SelectTrigger data-testid="adjustment-location-select">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                      <SelectItem value="Rack A">Rack A</SelectItem>
                      <SelectItem value="Rack B">Rack B</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
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
                    value={formData.recordedQty}
                    onChange={(e) => setFormData({ ...formData, recordedQty: e.target.value })}
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
              {formData.recordedQty && formData.countedQty && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Difference: {parseInt(formData.countedQty) - parseInt(formData.recordedQty)} units
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
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by reference, product, or location..."
              className="pl-10 h-11 bg-slate-50 border-slate-200"
              data-testid="adjustments-search-input"
            />
          </div>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
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
                <tr key={adj.id} className="hover:bg-slate-50 transition-colors" data-testid={`adjustment-row-${adj.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{adj.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{adj.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 font-medium">{adj.product}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{adj.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{adj.recorded}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{adj.counted}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${adj.difference < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} border-0`} data-testid={`adjustment-diff-${adj.ref}`}>
                      {adj.difference > 0 ? '+' : ''}{adj.difference}
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
