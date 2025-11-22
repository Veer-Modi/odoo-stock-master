import { useState, useEffect } from 'react';
import { stockAPI, warehouseAPI } from '../utils/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Stock() {
  const { user, hasPermission } = useAuth();
  const [stock, setStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadStock();
  }, [selectedWarehouse]);

  const loadWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
      // If user is STAFF, set their warehouse
      if (user?.warehouseId && !hasPermission('VIEW_ALL_STOCK')) {
        setSelectedWarehouse(user.warehouseId);
      }
    } catch (error) {
      toast.error('Failed to load warehouses');
    }
  };

  const loadStock = async () => {
    try {
      setLoading(true);
      const response = await stockAPI.getAll(selectedWarehouse || null);
      setStock(response.data);
    } catch (error) {
      toast.error('Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stock Levels</h1>
          <p className="text-slate-600 mt-1">Current inventory across warehouses</p>
        </div>
        {hasPermission('VIEW_ALL_STOCK') && (
          <Select value={selectedWarehouse || 'all'} onValueChange={(v) => setSelectedWarehouse(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w._id} value={w._id}>
                  {w.name} ({w.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No stock found
                  </TableCell>
                </TableRow>
              ) : (
                stock.map((item) => {
                  const isLowStock = item.productId?.reorderLevel && item.available <= item.productId.reorderLevel;
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="font-semibold">{item.productId?.name}</TableCell>
                      <TableCell className="font-mono text-sm">{item.productId?.sku}</TableCell>
                      <TableCell>{item.warehouseId?.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.reserved}</TableCell>
                      <TableCell className="font-semibold">{item.available}</TableCell>
                      <TableCell>
                        {isLowStock && (
                          <span className="flex items-center gap-1 text-orange-600 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            Low Stock
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

