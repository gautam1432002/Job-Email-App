import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileProvider } from './src/store/ProfileContext';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </ProfileProvider>
    </QueryClientProvider>
  );
}
