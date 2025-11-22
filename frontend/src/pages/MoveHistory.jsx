import { Search, ArrowRight, Calendar, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function MoveHistory() {
  const [view, setView] = useState('list');
  
  const moves = [
    {
      id: 1,
      ref: 'WH/INT/0001',
      date: '12/24/2025',
      product: 'Steel Rods',
      quantity: 50,
      unit: 'kg',
      from: 'Main Warehouse',
      to: 'Production Floor',
      contact: 'Internal Transfer',
      status: 'Done'
    },
    {
      id: 2,
      ref: 'WH/IN/0001',
      date: '12/24/2025',
      product: 'Office Desk',
      quantity: 10,
      unit: 'pcs',
      from: 'Vendor',
      to: 'Rack A',
      contact: 'Acme Supplier',
      status: 'Ready'
    },
    {
      id: 3,
      ref: 'WH/OUT/0001',
      date: '12/23/2025',
      product: 'Office Chair',
      quantity: 5,
      unit: 'pcs',
      from: 'Rack A',
      to: 'Customer',
      contact: 'John Corp',
      status: 'Done'
    },
    {
      id: 4,
      ref: 'WH/INT/0002',
      date: '12/23/2025',
      product: 'Bolts M10',
      quantity: 500,
      unit: 'pcs',
      from: 'Rack B',
      to: 'Production Floor',
      contact: 'Internal Transfer',
      status: 'Done'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-slate-100 text-slate-700',
      'Ready': 'bg-amber-100 text-amber-700',
      'Done': 'bg-green-100 text-green-700',
      'Waiting': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6" data-testid="move-history-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Move History</h2>
          <p className="text-slate-600 mt-1">Track all stock movements and transfers</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
            className={view === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            data-testid="list-view-button"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('card')}
            className={view === 'card' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            data-testid="card-view-button"
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by reference, product, or contact..."
              className="pl-10 h-11 bg-slate-50 border-slate-200"
              data-testid="move-history-search-input"
            />
          </div>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Reference</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Product</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">From</th>
                  <th className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">To</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Quantity</th>
                  <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {moves.map((move) => (
                  <tr key={move.id} className="hover:bg-slate-50 transition-colors" data-testid={`move-row-${move.ref}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{move.ref}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {move.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-medium">{move.product}</div>
                      <div className="text-xs text-slate-500">{move.contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{move.from}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-blue-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{move.to}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {move.quantity} {move.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(move.status)} border-0`} data-testid={`move-status-${move.ref}`}>
                        {move.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {view === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moves.map((move) => (
            <div
              key={move.id}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all"
              data-testid={`move-card-${move.ref}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-slate-900 text-lg">{move.ref}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {move.date}
                  </div>
                </div>
                <Badge className={`${getStatusColor(move.status)} border-0`}>
                  {move.status}
                </Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Product</div>
                  <div className="font-medium text-slate-900">{move.product}</div>
                  <div className="text-sm text-slate-500">{move.quantity} {move.unit}</div>
                </div>
                <div className="flex items-center gap-3 py-3 bg-slate-50 rounded-lg px-4">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">From</div>
                    <div className="text-sm font-medium text-slate-900">{move.from}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">To</div>
                    <div className="text-sm font-medium text-slate-900">{move.to}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Contact: {move.contact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
