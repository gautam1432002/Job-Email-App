import axios from 'axios';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Using env var for production, falling back to local network IP for Expo Go development
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://job-email-app.onrender.com/api/v1/';

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

// Response Interceptor: Handle Orphaned UUIDs (Database Wipes)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 404)) {
      console.warn("Backend rejected Profile ID (likely DB wipe). Wiping local SecureStore...");
      
      // Delete the orphaned UUID so the app doesn't stay stuck in a broken state
      await SecureStore.deleteItemAsync('jobmailer_active_profile_id');
      
      // Notify the user gently
      Alert.alert(
        "Session Expired", 
        "Your profile data was cleared by the server (Backend Update). Please restart the app to create a new profile.",
        [{ text: "OK" }]
      );
    }
    return Promise.reject(error);
  }
);

export default api;
