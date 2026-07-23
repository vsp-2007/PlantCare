import React, { useState } from 'react';
import { X, Droplets, Sparkles, Scissors, RefreshCw, Move, Check, Clock, Calendar } from 'lucide-react';
import { CareLogEntry, CareActionType } from '../../types';

interface LogCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantName: string;
  plantId: string;
  onAddLog: (log: CareLogEntry) => void;
}

export const LogCareModal: React.FC<LogCareModalProps> = ({
  isOpen,
  onClose,
  plantName,
  plantId,
  onAddLog
}) => {
  if (!isOpen) return null;

  const [selectedType, setSelectedType] = useState<CareActionType>('water');
  const [waterVolume, setWaterVolume] = useState('500ml');
  const [fertilizerType, setFertilizerType] = useState('10-10-10 Liquid NPK (Half Strength)');
  const [note, setNote] = useState('');
  const [customTime, setCustomTime] = useState('Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let title = 'Watered';
    let typeTag: CareLogEntry['type'] = 'Watered';
    let badgeText = 'Routine';

    if (selectedType === 'fertilize') {
      title = 'Fertilized';
      typeTag = 'Fertilized';
      badgeText = 'Nutrition';
    } else if (selectedType === 'prune') {
      title = 'Pruned foliage';
      typeTag = 'Pruned';
      badgeText = 'Maintenance';
    } else if (selectedType === 'repot') {
      title = 'Repotted specimen';
      typeTag = 'Repotted';
      badgeText = 'Growth';
    } else if (selectedType === 'move') {
      title = 'Relocated position';
      typeTag = 'Moved';
      badgeText = 'Environment';
    } else if (selectedType === 'inspect') {
      title = 'Pest & Soil Inspection';
      typeTag = 'Inspected';
      badgeText = 'Health Check';
    }

    const finalNote = note.trim() || (
      selectedType === 'water' ? `Given ${waterVolume} of filtered water. Soil checked.` :
      selectedType === 'fertilize' ? `Fed with ${fertilizerType}.` :
      `Care action ${selectedType} logged for ${plantName}.`
    );

    const logEntry: CareLogEntry = {
      id: `log-${Date.now()}`,
      plantId,
      type: typeTag,
      title,
      timestamp: customTime,
      note: finalNote,
      badgeText
    };

    onAddLog(logEntry);
    onClose();
  };

  const actionTypes = [
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-blue-400' },
    { id: 'fertilize', label: 'Fertilize', icon: Sparkles, color: 'text-amber-400' },
    { id: 'prune', label: 'Prune', icon: Scissors, color: 'text-emerald-400' },
    { id: 'repot', label: 'Repot', icon: RefreshCw, color: 'text-teal-400' },
    { id: 'move', label: 'Move', icon: Move, color: 'text-purple-400' },
    { id: 'inspect', label: 'Inspect', icon: Check, color: 'text-emerald-300' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 neo-modal overflow-y-auto">
      <div className="neo-card rounded-2xl w-full max-w-lg text-slate-100 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Droplets className="text-blue-400" size={20} />
              Log Care Action
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Recording care event for <span className="text-emerald-300 font-bold">{plantName}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="neo-btn p-2 rounded-xl text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 lg:p-6 space-y-4">
          
          {/* Action Grid */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Care Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {actionTypes.map((action) => {
                const Icon = action.icon;
                const isSelected = selectedType === action.id;
                return (
                  <button
                    type="button"
                    key={action.id}
                    onClick={() => setSelectedType(action.id as CareActionType)}
                    className={`
                      p-3 rounded-2xl text-left flex flex-col items-start gap-1.5 transition-all
                      ${isSelected 
                        ? `neo-active ${action.color} font-bold` 
                        : 'neo-btn text-slate-300'}
                    `}
                  >
                    <Icon size={18} />
                    <span className="text-xs">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Action Fields */}
          {selectedType === 'water' && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Water Volume
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['250ml', '500ml', '750ml', '1000ml'].map((vol) => (
                  <button
                    type="button"
                    key={vol}
                    onClick={() => setWaterVolume(vol)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      waterVolume === vol 
                        ? 'neo-active text-blue-300' 
                        : 'neo-btn text-slate-300'
                    }`}
                  >
                    {vol}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedType === 'fertilize' && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Fertilizer Formula
              </label>
              <input
                type="text"
                value={fertilizerType}
                onChange={(e) => setFertilizerType(e.target.value)}
                className="w-full neo-input rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
              />
            </div>
          )}

          {/* Timestamp Picker */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Timestamp
              </label>
              <button
                type="button"
                onClick={() => setCustomTime('Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Clock size={12} /> Set to NOW
              </button>
            </div>
            <input
              type="text"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full neo-input rounded-xl px-3.5 py-2.5 text-sm text-slate-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Care Notes & Soil Observations
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Soil was dry down to 2 inches. Leaves wiped free of dust."
              className="w-full neo-input rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neo-btn-emerald px-5 py-2.5 rounded-2xl text-xs font-bold"
            >
              Save Care Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
