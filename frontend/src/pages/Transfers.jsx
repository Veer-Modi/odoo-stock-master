import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { transferAPI, warehouseAPI, productAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { TruckIcon, Plus, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function Transfers() {
  const { user, hasPermission } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromWarehouse: '',
    toWarehouse: '',
    items: [{ productId: '', quantity: '' }]
  });

  useEffect(() => {
    loadTransfers();
    loadWarehouses();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const loadTransfers = async () => {
    try {
      const response = await transferAPI.getAll();
      setTransfers(response.data);
    } catch (error) {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      setWarehouses(response.data);
    } catch (error) {
      toast.error('Failed to load warehouses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const items = formData.items
        .filter(item => item.productId && item.quantity)
        .map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity)
        }));

      await transferAPI.create({
        fromWarehouse: formData.fromWarehouse,
        toWarehouse: formData.toWarehouse,
        items
      });
      
      toast.success('Transfer created successfully');
      setDialogOpen(false);
      setFormData({
        fromWarehouse: '',
        toWarehouse: '',
        items: [{ productId: '', quantity: '' }]
      });
      loadTransfers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create transfer');
    }
  };

  const handleDispatch = async (id) => {
    try {
      await transferAPI.dispatch(id);
      toast.success('Transfer dispatched successfully');
      loadTransfers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch transfer');
    }
  };

  const handleReceive = async (id) => {
    try {
      await transferAPI.receive(id);
      toast.success('Transfer received successfully');
      loadTransfers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to receive transfer');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '' }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transfers</h1>
          <p className="text-slate-600 mt-1">Inter-warehouse stock transfers</p>
        </div>
        {hasPermission('CREATE_TRANSFERS') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Transfer</DialogTitle>
                <DialogDescription>Create a new inter-warehouse transfer</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From Warehouse</Label>
                    <Select
                      value={formData.fromWarehouse}
                      onValueChange={(value) => setFormData({ ...formData, fromWarehouse: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh._id} value={wh._id}>
                            {wh.name} ({wh.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>To Warehouse</Label>
                    <Select
                      value={formData.toWarehouse}
                      onValueChange={(value) => setFormData({ ...formData, toWarehouse: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh._id} value={wh._id}>
                            {wh.name} ({wh.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Items</Label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Select
                        value={item.productId}
                        onValueChange={(value) => {
                          const newItems = [...formData.items];
                          newItems[index].productId = value;
                          setFormData({ ...formData, items: newItems });
                        }}
                      >
                        <SelectTrigger className="flex-1">
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
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].quantity = e.target.value;
                          setFormData({ ...formData, items: newItems });
                        }}
                        className="w-24"
                      />
                      {formData.items.length > 1 && (
                        <Button type="button" variant="ghost" onClick={() => removeItem(index)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addItem} className="mt-2">
                    Add Item
                  </Button>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Transfer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer._id}>
                    <TableCell className="font-mono">{transfer.ref}</TableCell>
                    <TableCell>{transfer.fromWarehouse?.name}</TableCell>
                    <TableCell>{transfer.toWarehouse?.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        transfer.status === 'Received' ? 'bg-green-100 text-green-800' :
                        transfer.status === 'Dispatched' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transfer.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {transfer.status === 'Draft' && hasPermission('DISPATCH_TRANSFERS') && (
                          <Button size="sm" onClick={() => handleDispatch(transfer._id)}>
                            Dispatch
                          </Button>
                        )}
                        {transfer.status === 'Dispatched' && hasPermission('RECEIVE_TRANSFERS') && (
                          <Button size="sm" onClick={() => handleReceive(transfer._id)}>
                            Receive
                          </Button>
                        )}
                      </div>
                    </TableCell>
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

