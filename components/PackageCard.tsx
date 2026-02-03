
import React, { useState } from 'react';
import { Package, Status, ShipmentDirection } from '../types';
import { STATUS_UI } from '../constants';
import { ChevronDown, ChevronUp, MapPin, ExternalLink, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface PackageCardProps {
  pkg: Package;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = STATUS_UI[pkg.status];
  const isIncoming = pkg.direction === ShipmentDirection.INCOMING;

  return (
    <div 
      className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 ${
        isExpanded ? 'ring-2 ring-indigo-500 shadow-xl scale-[1.01]' : 'hover:shadow-md'
      }`}
    >
      <div 
        className="p-4 flex gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative flex-shrink-0">
          <img 
            src={pkg.imageUrl || 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=200&h=200&auto=format&fit=crop'} 
            className="w-20 h-20 object-cover rounded-2xl bg-slate-100"
            alt={pkg.name}
          />
          <div className={`absolute -top-1 -left-1 p-1.5 rounded-lg shadow-sm ${isIncoming ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
            {isIncoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-sm">
            <div className={`w-3 h-3 rounded-full ${statusInfo.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              {pkg.isReturn && (
                <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Return</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{pkg.carrier}</span>
          </div>
          <h4 className="font-bold text-slate-900 truncate">{pkg.name}</h4>
          <p className="text-xs text-slate-500 truncate mb-2">{pkg.productDescription}</p>
          
          <div className="flex items-center gap-3">
             <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isIncoming ? 'bg-emerald-500' : 'bg-indigo-600'} transition-all duration-500`} 
                  style={{ width: pkg.status === Status.DELIVERED ? '100%' : pkg.status === Status.OUT_FOR_DELIVERY ? '85%' : '50%' }}
                />
             </div>
             {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-50 rounded-2xl p-4 mt-2 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tracking Number</p>
                <button className="flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                  {pkg.trackingNumber}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isIncoming ? 'Arrival' : 'Delivery'}</p>
                <p className="text-sm font-bold text-slate-900">{new Date(pkg.estimatedDelivery).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {pkg.events.map((event, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  {idx !== pkg.events.length - 1 && (
                    <div className="absolute left-1.5 top-3 w-0.5 h-full bg-slate-200" />
                  )}
                  <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${idx === 0 ? (isIncoming ? 'bg-emerald-500' : 'bg-indigo-500') : 'bg-slate-300'}`} />
                  <div>
                    <p className={`text-xs font-bold ${idx === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium text-slate-400 uppercase">{event.location}</span>
                      <span className="text-[10px] font-medium text-slate-400">•</span>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageCard;
