import { 
  Package, 
  AlertTriangle, 
  TruckIcon, 
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { productAPI, stockAPI, receiptAPI, deliveryAPI, transferAPI, adjustmentAPI } from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const isWarehouseStaff = user?.role === ROLES.STAFF;
  const isManager = user?.role === ROLES.MANAGER;
  const isAdmin = user?.role === ROLES.ADMIN;

  const [kpis, setKpis] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, recRes, delRes, trfRes, adjRes] = await Promise.all([
          productAPI.getAll(),
          receiptAPI.getAll(),
          deliveryAPI.getAll(),
          transferAPI.getAll(),
          adjustmentAPI.getAll(),
        ]);

        const products = prodRes.data || [];
        const receipts = recRes.data || [];
        const deliveries = delRes.data || [];
        const transfers = trfRes.data || [];
        const adjustments = adjRes.data || [];

        // Low stock count by aggregating stock per product
        const stockTotals = await Promise.all(
          products.map(async (p) => {
            try {
              const s = await stockAPI.getByProduct(p._id);
              const rows = s.data || [];
              const total = rows.reduce((sum, r) => sum + (Number(r.quantity || 0) - Number(r.reserved || 0)), 0);
              return { id: p._id, total, reorderLevel: Number(p.reorderLevel || 0) };
            } catch {
              return { id: p._id, total: 0, reorderLevel: Number(p.reorderLevel || 0) };
            }
          })
        );
        const lowStock = stockTotals.filter(x => x.reorderLevel > 0 && x.total < x.reorderLevel).length;

        const pendingReceipts = receipts.filter(r => (r.status || '').toLowerCase() !== 'done').length;
        const pendingDeliveries = deliveries.filter(d => (d.status || '').toLowerCase() !== 'done').length;
        const pendingTransfers = transfers.filter(t => (t.status || '').toLowerCase() !== 'received' && (t.status || '').toLowerCase() !== 'done').length;

        const newKpis = [
          { label: 'Total Products', value: String(products.length), change: '', icon: Package, color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700', gradient: 'from-blue-50 to-blue-100', trend: true },
          { label: 'Low Stock Items', value: String(lowStock), change: '', icon: AlertTriangle, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700', gradient: 'from-amber-50 to-amber-100', trend: false },
          { label: 'Pending Receipts', value: String(pendingReceipts), change: '', icon: ArrowDownToLine, color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700', gradient: 'from-green-50 to-green-100', trend: true },
          { label: 'Pending Deliveries', value: String(pendingDeliveries), change: '', icon: ArrowUpFromLine, color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700', gradient: 'from-purple-50 to-purple-100', trend: true },
          { label: 'Internal Transfers', value: String(pendingTransfers), change: 'Scheduled', icon: TruckIcon, color: 'bg-indigo-500', bgLight: 'bg-indigo-50', textColor: 'text-indigo-700', gradient: 'from-indigo-50 to-indigo-100', trend: false },
          { label: 'Stock Value', value: '—', change: '', icon: TrendingUp, color: 'bg-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', gradient: 'from-emerald-50 to-emerald-100', trend: true },
        ];
        setKpis(newKpis);

        // Build recent activities list
        const mapActivity = (type, item) => ({
          id: item._id,
          type,
          ref: (item.reference || item.code || item._id || '').toString().slice(-6).toUpperCase(),
          status: item.status || '—',
          date: item.updatedAt || item.createdAt || new Date().toISOString(),
          contact: item.contact || item.partner || item.customer || item.supplier || ''
        });

        const activities = [
          ...receipts.slice(0, 10).map(x => mapActivity('Receipt', x)),
          ...deliveries.slice(0, 10).map(x => mapActivity('Delivery', x)),
          ...transfers.slice(0, 10).map(x => mapActivity('Transfer', x)),
          ...adjustments.slice(0, 10).map(x => mapActivity('Adjustment', x)),
        ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)
          .map(a => ({ ...a, date: new Date(a.date).toLocaleDateString() }));

        setRecentActivities(activities);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Ready': 'bg-green-100 text-green-700',
      'Done': 'bg-blue-100 text-blue-700',
      'Waiting': 'bg-amber-100 text-amber-700',
      'Canceled': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  // Filter KPIs based on role
  const filteredKPIs = isWarehouseStaff 
    ? kpis.filter(kpi => ['Total Products', 'Low Stock Items', 'Pending Receipts', 'Pending Deliveries'].includes(kpi.label))
    : kpis;

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard-page">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-blue-100">
          {isAdmin && 'Full system access - Manage all operations'}
          {isManager && 'Inventory management - Oversee operations and validations'}
          {isWarehouseStaff && `Warehouse operations - ${user?.warehouseName || 'Your warehouse'}`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change.includes('+') || kpi.change === 'Scheduled';
          const isNegative = kpi.change.includes('-');
          
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 p-6 cursor-pointer hover-lift animate-slide-up ${
                kpi.gradient.includes('blue') ? 'from-blue-50 to-blue-100' :
                kpi.gradient.includes('amber') ? 'from-amber-50 to-amber-100' :
                kpi.gradient.includes('green') ? 'from-green-50 to-green-100' :
                kpi.gradient.includes('purple') ? 'from-purple-50 to-purple-100' :
                kpi.gradient.includes('indigo') ? 'from-indigo-50 to-indigo-100' :
                'from-emerald-50 to-emerald-100'
              } bg-gradient-to-br border-slate-100/80 bg-white`}
              data-testid={`kpi-card-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/0 to-white/20 rounded-full -mr-16 -mt-16 group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3.5 rounded-xl shadow-md group-hover:scale-110 transition-all duration-300 ${kpi.bgLight} border border-white/50`}>
                    <Icon className={`w-6 h-6 ${kpi.textColor}`} />
                  </div>
                  <div className={`text-xs font-bold px-3 py-2 rounded-full transition-all duration-300 flex items-center gap-1 ${
                    isPositive ? 'bg-green-100 text-green-700' :
                    isNegative ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <span className={isNegative ? '' : isPositive ? '↗️' : '📅'}></span>
                    {kpi.change}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{kpi.value}</div>
                  <div className="text-sm font-semibold text-slate-600">{kpi.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="card-elevated p-6 border-blue-100/50 animate-slide-up animate-delay-300">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search by reference, contact, or product..."
              className="pl-12 h-11 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 rounded-xl focus:border-blue-400 font-medium"
              data-testid="dashboard-search-input"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-48 h-11 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-slate-200 font-medium" data-testid="filter-type">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operations</SelectItem>
              <SelectItem value="receipts">Receipts</SelectItem>
              <SelectItem value="deliveries">Deliveries</SelectItem>
              <SelectItem value="transfers">Transfers</SelectItem>
              <SelectItem value="adjustments">Adjustments</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-full md:w-40 h-11 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-slate-200 font-medium" data-testid="filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="table-modern animate-slide-up animate-delay-400">
        <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <h2 className="text-2xl font-bold text-gradient">Recent Activities</h2>
          <p className="text-sm text-slate-500 mt-1">Latest stock operations and movements</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100/50 to-blue-100/30 border-b border-slate-200/50">
              <tr>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Reference</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Type</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Contact</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Date</th>
                <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Status</th>
                <th className="text-right text-xs font-bold text-slate-700 uppercase tracking-widest px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading recent activities...</td>
                </tr>
              ) : recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No recent activities</td>
                </tr>
              ) : recentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-blue-50/50 transition-colors duration-200" data-testid={`activity-row-${activity.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{activity.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{activity.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{activity.contact || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500">{activity.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(activity.status)} border-0 font-semibold`} data-testid={`status-${activity.ref}`}>
                      {activity.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 font-medium transition-colors" data-testid={`view-${activity.ref}`}>
                      View
                    </Button>
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
