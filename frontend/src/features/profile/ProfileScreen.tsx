import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { SlideInRight, SlideOutLeft, Easing } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../services/api';
import { useAppTheme, typography, spacing } from '../../utils/theme';
import BentoCard from '../../components/BentoCard';
import { UploadCloud, CheckCircle, Eye } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as IntentLauncher from 'expo-intent-launcher';

export default function ProfileScreen() {
  const { colors, isDark } = useAppTheme();
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
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
      if (gradYear !== '') {
        formData.append('grad_year', gradYear);
      }
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  const dividerStyle = [styles.divider, { backgroundColor: colors.border }];
  
  const getInputStyle = (inputName: string) => [
    styles.input, 
    { 
      color: colors.textPrimary, 
      backgroundColor: focusedInput === inputName ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent',
    }
  ];

  const skillArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View 
        style={[{ flex: 1, backgroundColor: colors.background }]}
        entering={SlideInRight.duration(280).easing(Easing.out(Easing.cubic))}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 140 }}>
          <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.lg, paddingHorizontal: spacing.sm }]}>Profile</Text>
          
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PERSONAL INFO</Text>
          <BentoCard style={styles.groupCard}>
            <TextInput style={getInputStyle('fullName')} onFocus={() => setFocusedInput('fullName')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
            <View style={dividerStyle} />
            <TextInput style={getInputStyle('role')} onFocus={() => setFocusedInput('role')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="Current Role / Headline" value={role} onChangeText={setRole} />
          </BentoCard>

          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PROFESSIONAL DETAILS</Text>
          <BentoCard style={styles.groupCard}>
            <TextInput style={getInputStyle('location')} onFocus={() => setFocusedInput('location')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="Location (e.g. Indore, India)" value={location} onChangeText={setLocation} />
            <View style={dividerStyle} />
            <TextInput style={getInputStyle('experienceYears')} onFocus={() => setFocusedInput('experienceYears')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="Years of Experience" value={experienceYears} onChangeText={setExperienceYears} keyboardType="numeric" />
          </BentoCard>

          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>EDUCATION</Text>
          <BentoCard style={styles.groupCard}>
            <TextInput style={getInputStyle('college')} onFocus={() => setFocusedInput('college')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="College / University" value={college} onChangeText={setCollege} />
            <View style={dividerStyle} />
            <TextInput style={getInputStyle('gradYear')} onFocus={() => setFocusedInput('gradYear')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="Graduation Year (e.g. 2026)" value={gradYear} onChangeText={setGradYear} keyboardType="numeric" />
          </BentoCard>

          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>RESUME & DOCUMENTS</Text>
          <BentoCard style={styles.groupCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={[styles.uploadBtn, { flex: 1 }]} onPress={handlePickResume}>
                <UploadCloud color={colors.textPrimary} size={24} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body1, { color: colors.textPrimary }]}>Upload PDF Resume</Text>
                  {resumeFile ? (
                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{resumeFile.name}</Text>
                  ) : existingResume ? (
                    <Text style={[typography.caption, { color: '#10b981', marginTop: 2 }]}>Resume previously uploaded</Text>
                  ) : null}
                </View>
                {existingResume && !resumeFile && <CheckCircle color="#10b981" size={20} />}
              </TouchableOpacity>

              {resumeFile && (
                <TouchableOpacity 
                  style={{ padding: 16, borderLeftWidth: 1, borderLeftColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                  onPress={async () => {
                    try {
                      if (resumeFile.uri) {
                        if (Platform.OS === 'android') {
                          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                            data: resumeFile.uri,
                            flags: 1,
                            type: 'application/pdf'
                          });
                        } else {
                          await WebBrowser.openBrowserAsync(resumeFile.uri);
                        }
                      }
                    } catch (e) {
                      console.log("Could not open preview", e);
                      Alert.alert("Preview Unavailable", "Cannot open this file type on this device.");
                    }
                  }}
                >
                  <Eye color={colors.accent} size={20} />
                  <Text style={{ color: colors.accent, fontSize: 10, marginTop: 4 }}>Preview</Text>
                </TouchableOpacity>
              )}
            </View>
          </BentoCard>

          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>TECH STACK</Text>
          <BentoCard style={[styles.groupCard, { paddingBottom: 16 }]}>
            {skillArray.length > 0 && (
              <View style={styles.skillPillContainer}>
                {skillArray.map((skill, index) => (
                  <View key={index} style={[styles.skillPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}
            <TextInput 
              style={[getInputStyle('skills'), { paddingHorizontal: 16 }]} 
              onFocus={() => setFocusedInput('skills')} 
              onBlur={() => setFocusedInput(null)} 
              placeholderTextColor={colors.textSecondary} 
              placeholder="Skills (comma separated)" 
              value={skills} 
              onChangeText={setSkills} 
            />
          </BentoCard>

          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>LINKS</Text>
          <BentoCard style={styles.groupCard}>
            <TextInput style={getInputStyle('portfolio')} onFocus={() => setFocusedInput('portfolio')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="Portfolio URL" value={portfolio} onChangeText={setPortfolio} autoCapitalize="none" />
            <View style={dividerStyle} />
            <TextInput style={getInputStyle('linkedin')} onFocus={() => setFocusedInput('linkedin')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="LinkedIn URL" value={linkedin} onChangeText={setLinkedin} autoCapitalize="none" />
            <View style={dividerStyle} />
            <TextInput style={getInputStyle('github')} onFocus={() => setFocusedInput('github')} onBlur={() => setFocusedInput(null)} placeholderTextColor={colors.textSecondary} placeholder="GitHub URL" value={github} onChangeText={setGithub} autoCapitalize="none" />
          </BentoCard>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.textPrimary, marginTop: spacing.xl }]} 
            onPress={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            <Text style={[typography.button, { color: colors.background }]}>{updateMutation.isPending ? 'SAVING...' : 'SAVE PROFILE'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  groupCard: {
    padding: 0,
    marginBottom: 8,
  },
  input: {
    padding: 16,
    fontSize: 16,
    borderWidth: 0,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  button: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  skillPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skillPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  }
});
