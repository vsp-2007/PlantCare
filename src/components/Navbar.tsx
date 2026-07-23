import React from 'react';
import { 
  Sprout, 
  Bell, 
  Search, 
  Plus, 
  Sparkles, 
  ShieldAlert,
  Settings,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { CareAlert } from '../types';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  alerts: CareAlert[];
  onOpenAddModal: () => void;
  onOpenRescueModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  alerts,
  onOpenAddModal,
  onOpenRescueModal,
  searchQuery,
  setSearchQuery,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const unhandledAlerts = alerts.length;

  return (
    <header className="sticky top-0 z-40 bg-[#090e17] border-b border-slate-800/60 text-slate-100 px-4 lg:px-8 py-3 shadow-[0_6px_16px_#04070c] backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 rounded-xl neo-btn text-emerald-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div 
            onClick={() => setActiveView('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-[#0b1320] shadow-[5px_5px_12px_#04070c,-5px_-5px_12px_#142032] border border-slate-800/80 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-emerald-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#090e17] shadow-[2px_2px_4px_#04070c]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-white font-sans">
                  PlantCare <span className="text-emerald-400 font-serif italic">Pro</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-[#06120d] text-emerald-400 rounded-lg shadow-[inset_2px_2px_4px_#030906,inset_-2px_-2px_4px_#0a1b14] border border-emerald-800/40 uppercase">
                  NEO AI v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Tactile Botanical Intelligence Engine</p>
            </div>
          </div>
        </div>

        {/* Middle Search Input */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="absolute left-3.5 w-4 h-4 text-emerald-400/80" />
          <input
            type="text"
            placeholder="Search plants, species, logs or diagnostic symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full neo-input rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500"
          />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Rescue Emergency Button */}
          <button
            onClick={onOpenRescueModal}
            className="neo-btn-rose flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium"
            title="Launch Emergency Rescue Protocol"
          >
            <ShieldAlert size={16} className="text-rose-200 animate-bounce" />
            <span className="hidden sm:inline">Emergency Rescue</span>
          </button>

          {/* Add Plant Button */}
          <button
            onClick={onOpenAddModal}
            className="neo-btn-emerald flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Plant</span>
          </button>

          {/* Alerts Bell Indicator */}
          <div className="relative">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`p-2.5 rounded-xl neo-btn text-emerald-300 relative ${unhandledAlerts > 0 ? 'border-amber-500/40' : ''}`}
              title={`${unhandledAlerts} Urgent Care Alerts`}
            >
              <Bell size={18} />
              {unhandledAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-[1px_1px_3px_#000] animate-pulse">
                  {unhandledAlerts}
                </span>
              )}
            </button>
          </div>

          {/* Help / Guide */}
          <button
            onClick={() => setActiveView('support')}
            className={`p-2.5 rounded-xl border transition-all ${
              activeView === 'support' ? 'neo-active text-emerald-400' : 'neo-btn text-slate-300'
            }`}
            title="User Guide & Botanical Docs"
          >
            <HelpCircle size={18} />
          </button>

        </div>
      </div>
    </header>
  );
};
