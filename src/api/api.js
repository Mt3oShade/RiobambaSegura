
import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.API_URL;

const api = axios.create({
  baseURL: API_URL,
});

let setLoading, setError;

export const initializeApi = (loadingSetter, errorSetter) => {
  setLoading = loadingSetter;
  setError = errorSetter;
};

api.interceptors.request.use(
  async (config) => {
    setLoading(true);
    const token = await SecureStore.getItemAsync('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    setLoading(false);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    setLoading(false);
    return response;
  },
  (error) => {
    setLoading(false);
    const errorMessage = error.response?.data?.message || error.message || 'Ocurrió un error inesperado.';
    setError(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
