import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert, Modal, SafeAreaView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { useQuery, useMutation } from '@tanstack/react-query';
import Animated, { FadeInRight, FadeOut, Easing, withRepeat, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { useAppTheme, typography, spacing, borderRadius } from '../../utils/theme';
import BentoCard from '../../components/BentoCard';
import { Sparkles, Paperclip, Check, CheckCircle } from 'lucide-react-native';

export default function ComposeScreen() {
  const route = useRoute<RouteProp<Record<string, { initialContext?: string, initialTone?: string }>, string>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors, isDark } = useAppTheme();
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [aboutCompany, setAboutCompany] = useState(route.params?.initialContext || '');
  const [useResume, setUseResume] = useState(true);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('none');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [tone, setTone] = useState(route.params?.initialTone || 'Professional');

  React.useEffect(() => {
    if (route.params?.initialContext) {
      setAboutCompany(route.params.initialContext);
    }
    if (route.params?.initialTone) {
      setTone(route.params.initialTone);
    } else {
      const loadDefaultTone = async () => {
        try {
          const defaultTone = await AsyncStorage.getItem('defaultAiTone');
          if (defaultTone) setTone(defaultTone);
        } catch (e) {
          console.log('Failed to load default tone', e);
        }
      };
      loadDefaultTone();
    }
  }, [route.params?.initialContext, route.params?.initialTone]);

  const [generatedDraft, setGeneratedDraft] = useState<{subject: string; full_body: string} | null>(null);
  const [sentSuccessData, setSentSuccessData] = useState<{id: number, companyName: string} | null>(null);
  const [reminderDays, setReminderDays] = useState('7');

  const THEMES = [
    { id: 'none', name: 'Plain Text' },
    { id: 'theme1', name: 'Void Purple' },
    { id: 'theme2', name: 'Editorial Ink' },
    { id: 'theme3', name: 'Soft Bento' },
    { id: 'theme4', name: 'Neobrutalist' },
    { id: 'theme5', name: 'Newsletter' },
    { id: 'theme6', name: 'Minimal' },
  ];

  // Pulse animation for AI Loader
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    pulseScale.value = withRepeat(withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
    pulseOpacity.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('profiles/me/');
      return res.data;
    },
  });

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('compose/generate/', {
        company_name: companyName,
        job_description: jobDescription,
        about_company: aboutCompany,
        use_resume: useResume,
        tone: tone,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setGeneratedDraft(data);
      const cleanName = companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      setReceiverEmail(`hr@${cleanName || 'company'}.com`);
    },
    onError: () => {
      Alert.alert("Generation Failed", "Could not connect to Gemini API. Ensure keys are set in Profile.");
    }
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!generatedDraft) return;
      const res = await api.post('compose/preview/', {
        receiver_email: receiverEmail,
        company_name: companyName,
        subject: generatedDraft.subject,
        html_body: generatedDraft.full_body,
        ai_used: true,
        theme_used: selectedTheme
      });
      return res.data.html;
    },
    onSuccess: (htmlString) => {
      let finalHtml = htmlString;
      if (!finalHtml.includes('name="viewport"')) {
        finalHtml = finalHtml.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">');
      }
      setPreviewHtml(finalHtml);
      setPreviewModalVisible(true);
    },
    onError: (err: any) => {
      Alert.alert("Preview Failed", err.response?.data?.error || "Could not generate preview.");
    }
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!generatedDraft) return;
      const res = await api.post('compose/send/', {
        receiver_email: receiverEmail,
        company_name: companyName,
        subject: generatedDraft.subject,
        html_body: generatedDraft.full_body,
        ai_used: true,
        theme_used: selectedTheme
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSentSuccessData({ id: data.id, companyName: companyName });
      setGeneratedDraft(null);
      setCompanyName('');
      setJobDescription('');
      setAboutCompany('');
      setReceiverEmail('');
      setSelectedTheme('none');
    },
    onError: (err: any) => {
      Alert.alert("Send Failed", err.response?.data?.error || "Unknown error");
    }
  });

  const dividerStyle = [styles.divider, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }];
  const inputStyle = [styles.input, { color: colors.textPrimary, backgroundColor: colors.background }];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 140 }}>
        {sentSuccessData ? (
          <Animated.View entering={FadeInRight.duration(250)}>
            <BentoCard style={{ padding: spacing.xl, alignItems: 'center' }}>
              <CheckCircle color="#10b981" size={64} style={{ marginBottom: 16 }} />
              <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>Email Sent to {sentSuccessData.companyName}</Text>
              
              <Text style={[typography.body1, { color: colors.textSecondary, marginTop: 32, marginBottom: 16 }]}>Set a Follow-Up Reminder?</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
                <Text style={{ color: colors.textPrimary, marginRight: 8, fontSize: 16 }}>Remind me in</Text>
                <TextInput 
                  style={[styles.input, { width: 70, textAlign: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: colors.textPrimary, padding: 8 }]} 
                  value={reminderDays} 
                  onChangeText={setReminderDays} 
                  keyboardType="numeric" 
                />
                <Text style={{ color: colors.textPrimary, marginLeft: 8, fontSize: 16 }}>days</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.accent, width: '100%' }]} 
                onPress={async () => {
                  if (reminderDays && !isNaN(Number(reminderDays))) {
                    const date = new Date();
                    date.setDate(date.getDate() + Number(reminderDays));
                    
                    const existing = await SecureStore.getItemAsync('reminders');
                    const reminders = existing ? JSON.parse(existing) : {};
                    reminders[sentSuccessData.id] = {
                       date: date.toISOString(),
                       companyName: sentSuccessData.companyName
                    };
                    await SecureStore.setItemAsync('reminders', JSON.stringify(reminders));
                    Alert.alert("Reminder Set", `We'll remind you to follow up on ${date.toLocaleDateString()}`);
                  }
                  setSentSuccessData(null);
                  navigation.navigate('MainTabs', { screen: 'History' });
                }}
              >
                <Text style={[typography.button, { color: '#fff' }]}>SAVE & VIEW HISTORY</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ marginTop: 24 }}
                onPress={() => {
                  setSentSuccessData(null);
                  navigation.navigate('MainTabs', { screen: 'History' });
                }}
              >
                <Text style={[typography.button, { color: colors.textSecondary }]}>SKIP</Text>
              </TouchableOpacity>
            </BentoCard>
          </Animated.View>
        ) : !generatedDraft ? (
          <Animated.View entering={FadeInRight.duration(250)} exiting={FadeOut}>
            <View style={styles.headerRow}>
              <Text style={[typography.h1, { color: colors.textPrimary }]}>Composer</Text>
              {profile?.resume && (
                <View style={[styles.resumeBadge, { backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 122, 255, 0.1)' }]}>
                  <Paperclip color={colors.accent} size={14} />
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>Resume Linked</Text>
                </View>
              )}
            </View>

            <BentoCard style={{ padding: spacing.lg }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>COMPANY NAME *</Text>
              <TextInput style={inputStyle} placeholderTextColor={colors.textSecondary} placeholder="Acme Corp" value={companyName} onChangeText={setCompanyName} />
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>JOB DESCRIPTION / ROLE DETAILS</Text>
              <TextInput style={[inputStyle, { height: 80, paddingTop: 16 }]} multiline placeholderTextColor={colors.textSecondary} placeholder="Looking for a backend engineer..." value={jobDescription} onChangeText={setJobDescription} />
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>TONE</Text>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                {(['Professional', 'Friendly', 'Direct']).map((t) => (
                   <TouchableOpacity
                     key={t}
                     onPress={() => setTone(t)}
                     style={[styles.outlineBtn, { flex: 1, marginHorizontal: 4, borderColor: tone === t ? colors.accent : colors.border, backgroundColor: tone === t ? 'rgba(0,0,0,0.05)' : 'transparent', padding: 10 }]}
                   >
                     <Text style={{ color: tone === t ? colors.accent : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{t}</Text>
                   </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>CONTEXT / ABOUT COMPANY</Text>
              <TextInput style={inputStyle} placeholderTextColor={colors.textSecondary} placeholder="Fast growing AI startup..." value={aboutCompany} onChangeText={setAboutCompany} />
              
              <View style={styles.switchRow}>
                <Text style={[typography.body1, { color: colors.textPrimary, fontWeight: '600' }]}>Attach Profile Resume</Text>
                <Switch value={useResume} onValueChange={setUseResume} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={'#ffffff'} />
              </View>

              {generateMutation.isPending ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={[styles.aiCore, { backgroundColor: colors.accent }, animatedPulseStyle]} />
                  <Text style={[typography.caption, { color: colors.accent }]}>AGENTIC AI DRAFTING...</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => generateMutation.mutate()} disabled={!companyName}>
                  <LinearGradient colors={[colors.deepViolet, colors.neonCyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
                    <Sparkles color="#fff" size={20} style={{ marginRight: 8 }} />
                    <Text style={[typography.button, { color: '#fff' }]}>GENERATE AI PITCH</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </BentoCard>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInRight.duration(250)}>
            <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.md }]}>Review Draft</Text>
            
            <BentoCard style={{ padding: spacing.lg }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>TO EMAIL *</Text>
              <TextInput style={inputStyle} keyboardType="email-address" autoCapitalize="none" value={receiverEmail} onChangeText={setReceiverEmail} />
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>SUBJECT</Text>
              <TextInput style={inputStyle} value={generatedDraft.subject} onChangeText={(t) => setGeneratedDraft({...generatedDraft, subject: t})} />
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>SELECT THEME</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
                {THEMES.map(theme => {
                  const isActive = selectedTheme === theme.id;
                  return (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.themeCard,
                        { 
                          borderColor: isActive ? colors.neonCyan : colors.border,
                          backgroundColor: isActive ? 'rgba(0, 240, 255, 0.15)' : colors.background 
                        }
                      ]}
                      onPress={() => setSelectedTheme(theme.id)}
                    >
                      {isActive && <Check color={colors.neonCyan} size={14} style={{ marginRight: 6 }} />}
                      <Text style={[styles.themeText, { color: isActive ? colors.neonCyan : colors.textSecondary }]}>{theme.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.label, { color: colors.textSecondary }]}>HTML BODY</Text>
              <TextInput style={[inputStyle, { height: 250, paddingTop: 16 }]} multiline value={generatedDraft.full_body} onChangeText={(t) => setGeneratedDraft({...generatedDraft, full_body: t})} />
              
              <TouchableOpacity 
                style={[styles.outlineBtn, { borderColor: colors.border }]} 
                onPress={() => previewMutation.mutate()} 
                disabled={previewMutation.isPending}
              >
                <Text style={[typography.button, { color: colors.textPrimary }]}>{previewMutation.isPending ? "LOADING PREVIEW..." : "PREVIEW HTML THEME"}</Text>
              </TouchableOpacity>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.outlineBtn, { flex: 1, marginRight: 8, borderColor: '#ef4444' }]} onPress={() => setGeneratedDraft(null)}>
                  <Text style={[typography.button, { color: '#ef4444' }]}>DISCARD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent, flex: 2, marginLeft: 8, paddingVertical: 14 }]} onPress={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
                  <Text style={[typography.button, { color: '#fff' }]}>{sendMutation.isPending ? "SENDING..." : "DISPATCH EMAIL"}</Text>
                </TouchableOpacity>
              </View>
            </BentoCard>
          </Animated.View>
        )}
      </ScrollView>

      <Modal visible={previewModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.cardSurface }}>
          <View style={[styles.modalHeader, { backgroundColor: colors.cardSurface, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>Preview</Text>
            <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
              <Text style={[typography.button, { color: colors.accent }]}>Close</Text>
            </TouchableOpacity>
          </View>
          {previewHtml ? (
            <WebView source={{ html: previewHtml }} style={{ flex: 1, backgroundColor: colors.background }} originWhitelist={['*']} />
          ) : (
            <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.textPrimary }}>Loading preview...</Text></View>
          )}
        </SafeAreaView>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
  resumeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 12, letterSpacing: 0.5 },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 24 },
  button: { flexDirection: 'row', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  outlineBtn: { padding: 14, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionRow: { flexDirection: 'row', marginTop: 16 },
  loadingContainer: { alignItems: 'center', paddingVertical: 24 },
  aiCore: { width: 40, height: 40, borderRadius: 20, marginBottom: 16 },
  themeScroll: { marginBottom: 8, paddingBottom: 8 },
  themeCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  themeText: { fontSize: 13, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  divider: { height: 1, width: '100%' }
});
