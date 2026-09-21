import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import MainStack from './MainStack';
import ProfileSetupStack from './ProfileSetupStack';
import { ProfileContext } from '../store/ProfileContext';

export default function AppNavigator() {
  const { activeProfileId, isLoading } = useContext(ProfileContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#00ffcc" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {activeProfileId ? <MainStack /> : <ProfileSetupStack />}
    </NavigationContainer>
  );
}
