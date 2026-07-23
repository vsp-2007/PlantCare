import React from 'react';
import { 
  LayoutDashboard, 
  Grid, 
  Scan, 
  Calendar, 
  Bot, 
  ShieldAlert, 
  Settings, 
  HelpCircle,
  Sparkles,
  ChevronRight,
  Droplets,
  Sun
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenRescueModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenRescueModal
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Profile', icon: LayoutDashboard, badge: 'Main' },
    { id: 'garden', label: 'My Garden', icon: Grid, badge: '6 Plants' },
    { id: 'identify', label: 'AI Species Identification', icon: Scan, badge: 'Camera' },
    { id: 'schedule', label: 'Care Schedule', icon: Calendar, badge: 'Tasks' },
    { id: 'chat', label: 'AI Plant Doctor', icon: Bot, badge: 'Gemini' },
    { id: 'rescue', label: 'Emergency Rescue', icon: ShieldAlert, badge: 'Urgent', isAction: true },
    { id: 'settings', label: 'Settings & Status', icon: Settings },
    { id: 'support', label: 'Botanical Guide', icon: HelpCircle }
  ];

  const handleNav = (id: string, isAction?: boolean) => {
    if (isAction) {
      onOpenRescueModal();
    } else {
      setActiveView(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-16 left-0 bottom-0 z-40
        w-68 bg-[#090e17] border-r border-slate-800/60 text-slate-100 p-4 lg:p-5
        flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-[6px_0_18px_#04070c]
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Navigation Links */}
        <div className="space-y-2">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Navigation</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id, item.isAction)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all group
                    ${item.isAction 
                      ? 'neo-btn-rose' 
                      : isActive 
                        ? 'neo-active text-emerald-300 font-semibold' 
                        : 'neo-btn text-slate-300 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      item.isAction 
                        ? 'text-rose-200' 
                        : isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-xl font-bold tracking-wide
                      ${item.isAction 
                        ? 'bg-rose-950/90 text-rose-200 shadow-[inset_2px_2px_4px_#380e18,inset_-2px_-2px_4px_#881337]' 
                        : isActive 
                          ? 'bg-emerald-950/80 text-emerald-300 shadow-[inset_2px_2px_4px_#030906,inset_-2px_-2px_4px_#0e382b]' 
                          : 'neo-badge text-slate-400'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom System & Quick Stats Card */}
        <div className="pt-4 border-t border-slate-800/60 space-y-3">
          <div className="neo-card-emerald p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-teal-300 animate-spin" style={{ animationDuration: '6s' }} />
                Gemini LLM Active
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Tactile Neumorphic AI diagnostics and species engine operational.
            </p>
            <div className="mt-3 pt-2.5 border-t border-emerald-800/40 flex items-center justify-between text-[10px] font-medium text-emerald-300">
              <span className="flex items-center gap-1">
                <Droplets size={11} className="text-blue-400" /> Auto-Sync
              </span>
              <span className="flex items-center gap-1">
                <Sun size={11} className="text-amber-300" /> UV Index 4
              </span>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-500 font-mono tracking-wider">
            PLANTCARE PRO • NEUMORPHIC EDITION
          </p>
        </div>
      </aside>
    </>
  );
};
