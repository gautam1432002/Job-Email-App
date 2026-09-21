import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileProvider } from './src/store/ProfileContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ProfileProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ProfileProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
