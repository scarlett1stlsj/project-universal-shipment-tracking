
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const BRANDS = [
  { name: 'Apple', logo: 'https://logo.clearbit.com/apple.com' },
  { name: 'Nike', logo: 'https://logo.clearbit.com/nike.com' },
  { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
  { name: 'Zara', logo: 'https://logo.clearbit.com/zara.com' },
];

const PromoBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-xl group">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
      
      <div className="relative z-10 p-5 space-y-4">
        {/* Header Section */}
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <h3 className="text-sm font-black tracking-tight text-white/90">Your favorite stores</h3>
        </div>

        {/* Integrated Brand Section - Minimized Height */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
          {BRANDS.map((brand) => (
            <button 
              key={brand.name} 
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group/brand"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 flex items-center justify-center p-2.5 transition-all group-active/brand:scale-90 shadow-sm">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="w-full h-full object-contain brightness-0 invert opacity-40 group-hover/brand:opacity-100 transition-opacity" 
                />
              </div>
              <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest group-hover/brand:text-white/70 transition-colors">
                {brand.name}
              </span>
            </button>
          ))}
          <button className="flex-shrink-0 flex flex-col items-center gap-1.5 group/more">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover/more:bg-indigo-600 group-hover/more:text-white transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
