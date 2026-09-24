import React, { useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/HomeScreen';
import HistoryScreen from '../features/history/HistoryScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import SettingsScreen from '../features/profile/SettingsScreen';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '../utils/theme';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, runOnJS } from 'react-native-reanimated';
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
  const { colors: themeColors, isDark: isDarkMode } = useAppTheme();
  
  // 40 is total horizontal padding for the floating bar
  const tabWidth = (width - 40) / state.routes.length; 
  const indicatorPosition = useSharedValue(0);
  const activeIndexShared = useSharedValue(state.index);

  useEffect(() => {
    activeIndexShared.value = state.index;
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

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      // Optional: stop existing spring, but withSpring handles interruptions well
    })
    .onUpdate((e) => {
      // e.x is relative to the GestureDetector view
      const boundedX = Math.min(Math.max(0, e.x - tabWidth / 2), width - 40 - tabWidth);
      indicatorPosition.value = boundedX;
      
      const newIndex = Math.max(0, Math.min(state.routes.length - 1, Math.floor(e.x / tabWidth)));
      activeIndexShared.value = newIndex;
    })
    .onEnd((e) => {
      const finalIndex = Math.max(0, Math.min(state.routes.length - 1, Math.floor(e.x / tabWidth)));
      indicatorPosition.value = withSpring(finalIndex * tabWidth, { damping: 16, stiffness: 250, mass: 0.5 });
      activeIndexShared.value = finalIndex;
      runOnJS(navigation.navigate)(state.routes[finalIndex].name);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.shadowContainer, { borderColor: 'rgba(0,0,0,0.06)' }]}>
      <View style={[styles.solidView, { backgroundColor: themeColors.cardSurface }]}>
        {/* Animated Background Highlight */}
        <Animated.View 
          style={[
            styles.activeIndicator, 
            { 
              width: tabWidth, 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
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

          // Use appropriate contrast colors for solid navbar
          const color = isFocused 
            ? themeColors.textPrimary 
            : themeColors.textSecondary;
          
          let IconComponent = Home;
          if (route.name === 'History') IconComponent = Clock;
          else if (route.name === 'Profile') IconComponent = User;
          else if (route.name === 'Settings') IconComponent = Settings;

          const scale = useSharedValue(isFocused ? 1.15 : 1);
          
          useEffect(() => {
            scale.value = withSpring(isFocused ? 1.15 : 1, {
              damping: 16,
              stiffness: 250,
              mass: 0.5
            });
          }, [isFocused]);

          const tabAnimatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: scale.value }]
            };
          });

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={1}
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
      </View>
      </View>
    </GestureDetector>
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
  solidView: {
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
  const { colors: themeColors } = useAppTheme();
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      sceneContainerStyle={{ backgroundColor: themeColors.background }}
      screenOptions={{
        headerShown: false,
        animation: 'shift', // Use React Navigation 7 native sliding transition
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
