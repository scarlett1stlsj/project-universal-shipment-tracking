
import React, { useState, useRef } from 'react';
import { 
  Package, 
  MapPin, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Box, 
  Building, 
  CircleDollarSign,
  Camera,
  BookUser,
  X,
  Loader2,
  CheckCircle,
  ArrowRight,
  Calendar,
  Layers,
  Tag,
  Weight,
  CreditCard,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Address } from '../types';

interface CreateShipmentViewProps {
  onOpenAiImport: () => void;
  onComplete: () => void;
  addresses: Address[];
}

type CreateStep = 'details' | 'payment' | 'success';

const CreateShipmentView: React.FC<CreateShipmentViewProps> = ({ onOpenAiImport, onComplete, addresses }) => {
  const [currentStep, setCurrentStep] = useState<CreateStep>('details');
  const [shipmentType, setShipmentType] = useState('Small Parcel');
  const [itemCategory, setItemCategory] = useState('Electronics');
  const [method, setMethod] = useState('Doorstep Pickup');
  const [selectedCourier, setSelectedCourier] = useState('FedEx');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState<'sender' | 'dest' | null>(null);
  
  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderAddr, setSenderAddr] = useState('');
  const [destName, setDestName] = useState('');
  const [destAddr, setDestAddr] = useState('');
  const [itemValue, setItemValue] = useState('150.00');
  const [itemWeight, setItemWeight] = useState('2.5');
  const [pickupDate, setPickupDate] = useState('2024-05-24');
  const [pickupTime, setPickupTime] = useState('09:00 - 12:00');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setIsScanning(false);
    }
  };

  const captureAndParse = async (target: 'sender' | 'dest') => {
    setIsProcessing(true);
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

    const stream = video.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    setIsScanning(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Extract the recipient name and full address from this label. Return as JSON with keys 'name' and 'address'." },
              { inlineData: { mimeType: "image/jpeg", data: base64Image } }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      if (target === 'sender') {
        setSenderName(result.name || '');
        setSenderAddr(result.address || '');
      } else {
        setDestName(result.name || '');
        setDestAddr(result.address || '');
      }
    } catch (err) {
      console.error("AI Scan failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAddress = (addr: Address) => {
    const formatted = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
    if (showAddressBook === 'sender') {
      setSenderName('Alex Chen');
      setSenderAddr(formatted);
    } else if (showAddressBook === 'dest') {
      setDestName(addr.label);
      setDestAddr(formatted);
    }
    setShowAddressBook(null);
  };

  const handlePayment = (method: string) => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setCurrentStep('success');
    }, 2000);
  };

  const couriers = [
    { name: 'FedEx', price: '$12.50', eta: '2 Days' },
    { name: 'UPS', price: '$14.20', eta: '1 Day' },
    { name: 'DHL Express', price: '$28.00', eta: 'Next Day' }
  ];

  if (currentStep === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
          <CheckCircle className="w-12 h-12 stroke-[2.5px]" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Shipment Created!</h2>
        <p className="text-slate-500 font-medium mb-8">Your courier is notified and on the way.</p>
        
        <div className="w-full bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mb-10 text-left">
          <div className="flex justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Number</span>
            <span className="text-sm font-black text-indigo-600">UT-8829-XQ-10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Pickup</span>
            <span className="text-sm font-black text-slate-900">{pickupDate}, {pickupTime}</span>
          </div>
        </div>

        <button 
          onClick={onComplete}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
        >
          Back to Feed
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (currentStep === 'payment') {
    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentStep('details')} className="p-2 bg-slate-100 rounded-xl text-slate-500">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Payment</h2>
        </div>

        {paymentProcessing ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Verifying Transaction...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-slate-400">Total Amount</span>
                 <span className="text-2xl font-black text-slate-900">
                   {couriers.find(c => c.name === selectedCourier)?.price || '$0.00'}
                 </span>
               </div>
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Includes Insurance & Taxes</p>
            </div>

            <button 
              onClick={() => handlePayment('apple')}
              className="w-full bg-black text-white p-6 rounded-[2rem] flex items-center justify-between group active:scale-95 transition-all shadow-lg"
            >
              <div className="flex items-center gap-4">
                <Smartphone className="w-6 h-6" />
                <span className="text-sm font-black uppercase tracking-widest">Apple Pay</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white" />
            </button>

            <button 
              onClick={() => handlePayment('google')}
              className="w-full bg-white border-2 border-slate-100 p-6 rounded-[2rem] flex items-center justify-between group active:scale-95 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Smartphone className="w-6 h-6 text-slate-900" />
                <span className="text-sm font-black uppercase tracking-widest text-slate-900">Google Pay</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900" />
            </button>

            <button 
              onClick={() => handlePayment('card')}
              className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] flex items-center justify-between group active:scale-95 transition-all shadow-lg shadow-indigo-100"
            >
              <div className="flex items-center gap-4">
                <CreditCard className="w-6 h-6" />
                <span className="text-sm font-black uppercase tracking-widest">Credit / Debit Card</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Shipment</h2>
        <p className="text-sm text-slate-500 font-medium">Tracking the world so you don't have to.</p>
      </div>

      {/* Modals & Overlays */}
      {showAddressBook && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Address Book</h3>
              <button onClick={() => setShowAddressBook(null)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {addresses.map(addr => (
                <button 
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className="w-full text-left bg-slate-50 hover:bg-indigo-50 p-4 rounded-2xl transition-colors border border-transparent hover:border-indigo-100"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-900">{addr.label}</p>
                    {addr.isDefault && <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Main</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{addr.street}, {addr.city}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="p-6 flex justify-between items-center">
            <h3 className="text-white font-black uppercase text-xs tracking-widest">Scanning Label...</h3>
            <button onClick={() => setIsScanning(false)} className="p-2 bg-white/10 rounded-full text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-indigo-400 rounded-3xl relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-10 flex justify-center">
            <button 
              onClick={() => captureAndParse('dest')}
              className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 active:scale-90 transition-transform flex items-center justify-center"
            >
              <div className="w-16 h-16 bg-white border-2 border-slate-900 rounded-full"></div>
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-400" />
          <p className="font-black uppercase text-xs tracking-[0.2em]">AI is parsing label...</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Parties Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Origins & Destinations</h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">1</div>
                  <span className="text-[10px] font-black uppercase text-slate-900 tracking-[0.15em]">Sender Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAddressBook('sender')} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                    <BookUser className="w-4 h-4" />
                  </button>
                  <button onClick={startCamera} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 ring-indigo-500 outline-none" 
                />
                <textarea 
                  placeholder="Address details" 
                  value={senderAddr}
                  onChange={(e) => setSenderAddr(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 ring-indigo-500 outline-none h-20 resize-none"
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">2</div>
                  <span className="text-[10px] font-black uppercase text-slate-900 tracking-[0.15em]">Recipient Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAddressBook('dest')} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                    <BookUser className="w-4 h-4" />
                  </button>
                  <button onClick={startCamera} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={destName}
                  onChange={(e) => setDestName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 ring-indigo-500 outline-none" 
                />
                <textarea 
                  placeholder="Address details" 
                  value={destAddr}
                  onChange={(e) => setDestAddr(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 ring-indigo-500 outline-none h-20 resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* Shipment Info Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Shipment Info</h3>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Type</label>
                <div className="relative">
                  <select 
                    value={shipmentType}
                    onChange={(e) => setShipmentType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 appearance-none focus:ring-2 ring-indigo-500 outline-none"
                  >
                    <option>Small Parcel</option>
                    <option>Medium Parcel</option>
                    <option>Document</option>
                    <option>Heavy & Bulky</option>
                  </select>
                  <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Category</label>
                <div className="relative">
                  <select 
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 appearance-none focus:ring-2 ring-indigo-500 outline-none"
                  >
                    <option>Electronics</option>
                    <option>Apparel</option>
                    <option>Fragile</option>
                    <option>Cosmetics</option>
                  </select>
                  <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Value (USD)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={itemValue}
                    onChange={(e) => setItemValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none" 
                  />
                  <CircleDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Weight (KG)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={itemWeight}
                    onChange={(e) => setItemWeight(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none" 
                  />
                  <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scheduled Pickup Window */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Scheduled Pickup</h3>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex gap-2 mb-2">
              <button 
                onClick={() => setMethod('Doorstep Pickup')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  method === 'Doorstep Pickup' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-slate-50'
                }`}
              >
                <Truck className={`w-5 h-5 ${method === 'Doorstep Pickup' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Pickup</span>
              </button>
              <button 
                onClick={() => setMethod('Dropoff')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  method === 'Dropoff' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-slate-50'
                }`}
              >
                <Building className={`w-5 h-5 ${method === 'Dropoff' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Dropoff</span>
              </button>
            </div>

            {method === 'Doorstep Pickup' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Date</label>
                    <input 
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Time Slot</label>
                    <div className="relative">
                      <select 
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 appearance-none focus:ring-2 ring-indigo-500 outline-none"
                      >
                        <option>09:00 - 12:00</option>
                        <option>12:00 - 15:00</option>
                        <option>15:00 - 18:00</option>
                      </select>
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Courier Selection */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Select Courier</h3>
          <div className="space-y-2">
            {couriers.map(c => (
              <button 
                key={c.name}
                onClick={() => setSelectedCourier(c.name)}
                className={`w-full bg-white p-4 rounded-3xl border transition-all flex items-center justify-between ${
                  selectedCourier === c.name ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCourier === c.name ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.eta}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-indigo-600">{c.price}</p>
              </button>
            ))}
          </div>
        </section>

        <button 
          onClick={() => setCurrentStep('payment')}
          className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          Complete & Pay
        </button>
      </div>
    </div>
  );
};

export default CreateShipmentView;
