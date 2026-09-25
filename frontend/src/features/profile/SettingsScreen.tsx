import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { SlideInRight, SlideOutLeft, Easing } from 'react-native-reanimated';
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

  React.useEffect(() => {
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
          
          <BentoCard style={styles.card}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Active Profile</Text>
            <Text style={[typography.body1, { color: colors.textPrimary }]}><Text style={{ color: colors.accent, fontWeight: 'bold' }}>Name:</Text> {profile?.profile_name}</Text>
          </BentoCard>

          <BentoCard style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: 4 }]}>Appearance</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {themeMode === 'system' ? 'System Default' : themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (themeMode === 'system') setThemeMode('light');
                  else if (themeMode === 'light') setThemeMode('dark');
                  else setThemeMode('system');
                }}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' }}
              >
                {themeMode === 'light' ? <Sun color={colors.textPrimary} size={28} /> : themeMode === 'dark' ? <Moon color={colors.textPrimary} size={28} /> : <Laptop color={colors.textPrimary} size={28} />}
              </TouchableOpacity>
            </View>
          </BentoCard>

          <BentoCard style={styles.card}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>AI Voice Engine</Text>
            <Text style={[typography.body2, { color: colors.textSecondary, marginBottom: spacing.md }]}>Slide to select your default outreach tone</Text>
            
            <View style={{ height: 56, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 28, flexDirection: 'row', padding: 4 }}>
              {(['Professional', 'Friendly', 'Direct']).map((tone) => {
                const isActive = defaultAiTone === tone;
                return (
                  <TouchableOpacity
                    key={tone}
                    activeOpacity={0.8}
                    onPress={() => handleToneChange(tone)}
                    style={{ 
                      flex: 1, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      borderRadius: 24, 
                      backgroundColor: isActive ? (isDark ? '#38383A' : '#FFFFFF') : 'transparent',
                      shadowColor: isActive ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isActive ? (isDark ? 0.3 : 0.08) : 0,
                      shadowRadius: 8,
                      elevation: isActive ? 4 : 0
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

          <BentoCard style={styles.card}>
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
  card: { padding: 24, marginBottom: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, overflow: 'hidden' },
  input: { borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1 },
  button: { padding: 16, borderRadius: 9999, alignItems: 'center' },
  logoutButton: { padding: 16, alignItems: 'center', marginBottom: 50, borderWidth: 1, borderRadius: 9999 },
  themeToggle: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 1, borderRadius: 8, marginHorizontal: 4 },
});
