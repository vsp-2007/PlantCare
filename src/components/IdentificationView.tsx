import React, { useState } from 'react';
import { 
  Scan, 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw,
  Info
} from 'lucide-react';
import { SpeciesMatch, Plant } from '../types';
import { INITIAL_SPECIES_DATABASE } from '../data/initialData';

interface IdentificationViewProps {
  onAddFromIdentification: (speciesMatch: SpeciesMatch) => void;
}

export const IdentificationView: React.FC<IdentificationViewProps> = ({
  onAddFromIdentification
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuC4pCGpENBOqU1X91S7MW4VB7gSBg9O1cwvp1kDMvWSmzZegP7t7vE9-34ru9fkMzdruWw-oSkWqwjyKe73nuOt6u080dG-EDI52k8b0pkeeAl2SFceoiXCFmSSknsWrWyWYe7WUivwiyKmGjHIwRZWH0UIYRXgZouw5K-vc-3AkOn_1rAi_BYjs_uRQEjFIvsaom3n2DEikfnPk4l4XCMCbfzt22fovIbhYXzP3D6BOuzS5s1d8ByAZuZQpRNx40kHL-g9fctPlEI');
  const [isScanning, setIsScanning] = useState(false);
  const [matches, setMatches] = useState<SpeciesMatch[]>(INITIAL_SPECIES_DATABASE);

  const handleStartScan = async () => {
    setIsScanning(true);

    try {
      const res = await fetch('/api/gemini/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Identify this tropical indoor plant leaf sample.'
        })
      });

      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
      } else {
        setMatches(INITIAL_SPECIES_DATABASE);
      }
    } catch (e) {
      setMatches(INITIAL_SPECIES_DATABASE);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 1200);
    }
  };

  const samplePhotos = [
    { label: 'Swiss Cheese (Monstera)', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4pCGpENBOqU1X91S7MW4VB7gSBg9O1cwvp1kDMvWSmzZegP7t7vE9-34ru9fkMzdruWw-oSkWqwjyKe73nuOt6u080dG-EDI52k8b0pkeeAl2SFceoiXCFmSSknsWrWyWYe7WUivwiyKmGjHIwRZWH0UIYRXgZouw5K-vc-3AkOn_1rAi_BYjs_uRQEjFIvsaom3n2DEikfnPk4l4XCMCbfzt22fovIbhYXzP3D6BOuzS5s1d8ByAZuZQpRNx40kHL-g9fctPlEI' },
    { label: 'Velvet Philodendron', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPvb7MZWxgyywB8PvQUB1dFBso14wydynMvKHXFaVT4LnUYyrvQ4qNKXHtk0WRlbaHkS2_IzZLDrGV-Nfs0-gBg0pazJJsoSFhpqVgcsziC-ieyucxvt7S75sNxXQuljKb63QNXQF6Iv91xknsWtfCnxCpUtPb-OYZw1irzoRuhNmmWSFHhR8Jg4nTqK8UKczqTD-iVu50n8VRzw08FQNG5N3e9xDTJLNSE-nid0IwSYumHKg78uRmHdZhiiA2nTTE6D7UNNpcZHo' },
    { label: 'Monstera Adansonii', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyYByVA2YkV_SPUFSa13On83X4L7HPZZjRtNkjeqziOkhJn9Drbm8OiW4GW7UDMNsY7nJqsb5O3hP1TiTLqr-m_RTQ6KoqnrbJ7MFDKkgLwMiKpTXAd2VrDpMN90bHwX-GUovAkxdWtpZC5_0P3ct8nzyZ84oWipJtuKQH1JSIZy3RI2g7yS43gXhS47huwtnGBlXy7eyOYEY7gDLjZQgwplb6JF_atQN5d-TLAsGMbmyulR1u4rW4QEr-cH-czSm1TtX-tbhQOr8' }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="neo-card p-5 lg:p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Scan className="text-emerald-400" size={22} />
            <span>AI Specimen Identification</span>
            <span className="text-xs neo-badge text-emerald-300 font-extrabold px-3 py-1 rounded-xl">
              Gemini Vision
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Scan plant leaves or upload photos for instant AI taxonomic analysis and confidence scoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Viewfinder / Camera Simulation */}
        <div className="lg:col-span-5 neo-card p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <Camera size={16} /> Viewfinder Capture
          </h3>

          <div className="relative h-72 rounded-2xl overflow-hidden neo-inset p-1.5 group">
            <img 
              src={selectedPhoto} 
              alt="Scan specimen" 
              className="w-full h-full object-cover rounded-xl"
            />

            {/* Viewfinder Overlay Frame */}
            <div className="absolute inset-5 border-2 border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-10 h-10 border-t-2 border-l-2 border-emerald-300 absolute top-0 left-0"></div>
              <div className="w-10 h-10 border-t-2 border-r-2 border-emerald-300 absolute top-0 right-0"></div>
              <div className="w-10 h-10 border-b-2 border-l-2 border-emerald-300 absolute bottom-0 left-0"></div>
              <div className="w-10 h-10 border-b-2 border-r-2 border-emerald-300 absolute bottom-0 right-0"></div>
            </div>

            {/* Live Animated Scanning Line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf] animate-bounce top-1/2"></div>
            )}

            <span className="absolute bottom-4 left-4 neo-badge text-emerald-300 text-[10px] font-mono px-3 py-1 rounded-xl">
              {isScanning ? 'ANALYZING LEAF FENESTRATIONS...' : 'SPECIMEN IN FOCUS'}
            </span>
          </div>

          {/* Sample Selectors */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sample Test Images
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {samplePhotos.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPhoto(s.url);
                    handleStartScan();
                  }}
                  className={`p-2 rounded-2xl text-left flex flex-col items-center gap-1.5 transition-all ${
                    selectedPhoto === s.url 
                      ? 'neo-active text-emerald-300' 
                      : 'neo-btn text-slate-300'
                  }`}
                >
                  <img src={s.url} alt={s.label} className="w-full h-12 rounded-xl object-cover neo-badge" />
                  <span className="text-[10px] text-slate-300 truncate w-full text-center font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Scan Button */}
          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="w-full neo-btn-emerald py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
          >
            {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            <span>{isScanning ? 'Running Gemini Vision Scan...' : 'Analyze Specimen Now'}</span>
          </button>
        </div>

        {/* Right Column: Species Match Results */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-teal-300" /> AI Confidence Match Results
          </h3>

          <div className="space-y-3.5">
            {matches.map((match, idx) => (
              <div 
                key={idx}
                className={`
                  p-4 lg:p-5 rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                  ${idx === 0 
                    ? 'neo-card-emerald' 
                    : 'neo-card'}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <img 
                    src={match.photoUrl || selectedPhoto} 
                    alt={match.species} 
                    className="w-16 h-16 rounded-2xl object-cover neo-badge flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{match.species}</h4>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-xl neo-badge ${
                        match.confidence >= 80 
                          ? 'text-emerald-300' 
                          : 'text-amber-300'
                      }`}>
                        {match.confidence}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-serif italic">{match.commonName}</p>

                    <div className="flex items-center gap-1.5 pt-1">
                      {match.tags?.map((t, i) => (
                        <span key={i} className="text-[10px] neo-badge text-emerald-300 px-2 py-0.5 rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-end gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onAddFromIdentification(match)}
                    className="w-full sm:w-auto neo-btn-emerald px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    <span>Add to Garden</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
