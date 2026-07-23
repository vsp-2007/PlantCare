import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Database, 
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { Plant } from '../types';

interface SettingsViewProps {
  plants: Plant[];
  onResetData: () => void;
  onOpenDeleteModal: (p: Plant) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  plants,
  onResetData,
  onOpenDeleteModal
}) => {
  const [geminiKeySet, setGeminiKeySet] = useState(true);
  const [weatherApiEnabled, setWeatherApiEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [exportMessage, setExportMessage] = useState('');

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plants, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `plantcare_pro_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportMessage('Backup downloaded successfully!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Settings className="text-emerald-400" size={22} />
            <span>Settings & System Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage integrations, API keys, data backups, and garden management</p>
        </div>
      </div>

      {/* AI Integrations Status */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
          <Key size={16} /> Integrations & Secrets Panel
        </h3>

        <div className="space-y-3.5">
          <div className="p-4 neo-inset rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 neo-badge text-emerald-400 rounded-xl">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Google Gemini AI Engine</h4>
                <p className="text-xs text-slate-400">Used for Plant Doctor conversation and Vision Species Identification</p>
              </div>
            </div>

            <span className="text-xs font-extrabold text-emerald-300 neo-badge px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" /> Server Active
            </span>
          </div>

          <div className="p-4 neo-inset rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 neo-badge text-blue-400 rounded-xl">
                <Database size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Local Microclimate Weather Sync</h4>
                <p className="text-xs text-slate-400">Auto-adjusts care reminders based on outdoor humidity & UV</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={weatherApiEnabled} 
                onChange={(e) => setWeatherApiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 neo-inset rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-emerald-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
          <Database size={16} /> Garden Data Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExportData}
            className="p-4 rounded-2xl neo-btn text-left space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Download size={16} className="text-emerald-400" /> Export JSON Backup
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Download all plants, care logs, and history as a JSON file</p>
          </button>

          <button
            onClick={onResetData}
            className="p-4 rounded-2xl neo-btn text-left space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <RotateCcw size={16} className="text-rose-400" /> Reset Default Database
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Restore initial sample garden (Monty, Calathea, Olive, etc.)</p>
          </button>
        </div>

        {exportMessage && (
          <div className="p-3.5 neo-badge text-emerald-300 text-xs font-bold rounded-2xl">
            {exportMessage}
          </div>
        )}
      </div>

      {/* Plant Management List */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
          Registered Garden Specimens ({plants.length})
        </h3>

        <div className="space-y-2.5">
          {plants.map((p) => (
            <div
              key={p.id}
              className="p-3.5 neo-inset rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <img src={p.photoUrl} alt={p.nickname} className="w-10 h-10 rounded-xl object-cover neo-badge" />
                <div>
                  <h4 className="text-xs font-bold text-white">{p.nickname}</h4>
                  <p className="text-[11px] text-slate-400 italic">{p.species}</p>
                </div>
              </div>

              <button
                onClick={() => onOpenDeleteModal(p)}
                className="neo-btn p-2.5 text-rose-400 rounded-xl"
                title="Remove plant"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
