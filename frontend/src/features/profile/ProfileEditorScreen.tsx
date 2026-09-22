import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppTheme, typography, spacing } from '../../utils/theme';
import { ProfileContext } from '../../store/ProfileContext';

export default function ProfileEditorScreen() {
  const { colors, isDark } = useAppTheme();
  const { createProfile } = useContext(ProfileContext);
  const [profileName, setProfileName] = useState('');

  const mutation = useMutation({
    mutationFn: async (name: string) => {
      // Must match the BASE_URL in api.ts
      const BASE_URL = 'http://10.68.101.154:8000/api/v1/';
      const res = await axios.post(`${BASE_URL}profiles/create/`, { profile_name: name });
      return res.data;
    },
    onSuccess: async (data) => {
      // data.id is the UUID from backend
      await createProfile(data.profile_name, data.id);
      // Navigation is handled automatically by AppNavigator because activeProfileId becomes set.
    },
  });

  const handleCreate = () => {
    if (profileName.trim()) {
      mutation.mutate(profileName);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.md }]}>
        Create Profile
      </Text>
      <Text style={[typography.body1, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
        A profile holds your settings, email history, and contacts. You can create multiple profiles later.
      </Text>

      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        PROFILE NAME
      </Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: colors.cardSurface, 
            color: colors.textPrimary,
            borderColor: colors.border 
          }
        ]}
        placeholder="e.g. Dev Jobs 2026"
        placeholderTextColor={colors.textSecondary}
        value={profileName}
        onChangeText={setProfileName}
      />

      {mutation.isError && (
        <Text style={{ color: '#ef4444', marginTop: spacing.sm }}>
          Failed to create profile. Ensure backend is running.
        </Text>
      )}

      <View style={{ flex: 1 }} />

      <TouchableOpacity 
        style={[
          styles.button, 
          { 
            backgroundColor: profileName.trim() ? colors.accent : colors.border,
          }
        ]}
        disabled={!profileName.trim() || mutation.isPending}
        onPress={handleCreate}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={[typography.button, { color: '#ffffff' }]}>INITIALIZE PROFILE</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 100,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  }
});
