import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, stockAPI } from '../utils/api';

export default function Products() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('CREATE_PRODUCTS');
  const canEdit = hasPermission('EDIT_PRODUCTS');
  const canDelete = hasPermission('DELETE_PRODUCTS');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll();
      const base = res.data || [];
      // Fetch stock totals per product in parallel
      const withTotals = await Promise.all(
        base.map(async (p) => {
          try {
            const stockRes = await stockAPI.getByProduct(p._id);
            const rows = stockRes.data || [];
            const total = rows.reduce((sum, r) => sum + (Number(r.quantity || 0) - Number(r.reserved || 0)), 0);
            return { ...p, stockTotal: total };
          } catch {
            return { ...p, stockTotal: 0 };
          }
        })
      );
      setProducts(withTotals);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        category: product.category || '',
        unit: product.unit || '',
        stock: '',
        location: '',
        minStock: product.reorderLevel ?? ''
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, {
          name: formData.name,
          unit: formData.unit,
          category: formData.category,
          reorderLevel: formData.minStock === '' ? 0 : Number(formData.minStock),
        });
        toast.success('Product updated successfully');
      } else {
        await productAPI.create({
          sku: formData.sku,
          name: formData.name,
          unit: formData.unit,
          category: formData.category,
          reorderLevel: formData.minStock === '' ? 0 : Number(formData.minStock),
          description: '',
        });
        toast.success('Product created successfully');
      }
      setDialogOpen(false);
      await loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      await loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const getStockStatus = (stock, minStock) => {
    const s = Number(stock || 0);
    const m = Number(minStock || 0);
    if (s <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (s < m) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="products-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-down">
        <div>
          <h2 className="text-4xl font-bold text-gradient">Product Management</h2>
          <p className="text-slate-500 mt-2 font-medium">Manage your inventory products and stock levels</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary h-11 hover-lift" onClick={() => handleOpenDialog()} data-testid="create-product-button">
                <Plus className="w-5 h-5 mr-2" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-blue-100/50 bg-gradient-to-br from-white to-blue-50/30 animate-scale-in">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gradient">{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                <DialogDescription className="text-slate-600 font-medium">
                  {editingProduct ? 'Update product information' : 'Add a new product to your inventory'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="font-semibold text-slate-700">SKU / Code *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="STEEL-001"
                      required
                      data-testid="product-sku-input"
                      className="input-modern h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-semibold text-slate-700">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Steel Rods"
                      required
                      data-testid="product-name-input"
                      className="input-modern h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-semibold text-slate-700">Category *</Label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                      <SelectTrigger data-testid="product-category-select" className="input-modern h-11">
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
                    <Label htmlFor="unit" className="font-semibold text-slate-700">Unit of Measure *</Label>
                    <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                      <SelectTrigger data-testid="product-unit-select" className="input-modern h-11">
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
                    <Label htmlFor="stock" className="font-semibold text-slate-700">Initial Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="100"
                      data-testid="product-stock-input"
                      className="input-modern h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock" className="font-semibold text-slate-700">Minimum Stock Level</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      placeholder="20"
                      data-testid="product-minstock-input"
                      className="input-modern h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="font-semibold text-slate-700">Location *</Label>
                  <Select value={formData.location} onValueChange={(val) => setFormData({ ...formData, location: val })}>
                    <SelectTrigger data-testid="product-location-select" className="input-modern h-11">
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
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="product-cancel-button" className="h-11">
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary h-11" data-testid="product-save-button">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card-elevated p-6 border-blue-100/50 animate-slide-up animate-delay-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search products by name, SKU, or category..."
              className="pl-12 h-11 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 font-medium"
              data-testid="products-search-input"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-48 h-11 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-slate-200 font-medium" data-testid="category-filter">
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
      <div className="table-modern animate-slide-up animate-delay-300">
        <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <h3 className="text-xl font-bold text-slate-900">Product Inventory</h3>
          <p className="text-sm text-slate-500 mt-1">{products.length} products in your inventory</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100/50 to-blue-100/30 border-b border-slate-200/50">
              <tr>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Product</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">SKU</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Category</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Stock</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Location</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Status</th>
                <th className="text-right text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No products found</td>
                </tr>
              ) : products.map((product) => {
                const status = getStockStatus(product.stockTotal, product.reorderLevel);
                return (
                  <tr key={product._id} className="hover:bg-blue-50/50 transition-all duration-200 hover-lift" data-testid={`product-row-${product.sku}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center shadow-sm">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="font-semibold text-slate-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded-lg w-fit">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{product.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {product.stockTotal ?? 0} <span className="text-slate-500 font-normal">{product.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">-</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${status.color} border-0 font-semibold`} data-testid={`product-status-${product.sku}`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-all duration-200 hover-lift font-medium"
                            data-testid={`edit-product-${product.sku}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-all duration-200 hover-lift font-medium"
                            data-testid={`delete-product-${product.sku}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-sm text-slate-400">View Only</span>
                        )}
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
