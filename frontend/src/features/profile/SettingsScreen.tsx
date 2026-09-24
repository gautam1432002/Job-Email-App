import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { SlideInRight, SlideOutLeft, Easing } from 'react-native-reanimated';
import { ProfileContext } from '../../store/ProfileContext';
import api from '../../services/api';
import { useAppTheme, typography, spacing } from '../../utils/theme';

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
      <View style={[{ flex: 1, backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 120 }}>
          
          <View style={[styles.card, { backgroundColor: colors.cardSurface, borderColor: colors.border }]}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Active Profile</Text>
            <Text style={[typography.body1, { color: colors.textPrimary }]}><Text style={{ color: colors.accent, fontWeight: 'bold' }}>Name:</Text> {profile?.profile_name}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardSurface, borderColor: colors.border }]}>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.md }]}>Appearance</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {(['system', 'light', 'dark'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.themeToggle,
                    { 
                      borderColor: themeMode === mode ? colors.textPrimary : colors.border,
                      backgroundColor: themeMode === mode ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent' 
                    }
                  ]}
                >
                  <Text style={[typography.button, { color: themeMode === mode ? colors.textPrimary : colors.textSecondary }]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardSurface, borderColor: colors.border }]}>
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
          </View>

          <TouchableOpacity style={[styles.logoutButton, { borderColor: '#ef4444' }]} onPress={handleWipeProfile}>
            <Text style={[typography.button, { color: '#ef4444' }]}>WIPE LOCAL PROFILE</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, overflow: 'hidden' },
  input: { borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1 },
  button: { padding: 16, borderRadius: 9999, alignItems: 'center' },
  logoutButton: { padding: 16, alignItems: 'center', marginBottom: 50, borderWidth: 1, borderRadius: 9999 },
  themeToggle: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 1, borderRadius: 8, marginHorizontal: 4 },
});
