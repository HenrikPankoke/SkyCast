import { useState, useEffect } from "react";
import { Heart, CloudSun, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GeoLocation, WeatherData, TempUnit, CurrentWeatherDetails, DailyForecast } from "./types";
import SearchCity from "./components/SearchCity";
import CurrentWeather from "./components/CurrentWeather";
import Forecast7Day from "./components/Forecast7Day";
import WeatherIllustration from "./components/WeatherIllustration";

const DEFAULT_CITY: GeoLocation = {
  name: "Berlin",
  latitude: 52.52,
  longitude: 13.41,
  country: "Germany",
  countryCode: "DE",
};

export default function App() {
  // State initialization
  const [currentCity, setCurrentCity] = useState<GeoLocation>(() => {
    const saved = localStorage.getItem("currentCity");
    return saved ? JSON.parse(saved) : DEFAULT_CITY;
  });

  const [favorites, setFavorites] = useState<GeoLocation[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(() => {
    const saved = localStorage.getItem("weatherCache");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If loaded city coordinates match currentCity, prefill cache
        const cacheCity = parsed.city;
        const activeCity = currentCity;
        if (
          Math.abs(cacheCity.latitude - activeCity.latitude) < 0.01 &&
          Math.abs(cacheCity.longitude - activeCity.longitude) < 0.01
        ) {
          return parsed;
        }
      } catch (e) {
        console.error("Cache parsing error:", e);
      }
    }
    return null;
  });

  const [tempUnit, setTempUnit] = useState<TempUnit>(() => {
    const saved = localStorage.getItem("tempUnit");
    return (saved as TempUnit) || TempUnit.CELSIUS;
  });

  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem("currentCity", JSON.stringify(currentCity));
  }, [currentCity]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("tempUnit", tempUnit);
  }, [tempUnit]);

  // Dark Mode side effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Fetch weather function with comprehensive fields
  const fetchWeather = async (city: GeoLocation, force = false) => {
    // If cache is fresh (< 30 min) and city is match, avoid fetch unless forced
    if (!force && weatherData && Date.now() - weatherData.lastFetched < 30 * 60 * 1000) {
      const match =
        Math.abs(weatherData.city.latitude - city.latitude) < 0.01 &&
        Math.abs(weatherData.city.longitude - city.longitude) < 0.01;
      if (match) {
        console.log("Serving weather from fresh client cache");
        return;
      }
    }

    setLoading(true);
    setError(null);

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,uv_index_max,windspeed_10m_max&timezone=auto`;

    try {
      const response = await fetch(forecastUrl);
      if (!response.ok) throw new Error("Could not fetch weather data");
      const data = await response.json();

      if (!data.current || !data.daily) {
        throw new Error("Invalid weather data payload");
      }

      // Map current values
      const current: CurrentWeatherDetails = {
        temperature: data.current.temperature_2m,
        apparentTemperature: data.current.apparent_temperature,
        relativeHumidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation || 0,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        isDay: data.current.is_day !== 0,
        uvIndex: data.daily.uv_index_max?.[0] || 0,
        time: data.current.time || new Date().toISOString(),
      };

      // Map 7-day forecast
      const forecast: DailyForecast[] = data.daily.time.map((dateStr: string, idx: number) => ({
        date: dateStr,
        weatherCode: data.daily.weathercode[idx],
        tempMax: data.daily.temperature_2m_max[idx],
        tempMin: data.daily.temperature_2m_min[idx],
        apparentTempMax: data.daily.apparent_temperature_max[idx],
        apparentTempMin: data.daily.apparent_temperature_min[idx],
        precipitationSum: data.daily.precipitation_sum[idx] || 0,
        uvIndexMax: data.daily.uv_index_max?.[idx] || 0,
        windSpeedMax: data.daily.windspeed_10m_max[idx] || 0,
      }));

      const newWeatherData: WeatherData = {
        city,
        current,
        forecast,
        lastFetched: Date.now(),
      };

      setWeatherData(newWeatherData);
      localStorage.setItem("weatherCache", JSON.stringify(newWeatherData));
    } catch (err) {
      console.error("Fetch weather error:", err);
      setError("Unable to coordinate weather readings. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on currentCity modification
  useEffect(() => {
    fetchWeather(currentCity);
  }, [currentCity]);

  // Window Focus listener triggers re-fresh if 30 mins lapse
  useEffect(() => {
    const handleReVisitFocus = () => {
      console.log("App gained focus. Evaluating refresh timestamp...");
      if (weatherData) {
        const diff = Date.now() - weatherData.lastFetched;
        if (diff > 30 * 60 * 1000) {
          console.log("Lapsed 30 minutes! Automatic background refresh active.");
          fetchWeather(currentCity, true);
        }
      } else {
        fetchWeather(currentCity, true);
      }
    };

    window.addEventListener("focus", handleReVisitFocus);
    return () => window.removeEventListener("focus", handleReVisitFocus);
  }, [currentCity, weatherData]);

  // Periodic interval checks every 5 minutes in background
  useEffect(() => {
    const interval = setInterval(() => {
      if (weatherData) {
        const diff = Date.now() - weatherData.lastFetched;
        if (diff > 30 * 60 * 1000) {
          fetchWeather(currentCity, true);
        }
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentCity, weatherData]);

  // Favorites handling with offset tolerance to prevent floating doublets
  const isFavorite = favorites.some(
    (fav) =>
      Math.abs(fav.latitude - currentCity.latitude) < 0.01 &&
      Math.abs(fav.longitude - currentCity.longitude) < 0.01
  );

  const handleToggleFavorite = () => {
    if (isFavorite) {
      setFavorites(
        favorites.filter(
          (fav) =>
            !(
              Math.abs(fav.latitude - currentCity.latitude) < 0.01 &&
              Math.abs(fav.longitude - currentCity.longitude) < 0.01
            )
        )
      );
    } else {
      setFavorites([...favorites, currentCity]);
    }
  };

  const handleRemoveFavorite = (city: GeoLocation) => {
    setFavorites(
      favorites.filter(
        (fav) =>
          !(
            Math.abs(fav.latitude - city.latitude) < 0.01 &&
            Math.abs(fav.longitude - city.longitude) < 0.01
          )
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-12">
      {/* Top Header Section */}
      <header className="border-b border-slate-200/40 dark:border-slate-800/40 bg-[#F8FAFC]/80 dark:bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-xl shadow-sky-500/20 dark:shadow-sky-500/10">
              <CloudSun className="w-6 h-6 stroke-[2]" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-sky-500 dark:text-sky-400">Sky</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">Cast</span>
            </h1>
          </div>

          <div className="w-full sm:max-w-md">
            <SearchCity
              onSelectCity={setCurrentCity}
              favorites={favorites}
              onRemoveFavorite={handleRemoveFavorite}
              currentCity={currentCity}
            />
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div id="dashboard-wrapper" className="flex flex-col gap-6">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                id="error-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm font-semibold shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="flex-1">{error}</p>
                <button
                  onClick={() => fetchWeather(currentCity, true)}
                  className="px-3 py-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 rounded-lg text-xs font-bold transition-all"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && !weatherData ? (
            // Loading fallback skeletal frame
            <div id="loading-shimmer-card" className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center justify-center py-24 gap-4 backdrop-blur-md">
              <RefreshCw className="w-12 h-12 animate-spin text-sky-500" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Retrieving atmospheric forecasting...
              </p>
            </div>
          ) : (
            weatherData && (
              <div id="weather-active-display" className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Grid pairing current numeric card with dynamic character illustrative asset */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-stretch">
                  <CurrentWeather
                    city={weatherData.city}
                    current={weatherData.current}
                    tempUnit={tempUnit}
                    onToggleUnit={() =>
                      setTempUnit(tempUnit === TempUnit.CELSIUS ? TempUnit.FAHRENHEIT : TempUnit.CELSIUS)
                    }
                    onRefresh={() => fetchWeather(currentCity, true)}
                    isRefreshing={loading}
                    lastFetched={weatherData.lastFetched}
                    isFavorite={isFavorite}
                    onToggleFavorite={handleToggleFavorite}
                  />

                  <WeatherIllustration
                    weatherCode={weatherData.current.weatherCode}
                    temperature={weatherData.current.temperature}
                    windSpeed={weatherData.current.windSpeed}
                  />
                </div>

                {/* 7-Day Forecast */}
                <Forecast7Day forecast={weatherData.forecast} tempUnit={tempUnit} />
              </div>
            )
          )}

        </div>
      </main>
    </div>
  );
}
