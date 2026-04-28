import axios from "axios";

const API_KEY = "c065c38f5d46c4b2d794a2b28740d3d4";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const getCurrentWeather = async (location) => {
  const { data } = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: location,
      appid: API_KEY,
      units: "metric", // celsius — use "imperial" for fahrenheit
      lang: "en",
    },
  });
  return data;
};

export const getCurrentWeatherByCoords = async (lat, lon) => {
  const { data } = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
      lang: "en",
    },
  });
  return data;
};

export const getForecast = async (location) => {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      q: location,
      appid: API_KEY,
      units: "metric",
      lang: "en",
    },
  });
  return data;
};

export const getForecastByCoords = async (lat, lon) => {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
      lang: "en",
    },
  });
  return data;
};