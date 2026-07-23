import React from 'react';
import { HelpCircle, BookOpen, Droplets, Sun, Sparkles, ShieldAlert, Sprout } from 'lucide-react';

export const SupportView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <BookOpen className="text-emerald-400" size={22} />
          <span>Botanical Guide & User Documentation</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Mastering indoor plant care, diagnostics, emergency rescue, and AI features</p>
      </div>

      {/* Quick Start Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="neo-card p-5 lg:p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
            <Droplets size={16} /> The Finger-Test Water Rule
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Never water strictly by calendar date alone! Insert your index finger 2 inches into the potting soil. If soil clings to your finger and feels cool, wait 2-3 days. If bone dry, water deeply until drainage occurs.
          </p>
        </div>

        <div className="neo-card p-5 lg:p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Sun size={16} /> Understanding "Bright Indirect" Light
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            "Bright indirect" light means your plant can see the blue sky from its spot, but rays from the sun do not hit the leaves directly for more than 1 hour. Direct beam light through glass burns waxy tropical foliage.
          </p>
        </div>
      </div>

      {/* Emergency Rescue Protocol Steps */}
      <div className="neo-card-rose p-5 lg:p-6 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
          <ShieldAlert size={16} /> Emergency Rescue Protocol Steps
        </h3>
        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed font-medium">
          <li><strong>Identify the Symptom:</strong> Severe wilting with bone dry soil requires bottom soaking. Yellow soft stems require immediate unpotting and root rot pruning.</li>
          <li><strong>Launch Protocol Timer:</strong> Use the <i>Emergency Rescue</i> button to begin the live stopwatch.</li>
          <li><strong>Execute 20-min Bottom Soak:</strong> Submerge the pot base in room-temperature water so roots absorb moisture via capillary action without disturbing topsoil.</li>
          <li><strong>Schedule 48-Hour Re-check:</strong> Keep plant in medium indirect light to recover.</li>
        </ol>
      </div>

    </div>
  );
};
