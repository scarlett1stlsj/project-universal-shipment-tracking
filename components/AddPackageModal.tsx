
import React, { useState } from 'react';
import { X, Sparkles, Loader2, PackageSearch } from 'lucide-react';
import { Carrier, Status, Package, ShipmentDirection } from '../types';
import { parseEmailWithGemini } from '../services/geminiService';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pkg: Package) => void;
}

const AddPackageModal: React.FC<AddPackageModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [formData, setFormData] = useState({
    name: '',
    trackingNumber: '',
    carrier: Carrier.OTHER
  });
  const [aiText, setAiText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add missing direction property to satisfy Package type requirement
    const newPkg: Package = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      carrier: formData.carrier,
      trackingNumber: formData.trackingNumber,
      status: Status.ORDER_PLACED,
      direction: ShipmentDirection.INCOMING,
      estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
      lastUpdate: new Date().toISOString(),
      events: [{
        timestamp: new Date().toISOString(),
        location: 'Pending',
        description: 'Tracking information initiated',
        status: Status.ORDER_PLACED
      }]
    };
    onAdd(newPkg);
    onClose();
    setFormData({ name: '', trackingNumber: '', carrier: Carrier.OTHER });
  };

  const handleAiParse = async () => {
    if (!aiText.trim()) return;
    setIsParsing(true);
    try {
      const result = await parseEmailWithGemini(aiText);
      if (result) {
        // Add missing direction property to satisfy Package type requirement
        const newPkg: Package = {
          ...result,
          id: Math.random().toString(36).substr(2, 9),
          direction: ShipmentDirection.INCOMING,
          lastUpdate: new Date().toISOString(),
          events: [{
            timestamp: new Date().toISOString(),
            location: 'System',
            description: 'Package imported via AI Assistant',
            status: result.status
          }]
        };
        onAdd(newPkg);
        onClose();
        setAiText('');
      }
    } catch (error) {
      alert("AI failed to parse. Please try again or use manual entry.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Add New Shipment</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Magic Import
            </button>
          </div>

          {activeTab === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Package Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. New Running Shoes"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Carrier</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
                    value={formData.carrier}
                    onChange={e => setFormData({ ...formData, carrier: e.target.value as Carrier })}
                  >
                    {Object.values(Carrier).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tracking Number</label>
                  <input
                    required
                    type="text"
                    placeholder="1Z..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    value={formData.trackingNumber}
                    onChange={e => setFormData({ ...formData, trackingNumber: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-6"
              >
                <PackageSearch className="w-5 h-5" />
                Start Tracking
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                Paste the shipping confirmation email text below. Our AI will automatically extract the tracking info.
              </p>
              <textarea
                className="w-full h-40 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none font-mono text-xs"
                placeholder="Paste email content here..."
                value={aiText}
                onChange={e => setAiText(e.target.value)}
              ></textarea>
              <button
                disabled={isParsing || !aiText.trim()}
                onClick={handleAiParse}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isParsing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isParsing ? 'Parsing with AI...' : 'Analyze and Add'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPackageModal;
