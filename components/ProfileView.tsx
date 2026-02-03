
import React, { useState } from 'react';
import { Mail, Landmark, MapPin, Plus, ChevronRight, ShieldCheck, MailQuestion, Pencil, X, Save } from 'lucide-react';
import { Address } from '../types';

interface ProfileViewProps {
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ addresses, setAddresses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAddr: Address = {
      id: editingAddress?.id || Date.now().toString(),
      label: formData.get('label') as string,
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
      isDefault: editingAddress?.isDefault || addresses.length === 0,
    };

    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? newAddr : a));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* User Info Header */}
      <div className="flex items-center gap-4 bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
        <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black">
          AC
        </div>
        <div>
          <h2 className="text-xl font-black">Alex Chen</h2>
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Power User • San Francisco</p>
        </div>
      </div>

      {/* Account Linking Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Connected Accounts</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Amazon Account</p>
                <p className="text-xs text-slate-500">Sync orders automatically</p>
              </div>
            </div>
            <button className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider group-hover:bg-indigo-600 group-hover:text-white transition-all">
              Link
            </button>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Email Tracking</p>
                <p className="text-xs text-slate-500">Import from Gmail & Outlook</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Address Management Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Saved Addresses</h3>
          <button onClick={handleOpenAdd} className="p-1.5 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-100 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative group">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <MapPin className={`w-5 h-5 ${addr.isDefault ? 'text-indigo-600' : 'text-slate-300'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {addr.street},<br />
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenEdit(addr)}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Address Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSaveAddress}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  {editingAddress ? 'Update Address' : 'New Address'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Label</label>
                  <input 
                    name="label" 
                    defaultValue={editingAddress?.label} 
                    required 
                    placeholder="e.g. Home, Office"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Street</label>
                  <input 
                    name="street" 
                    defaultValue={editingAddress?.street} 
                    required 
                    placeholder="Address Line"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">City</label>
                    <input 
                      name="city" 
                      defaultValue={editingAddress?.city} 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">State</label>
                    <input 
                      name="state" 
                      defaultValue={editingAddress?.state} 
                      required 
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Zip Code</label>
                  <input 
                    name="zip" 
                    defaultValue={editingAddress?.zip} 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <div className="p-6 pt-0">
                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingAddress ? 'Update Saved Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2rem] text-center space-y-2">
        <MailQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-600">Need help with your profile?</p>
        <p className="text-xs text-slate-400">Our support team is available 24/7</p>
      </div>
    </div>
  );
};

export default ProfileView;
