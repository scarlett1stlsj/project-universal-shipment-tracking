
import React from 'react';
import { Status, Package } from '../types';
import { Package as PackageIcon, Truck, MapPin, CheckCircle2 } from 'lucide-react';

interface StatusFilterProps {
  packages: Package[];
  activeFilter: string | null;
  onFilterChange: (status: string | null) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ packages, activeFilter, onFilterChange }) => {
  const counts = {
    all: packages.length,
    active: packages.filter(p => p.status !== Status.DELIVERED).length,
    out: packages.filter(p => p.status === Status.OUT_FOR_DELIVERY).length,
    done: packages.filter(p => p.status === Status.DELIVERED).length,
  };

  const filters = [
    { id: null, label: 'All', count: counts.all, icon: PackageIcon, color: 'text-slate-600' },
    { id: 'active', label: 'Active', count: counts.active, icon: Truck, color: 'text-indigo-600' },
    { id: Status.OUT_FOR_DELIVERY, label: 'Out for Del.', count: counts.out, icon: MapPin, color: 'text-amber-600' },
    { id: Status.DELIVERED, label: 'Delivered', count: counts.done, icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
      {filters.map((f) => (
        <button
          key={f.label}
          onClick={() => onFilterChange(f.id)}
          className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
            activeFilter === f.id 
              ? 'bg-white border-indigo-600 shadow-md ring-4 ring-indigo-50' 
              : 'bg-white border-slate-100 shadow-sm opacity-80'
          }`}
        >
          <f.icon className={`w-4 h-4 ${activeFilter === f.id ? f.color : 'text-slate-300'}`} />
          <div className="text-left whitespace-nowrap">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{f.label}</p>
            <p className="text-sm font-black text-slate-900 leading-none">{f.count}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
