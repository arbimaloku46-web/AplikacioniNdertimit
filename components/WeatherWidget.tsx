import React, { useState, useEffect } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherWidgetProps {
  location: string;
  date?: string;
}

interface ForecastData {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  forecast?: ForecastData[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, date }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      if (!location) {
          if (mounted) setLoading(false);
          return;
      }
      setLoading(true);
      setError(false);
      try {
        // Step 1: Geocoding
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('Location not found');
        }

        const { latitude, longitude } = geoData.results[0];

        // Step 2: Weather Forecast or Historical
        let weatherData: any;
        const today = new Date().toISOString().split('T')[0];
        const targetDate = date || today;

        if (targetDate < today) {
            // Historical
            const weatherResponse = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${targetDate}&end_date=${targetDate}&daily=temperature_2m_max,weather_code,wind_speed_10m_max&timezone=auto`);
            weatherData = await weatherResponse.json();
            
            if (mounted && weatherData.daily && weatherData.daily.time && weatherData.daily.time.length > 0) {
              setWeather({
                temperature: weatherData.daily.temperature_2m_max[0],
                weatherCode: weatherData.daily.weather_code[0],
                windSpeed: weatherData.daily.wind_speed_10m_max[0],
              });
            } else {
               throw new Error('Historical data not available');
            }
        } else if (targetDate === today) {
            // Current live + 3 day forecast
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=celsius&wind_speed_unit=kmh&forecast_days=4&timezone=auto`);
            weatherData = await weatherResponse.json();
            if (mounted && weatherData.current) {
              let forecast: ForecastData[] | undefined;
              if (weatherData.daily && weatherData.daily.time.length > 1) {
                forecast = weatherData.daily.time.slice(1, 4).map((time: string, index: number) => ({
                  date: time,
                  temperatureMax: weatherData.daily.temperature_2m_max[index + 1],
                  temperatureMin: weatherData.daily.temperature_2m_min[index + 1],
                  weatherCode: weatherData.daily.weather_code[index + 1],
                }));
              }

              setWeather({
                temperature: weatherData.current.temperature_2m,
                weatherCode: weatherData.current.weather_code,
                windSpeed: weatherData.current.wind_speed_10m,
                forecast: forecast,
              });
            }
        } else {
             // Future forecast
             const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${targetDate}&end_date=${targetDate}&daily=temperature_2m_max,weather_code,wind_speed_10m_max&timezone=auto`);
             weatherData = await weatherResponse.json();
             if (mounted && weatherData.daily && weatherData.daily.time && weatherData.daily.time.length > 0) {
              setWeather({
                temperature: weatherData.daily.temperature_2m_max[0],
                weatherCode: weatherData.daily.weather_code[0],
                windSpeed: weatherData.daily.wind_speed_10m_max[0],
              });
            } else {
               throw new Error('Forecast data not available');
            }
        }

      } catch (err) {
        console.error('Failed to fetch weather:', err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeather();

    return () => {
      mounted = false;
    };
  }, [location, date]);

  if (loading) {
    return (
      <div className="bg-white/5 p-3 md:p-6 rounded-2xl animate-pulse flex flex-col justify-between h-full min-h-[80px] w-full">
        <span className="text-[8px] text-slate-500 font-extrabold tracking-tight uppercase block mb-1">Live Weather</span>
        <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white/5 p-3 md:p-6 rounded-2xl flex flex-col justify-between h-full min-h-[80px] w-full">
        <span className="text-[8px] text-slate-500 font-extrabold tracking-tight uppercase block mb-1">Live Weather</span>
        <span className="text-white text-xs font-extrabold tracking-tight">Unavailable</span>
      </div>
    );
  }

  // Map WMO weather codes to lucide-react icons and descriptions
  const getWeatherIconAndDesc = (code: number, className = "w-4 h-4 text-amber-400") => {
    if (code === 0) return { icon: <Sun className={className.replace('text-amber-400', 'text-amber-400')} />, desc: 'Clear sky' };
    if ([1, 2, 3].includes(code)) return { icon: <Cloud className={className.replace('text-amber-400', 'text-slate-400')} />, desc: 'Partly cloudy' };
    if ([45, 48].includes(code)) return { icon: <CloudFog className={className.replace('text-amber-400', 'text-slate-400')} />, desc: 'Fog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: <CloudDrizzle className={className.replace('text-amber-400', 'text-brand-blue')} />, desc: 'Drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: <CloudRain className={className.replace('text-amber-400', 'text-blue-400')} />, desc: 'Rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: <CloudSnow className={className.replace('text-amber-400', 'text-white')} />, desc: 'Snow' };
    if ([95, 96, 99].includes(code)) return { icon: <CloudLightning className={className.replace('text-amber-400', 'text-purple-400')} />, desc: 'Thunderstorm' };
    return { icon: <Sun className={className.replace('text-amber-400', 'text-amber-400')} />, desc: 'Clear sky' }; // default
  };

  const { icon, desc } = getWeatherIconAndDesc(weather.weatherCode);
  const today = new Date().toISOString().split('T')[0];
  const isToday = !date || date === today;
  const canExpand = isToday && weather.forecast && weather.forecast.length > 0;

  return (
    <div 
      className={`bg-slate-800/80 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/40 p-4 md:p-6 rounded-2xl flex flex-col justify-between h-full min-h-[100px] w-full transition-all duration-300 ease-in-out ${canExpand ? 'cursor-pointer hover:bg-slate-700/80 hover:scale-[1.02] active:scale-95' : ''}`}
      onClick={() => canExpand && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-extrabold tracking-tight uppercase block">{isToday ? 'Live Weather' : 'Weather'}</span>
        <div className="flex items-center gap-2">
            {icon}
            {canExpand && (
                <div className="text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            )}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-white text-3xl font-display font-extrabold tracking-tight leading-none">{Math.round(weather.temperature)}°C</span>
          <span className="text-slate-400 text-sm mt-1 truncate max-w-[120px]">{desc}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
          <Wind className="w-3 h-3" />
          <span className="text-xs font-medium">{Math.round(weather.windSpeed)} km/h</span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && canExpand && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="border-t border-white/5 pt-4 overflow-hidden"
          >
            <span className="text-xs text-slate-500 font-extrabold tracking-tight uppercase block mb-3">3-Day Forecast</span>
            <div className="grid grid-cols-3 gap-2">
              {weather.forecast!.map((day, i) => {
                const dayDate = new Date(day.date);
                const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                const { icon: dayIcon } = getWeatherIconAndDesc(day.weatherCode, "w-5 h-5");
                
                return (
                  <div key={i} className="flex flex-col items-center bg-slate-900/50 p-2 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 font-medium mb-2">{dayName}</span>
                    <div className="mb-2">{dayIcon}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-white font-bold">{Math.round(day.temperatureMax)}°</span>
                      <span className="text-slate-500">{Math.round(day.temperatureMin)}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
