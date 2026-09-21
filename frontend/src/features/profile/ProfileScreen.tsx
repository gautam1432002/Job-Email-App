import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';

export default function ProfileScreen() {
  const { themeColors, typography, spacing } = useTheme();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [college, setCollege] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [resumeFile, setResumeFile] = useState<any>(null);
  const [existingResume, setExistingResume] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('profiles/me/');
      return res.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setRole(profile.role || '');
      setLocation(profile.location || '');
      setExperienceYears(profile.experience_years?.toString() || '');
      setCollege(profile.college || '');
      setGradYear(profile.grad_year?.toString() || '');
      setSkills(profile.skills || '');
      setPortfolio(profile.portfolio || '');
      setLinkedin(profile.linkedin || '');
      setGithub(profile.github || '');
      if (profile.resume) {
        setExistingResume(true);
      }
    }
  }, [profile]);

  const handlePickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setResumeFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('role', role);
      formData.append('location', location);
      if (experienceYears !== '') {
        formData.append('experience_years', experienceYears);
      }
      formData.append('college', college);
      formData.append('grad_year', gradYear);
      formData.append('skills', skills);
      formData.append('portfolio', portfolio);
      formData.append('linkedin', linkedin);
      formData.append('github', github);

      if (resumeFile) {
        formData.append('resume', {
          uri: resumeFile.uri,
          name: resumeFile.name,
          type: resumeFile.mimeType || 'application/pdf',
        } as any);
      }

      const res = await api.patch('profiles/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.error || "Failed to update profile.");
    }
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.aiAccent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: themeColors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 100 }}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[typography.h1, { color: themeColors.textPrimary, marginBottom: spacing.lg }]}>My Profile</Text>
          
          <View style={[styles.card, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h2, { color: themeColors.textPrimary, marginBottom: spacing.sm }]}>Personal Info</Text>
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="Current Role / Headline" value={role} onChangeText={setRole} />
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h2, { color: themeColors.textPrimary, marginBottom: spacing.sm }]}>Professional Details</Text>
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="Location (e.g. Indore, India)" value={location} onChangeText={setLocation} />
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="Years of Experience" value={experienceYears} onChangeText={setExperienceYears} keyboardType="numeric" />
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h2, { color: themeColors.textPrimary, marginBottom: spacing.sm }]}>Education</Text>
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="College / University" value={college} onChangeText={setCollege} />
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="Graduation Year (e.g. 2026)" value={gradYear} onChangeText={setGradYear} keyboardType="numeric" />
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h2, { color: themeColors.textPrimary, marginBottom: spacing.sm }]}>Resume & Documents</Text>
            <TouchableOpacity style={[styles.outlineBtn, { borderColor: themeColors.aiAccent }]} onPress={handlePickResume}>
              <Text style={{ color: themeColors.aiAccent, fontWeight: 'bold' }}>SELECT PDF RESUME</Text>
            </TouchableOpacity>
            {resumeFile ? (
              <Text style={[typography.caption, { color: themeColors.textPrimary, marginTop: 8 }]}>Selected: {resumeFile.name}</Text>
            ) : existingResume ? (
              <Text style={[typography.caption, { color: themeColors.success, marginTop: 8 }]}>📎 Resume previously uploaded</Text>
            ) : null}
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h2, { color: themeColors.textPrimary, marginBottom: spacing.sm }]}>Tech Stack</Text>
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="Skills (comma separated)" value={skills} onChangeText={setSkills} />
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h2, { color: themeColors.textPrimary, marginBottom: spacing.sm }]}>Links</Text>
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="Portfolio URL" value={portfolio} onChangeText={setPortfolio} autoCapitalize="none" />
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="LinkedIn URL" value={linkedin} onChangeText={setLinkedin} autoCapitalize="none" />
            <TextInput style={[styles.input, { backgroundColor: themeColors.background, color: themeColors.textPrimary, borderColor: themeColors.border }]} placeholderTextColor={themeColors.textSecondary} placeholder="GitHub URL" value={github} onChangeText={setGithub} autoCapitalize="none" />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: themeColors.aiAccent, marginTop: spacing.md }]} 
            onPress={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            <Text style={[typography.button, { color: '#000' }]}>{updateMutation.isPending ? 'SAVING...' : 'SAVE PROFILE'}</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  input: { borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1 },
  button: { padding: 16, borderRadius: 9999, alignItems: 'center' },
  outlineBtn: { padding: 14, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
});
