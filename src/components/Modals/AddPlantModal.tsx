import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Upload, Camera, MapPin, Calendar, Info, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { Plant } from '../../types';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (newPlant: Plant) => void;
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onAddPlant
}) => {
  if (!isOpen) return null;

  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('Monstera Deliciosa');
  const [scientificName, setScientificName] = useState('Deliciosa');
  const [location, setLocation] = useState('Living room - north window');
  const [acquiredDate, setAcquiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [latitude, setLatitude] = useState('37.7749');
  const [longitude, setLongitude] = useState('-122.4194');
  const [photoUrl, setPhotoUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuCCMwJCla7dJPo7MDWgljeol0WcOvXHwj3LivMJ8cbiQQ6TPb84beJDVny5KqWx7JXsN9DHaihU-xWOwNuzW0WjZhZKTEwuh6UtxI-Pk58xKFo8ARHi-4WonsYi91PQkyJSK54AG0L3MSAd3Aao5oqKF7R7KAvhn2QgfoAguQPnVF_1wd66-putB31NwYQPYoK2BffiTBuyl06q9HBEKtuFKzXEGfAhnOfj9QyEmfeEO4B5OeZ5Hg5pK4CvOj7wOEK9WByPo4Pk6ds');
  const [sunRequirement, setSunRequirement] = useState('Partial');
  const [careNotes, setCareNotes] = useState('');

  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera stream via MediaDevices API
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream to video ref once rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.error('Video play error:', err));
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera stream error:', err);
      setCameraError(
        err.message || 'Unable to access camera. Please check permissions or select a sample image.'
      );
      setIsCameraActive(false);
    }
  };

  // Capture frame from video to canvas and output Data URL
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoUrl(capturedDataUrl);
    }

    stopCamera();
  };

  // Cleanup camera stream on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    stopCamera();

    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      nickname: nickname.trim(),
      species,
      scientificName,
      location,
      acquiredDate,
      healthScore: 90,
      survivalScore: 90,
      nextCareDue: 'Water in 5 days',
      nextCareDays: 5,
      waterRequirement: 'In 5 days',
      sunRequirement,
      status: 'Healthy',
      photoUrl,
      latitude,
      longitude,
      watersCount: 1,
      fertsCount: 0,
      daysTracked: 1,
      careNotes: careNotes.trim()
    };

    onAddPlant(newPlant);
    onClose();
  };

  const handleSampleImage = (url: string) => {
    stopCamera();
    setPhotoUrl(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 neo-modal overflow-y-auto">
      <div className="neo-card rounded-2xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl neo-inset text-emerald-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Specimen</h2>
              <p className="text-xs text-slate-400">Register a new plant in your digital botanical garden</p>
            </div>
          </div>
          <button 
            onClick={handleCloseModal}
            className="neo-btn p-2 rounded-xl text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 lg:p-6 space-y-4">
          
          {/* Photo Preview, Camera Viewfinder & Sample Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Specimen Photo
              </label>

              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="neo-btn-emerald px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Camera size={14} />
                  <span>Take Photo with Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="neo-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5"
                >
                  <X size={14} />
                  <span>Close Camera</span>
                </button>
              )}
            </div>

            {/* Live Camera Viewfinder */}
            {isCameraActive && (
              <div className="neo-card p-3 rounded-2xl space-y-3 animate-in fade-in">
                <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-emerald-500/30">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>LIVE MEDIA CAMERA</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="neo-btn-emerald px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    <Camera size={16} />
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Camera Error Message */}
            {cameraError && (
              <div className="p-3 neo-badge rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Hidden Canvas for Drawing Photo Frame */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex items-center gap-4 p-3.5 neo-inset rounded-2xl">
              <img 
                src={photoUrl} 
                alt="Preview" 
                className="w-16 h-16 rounded-xl object-cover neo-badge flex-shrink-0"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste image URL, data URL, or use camera above..."
                  className="w-full neo-input rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
                />
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold flex-wrap">
                  <span>Samples:</span>
                  <button 
                    type="button" 
                    onClick={() => handleSampleImage('https://lh3.googleusercontent.com/aida-public/AB6AXuCCMwJCla7dJPo7MDWgljeol0WcOvXHwj3LivMJ8cbiQQ6TPb84beJDVny5KqWx7JXsN9DHaihU-xWOwNuzW0WjZhZKTEwuh6UtxI-Pk58xKFo8ARHi-4WonsYi91PQkyJSK54AG0L3MSAd3Aao5oqKF7R7KAvhn2QgfoAguQPnVF_1wd66-putB31NwYQPYoK2BffiTBuyl06q9HBEKtuFKzXEGfAhnOfj9QyEmfeEO4B5OeZ5Hg5pK4CvOj7wOEK9WByPo4Pk6ds')}
                    className="hover:underline text-emerald-400"
                  >
                    Monstera
                  </button>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={() => handleSampleImage('https://lh3.googleusercontent.com/aida-public/AB6AXuDYLivk5LRbEYKW55MvDTzLhn1FgCBXcz1b0XtYOmTfixn5ssDzMaaz2PC6Kyry3wsGlFR2BeUrHjzuZdJMNzYgdRpJ0AJr4SCNguVrXiBzbogEgK9LAC6JUEPGNOmGQ-z2neBmSw60lZlccl9Pd8d9GKpQ8KhjyMC8awaaZweMd9t_SkZvWzHBa8ZwVqQ7lkH9dUUIsNoE6oGxHtZL7-nngo_95U-M3TaRKMt3Nc2-NXTJZ91eWgtrBv5eMGIGN0lYMbAdtvC0Udc')}
                    className="hover:underline text-emerald-400"
                  >
                    Calathea
                  </button>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={() => handleSampleImage('https://lh3.googleusercontent.com/aida-public/AB6AXuBG5V2uyZuKp1JAb93dUnvs00RRZUiDyN7duenCEQA8jFl0Yf7pX5DHJEFa78oLGdfJbNmAjXXDVHf5LcvLxY-LrJIxl5TSsA79IELLkqplMbeFOjpfRRAT5WKVld4uqldmLZG2GPKNh2O24A_37D6U8KX-w5RuCOnaRACtinvIPR5-lGo_MEpw68BvXf2tDq_th9tBsyyrRL4jj8QTimyOiixpmyHj0SQJiKVjJRtBSiuLhzkIQjFm7JjWmKIf9mmvu_vMWQ0VhJ0')}
                    className="hover:underline text-emerald-400"
                  >
                    Olive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Nickname & Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Plant Nickname *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Monty, Sunny..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full neo-input rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Botanical Species
              </label>
              <input
                type="text"
                placeholder="e.g. Monstera deliciosa"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full neo-input rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Location & Acquisition Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Micro-Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Living room north window"
                  className="w-full neo-input rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Acquisition Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                <input
                  type="date"
                  value={acquiredDate}
                  onChange={(e) => setAcquiredDate(e.target.value)}
                  className="w-full neo-input rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Light Requirement & Geo Lat/Lng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Sunlight Needs
              </label>
              <select
                value={sunRequirement}
                onChange={(e) => setSunRequirement(e.target.value)}
                className="w-full neo-input rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-semibold"
              >
                <option value="Partial" className="bg-slate-900 text-slate-100">Partial Indirect</option>
                <option value="Direct" className="bg-slate-900 text-slate-100">Full Direct Sun</option>
                <option value="Shade" className="bg-slate-900 text-slate-100">Deep Shade / Low Light</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full neo-input rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full neo-input rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Care Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Custom Care Notes & Instructions
            </label>
            <textarea
              rows={3}
              value={careNotes}
              onChange={(e) => setCareNotes(e.target.value)}
              placeholder="Add specific watering instructions, potting history, soil mix details, or light preferences for this plant..."
              className="w-full neo-input rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 leading-relaxed resize-none"
            />
          </div>

          {/* Floating AI Tip Box */}
          <div className="p-4 neo-badge rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-300">
              <span className="font-bold text-white block mb-0.5">Did you know?</span>
              Setting precise micro-locations allows PlantCare Pro to synthesize local weather API data for automatic humidity & UV risk warnings.
            </div>
          </div>

          {/* Actions */}
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
              Register Specimen
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
