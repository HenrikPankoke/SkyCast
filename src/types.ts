export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State / Region
  postcode?: string;
  countryCode?: string;
}

export interface CurrentWeatherDetails {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  time: string;
  apparentTemperature?: number;
  relativeHumidity?: number;
  precipitation?: number;
  uvIndex?: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  precipitationSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
}

export interface WeatherData {
  city: GeoLocation;
  current: CurrentWeatherDetails;
  forecast: DailyForecast[];
  lastFetched: number; // timestamp
}

export enum TempUnit {
  CELSIUS = "C",
  FAHRENHEIT = "F",
}
