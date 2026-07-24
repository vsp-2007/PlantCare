import React, { useState } from 'react';
import { 
  Sprout, 
  Heart, 
  ShieldAlert, 
  Calendar, 
  Droplets, 
  Sparkles, 
  Bot, 
  QrCode, 
  Clock, 
  MapPin, 
  Sun, 
  Compass, 
  ChevronRight, 
  Award, 
  CheckCircle2, 
  Send,
  Download,
  Printer,
  Share2,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Plant, CareAlert, CareLogEntry, ChatMessage } from '../types';
import { GrowthTracker } from './GrowthTracker';
import { LocalClimateWidget } from './LocalClimateWidget';

interface DashboardViewProps {
  plants: Plant[];
  selectedPlant: Plant;
  setSelectedPlant: (p: Plant) => void;
  alerts: CareAlert[];
  logs: CareLogEntry[];
  onOpenLogCareModal: () => void;
  onOpenRescueModal: () => void;
  onNavigateToChat: () => void;
  onResolveAlert: (alertId: string) => void;
  onUpdateHealthScore?: (plantId: string, newScore: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  plants,
  selectedPlant,
  setSelectedPlant,
  alerts,
  logs,
  onOpenLogCareModal,
  onOpenRescueModal,
  onNavigateToChat,
  onResolveAlert,
  onUpdateHealthScore
}) => {
  const [profileTab, setProfileTab] = useState<'growth' | 'timeline' | 'doctor' | 'insights' | 'passport'>('growth');
  const [doctorQuery, setDoctorQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `Hello! I'm your PlantAI Doctor. How can I assist with ${selectedPlant.nickname} (${selectedPlant.species}) today?`,
      timestamp: '10:00 AM'
    }
  ]);
  const [isDoctorLoading, setIsDoctorLoading] = useState(false);

  // Quick stats calculations
  const totalPlants = plants.length;
  const avgHealth = Math.round(plants.reduce((acc, p) => acc + p.healthScore, 0) / (totalPlants || 1));
  const thirstyCount = plants.filter(p => p.status === 'Thirsty' || p.status === 'Warning').length;

  const handleSendDoctorMessage = async (customText?: string) => {
    const textToSend = customText || doctorQuery;
    if (!textToSend.trim() || isDoctorLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setDoctorQuery('');
    setIsDoctorLoading(true);

    try {
      const response = await fetch('/api/gemini/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          plantName: selectedPlant.nickname,
          plantSpecies: selectedPlant.species,
          history: chatMessages
        })
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || data.error || 'PlantAI Doctor processed your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Error connecting to AI Doctor: ${e.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } finally {
      setIsDoctorLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="neo-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Garden</p>
            <p className="text-2xl font-bold text-white mt-1">{totalPlants} <span className="text-xs font-normal text-slate-400">Specimens</span></p>
          </div>
          <div className="p-3 rounded-xl neo-badge text-emerald-400">
            <Sprout size={22} />
          </div>
        </div>

        <div className="neo-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Health</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{avgHealth}% <span className="text-xs font-normal text-emerald-400/70">Optimum</span></p>
          </div>
          <div className="p-3 rounded-xl neo-badge text-emerald-400">
            <Heart size={22} className="text-emerald-400" />
          </div>
        </div>

        <div className="neo-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Needs Attention</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{thirstyCount} <span className="text-xs font-normal text-amber-200">Alerts</span></p>
          </div>
          <div className="p-3 rounded-xl neo-badge text-amber-400">
            <Droplets size={22} />
          </div>
        </div>

        <div className="neo-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Survival Index</p>
            <p className="text-2xl font-bold text-teal-300 mt-1">Low <span className="text-xs font-normal text-teal-200">Risk</span></p>
          </div>
          <div className="p-3 rounded-xl neo-badge text-teal-300">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Local Climate & Plant Care Recommendations Widget */}
      <LocalClimateWidget />

      {/* Urgent Care Needed Alerts Bar */}
      {alerts.length > 0 && (
        <div className="neo-card-emerald p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-300 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Urgent Botanical Care Needed</h3>
              <span className="text-xs bg-rose-950/80 text-rose-200 px-2.5 py-0.5 rounded-full shadow-[inset_2px_2px_4px_#380e18,inset_-2px_-2px_4px_#881337] font-extrabold border border-rose-500/30">
                {alerts.length} Pending
              </span>
            </div>
            <span className="text-xs text-emerald-300/80 hidden sm:inline">Priority queue auto-updates every hour</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="neo-card p-3 rounded-xl flex items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={alert.plantPhoto} 
                    alt={alert.plantName} 
                    className="w-10 h-10 rounded-xl object-cover neo-badge flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{alert.title}</p>
                    <p className="text-[11px] text-rose-300 truncate">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="neo-btn-emerald px-2.5 py-1.5 rounded-xl text-[11px]"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={onOpenRescueModal}
                    className="neo-btn-rose p-1.5 rounded-xl"
                    title="Rescue Protocol"
                  >
                    <ShieldAlert size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Container: Plant Selector Bar + Profile Card */}
      <div className="neo-card rounded-3xl p-5 lg:p-7 space-y-6">
        
        {/* Plant Selector Carousel Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sprout className="text-emerald-400" size={18} />
              Active Specimen Focus
            </h2>
            <p className="text-xs text-slate-400">Select a plant to view full biological passport and telemetry</p>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto max-w-md py-1 no-scrollbar">
            {plants.map((p) => {
              const isSelected = selectedPlant.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlant(p)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0
                    ${isSelected 
                      ? 'neo-active text-emerald-300' 
                      : 'neo-btn text-slate-300 hover:text-white'}
                  `}
                >
                  <img src={p.photoUrl} alt={p.nickname} className="w-5 h-5 rounded-full object-cover neo-badge" />
                  <span>{p.nickname}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Plant Header Profile Card */}
        <div className="neo-convex rounded-2xl p-5 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative overflow-hidden">
          
          {/* Ambient background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Plant Image Column */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden neo-card p-1 relative">
                <img 
                  src={selectedPlant.photoUrl} 
                  alt={selectedPlant.nickname} 
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 neo-badge text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider">
                  {selectedPlant.status}
                </span>
              </div>
            </div>
          </div>

          {/* Plant Details & Metric Badges Column */}
          <div className="md:col-span-8 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-serif tracking-tight">
                    {selectedPlant.nickname}
                  </h1>
                  <span className="px-3 py-1 rounded-xl neo-badge text-emerald-300 text-xs font-bold">
                    {selectedPlant.species}
                  </span>
                </div>
                <p className="text-xs text-slate-400 italic mt-1">
                  Scientific Name: <span className="font-sans font-medium text-emerald-300">{selectedPlant.scientificName || selectedPlant.species}</span>
                </p>
              </div>

              {/* Stat Buttons */}
              <div className="flex items-center gap-3">
                <div className="neo-card px-3.5 py-2 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Health Score</span>
                  <span className="text-lg font-extrabold text-white flex items-center justify-center gap-1.5 mt-0.5">
                    {selectedPlant.healthScore}% <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </span>
                </div>

                <div className="neo-card px-3.5 py-2 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Next Care</span>
                  <span className="text-sm font-extrabold text-teal-200 mt-0.5 block">
                    {selectedPlant.nextCareDue}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Location & Metadata Pills */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="neo-inset p-3 rounded-2xl">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Location</span>
                <span className="text-slate-100 font-semibold truncate block mt-0.5">{selectedPlant.location}</span>
              </div>

              <div className="neo-inset p-3 rounded-2xl">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Sunlight</span>
                <span className="text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                  <Sun size={12} /> {selectedPlant.sunRequirement}
                </span>
              </div>

              <div className="neo-inset p-3 rounded-2xl">
                <span className="text-slate-400 text-[10px] uppercase block font-bold">Acquired</span>
                <span className="text-slate-100 font-semibold block mt-0.5">{selectedPlant.acquiredDate}</span>
              </div>
            </div>

            {/* Primary Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenLogCareModal}
                className="neo-btn-emerald px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2"
              >
                <Droplets size={16} />
                <span>Log Care</span>
              </button>

              <button
                onClick={onOpenRescueModal}
                className="neo-btn-rose px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2"
              >
                <ShieldAlert size={16} className="text-rose-200" />
                <span>Emergency Rescue</span>
              </button>

              <button
                onClick={() => setProfileTab('doctor')}
                className="neo-btn px-4 py-2.5 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2"
              >
                <Bot size={16} className="text-teal-300" />
                <span>AI Doctor</span>
              </button>

              <button
                onClick={() => setProfileTab('passport')}
                className="neo-btn px-4 py-2.5 rounded-2xl text-slate-200 text-xs font-semibold flex items-center gap-2"
              >
                <QrCode size={16} className="text-emerald-300" />
                <span>Passport</span>
              </button>
            </div>

          </div>
        </div>

        {/* Profile Sub-Tabs Navigation */}
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {[
            { id: 'growth', label: 'Growth & Health Tracker', icon: TrendingUp },
            { id: 'timeline', label: 'Care Timeline', icon: Clock },
            { id: 'doctor', label: 'AI Doctor Chat', icon: Bot },
            { id: 'insights', label: 'Botanical Insights', icon: Sparkles },
            { id: 'passport', label: 'Digital Passport', icon: QrCode }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = profileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap
                  ${isActive 
                    ? 'neo-active text-emerald-300' 
                    : 'neo-btn text-slate-300 hover:text-white'}
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 0: Growth Tracker Chart Content */}
        {profileTab === 'growth' && (
          <div className="animate-in fade-in duration-200">
            <GrowthTracker
              plant={selectedPlant}
              logs={logs}
              onUpdateHealthScore={onUpdateHealthScore}
            />
          </div>
        )}

        {/* Tab 1: Timeline Content */}
        {profileTab === 'timeline' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="text-emerald-400" size={16} />
                Recent Care Logs for {selectedPlant.nickname}
              </h3>
              <button 
                onClick={onOpenLogCareModal}
                className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                + Add Care Action
              </button>
            </div>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="relative pl-8 neo-card p-4 rounded-2xl transition-colors"
                >
                  <div className="absolute left-2 top-4 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0d1520] shadow-[0_0_8px_#34d399]"></div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{log.title}</span>
                    <div className="flex items-center gap-2">
                      {log.badgeText && (
                        <span className="text-[10px] font-bold neo-badge text-emerald-300 px-2 py-0.5 rounded-lg">
                          {log.badgeText}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{log.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Embedded Doctor Chat */}
        {profileTab === 'doctor' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-5 neo-inset rounded-2xl space-y-4">
              <div className="h-64 overflow-y-auto space-y-3 p-2 pr-3">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`
                      max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed
                      ${msg.sender === 'user' 
                        ? 'neo-btn-emerald text-slate-950 font-medium rounded-tr-none' 
                        : 'neo-card text-slate-100 rounded-tl-none'}
                    `}>
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-70 block text-right mt-1.5 font-mono">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isDoctorLoading && (
                  <div className="flex items-center gap-2 text-xs text-emerald-300 p-2">
                    <Sparkles className="animate-spin text-teal-300" size={14} /> PlantAI Doctor analyzing biological factors...
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <button 
                  type="button"
                  onClick={() => handleSendDoctorMessage('What is the optimal watering frequency for my Monstera?')}
                  className="text-[11px] px-3 py-1.5 rounded-xl neo-btn text-emerald-300 font-medium whitespace-nowrap"
                >
                  💧 Optimal Watering
                </button>
                <button 
                  type="button"
                  onClick={() => handleSendDoctorMessage('My leaves are developing yellow edges, what should I do?')}
                  className="text-[11px] px-3 py-1.5 rounded-xl neo-btn text-amber-300 font-medium whitespace-nowrap"
                >
                  🍂 Yellow Leaves Diagnosis
                </button>
                <button 
                  type="button"
                  onClick={() => handleSendDoctorMessage('Is my room light level sufficient for steady growth?')}
                  className="text-[11px] px-3 py-1.5 rounded-xl neo-btn text-teal-300 font-medium whitespace-nowrap"
                >
                  ☀️ Light Level Audit
                </button>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="text"
                  placeholder={`Ask PlantAI Doctor about ${selectedPlant.nickname}...`}
                  value={doctorQuery}
                  onChange={(e) => setDoctorQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendDoctorMessage()}
                  className="flex-1 neo-input rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500"
                />
                <button
                  onClick={() => handleSendDoctorMessage()}
                  disabled={isDoctorLoading}
                  className="neo-btn-emerald p-2.5 rounded-2xl"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Insights */}
        {profileTab === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="neo-card p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-teal-300" /> Survival Index Analysis
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full neo-inset flex items-center justify-center font-extrabold text-xl text-emerald-400">
                  85%
                </div>
                <div className="text-xs text-slate-300 space-y-1.5">
                  <p>• Root Aeration Score: <strong className="text-emerald-300">High</strong></p>
                  <p>• Light Consistency: <strong className="text-emerald-300">Optimal</strong></p>
                  <p>• Temperature Variance: <strong className="text-amber-300">Normal</strong></p>
                </div>
              </div>
            </div>

            <div className="neo-card p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Sun size={14} className="text-amber-300" /> Weather & Humidity Sync
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Local microclimate predictions indicate optimal relative humidity for {selectedPlant.nickname}. Recommendation: Maintain steady ambient light and regular moisture checks.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Passport */}
        {profileTab === 'passport' && (
          <div className="neo-card-emerald p-6 rounded-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
                    Botanical Passport #SPEC-{selectedPlant.id.toUpperCase()}
                  </h3>
                  <p className="text-xs text-emerald-200/80">Certified Digital Specimen Record</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="neo-btn px-3.5 py-2 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="neo-inset p-3.5 rounded-xl space-y-1">
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Specimen Nickname</span>
                <span className="text-white font-bold text-sm block">{selectedPlant.nickname}</span>
              </div>

              <div className="neo-inset p-3.5 rounded-xl space-y-1">
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Species Taxonomy</span>
                <span className="text-emerald-300 font-semibold block">{selectedPlant.species}</span>
              </div>

              <div className="neo-inset p-3.5 rounded-xl space-y-1">
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Tracking Duration</span>
                <span className="text-teal-300 font-mono font-bold block">{selectedPlant.daysTracked || 45} Days Tracked</span>
              </div>
            </div>

            {selectedPlant.careNotes && (
              <div className="neo-inset p-4 rounded-xl space-y-1">
                <span className="text-emerald-400 uppercase text-[10px] block font-bold flex items-center gap-1.5">
                  <Sparkles size={12} /> Custom Care Notes & Instructions
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic whitespace-pre-wrap">
                  "{selectedPlant.careNotes}"
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
