import { motion } from "motion/react";

// Explicit imports so Vite includes and hashes these images during production builds
import imgSunny from "../assets/images/weather_sunny_1781336486984.jpg";
import imgCloudy from "../assets/images/weather_cloudy_1781336527150.jpg";
import imgPartlyCloudy from "../assets/images/weather_partly_cloudy_1781338389511.jpg";
import imgDrizzle from "../assets/images/weather_drizzle_1781338174554.jpg";
import imgRainy from "../assets/images/weather_rainy_1781336513302.jpg";
import imgHeavyRain from "../assets/images/weather_heavy_rain_1781338161247.jpg";
import imgStormy from "../assets/images/weather_stormy_1781338124972.jpg";
import imgSnowy from "../assets/images/weather_snowy_1781336499453.jpg";
import imgFoggy from "../assets/images/weather_foggy_1781338137082.jpg";
import imgWindy from "../assets/images/weather_windy_1781338190131.jpg";

interface WeatherIllustrationProps {
  weatherCode: number;
  temperature: number; // in Celsius
  windSpeed?: number;  // in km/h
}

export default function WeatherIllustration({
  weatherCode,
  temperature,
  windSpeed = 0,
}: WeatherIllustrationProps) {
  // Map images based on conditions
  let imageUrl = imgSunny; // Default sunny
  let title = "Sunny Sunshine!";
  let subtitle = "A duck floating under a parasol, enjoying life.";
  let bgColorClass = "from-amber-100 to-orange-200 dark:from-amber-950/40 dark:to-orange-950/40";
  let textColorClass = "text-amber-800 dark:text-amber-200";

  // Check Severe Storms (95, 96, 99)
  const isStormy = [95, 96, 99].includes(weatherCode);
  // Check Snowy/Very Cold (71, 73, 75, 77, 85, 86, or temp <= 2)
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(weatherCode) || temperature <= 2;
  // Heavy Rain / Downpour (65, 82)
  const isHeavyRain = [65, 82].includes(weatherCode);
  // Moderate Rain / Showers (61, 63, 66, 67, 81)
  const isRainy = [61, 63, 66, 67, 81].includes(weatherCode);
  // Drizzle / Light Rain (51, 53, 55, 56, 57, 80)
  const isDrizzle = [51, 53, 55, 56, 57, 80].includes(weatherCode);
  // Foggy (45, 48)
  const isFoggy = [45, 48].includes(weatherCode);
  // Partly Cloudy (2)
  const isPartlyCloudy = weatherCode === 2;
  // Overcast / Cloudy (3)
  const isOvercast = weatherCode === 3;
  // Check Wind (windSpeed >= 25 km/h)
  const isWindy = windSpeed >= 25;

  if (isStormy) {
    imageUrl = imgStormy;
    title = "Thunderous Sparks!";
    subtitle = "A startled kitchen with static-electricity fluffed fur watching crackling lightning.";
    bgColorClass = "from-violet-100 to-purple-200 dark:from-violet-950/40 dark:to-purple-950/40";
    textColorClass = "text-violet-800 dark:text-violet-200";
  } else if (isSnowy) {
    imageUrl = imgSnowy;
    title = "Chilly Brrr!";
    subtitle = "A cute penguin shivering on a snowstorm mountain trail.";
    bgColorClass = "from-sky-100 to-blue-200 dark:from-sky-950/40 dark:to-sky-955/40";
    textColorClass = "text-sky-800 dark:text-sky-200";
  } else if (isWindy && !isHeavyRain && !isRainy && !isDrizzle && !isStormy) {
    imageUrl = imgWindy;
    title = "Whoosh! Windy!";
    subtitle = "A fluffy squirrel holding on tight as its tail blows dynamically in the autumn breeze.";
    bgColorClass = "from-zinc-100 to-slate-200 dark:from-zinc-900 dark:to-slate-800";
    textColorClass = "text-zinc-800 dark:text-zinc-200";
  } else if (isHeavyRain) {
    imageUrl = imgHeavyRain;
    title = "Heavy Downpour!";
    subtitle = "A busy baby beaver building a sturdy stick dam during a cozy rain flood.";
    bgColorClass = "from-blue-200 to-indigo-300 dark:from-blue-950/50 dark:to-indigo-300/40";
    textColorClass = "text-blue-800 dark:text-blue-200";
  } else if (isRainy) {
    imageUrl = imgRainy;
    title = "Splish Splash!";
    subtitle = "A cozy frog staying dry under a cute yellow umbrella.";
    bgColorClass = "from-teal-100 to-emerald-200 dark:from-teal-950/40 dark:to-emerald-950/40";
    textColorClass = "text-emerald-800 dark:text-emerald-200";
  } else if (isDrizzle) {
    imageUrl = imgDrizzle;
    title = "Gentle Drizzle!";
    subtitle = "A happy little snail crawling slowly on a wet green leaf, enjoying safe mist.";
    bgColorClass = "from-emerald-50 to-teal-150 dark:from-emerald-950/30 dark:to-teal-950/30";
    textColorClass = "text-teal-800 dark:text-teal-200";
  } else if (isFoggy) {
    imageUrl = imgFoggy;
    title = "Mysterious Fog!";
    subtitle = "A sleepy round detective owl peering through dense, soft fog.";
    bgColorClass = "from-indigo-100 to-slate-200 dark:from-indigo-950/40 dark:to-slate-900/40";
    textColorClass = "text-indigo-800 dark:text-indigo-200";
  } else if (isPartlyCloudy) {
    imageUrl = imgPartlyCloudy;
    title = "Partly Cloudy!";
    subtitle = "A cute little red panda in a blue scarf resting on a branch, looking up at soft clouds.";
    bgColorClass = "from-blue-100 to-sky-200 dark:from-blue-950/40 dark:to-sky-955/40";
    textColorClass = "text-sky-800 dark:text-sky-200";
  } else if (isOvercast) {
    imageUrl = imgCloudy;
    title = "Puzzled Skies!";
    subtitle = "A baffled sheep pondering. What a thick white cloud!";
    bgColorClass = "from-slate-200 to-gray-300 dark:from-slate-900 dark:to-gray-800";
    textColorClass = "text-slate-700 dark:text-slate-300";
  }

  return (
    <motion.div
      id="weather-illustration-card"
      key={imageUrl}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-[2.5rem] p-8 bg-gradient-to-br ${bgColorClass} shadow-2xl border border-white/20 dark:border-slate-800/60 overflow-hidden flex flex-col items-center justify-center text-center`}
    >
      <div className="relative w-full aspect-square max-w-[210px] rounded-[1.8rem] overflow-hidden shadow-lg border border-neutral-200/10 mb-5 bg-neutral-100/50">
        <img
          id="weather-illustration-img"
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h3 id="illustration-title" className={`font-sans font-extrabold text-2xl mb-2 ${textColorClass}`}>
        {title}
      </h3>
      <p id="illustration-subtitle" className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 max-w-xs font-sans italic opacity-90 leading-relaxed">
        "{subtitle}"
      </p>
    </motion.div>
  );
}
