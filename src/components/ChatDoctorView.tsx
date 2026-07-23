import React, { useState } from 'react';
import { Bot, Send, Sparkles, RefreshCw, Sprout, ShieldAlert, Heart, Info } from 'lucide-react';
import { Plant, ChatMessage } from '../types';

interface ChatDoctorViewProps {
  plants: Plant[];
  selectedPlant: Plant;
  onSelectPlant: (p: Plant) => void;
  onOpenRescueModal: () => void;
}

export const ChatDoctorView: React.FC<ChatDoctorViewProps> = ({
  plants,
  selectedPlant,
  onSelectPlant,
  onOpenRescueModal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: `Welcome to PlantAI Doctor! I am analyzing biological factors for ${selectedPlant.nickname} (${selectedPlant.species}). How can I help resolve leaf issues, optimize lighting, or advise on watering?`,
      timestamp: '10:00 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customMessage) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          plantName: selectedPlant.nickname,
          plantSpecies: selectedPlant.species,
          history: messages
        })
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || `Based on botanical parameters for ${selectedPlant.species}, maintain indirect sunlight and ensure the top 2 inches of soil dry between deep waterings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `For ${selectedPlant.nickname} (${selectedPlant.species}), standard care guidelines recommend indirect light, high humidity, and checking soil moisture before watering.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 neo-inset text-emerald-400 rounded-2xl font-bold">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <span>PlantAI Doctor Consultation</span>
              <span className="text-xs neo-badge text-emerald-300 font-extrabold px-3 py-1 rounded-xl">
                Gemini 3.6 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time botanical diagnosis, pest identification & care advice</p>
          </div>
        </div>

        {/* Specimen Context Selector */}
        <div className="flex items-center gap-2 neo-inset p-2 rounded-2xl">
          <span className="text-xs text-slate-300 font-bold pl-2">Context:</span>
          <select
            value={selectedPlant.id}
            onChange={(e) => {
              const found = plants.find(p => p.id === e.target.value);
              if (found) onSelectPlant(found);
            }}
            className="neo-input rounded-xl px-3 py-1.5 text-xs text-slate-100 font-semibold"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                {p.nickname} ({p.species})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="neo-card rounded-2xl p-5 lg:p-6 space-y-4">
        
        {/* Messages Scroll Area */}
        <div className="h-[420px] overflow-y-auto space-y-4 p-4 rounded-2xl neo-inset">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`
                max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed
                ${msg.sender === 'user' 
                  ? 'neo-card-emerald text-white rounded-tr-none' 
                  : 'neo-card text-slate-100 rounded-tl-none'}
              `}>
                <div className="flex items-center gap-2 mb-1 opacity-90 text-[10px] uppercase tracking-wider font-extrabold">
                  {msg.sender === 'bot' ? (
                    <span className="text-emerald-300 flex items-center gap-1.5"><Sparkles size={12} /> PlantAI Doctor</span>
                  ) : (
                    <span className="text-teal-200">You</span>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="text-[9px] text-slate-400 block text-right mt-1.5 font-mono">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-emerald-300 p-3 rounded-xl neo-badge">
              <RefreshCw className="animate-spin" size={16} />
              <span>Analyzing leaf diagnostics and humidity factors with Gemini...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="pt-2 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Suggested Diagnostic Queries
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleSendMessage(`What are the ideal temperature and humidity ranges for ${selectedPlant.nickname}?`)}
              className="text-xs px-3.5 py-2 rounded-xl neo-btn text-slate-200 whitespace-nowrap font-medium"
            >
              🌡️ Temp & Humidity Ranges
            </button>
            <button
              onClick={() => handleSendMessage(`How do I prevent root rot in ${selectedPlant.species}?`)}
              className="text-xs px-3.5 py-2 rounded-xl neo-btn text-slate-200 whitespace-nowrap font-medium"
            >
              🪴 Root Rot Prevention
            </button>
            <button
              onClick={onOpenRescueModal}
              className="text-xs px-3.5 py-2 rounded-xl neo-btn text-rose-300 whitespace-nowrap font-bold"
            >
              🚨 Emergency Rescue Protocol
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="text"
            placeholder={`Ask a question about ${selectedPlant.nickname}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 neo-input rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl neo-btn-emerald text-xs font-bold flex items-center gap-2"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

      </div>
    </div>
  );
};
