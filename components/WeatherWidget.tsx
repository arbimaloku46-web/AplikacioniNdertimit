import React, { useState, useEffect } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';

interface WeatherWidgetProps {
  location: string;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
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

        // Step 2: Weather Forecast
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`);
        const weatherData = await weatherResponse.json();

        if (mounted && weatherData.current) {
          setWeather({
            temperature: weatherData.current.temperature_2m,
            weatherCode: weatherData.current.weather_code,
            windSpeed: weatherData.current.wind_speed_10m,
          });
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
  }, [location]);

  if (loading) {
    return (
      <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl animate-pulse flex flex-col justify-between h-full min-h-[80px]">
        <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Live Weather</span>
        <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col justify-between h-full min-h-[80px]">
        <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Live Weather</span>
        <span className="text-white text-xs font-bold">Unavailable</span>
      </div>
    );
  }

  // Map WMO weather codes to lucide-react icons and descriptions
  const getWeatherIconAndDesc = (code: number) => {
    if (code === 0) return { icon: <Sun className="w-4 h-4 text-amber-400" />, desc: 'Clear sky' };
    if ([1, 2, 3].includes(code)) return { icon: <Cloud className="w-4 h-4 text-slate-300" />, desc: 'Partly cloudy' };
    if ([45, 48].includes(code)) return { icon: <CloudFog className="w-4 h-4 text-slate-400" />, desc: 'Fog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: <CloudDrizzle className="w-4 h-4 text-brand-blue" />, desc: 'Drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: <CloudRain className="w-4 h-4 text-blue-400" />, desc: 'Rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: <CloudSnow className="w-4 h-4 text-white" />, desc: 'Snow' };
    if ([95, 96, 99].includes(code)) return { icon: <CloudLightning className="w-4 h-4 text-purple-400" />, desc: 'Thunderstorm' };
    return { icon: <Sun className="w-4 h-4 text-amber-400" />, desc: 'Clear sky' }; // default
  };

  const { icon, desc } = getWeatherIconAndDesc(weather.weatherCode);

  return (
    <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col justify-between h-full min-h-[80px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] text-slate-500 font-bold uppercase block">Live Weather</span>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-white text-lg font-display font-bold leading-none">{Math.round(weather.temperature)}°C</span>
          <span className="text-slate-400 text-[10px] mt-1 truncate max-w-[80px]">{desc}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Wind className="w-3 h-3" />
          <span className="text-[10px]">{Math.round(weather.windSpeed)} km/h</span>
        </div>
      </div>
    </div>
  );
};
