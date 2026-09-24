import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import MainStack from './MainStack';
import ProfileSetupStack from './ProfileSetupStack';
import { ProfileContext } from '../store/ProfileContext';
import { useAppTheme } from '../utils/theme';

export default function AppNavigator() {
  const { activeProfileId, isLoading } = useContext(ProfileContext);
  const { colors } = useAppTheme();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#00ffcc" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {activeProfileId ? <MainStack /> : <ProfileSetupStack />}
    </NavigationContainer>
  );
}
