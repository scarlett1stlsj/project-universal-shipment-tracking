
import React, { useState } from 'react';
import { Package, ViewType, Status, ShipmentDirection, Carrier, Address } from './types';
import { INITIAL_PACKAGES, INITIAL_ADDRESSES } from './constants';
import BottomNav from './components/BottomNav';
import PromoBanner from './components/PromoBanner';
import StatusFilter from './components/StatusFilter';
import PackageCard from './components/PackageCard';
import AddPackageModal from './components/AddPackageModal';
import ProfileView from './components/ProfileView';
import CreateShipmentView from './components/CreateShipmentView';
import { Bell, ArrowLeft, ArrowDownLeft, ArrowUpRight, ShoppingCart, Sparkles, ChevronRight, X, ShieldCheck, Truck, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [activeDirection, setActiveDirection] = useState<ShipmentDirection>(ShipmentDirection.INCOMING);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const directionalPackages = packages.filter(p => p.direction === activeDirection);
  
  const filteredPackages = directionalPackages.filter(p => {
    if (!activeFilter) return true;
    if (activeFilter === 'active') return p.status !== Status.DELIVERED;
    return p.status === activeFilter;
  });

  const addPackage = (newPkg: Package) => {
    setPackages(prev => [{...newPkg, direction: ShipmentDirection.INCOMING}, ...prev]);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const newPkg: Package = {
        id: 'sync-' + Date.now(),
        name: 'Nike Air Max Order',
        carrier: Carrier.FEDEX,
        trackingNumber: 'FX-SYNC-99201',
        status: Status.SHIPPED,
        direction: ShipmentDirection.INCOMING,
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
        lastUpdate: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&h=200&auto=format&fit=crop',
        productDescription: 'Detected from your Gmail inbox.',
        events: [{
          timestamp: new Date().toISOString(),
          location: 'Memphis, TN',
          description: 'Shipment info sent to FedEx',
          status: Status.SHIPPED
        }]
      };
      setPackages(prev => [newPkg, ...prev]);
      setIsSyncing(false);
    }, 2500);
  };

  const RecommendedProducts = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Curated for You</h2>
        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
          Explore All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 pb-8">
        {[
          { id: 1, name: 'AirPods Max', price: '$549', img: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=400&h=400&auto=format&fit=crop', desc: 'The ultimate over-ear listening experience. High-fidelity audio and Industry-leading Active Noise Cancellation.' },
          { id: 2, name: 'Bellroy Wallet', price: '$89', img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&h=400&auto=format&fit=crop', desc: 'Premium leather, slim profile. Holds 4–12 cards and folded bills.' },
          { id: 3, name: 'Mechanical Keys', price: '$120', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&h=400&auto=format&fit=crop', desc: 'Custom mechanical keyboard with hot-swappable switches and RGB lighting.' },
          { id: 4, name: 'Smart Flask', price: '$45', img: 'https://images.unsplash.com/photo-1602143399827-bd9aa9673bc3?q=80&w=400&h=400&auto=format&fit=crop', desc: 'Vacuum insulated stainless steel water bottle. Keeps drinks cold for 24 hours.' }
        ].map(item => (
          <div key={item.id} onClick={() => setSelectedProduct(item)} className="bg-white rounded-[2rem] border border-slate-100 p-3 shadow-sm group cursor-pointer hover:shadow-md transition-all">
            <div className="relative overflow-hidden rounded-2xl mb-3">
              <img src={item.img} alt={item.name} className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110" />
              <button className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-900">
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-black text-slate-900 truncate px-1">{item.name}</p>
            <p className="text-[10px] font-bold text-slate-400 px-1 mt-0.5">{item.price}</p>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col items-center bg-slate-50 min-h-screen">
      <div className="w-full max-w-[480px] bg-white min-h-screen relative shadow-2xl pb-24 flex flex-col">
        
        <header className="px-6 py-6 flex items-center justify-between bg-white sticky top-0 z-40 h-20">
          <div className="flex items-center gap-3">
            {activeView !== 'home' && (
              <button onClick={() => setActiveView('home')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div>
              <h1 className={`text-2xl font-black text-slate-900 tracking-tighter ${activeView !== 'home' ? 'text-xl' : ''}`}>
                {activeView === 'home' ? 'UseOmni.io' : activeView === 'create' ? 'Create' : 'Profile'}
              </h1>
              {activeView === 'home' && (
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider -mt-1">Tracking the world so you don't have to.</p>
              )}
            </div>
          </div>
          <button className="relative p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
            <Bell className="w-6 h-6 stroke-[2.5px]" />
            <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-[3px] border-white animate-pulse"></span>
          </button>
        </header>

        <main className="flex-1 px-6 pt-2 pb-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {activeView === 'home' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex bg-slate-100 p-1.5 rounded-[2rem]">
                <button
                  onClick={() => { setActiveDirection(ShipmentDirection.INCOMING); setActiveFilter(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${
                    activeDirection === ShipmentDirection.INCOMING ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Incoming
                </button>
                <button
                  onClick={() => { setActiveDirection(ShipmentDirection.OUTGOING); setActiveFilter(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${
                    activeDirection === ShipmentDirection.OUTGOING ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Outgoing
                </button>
              </div>

              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{activeDirection} Activity</h2>
                </div>
                <StatusFilter packages={directionalPackages} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
              </section>

              <section className="space-y-5">
                {filteredPackages.length > 0 ? (
                  filteredPackages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">No {activeDirection.toLowerCase()} shipments</p>
                  </div>
                )}
              </section>

              {activeDirection === ShipmentDirection.INCOMING && (
                <section className="space-y-6 pt-4">
                  <div className="p-5 rounded-[2.5rem] bg-indigo-900 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                        {isSyncing ? <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-300" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black leading-tight">{isSyncing ? 'Scanning...' : 'Sync Inbox'}</h4>
                        <p className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest">{isSyncing ? 'AI is checking mail' : 'Connect Gmail'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSync} 
                      disabled={isSyncing}
                      className="bg-white text-indigo-900 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSyncing ? 'Busy' : 'Link'}
                    </button>
                  </div>
                  
                  <PromoBanner />
                  
                  <RecommendedProducts />
                </section>
              )}
            </div>
          )}

          {activeView === 'create' && <CreateShipmentView onOpenAiImport={() => setIsModalOpen(true)} onComplete={() => setActiveView('home')} addresses={addresses} />}
          {activeView === 'profile' && <ProfileView addresses={addresses} setAddresses={setAddresses} />}
        </main>

        <BottomNav activeView={activeView} onViewChange={setActiveView} />

        {/* Product Detail Overlay */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end animate-in fade-in duration-300">
            <div className="w-full bg-white rounded-t-[3rem] p-8 max-w-[480px] mx-auto animate-in slide-in-from-bottom-full duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Limited Edition</div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-[2.5rem] mb-6 shadow-2xl" />
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-slate-900">{selectedProduct.name}</h3>
                <span className="text-xl font-black text-indigo-600">{selectedProduct.price}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{selectedProduct.desc}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700">
                  <Truck className="w-5 h-5" />
                  <span className="text-xs font-bold">UseOmni.io 1-Click: Estimated Delivery in 2 Days</span>
                </div>
                <button className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                  Order via UseOmni.io
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddPackageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addPackage} />
    </div>
  );
};

export default App;
