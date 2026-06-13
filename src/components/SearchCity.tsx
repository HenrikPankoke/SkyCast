import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Heart, Trash2 } from "lucide-react";
import { GeoLocation } from "../types";

interface SearchCityProps {
  onSelectCity: (city: GeoLocation) => void;
  favorites: GeoLocation[];
  onRemoveFavorite: (city: GeoLocation) => void;
  currentCity?: GeoLocation | null;
}

export default function SearchCity({
  onSelectCity,
  favorites,
  onRemoveFavorite,
  currentCity,
}: SearchCityProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=6&language=en&format=json`
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const formatted: GeoLocation[] = data.results.map((item: any) => ({
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            country: item.country || "Unknown Country",
            admin1: item.admin1,
            countryCode: item.country_code,
            postcode: item.postcodes?.[0] || undefined,
          }));
          setSuggestions(formatted);
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Geocoding fetch error:", err);
        setError("Could not resolve location. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside listener for suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: GeoLocation) => {
    onSelectCity(city);
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleSearchGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setIsOpen(false);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let cityName = "My Location";
        let country = "Current Coordinates";
        let admin1: string | undefined = undefined;

        try {
          // Reverse geocoding over free nominatim osm API with secure headers
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            cityName = addr.city || addr.town || addr.village || addr.suburb || "My Location";
            country = addr.country || "GPS Location";
            admin1 = addr.state || addr.region;
          }
        } catch (e) {
          console.error("Reverse geocoding error:", e);
        }

        const gpsLoc: GeoLocation = {
          name: cityName,
          latitude,
          longitude,
          country,
          admin1,
        };

        onSelectCity(gpsLoc);
        setLoading(false);
      },
      (err) => {
        console.error("GPS retrieval error:", err);
        setError("GPS access denied or timed out.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div id="search-container" ref={dropdownRef} className="relative w-full">
      <div className="flex gap-2.5 items-center">
        {/* Input wrapping div */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-slate-500">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </div>

          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            placeholder="Search city or zip code..."
            className="w-full text-sm pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/55 text-neutral-800 dark:text-slate-100 placeholder-neutral-400 dark:placeholder-slate-505 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 dark:focus:border-sky-500/60 shadow-lg shadow-black/5 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && suggestions.length > 0) {
                handleSelect(suggestions[0]);
              }
            }}
          />

          {query && (
            <button
               id="clear-search"
               onClick={() => {
                 setQuery("");
                 setSuggestions([]);
               }}
               className="absolute inset-y-0 right-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
             >
               <X className="w-4 h-4" />
             </button>
           )}
         </div>

         {/* GPS Button */}
         <button
           id="gps-button"
           onClick={handleSearchGPS}
           disabled={loading}
           className="flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:bg-neutral-250 dark:disabled:bg-slate-800 text-white shadow-xl shadow-sky-500/10 hover:shadow-sky-500/20 font-bold transition-all duration-200"
           title="Retrieve current location"
         >
           <MapPin className="w-4.5 h-4.5" />
         </button>
       </div>

       {/* Error state */}
       {error && (
         <p id="search-error" className="absolute left-4 mt-1.5 text-xs font-bold text-rose-500">
           {error}
         </p>
       )}

       {/* Suggestions / Favorites dropdown load list */}
       {isOpen && (
         <div
           id="search-dropdown"
           className="absolute z-40 w-full mt-2.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200/40 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
         >
           {query.trim() !== "" ? (
             suggestions.length > 0 ? (
               <div className="py-2.5 max-h-[300px] overflow-y-auto divide-y divide-slate-100/40 dark:divide-slate-800/40">
                 {suggestions.map((city, idx) => (
                   <button
                     id={`suggestion-item-${idx}`}
                     key={`${city.latitude}-${city.longitude}-${idx}`}
                     onClick={() => handleSelect(city)}
                     className="w-full text-left px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors outline-none"
                   >
                     <div>
                       <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 leading-tight">
                         {city.name}
                       </p>
                       <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">
                         {city.admin1 ? `${city.admin1}, ` : ""}
                         {city.country}
                       </p>
                     </div>
                     {city.postcode && (
                       <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200/10">
                         {city.postcode}
                       </span>
                     )}
                   </button>
                 ))}
               </div>
             ) : (
               !loading && (
                 <div className="py-6 text-center text-xs text-neutral-500 dark:text-slate-400 font-semibold">
                   No matching locations found
                 </div>
               )
             )
           ) : (
             <div>
               <div className="px-5 py-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-505 uppercase border-b border-slate-105/20 dark:border-slate-800/20 flex items-center gap-1.5 select-none bg-slate-50/20 dark:bg-slate-900/10">
                 <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                 Favorite Locations
               </div>
               {favorites.length > 0 ? (
                 <div className="py-1 max-h-[300px] overflow-y-auto divide-y divide-slate-100/40 dark:divide-slate-800/45">
                   {favorites.map((city, idx) => {
                     const isCurrentlyActive = currentCity &&
                       currentCity.latitude === city.latitude &&
                       currentCity.longitude === city.longitude;
                     return (
                       <div
                         id={`favorite-item-row-${idx}`}
                         key={`${city.latitude}-${city.longitude}-${idx}`}
                         className="group flex items-center justify-between px-5 py-3 hover:bg-slate-55 dark:hover:bg-slate-850/50 transition-colors"
                       >
                         <button
                           id={`favorite-select-${idx}`}
                           onClick={() => handleSelect(city)}
                           className="flex-1 text-left outline-none cursor-pointer"
                         >
                           <p className={`text-sm font-extrabold leading-tight ${isCurrentlyActive ? "text-sky-500 dark:text-sky-400" : "text-neutral-800 dark:text-neutral-150"}`}>
                             {city.name}
                           </p>
                           <p className="text-xs text-neutral-400 dark:text-slate-500 font-semibold mt-0.5">
                             {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
                           </p>
                         </button>
                         <button
                           id={`favorite-remove-${idx}`}
                           onClick={(e) => {
                             e.stopPropagation();
                             onRemoveFavorite(city);
                           }}
                           className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all opacity-70 group-hover:opacity-100 cursor-pointer"
                           title="Remove from favorites"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="py-7 text-center px-4 bg-slate-50/5 dark:bg-slate-900/5">
                   <Heart className="w-5 h-5 text-slate-300 dark:text-slate-700 mx-auto mb-2 opacity-50" />
                   <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No saved favorites yet</p>
                   <p className="text-[10px] text-slate-400/80 dark:text-slate-500/80 mt-1 max-w-[200px] mx-auto leading-relaxed">
                     Tap the heart icon inside any city's header to save it!
                   </p>
                 </div>
               )}
             </div>
           )}
         </div>
       )}
    </div>
  );
}
