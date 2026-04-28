import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import * as Location from "expo-location";
import {
  getCurrentWeather,
  getCurrentWeatherByCoords,
  getForecast,
  getForecastByCoords,
} from "../services/weatherService";

const WeatherDetail = ({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string | number;
}) => (
  <View className="items-center bg-white/10 rounded-2xl px-4 py-3 flex-1 mx-1">
    <Text className="text-2xl">{emoji}</Text>
    <Text className="text-white/60 text-xs mt-1">{label}</Text>
    <Text className="text-white font-semibold text-sm">{String(value)}</Text>
  </View>
);

const getDailyForecast = (forecastList: any[]) => {
  const seen: Record<string, boolean> = {};
  return forecastList
    .filter((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!seen[date]) {
        seen[date] = true;
        return true;
      }
      return false;
    })
    .slice(1, 4);
};

const ForecastCard = ({ item }: { item: any }) => (
  <View className="flex-1 items-center bg-white/10 rounded-2xl py-4 mx-1">
    <Text className="text-white/60 text-xs mb-2">
      {new Date(item.dt_txt).toLocaleDateString("en", { weekday: "short" })}
    </Text>
    <Image
      source={{
        uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      }}
      style={{ width: 40, height: 40 }}
    />
    <Text className="text-white font-bold text-sm mt-2">
      {Math.round(item.main.temp_max ?? item.main.temp)}°
    </Text>
    <Text className="text-white/50 text-xs">
      {Math.round(item.main.temp_min ?? item.main.temp)}°
    </Text>
  </View>
);

export default function HomeScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        fetchWeatherByCoords(loc.coords.latitude, loc.coords.longitude);
      }
    })();
  }, []);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError("");
    try {
      const [current, forecastData] = await Promise.all([
        getCurrentWeatherByCoords(lat, lon),
        getForecastByCoords(lat, lon),
      ]);
      setWeather(current);
      setForecast(getDailyForecast(forecastData.list));
    } catch {
      setError("Could not get location weather");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [current, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);
      setWeather(current);
      setForecast(getDailyForecast(forecastData.list));
    } catch {
      setError("City not found, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text className="text-white text-3xl font-bold mt-6 mb-1">
            Weather Report
          </Text>
          <Text className="subtitle">
            Real time weather forecasts
          </Text>

          <View className="flex-row items-center bg-white/15 rounded-2xl px-4 mb-8 border border-white/20">
            <Text className="text-lg mr-2">🔍</Text>
            <TextInput
              className="flex-1 text-white py-4 text-base"
              placeholder="Search city..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={city}
              onChangeText={setCity}
              onSubmitEditing={fetchWeatherByCity}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={fetchWeatherByCity}
              className="bg-indigo-500 rounded-xl px-4 py-2"
            >
              <Text className="text-white font-semibold text-sm">Go</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#1f2349"
              className="my-10"
            />
          )}

          {error ? (
            <View className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 mb-6">
              <Text className="text-red-300 text-center">{error}</Text>
            </View>
          ) : null}

          {weather && !loading && (
            <>
              <View className="bg-white/10 border border-white/20 rounded-3xl p-6 mb-4 items-center">
                <Text className="text-white/60 text-sm mb-1">
                   {weather.name}, {weather.sys.country}
                </Text>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
                  }}
                  style={{ width: 100, height: 100 }}
                />
                <Text className="text-white text-7xl font-thin">
                  {Math.round(weather.main.temp)}°
                </Text>
                <Text className="text-white font-semibold text-lg mt-1 capitalize">
                  {weather.weather[0].description}
                </Text>
                <Text className="text-white/40 text-sm mt-1">
                  Feels like {Math.round(weather.main.feels_like)}°C
                </Text>
              </View>

              <View className="flex-row mb-4">
                <WeatherDetail
                  emoji="💧"
                  label="Humidity"
                  value={`${weather.main.humidity}%`}
                />
                <WeatherDetail
                  emoji="💨"
                  label="Wind"
                  value={`${Math.round(weather.wind.speed * 3.6)} km/h`}
                />
                <WeatherDetail
                  emoji="👁"
                  label="Visibility"
                  value={`${(weather.visibility / 1000).toFixed(1)} km`}
                />
              </View>

              <View className="flex-row mb-8">
                <WeatherDetail
                  emoji="🌡"
                  label="Min"
                  value={`${Math.round(weather.main.temp_min)}°`}
                />
                <WeatherDetail
                  emoji="🌡"
                  label="Max"
                  value={`${Math.round(weather.main.temp_max)}°`}
                />
                <WeatherDetail
                  emoji="🕛"
                  label="Pressure"
                  value={`${weather.main.pressure} mb`}
                />
                </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}