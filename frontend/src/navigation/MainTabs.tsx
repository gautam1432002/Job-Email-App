import React, { useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/HomeScreen';
import HistoryScreen from '../features/history/HistoryScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import SettingsScreen from '../features/profile/SettingsScreen';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Platform, PanResponder } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Home, Clock, User, Settings } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { themeColors, isDarkMode } = useTheme();
  
  // 40 is total horizontal padding for the floating bar
  const tabWidth = (width - 40) / state.routes.length; 
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    // Snappy Spring for translation
    indicatorPosition.value = withSpring(state.index * tabWidth, { 
      damping: 16, 
      stiffness: 250,
      mass: 0.5
    });
  }, [state.index, tabWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  // Force solid white transparent blur
  const blurTint = "light";

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 40) {
          const prevIndex = Math.max(0, state.index - 1);
          if (prevIndex !== state.index) {
            navigation.navigate(state.routes[prevIndex].name);
          }
        } else if (gestureState.dx < -40) {
          const nextIndex = Math.min(state.routes.length - 1, state.index + 1);
          if (nextIndex !== state.index) {
            navigation.navigate(state.routes[nextIndex].name);
          }
        }
      },
    })
  ).current;

  return (
    <View 
      style={[styles.shadowContainer, { borderColor: 'rgba(0,0,0,0.06)' }]} 
      {...panResponder.panHandlers}
    >
      <BlurView intensity={90} tint={blurTint} style={[styles.blurView, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
        {/* Animated Background Highlight */}
        <Animated.View 
          style={[
            styles.activeIndicator, 
            { 
              width: tabWidth, 
              backgroundColor: 'rgba(0,0,0,0.05)'
            }, 
            animatedStyle
          ]} 
        />
        
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Force dark icons since navbar is white transparent
          const color = isFocused 
            ? '#000000' 
            : '#888888';
          
          let IconComponent = Home;
          if (route.name === 'History') IconComponent = Clock;
          else if (route.name === 'Profile') IconComponent = User;
          else if (route.name === 'Settings') IconComponent = Settings;

          // Tactile scale effect
          const scale = useSharedValue(isFocused ? 1.15 : 1);
          useEffect(() => {
            scale.value = withSpring(isFocused ? 1.15 : 1, {
              damping: 16,
              stiffness: 250,
              mass: 0.5
            });
          }, [isFocused]);

          const tabAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }]
          }));

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.tabItemInner, tabAnimatedStyle]}>
                <IconComponent 
                  color={color} 
                  size={20} 
                  strokeWidth={isFocused ? 2.5 : 2} 
                />
                {isFocused && (
                  <Text style={[styles.tabLabel, { color }]}>
                    {route.name}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    height: 64,
    elevation: 8, // For Android
    shadowColor: '#000',
    shadowOpacity: 0.1, // Softened shadow
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    backgroundColor: 'transparent',
    borderRadius: 30,
    borderWidth: 1, // Added for visibility on white backgrounds
  },
  blurView: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 30,
    overflow: 'hidden',
  },
  activeIndicator: {
    position: 'absolute',
    height: '100%',
    borderRadius: 30,
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  }
});

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Add standard cross-fade animation natively
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: 'transparent',
        }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
