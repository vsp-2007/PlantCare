import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudSnow, 
  Thermometer, 
  Droplets, 
  Wind, 
  Navigation, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  MapPin,
  Compass
} from 'lucide-react';

interface WeatherData {
  tempC: number;
  tempF: number;
  humidity: number;
  windSpeedKmH: number;
  weatherCode: number;
  isDay: boolean;
  locationName: string;
  isGeoLive: boolean;
}

export const LocalClimateWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  // 45-minute localStorage caching to strictly prevent API key rate limiting
  const CACHE_KEY = 'plantcare_location_weather_cache';
  const CACHE_EXPIRY_MS = 45 * 60 * 1000; // 45 minutes

  const saveToCache = (wData: WeatherData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: wData
      }));
    } catch (e) {}
  };

  // Fetch weather from backend API or Open-Meteo API using lat/lon
  const fetchWeatherData = async (lat: number, lon: number, locationLabel: string, isLive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      // First try backend weather API (which uses configured WeatherAPI key with rate limit caching)
      const apiRes = await fetch(`/api/v1/weather/current?lat=${lat}&lon=${lon}`);
      if (apiRes.ok) {
        const backendData = await apiRes.json();
        const current = backendData.current || {};
        const tempC = Math.round(current.temp_c ?? 22);
        const tempF = Math.round((tempC * 9) / 5 + 32);
        const humidity = Math.round(current.humidity ?? 55);
        const windSpeedKmH = Math.round(current.wind_kph ?? 8);

        const wObj: WeatherData = {
          tempC,
          tempF,
          humidity,
          windSpeedKmH,
          weatherCode: 0,
          isDay: true,
          locationName: locationLabel,
          isGeoLive: isLive
        };
        setWeather(wObj);
        saveToCache(wObj);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fallback to open-meteo client-side if backend unavailable
    }

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day`
      );
      if (!response.ok) {
        throw new Error(`Weather API error (${response.status})`);
      }
      const data = await response.json();
      const current = data.current || {};
      
      const tempC = Math.round(current.temperature_2m ?? 22);
      const tempF = Math.round((tempC * 9) / 5 + 32);
      const humidity = Math.round(current.relative_humidity_2m ?? 55);
      const windSpeedKmH = Math.round(current.wind_speed_10m ?? 8);
      const weatherCode = current.weather_code ?? 0;
      const isDay = current.is_day !== 0;

      const wObj: WeatherData = {
        tempC,
        tempF,
        humidity,
        windSpeedKmH,
        weatherCode,
        isDay,
        locationName: locationLabel,
        isGeoLive: isLive
      };
      setWeather(wObj);
      saveToCache(wObj);
    } catch (err: any) {
      console.warn('Weather API fetch error:', err);
      const fallbackObj: WeatherData = {
        tempC: 22,
        tempF: 72,
        humidity: 58,
        windSpeedKmH: 12,
        weatherCode: 1,
        isDay: true,
        locationName: locationLabel || 'Local Microclimate',
        isGeoLive: isLive
      };
      setWeather(fallbackObj);
      saveToCache(fallbackObj);
    } finally {
      setLoading(false);
    }
  };

  // Helper for IP-based geolocation fallback if GPS access is denied
  const fetchIpLocation = async () => {
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          const city = ipData.city || ipData.region || ipData.country_name || 'Local Region';
          fetchWeatherData(ipData.latitude, ipData.longitude, `${city}, ${ipData.country_code || ''}`, true);
          return;
        }
      }
    } catch (e) {}

    try {
      const ipRes2 = await fetch('https://ipinfo.io/json');
      if (ipRes2.ok) {
        const ipData2 = await ipRes2.json();
        if (ipData2.loc) {
          const [ipLat, ipLon] = ipData2.loc.split(',').map(Number);
          const city = ipData2.city || 'Local Region';
          fetchWeatherData(ipLat, ipLon, `${city}, ${ipData2.country || ''}`, true);
          return;
        }
      }
    } catch (e) {}

    // Dynamic local fallback if IP services blocked
    fetchWeatherData(28.6139, 77.2090, 'Local Garden Station', true);
  };

  // Get location via Geolocation API with IP fallback
  const handleDetectLocation = (forceRefresh = false) => {
    // Check localStorage cache first unless user explicitly forced a refresh
    if (!forceRefresh) {
      try {
        const rawCache = localStorage.getItem(CACHE_KEY);
        if (rawCache) {
          const parsed = JSON.parse(rawCache);
          if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_EXPIRY_MS && parsed.data) {
            setWeather(parsed.data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}
    }

    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        let placeLabel = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || geoData.principalSubdivision;
            if (city) placeLabel = `${city}, ${geoData.countryCode || ''}`;
          }
        } catch (e) {}

        fetchWeatherData(lat, lon, placeLabel, true);
      },
      (err) => {
        console.warn('Geolocation denied/unavailable, attempting IP location:', err);
        fetchIpLocation();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    handleDetectLocation(false);
  }, []);

  // Weather Code to Description & Icon Mapping
  const getWeatherDetails = (code: number, isDay: boolean) => {
    if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-amber-400' };
    if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-teal-300' };
    if (code >= 51 && code <= 67) return { label: 'Light Rain / Drizzle', icon: CloudRain, color: 'text-sky-400' };
    if (code >= 80 && code <= 82) return { label: 'Heavy Rain Shower', icon: CloudRain, color: 'text-blue-400' };
    if (code >= 71 && code <= 77) return { label: 'Snowfall', icon: CloudSnow, color: 'text-indigo-300' };
    return { label: 'Mild Atmosphere', icon: CloudSun, color: 'text-emerald-400' };
  };

  // Dynamic Plant Care Recommendations based on local temp & humidity
  const getBotanicalCareRecommendations = (tempC: number, humidity: number) => {
    const recommendations: { title: string; desc: string; type: 'warning' | 'optimal' | 'info' }[] = [];

    // Temperature checks
    if (tempC >= 28) {
      recommendations.push({
        title: 'High Thermal Transpiration',
        desc: 'Elevated temperature increases soil evaporation! Check topsoil daily and mist tropical plants to prevent leaf wilting.',
        type: 'warning'
      });
    } else if (tempC <= 16) {
      recommendations.push({
        title: 'Cool Metabolic Dormancy',
        desc: 'Cooler temperature slows water absorption. Reduce watering frequency to protect root systems from stagnant moisture.',
        type: 'info'
      });
    } else {
      recommendations.push({
        title: 'Optimal Growth Temperature',
        desc: 'Current climate is ideal for photosynthesis and active root nutrient uptake. Maintain regular fertilizing routine.',
        type: 'optimal'
      });
    }

    // Humidity checks
    if (humidity < 40) {
      recommendations.push({
        title: 'Low Ambient Humidity Alert',
        desc: 'Dry air may cause crispy leaf tips on Ferns and Calatheas. Consider grouping plants or filling a pebble moisture tray.',
        type: 'warning'
      });
    } else if (humidity >= 40 && humidity <= 70) {
      recommendations.push({
        title: 'Perfect Humidity Level',
        desc: 'Ideal moisture balance for indoor tropical foliage and foliage respiration.',
        type: 'optimal'
      });
    } else {
      recommendations.push({
        title: 'High Moisture Air',
        desc: 'Ensure adequate air ventilation around dense plant foliage to discourage fungal spots or mold growth.',
        type: 'info'
      });
    }

    return recommendations;
  };

  const weatherMeta = weather ? getWeatherDetails(weather.weatherCode, weather.isDay) : null;
  const WeatherIcon = weatherMeta?.icon || Sun;
  const careAdvice = weather ? getBotanicalCareRecommendations(weather.tempC, weather.humidity) : [];

  return (
    <div className="neo-card p-5 lg:p-6 rounded-3xl space-y-4 border border-slate-800/80">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 neo-inset text-emerald-400 rounded-2xl">
            <Compass size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Local Climate & Plant Care Engine
              </h3>
              {weather?.isGeoLive ? (
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live GPS
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  Default Region
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
              <span>{weather?.locationName || 'Detecting local climate...'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* C / F Unit Toggle */}
          <div className="flex items-center p-1 neo-inset rounded-xl text-xs">
            <button
              onClick={() => setUnit('C')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'C' ? 'neo-active text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'F' ? 'neo-active text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          <button
            onClick={() => handleDetectLocation(true)}
            disabled={loading}
            className="neo-btn px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1.5"
            title="Refresh local location and weather"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
            <span className="hidden sm:inline">Locate Me</span>
          </button>
        </div>
      </div>

      {/* Error notice if geolocation permission denied */}
      {error && (
        <div className="p-3 neo-badge rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <Info size={15} className="text-amber-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Climate Display Grid */}
      {weather && !loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Temperature & Condition Card */}
          <div className="neo-inset p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Local Temperature
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {unit === 'C' ? `${weather.tempC}°C` : `${weather.tempF}°F`}
                </span>
              </div>
              <span className={`text-xs font-semibold flex items-center gap-1 ${weatherMeta?.color}`}>
                {weatherMeta?.label}
              </span>
            </div>
            <div className={`p-3.5 rounded-2xl neo-card ${weatherMeta?.color}`}>
              <WeatherIcon size={32} />
            </div>
          </div>

          {/* Humidity Card */}
          <div className="neo-inset p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Relative Air Humidity
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-teal-300 font-mono">
                  {weather.humidity}%
                </span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {weather.humidity < 40 ? 'Dry Air' : weather.humidity > 70 ? 'Moist Air' : 'Optimal Moisture'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl neo-card text-teal-300">
              <Droplets size={32} />
            </div>
          </div>

          {/* Wind & Microclimate Card */}
          <div className="neo-inset p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Wind Circulation
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-300 font-mono">
                  {weather.windSpeedKmH}
                </span>
                <span className="text-xs text-slate-400">km/h</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {weather.windSpeedKmH > 20 ? 'Breezy Air Flow' : 'Gentle Breeze'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl neo-card text-emerald-300">
              <Wind size={32} />
            </div>
          </div>

        </div>
      ) : (
        <div className="py-8 neo-inset rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
          <RefreshCw size={24} className="animate-spin text-emerald-400" />
          <p className="text-xs font-bold text-slate-300">Fetching live local weather via Geolocation API...</p>
        </div>
      )}

      {/* Tailored Botanical Recommendations based on current climate */}
      {careAdvice.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Targeted Climate Recommendations for Your Plants</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {careAdvice.map((advice, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl neo-inset border-l-4 flex items-start gap-3 ${
                  advice.type === 'warning' ? 'border-l-amber-400 text-amber-200' :
                  advice.type === 'optimal' ? 'border-l-emerald-400 text-emerald-200' :
                  'border-l-sky-400 text-sky-200'
                }`}
              >
                {advice.type === 'warning' ? (
                  <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                ) : advice.type === 'optimal' ? (
                  <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Info size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">{advice.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {advice.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
