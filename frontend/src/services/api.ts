import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Using env var for production, falling back to local network IP for Expo Go development
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.68.101.154:8000/api/v1/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Profile ID
api.interceptors.request.use(
  async (config) => {
    const profileId = await SecureStore.getItemAsync('jobmailer_active_profile_id');
    if (profileId && config.headers) {
      config.headers['X-Profile-ID'] = profileId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
