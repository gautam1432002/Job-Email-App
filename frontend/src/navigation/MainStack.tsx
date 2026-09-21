import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ComposeScreen from '../features/compose/ComposeScreen';

export type MainStackParamList = {
  MainTabs: undefined;
  Compose: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#000' } }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Compose" component={ComposeScreen} />
    </Stack.Navigator>
  );
}
