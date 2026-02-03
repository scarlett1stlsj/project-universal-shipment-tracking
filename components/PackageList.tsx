
import React from 'react';
import { Package, Status } from '../types';
import { STATUS_COLORS, CARRIER_COLORS } from '../constants';
import { ChevronRight, MapPin, Calendar, Hash } from 'lucide-react';

interface PackageListProps {
  packages: Package[];
  onSelect: (pkg: Package) => void;
}

const PackageList: React.FC<PackageListProps> = ({ packages, onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {packages.map((pkg) => (
        <div 
          key={pkg.id} 
          onClick={() => onSelect(pkg)}
          // Fixed: Added missing backtick to close template literal
          className={`bg-white rounded-2xl border-l-4 p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer ${CARRIER_COLORS[pkg.carrier]}`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {/* Fixed: Added missing backtick to close template literal */}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[pkg.status]}`}>
                  {pkg.status}
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {pkg.trackingNumber}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{pkg.name}</h4>
              <p className="text-sm text-slate-500 font-medium">{pkg.carrier}</p>
            </div>

            <div className="flex items-center gap-8 md:text-right">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Last Update</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {pkg.events[0]?.location || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Est. Arrival</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {new Date(pkg.estimatedDelivery).toLocaleDateString()}
                </div>
              </div>
              <div className="hidden md:block">
                <ChevronRight className="w-6 h-6 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 overflow-hidden">
             {pkg.status !== Status.DELIVERED && (
               <div className="w-full bg-slate-100 h-1.5 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full animate-pulse" 
                    style={{ width: pkg.status === Status.OUT_FOR_DELIVERY ? '90%' : '60%' }}
                  />
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PackageList;
