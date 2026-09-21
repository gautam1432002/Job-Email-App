import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../features/onboarding/OnboardingScreen';
import ProfileEditorScreen from '../features/profile/ProfileEditorScreen';

const Stack = createNativeStackNavigator();

export default function ProfileSetupStack() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="CreateProfile" component={ProfileEditorScreen} />
    </Stack.Navigator>
  );
}
