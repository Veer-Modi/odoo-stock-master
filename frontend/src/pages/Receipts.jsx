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

export default function Receipts() {
  const [receipts, setReceipts] = useState([
    { id: 1, ref: 'WH/IN/0001', date: '12/24/2025', supplier: 'Acme Supplier', warehouse: 'Main Warehouse', status: 'Ready', products: 3 },
    { id: 2, ref: 'WH/IN/0002', date: '12/23/2025', supplier: 'Steel Works', warehouse: 'Main Warehouse', status: 'Draft', products: 1 },
    { id: 3, ref: 'WH/IN/0003', date: '12/22/2025', supplier: 'Hardware Inc', warehouse: 'Rack B', status: 'Done', products: 5 },
    { id: 4, ref: 'WH/IN/0004', date: '12/21/2025', supplier: 'Paint Co', warehouse: 'Storage', status: 'Ready', products: 2 }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [formData, setFormData] = useState({
    supplier: '',
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

  const handleCreateReceipt = (e) => {
    e.preventDefault();
    const newReceipt = {
      id: Date.now(),
      ref: `WH/IN/${String(receipts.length + 1).padStart(4, '0')}`,
      date: formData.date,
      supplier: formData.supplier,
      warehouse: formData.warehouse,
      status: 'Draft',
      products: formData.products.length
    };
    setReceipts([newReceipt, ...receipts]);
    toast.success('Receipt created successfully');
    setDialogOpen(false);
    setFormData({ supplier: '', warehouse: '', date: '', products: [{ product: '', quantity: '' }] });
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
      products: [...formData.products, { product: '', quantity: '' }]
    });
  };

  return (
    <div className="space-y-6" data-testid="receipts-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Receipts</h2>
          <p className="text-slate-600 mt-1">Manage incoming stock from suppliers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700" data-testid="new-receipt-button">
              <Plus className="w-5 h-5 mr-2" />
              New Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Receipt</DialogTitle>
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
                <Select value={formData.warehouse} onValueChange={(val) => setFormData({ ...formData, warehouse: val })}>
                  <SelectTrigger data-testid="receipt-warehouse-select">
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
                  <Button type="button" variant="outline" size="sm" onClick={addProductRow} data-testid="add-product-row">
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
                      <SelectTrigger data-testid={`product-select-${index}`}>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STEEL-001">Steel Rods</SelectItem>
                        <SelectItem value="DESK-001">Office Desk</SelectItem>
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
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by reference, supplier, or warehouse..."
              className="pl-10 h-11 bg-slate-50 border-slate-200"
              data-testid="receipts-search-input"
            />
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Reference</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Supplier</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Warehouse</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Products</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-slate-50 transition-colors" data-testid={`receipt-row-${receipt.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{receipt.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {receipt.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{receipt.supplier}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{receipt.warehouse}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{receipt.products} items</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(receipt.status)} border-0`} data-testid={`receipt-status-${receipt.ref}`}>
                      {receipt.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {receipt.status === 'Ready' && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleValidate(receipt)}
                          data-testid={`validate-receipt-${receipt.ref}`}
                        >
                          Validate
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900" data-testid={`view-receipt-${receipt.ref}`}>
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
