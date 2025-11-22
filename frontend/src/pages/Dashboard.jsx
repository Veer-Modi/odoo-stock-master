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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const kpis = [
    {
      label: 'Total Products',
      value: '1,248',
      change: '+12%',
      icon: Package,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Low Stock Items',
      value: '23',
      change: '-5%',
      icon: AlertTriangle,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      label: 'Pending Receipts',
      value: '8',
      change: '+2',
      icon: ArrowDownToLine,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Pending Deliveries',
      value: '15',
      change: '+4',
      icon: ArrowUpFromLine,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      label: 'Internal Transfers',
      value: '12',
      change: 'Scheduled',
      icon: TruckIcon,
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      label: 'Stock Value',
      value: '$324K',
      change: '+8%',
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'Receipt', ref: 'WH/IN/0001', status: 'Ready', date: '12/24/2025', contact: 'Acme Supplier' },
    { id: 2, type: 'Delivery', ref: 'WH/OUT/0001', status: 'Ready', date: '12/24/2025', contact: 'John Corp' },
    { id: 3, type: 'Receipt', ref: 'WH/IN/0002', status: 'Draft', date: '12/23/2025', contact: 'Steel Works' },
    { id: 4, type: 'Transfer', ref: 'WH/INT/0001', status: 'Done', date: '12/23/2025', contact: 'Main → Rack A' },
    { id: 5, type: 'Delivery', ref: 'WH/OUT/0002', status: 'Ready', date: '12/22/2025', contact: 'BuildCo' }
  ];

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

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              data-testid={`kpi-card-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${kpi.bgLight} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${kpi.textColor}`} />
                </div>
                <div className="text-sm font-medium text-green-600">{kpi.change}</div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-slate-600">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by reference, contact, or product..."
              className="pl-10 h-11 bg-slate-50 border-slate-200"
              data-testid="dashboard-search-input"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-48 h-11 bg-slate-50" data-testid="filter-type">
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
            <SelectTrigger className="w-full md:w-40 h-11 bg-slate-50" data-testid="filter-status">
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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Reference</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Type</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Contact</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-slate-50 transition-colors" data-testid={`activity-row-${activity.ref}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{activity.ref}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{activity.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{activity.contact}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{activity.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${getStatusColor(activity.status)} border-0`} data-testid={`status-${activity.ref}`}>
                      {activity.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" data-testid={`view-${activity.ref}`}>
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
