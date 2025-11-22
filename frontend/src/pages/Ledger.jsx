import { useState, useEffect } from 'react';
import { ledgerAPI, productAPI, warehouseAPI } from '../utils/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { FileText, TrendingUp, TrendingDown } from 'lucide-react';

export default function Ledger() {
  const [ledger, setLedger] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filters, setFilters] = useState({
    productId: '',
    warehouseId: '',
    type: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLedger();
    loadProducts();
    loadWarehouses();
  }, [filters]);

  const loadLedger = async () => {
    try {
      const params = {};
      if (filters.productId) params.productId = filters.productId;
      if (filters.warehouseId) params.warehouseId = filters.warehouseId;
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await ledgerAPI.getAll(params);
      setLedger(response.data);
    } catch (error) {
      toast.error('Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      // Ignore error
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
    } catch (error) {
      // Ignore error
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'receipt':
        return 'text-green-600 bg-green-50';
      case 'delivery':
        return 'text-red-600 bg-red-50';
      case 'transfer':
        return 'text-blue-600 bg-blue-50';
      case 'adjustment':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Stock Ledger</h1>
        <p className="text-slate-600 mt-1">Complete transaction history</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label>Product</Label>
            <Select
              value={filters.productId || 'all'}
              onValueChange={(value) => setFilters({ ...filters, productId: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Warehouse</Label>
            <Select
              value={filters.warehouseId || 'all'}
              onValueChange={(value) => setFilters({ ...filters, warehouseId: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w._id} value={w._id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                    No ledger entries found
                  </TableCell>
                </TableRow>
              ) : (
                ledger.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(entry.type)}`}>
                        {entry.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">{entry.refNumber}</TableCell>
                    <TableCell>{entry.productId?.name}</TableCell>
                    <TableCell>{entry.warehouseId?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {entry.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={entry.change > 0 ? 'text-green-600' : 'text-red-600'}>
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{entry.quantityBefore}</TableCell>
                    <TableCell className="font-semibold">{entry.quantityAfter}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

