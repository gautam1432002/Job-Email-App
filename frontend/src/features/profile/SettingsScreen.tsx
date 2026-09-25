import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Animated as RNAnimated, PanResponder } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { SlideInRight, SlideOutLeft, Easing, ZoomIn } from 'react-native-reanimated';
import { ProfileContext } from '../../store/ProfileContext';
import api from '../../services/api';
import { useAppTheme, typography, spacing } from '../../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BentoCard from '../../components/BentoCard';
import { Sun, Moon, Laptop } from 'lucide-react-native';

export default function SettingsScreen() {
  const { deleteProfile, activeProfileId } = useContext(ProfileContext);
  const { colors, isDark, themeMode, setThemeMode } = useAppTheme();
  const queryClient = useQueryClient();
  
  const [gmail, setGmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('profiles/me/');
      return res.data;
    },
  });

  const [defaultAiTone, setDefaultAiTone] = useState('Professional');
  const AI_TONES = ['Professional', 'Friendly', 'Direct'];
  const [trackWidth, setTrackWidth] = useState(0);
  const slideAnim = useRef(new RNAnimated.Value(0)).current;

  const stateRef = useRef({ defaultAiTone, trackWidth });
  useEffect(() => {
    stateRef.current = { defaultAiTone, trackWidth };
  }, [defaultAiTone, trackWidth]);

  useEffect(() => {
    if (trackWidth > 0) {
      const idx = Math.max(0, AI_TONES.indexOf(defaultAiTone));
      RNAnimated.spring(slideAnim, {
        toValue: idx * (trackWidth / 3),
        useNativeDriver: true,
        friction: 8,
        tension: 50
      }).start();
    }
  }, [defaultAiTone, trackWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (evt, gestureState) => {
        const { defaultAiTone, trackWidth } = stateRef.current;
        const startPos = Math.max(0, AI_TONES.indexOf(defaultAiTone)) * (trackWidth / 3);
        let newPos = startPos + gestureState.dx;
        
        if (newPos < 0) newPos = 0;
        if (newPos > (trackWidth / 3) * 2) newPos = (trackWidth / 3) * 2;
        
        slideAnim.setValue(newPos);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { defaultAiTone, trackWidth } = stateRef.current;
        const startPos = Math.max(0, AI_TONES.indexOf(defaultAiTone)) * (trackWidth / 3);
        const finalPos = startPos + gestureState.dx;
        
        const segmentWidth = trackWidth / 3;
        let closestIndex = Math.round(finalPos / segmentWidth);
        if (closestIndex < 0) closestIndex = 0;
        if (closestIndex > 2) closestIndex = 2;
        
        handleToneChange(AI_TONES[closestIndex]);
      },
      onPanResponderTerminate: () => {
        const { defaultAiTone, trackWidth } = stateRef.current;
        const idx = Math.max(0, AI_TONES.indexOf(defaultAiTone));
        RNAnimated.spring(slideAnim, {
          toValue: idx * (trackWidth / 3),
          useNativeDriver: true,
        }).start();
      }
    })
  ).current;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const tone = await AsyncStorage.getItem('defaultAiTone');
        if (tone) setDefaultAiTone(tone);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };
    loadSettings();
  }, []);

  const handleToneChange = async (tone: string) => {
    setDefaultAiTone(tone);
    try {
      await AsyncStorage.setItem('defaultAiTone', tone);
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {};
      if (gmail) payload.gmail = gmail;
      if (appPassword) payload.app_password = appPassword;
      if (geminiKey) payload.gemini_key = geminiKey;
      const res = await api.patch('profiles/me/', payload);
      return res.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Integrations updated!");
      setGmail('');
      setAppPassword('');
      setGeminiKey('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update profile.");
    }
  });

  const handleWipeProfile = () => {
    Alert.alert("Wipe Profile", "This will permanently delete this profile from your device.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          if (activeProfileId) deleteProfile(activeProfileId);
        }
      }
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View 
        style={[{ flex: 1, backgroundColor: colors.background }]}
        entering={SlideInRight.duration(280).easing(Easing.out(Easing.cubic))}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 140 }}>
          
          <BentoCard style={styles.card} padding={24}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Active Profile</Text>
            <Text style={[typography.body1, { color: colors.textPrimary }]}><Text style={{ color: colors.accent, fontWeight: 'bold' }}>Name:</Text> {profile?.profile_name}</Text>
          </BentoCard>

          <BentoCard style={styles.card} padding={24}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: 4 }]}>Appearance</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setThemeMode(isDark ? 'light' : 'dark');
                }}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' }}
              >
                <Animated.View key={isDark ? 'dark' : 'light'} entering={ZoomIn.duration(250).easing(Easing.out(Easing.cubic))}>
                  {isDark ? <Moon color={colors.textPrimary} size={28} /> : <Sun color={colors.textPrimary} size={28} />}
                </Animated.View>
              </TouchableOpacity>
            </View>
          </BentoCard>

          <BentoCard style={styles.card} padding={24}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>AI Setting</Text>
            <Text style={[typography.body2, { color: colors.textSecondary, marginBottom: spacing.md }]}>Slide to select your default outreach tone</Text>
            
            <View 
              style={{ height: 56, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 28, flexDirection: 'row', padding: 4, position: 'relative' }}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width - 8)}
              {...panResponder.panHandlers}
            >
              {trackWidth > 0 && (
                <RNAnimated.View 
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    width: trackWidth / 3,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isDark ? '#38383A' : '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                    transform: [{ translateX: slideAnim }]
                  }}
                />
              )}
              {AI_TONES.map((tone) => {
                const isActive = defaultAiTone === tone;
                return (
                  <TouchableOpacity
                    key={tone}
                    activeOpacity={1}
                    onPress={() => handleToneChange(tone)}
                    style={{ 
                      flex: 1, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      zIndex: 1
                    }}
                  >
                    <Text style={[typography.button, { color: isActive ? colors.textPrimary : colors.textSecondary, fontSize: 13 }]}>
                      {tone}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </BentoCard>

          <BentoCard style={styles.card} padding={24}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.md }]}>Integrations</Text>
            
            <View style={styles.statusRow}>
              <Text style={[typography.body2, { color: colors.textPrimary }]}>Gmail Configured:</Text>
              <Text style={[styles.statusBadge, { 
                backgroundColor: profile?.gmail_configured ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)', 
                color: profile?.gmail_configured ? '#10b981' : '#ef4444' 
              }]}>
                {profile?.gmail_configured ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={[typography.body2, { color: colors.textPrimary }]}>Gemini AI Configured:</Text>
              <Text style={[styles.statusBadge, { 
                backgroundColor: profile?.gemini_configured ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)', 
                color: profile?.gemini_configured ? '#10b981' : '#ef4444' 
              }]}>
                {profile?.gemini_configured ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>

            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.md }]}>UPDATE CREDENTIALS (ENCRYPTED LOCALLY)</Text>
            
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]} placeholderTextColor={colors.textSecondary} placeholder="Gmail Address" autoCapitalize="none" value={gmail} onChangeText={setGmail} />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]} placeholderTextColor={colors.textSecondary} placeholder="Gmail App Password" secureTextEntry value={appPassword} onChangeText={setAppPassword} />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]} placeholderTextColor={colors.textSecondary} placeholder="Gemini API Key" secureTextEntry value={geminiKey} onChangeText={setGeminiKey} />
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.textPrimary, marginTop: spacing.md }]} 
              onPress={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || (!gmail && !appPassword && !geminiKey)}
            >
              <Text style={[typography.button, { color: colors.background }]}>{updateMutation.isPending ? 'UPDATING...' : 'SAVE INTEGRATIONS'}</Text>
            </TouchableOpacity>
          </BentoCard>

          <TouchableOpacity style={[styles.logoutButton, { borderColor: '#ef4444' }]} onPress={handleWipeProfile}>
            <Text style={[typography.button, { color: '#ef4444' }]}>WIPE LOCAL PROFILE</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, overflow: 'hidden' },
  input: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, borderWidth: 1 },
  button: { padding: 16, borderRadius: 9999, alignItems: 'center' },
  logoutButton: { padding: 16, alignItems: 'center', marginBottom: 50, borderWidth: 1, borderRadius: 9999 },
  themeToggle: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 1, borderRadius: 8, marginHorizontal: 4 },
});
