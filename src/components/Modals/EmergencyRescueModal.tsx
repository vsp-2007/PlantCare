import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Timer, CheckCircle, Lock, AlertTriangle, MessageSquare, BellRing, Sparkles } from 'lucide-react';

interface EmergencyRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName?: string;
  onResolveRescue?: () => void;
}

export const EmergencyRescueModal: React.FC<EmergencyRescueModalProps> = ({
  isOpen,
  onClose,
  plantName = 'Fiddle Leaf Fig',
  onResolveRescue
}) => {
  if (!isOpen) return null;

  const [seconds, setSeconds] = useState(165); // 02:45 initial
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [stage1Done, setStage1Done] = useState(false);
  const [stage2Done, setStage2Done] = useState(false);
  const [stage3Done, setStage3Done] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinishRescue = () => {
    if (onResolveRescue) onResolveRescue();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 neo-modal overflow-y-auto">
      <div className="neo-card-rose rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="p-5 lg:p-6 border-b border-rose-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl neo-badge text-rose-400 animate-pulse">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-widest neo-badge px-2.5 py-1 rounded-lg">
                  Critical Intervention
                </span>
                <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5 font-bold">
                  <Timer size={14} className="text-rose-400" /> Stopwatch: <strong className="text-white">{formatTimer(seconds)}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Emergency Rescue: <span className="text-rose-300">{plantName}</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="neo-btn p-2 rounded-xl text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Protocol Stages */}
        <div className="p-5 lg:p-6 space-y-5">
          
          {/* Progress Tabs */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setActiveStage(1)}
              className={`p-3 rounded-2xl text-left transition-all ${
                activeStage === 1 
                  ? 'neo-active text-rose-300 font-bold' 
                  : stage1Done 
                    ? 'neo-btn text-emerald-400 font-bold' 
                    : 'neo-btn text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Stage 1</span>
                {stage1Done ? <CheckCircle size={14} className="text-emerald-400" /> : <span>Assess</span>}
              </div>
              <div className="text-xs text-slate-200">Soil & Root Check</div>
            </button>

            <button
              onClick={() => stage1Done && setActiveStage(2)}
              disabled={!stage1Done}
              className={`p-3 rounded-2xl text-left transition-all ${
                !stage1Done ? 'opacity-40 cursor-not-allowed neo-inset' :
                activeStage === 2 
                  ? 'neo-active text-amber-300 font-bold' 
                  : stage2Done 
                    ? 'neo-btn text-emerald-400 font-bold' 
                    : 'neo-btn text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Stage 2</span>
                {stage2Done ? <CheckCircle size={14} className="text-emerald-400" /> : !stage1Done ? <Lock size={12} /> : <span>Act</span>}
              </div>
              <div className="text-xs text-slate-200">Bottom Soaking</div>
            </button>

            <button
              onClick={() => stage2Done && setActiveStage(3)}
              disabled={!stage2Done}
              className={`p-3 rounded-2xl text-left transition-all ${
                !stage2Done ? 'opacity-40 cursor-not-allowed neo-inset' :
                activeStage === 3 
                  ? 'neo-active text-teal-300 font-bold' 
                  : stage3Done 
                    ? 'neo-btn text-emerald-400 font-bold' 
                    : 'neo-btn text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Stage 3</span>
                {stage3Done ? <CheckCircle size={14} className="text-emerald-400" /> : !stage2Done ? <Lock size={12} /> : <span>Monitor</span>}
              </div>
              <div className="text-xs text-slate-200">Post Care</div>
            </button>
          </div>

          {/* Stage 1 Content */}
          {activeStage === 1 && (
            <div className="neo-inset p-4.5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle size={16} /> Stage 1: Diagnostic Soil & Foliage Inspection
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check for crispy leaf margins vs. mushy yellow stems. Insert finger 2 inches into root ball.
              </p>
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer font-semibold">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-700 accent-emerald-400 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) setStage1Done(true);
                    }}
                  />
                  <span>Confirmed root ball hydrophobic desiccation. Clear for deep rehydration.</span>
                </label>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStage1Done(true);
                    setActiveStage(2);
                  }}
                  className="neo-btn-rose px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Proceed to Stage 2 (Bottom Soak)
                </button>
              </div>
            </div>
          )}

          {/* Stage 2 Content */}
          {activeStage === 2 && (
            <div className="neo-inset p-4.5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Timer size={16} /> Stage 2: 20-Minute Bottom Hydration Soak
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Place the pot in a lukewarm basin of room temperature water (3-4 inches deep). Allow capillary action to draw water up to the roots for 20 minutes.
              </p>
              <div className="p-3.5 neo-badge rounded-xl text-xs text-amber-300 font-bold">
                ⚡ Active Timer Running: Keep pot submerged until soil surface feels cool & damp.
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStage2Done(true);
                    setActiveStage(3);
                  }}
                  className="neo-btn px-4 py-2.5 rounded-xl text-xs font-bold text-amber-300"
                >
                  Mark Bottom Soak Complete
                </button>
              </div>
            </div>
          )}

          {/* Stage 3 Content */}
          {activeStage === 3 && (
            <div className="neo-inset p-4.5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                <BellRing size={16} /> Stage 3: Post-Intervention Monitoring
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Move plant away from direct harsh sun for 48 hours to prevent transpiration shock. Set a 48-hour check-in reminder.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReminderSet(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    reminderSet 
                      ? 'neo-active text-emerald-300' 
                      : 'neo-btn text-slate-200'
                  }`}
                >
                  {reminderSet ? '✓ Reminder Scheduled for 48h' : '+ Schedule 48h Follow-up Check'}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              Close Protocol
            </button>

            <button
              type="button"
              onClick={handleFinishRescue}
              className="neo-btn-emerald px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle size={16} />
              <span>Mark Rescue Resolved</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
