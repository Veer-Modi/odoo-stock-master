import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, sku: 'STEEL-001', name: 'Steel Rods', category: 'Raw Materials', unit: 'kg', stock: 1200, location: 'Main Warehouse', minStock: 500 },
    { id: 2, sku: 'DESK-001', name: 'Office Desk', category: 'Furniture', unit: 'pcs', stock: 45, location: 'Rack A', minStock: 20 },
    { id: 3, sku: 'CHAIR-001', name: 'Office Chair', category: 'Furniture', unit: 'pcs', stock: 12, location: 'Rack A', minStock: 30 },
    { id: 4, sku: 'BOLT-001', name: 'Bolts M10', category: 'Hardware', unit: 'pcs', stock: 5000, location: 'Rack B', minStock: 1000 },
    { id: 5, sku: 'PAINT-001', name: 'White Paint', category: 'Supplies', unit: 'liters', stock: 8, location: 'Storage', minStock: 50 }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    unit: '',
    stock: '',
    location: '',
    minStock: ''
  });

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        sku: '',
        name: '',
        category: '',
        unit: '',
        stock: '',
        location: '',
        minStock: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
      toast.success('Product updated successfully');
    } else {
      setProducts([...products, { ...formData, id: Date.now() }]);
      toast.success('Product created successfully');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (stock < minStock) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-6" data-testid="products-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Management</h2>
          <p className="text-slate-600 mt-1">Manage your inventory products and stock levels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenDialog()} data-testid="create-product-button">
              <Plus className="w-5 h-5 mr-2" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product information' : 'Add a new product to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Code *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="STEEL-001"
                    required
                    data-testid="product-sku-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Steel Rods"
                    required
                    data-testid="product-name-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger data-testid="product-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit of Measure *</Label>
                  <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                    <SelectTrigger data-testid="product-unit-select">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    data-testid="product-stock-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock Level</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="20"
                    data-testid="product-minstock-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location} onValueChange={(val) => setFormData({ ...formData, location: val })}>
                  <SelectTrigger data-testid="product-location-select">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                    <SelectItem value="Rack A">Rack A</SelectItem>
                    <SelectItem value="Rack B">Rack B</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                    <SelectItem value="Production Floor">Production Floor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="product-cancel-button">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="product-save-button">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search products by name, SKU, or category..."
              className="pl-10 h-11 bg-slate-50 border-slate-200"
              data-testid="products-search-input"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-48 h-11 bg-slate-50" data-testid="category-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="raw">Raw Materials</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Product</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">SKU</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Category</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Stock</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Location</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => {
                const status = getStockStatus(product.stock, product.minStock);
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors" data-testid={`product-row-${product.sku}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="font-medium text-slate-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 font-mono">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{product.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {product.stock} {product.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{product.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${status.color} border-0`} data-testid={`product-status-${product.sku}`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          data-testid={`edit-product-${product.sku}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`delete-product-${product.sku}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
