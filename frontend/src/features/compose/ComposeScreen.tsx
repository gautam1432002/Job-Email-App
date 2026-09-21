import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert, Modal, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useQuery, useMutation } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut, Easing, withRepeat, withTiming, useSharedValue, useAnimatedStyle, withSequence } from 'react-native-reanimated';
import api from '../../services/api';
import { Theme } from '../../utils/theme';
import GlassCard from '../../components/GlassCard';

export default function ComposeScreen() {
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [aboutCompany, setAboutCompany] = useState('');
  const [useResume, setUseResume] = useState(true);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('none');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const [generatedDraft, setGeneratedDraft] = useState<{subject: string; full_body: string} | null>(null);

  const THEMES = [
    { id: 'none', name: 'Plain Text', color: '#52525b' },
    { id: 'theme1', name: 'Void Purple', color: '#6d28d9' },
    { id: 'theme2', name: 'Editorial Ink', color: '#18181b' },
    { id: 'theme3', name: 'Soft Bento', color: '#fbbf24' },
    { id: 'theme4', name: 'Neobrutalist', color: '#34d399' },
    { id: 'theme5', name: 'Newsletter', color: '#1e293b' },
    { id: 'theme6', name: 'Minimal', color: '#94a3b8' },
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
      // Inject viewport meta tag for mobile responsiveness if not present
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
    onSuccess: () => {
      Alert.alert("Success", "Email dispatched via SMTP!");
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: Theme.spacing.md }}>
        {!generatedDraft ? (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut}>
            <GlassCard style={styles.card}>
              <Text style={styles.header}>
                New Outreach {profile?.resume ? <Text style={{ color: Theme.colors.primary, fontSize: 12 }}>📎 Resume Attached</Text> : null}
              </Text>
              
              <Text style={styles.label}>Company Name *</Text>
              <TextInput style={styles.input} placeholderTextColor={Theme.colors.textDim} placeholder="Acme Corp" value={companyName} onChangeText={setCompanyName} />
              
              <Text style={styles.label}>Job Description / Role Details</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline placeholderTextColor={Theme.colors.textDim} placeholder="Looking for a backend engineer..." value={jobDescription} onChangeText={setJobDescription} />
              
              <Text style={styles.label}>Context / About Company</Text>
              <TextInput style={styles.input} placeholderTextColor={Theme.colors.textDim} placeholder="Fast growing AI startup..." value={aboutCompany} onChangeText={setAboutCompany} />
              
              <View style={styles.switchRow}>
                <Text style={styles.label}>Attach & Use Profile Resume</Text>
                <Switch value={useResume} onValueChange={setUseResume} trackColor={{ false: 'gray', true: Theme.colors.secondary }} thumbColor={useResume ? Theme.colors.primary : '#f4f3f4'} />
              </View>

              {generateMutation.isPending ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={[styles.aiCore, animatedPulseStyle]} />
                  <Text style={styles.loadingText}>Agentic AI Drafting...</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.button} onPress={() => generateMutation.mutate()} disabled={!companyName}>
                  <Text style={styles.buttonText}>GENERATE AI PITCH</Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(600)}>
            <GlassCard style={styles.card}>
              <Text style={styles.header}>Review Draft</Text>
              
              <Text style={styles.label}>To Email *</Text>
              <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" value={receiverEmail} onChangeText={setReceiverEmail} />
              
              <Text style={styles.label}>Subject</Text>
              <TextInput style={styles.input} value={generatedDraft.subject} onChangeText={(t) => setGeneratedDraft({...generatedDraft, subject: t})} />
              
              <Text style={styles.label}>Select Theme</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
                {THEMES.map(theme => {
                  const isActive = selectedTheme === theme.id;
                  return (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.themeCard,
                        { borderColor: isActive ? theme.color : 'rgba(255,255,255,0.1)' },
                        isActive && { backgroundColor: 'rgba(255,255,255,0.05)' }
                      ]}
                      onPress={() => setSelectedTheme(theme.id)}
                    >
                      <View style={[styles.themeColorIndicator, { backgroundColor: theme.color }]} />
                      <Text style={[styles.themeText, { color: isActive ? '#fff' : Theme.colors.textDim }]}>{theme.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.label}>Body (HTML supported)</Text>
              <TextInput style={[styles.input, { height: 200 }]} multiline value={generatedDraft.full_body} onChangeText={(t) => setGeneratedDraft({...generatedDraft, full_body: t})} />
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: Theme.colors.secondary, marginBottom: 10, marginTop: 15 }]} 
                onPress={() => previewMutation.mutate()} 
                disabled={previewMutation.isPending}
              >
                <Text style={styles.buttonText}>{previewMutation.isPending ? "LOADING PREVIEW..." : "PREVIEW HTML THEME"}</Text>
              </TouchableOpacity>
              
              <View style={[styles.actionRow, { marginTop: 0 }]}>
                <TouchableOpacity style={[styles.button, styles.outlineBtn, { flex: 1, marginRight: 5 }]} onPress={() => setGeneratedDraft(null)}>
                  <Text style={styles.outlineBtnText}>DISCARD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, {flex: 2, marginLeft: 5}]} onPress={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
                  <Text style={styles.buttonText}>{sendMutation.isPending ? "SENDING..." : "DISPATCH EMAIL"}</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      <Modal visible={previewModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Theme Preview</Text>
            <TouchableOpacity onPress={() => setPreviewModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
          {previewHtml ? (
            <WebView source={{ html: previewHtml }} style={{ flex: 1 }} originWhitelist={['*']} />
          ) : (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Loading preview...</Text></View>
          )}
        </SafeAreaView>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  card: { marginBottom: Theme.spacing.xl },
  header: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text, marginBottom: Theme.spacing.lg },
  label: { color: Theme.colors.secondary, fontSize: 12, fontWeight: 'bold', marginBottom: Theme.spacing.xs, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, color: Theme.colors.text, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.xl },
  button: { backgroundColor: Theme.colors.primary, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.pill, alignItems: 'center', shadowColor: Theme.colors.primary, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  buttonText: { color: '#000', fontWeight: '900', letterSpacing: 1.5 },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Theme.colors.error, shadowOpacity: 0 },
  outlineBtnText: { color: Theme.colors.error, fontWeight: '900', letterSpacing: 1.5 },
  actionRow: { flexDirection: 'row', marginTop: Theme.spacing.md },
  loadingContainer: { alignItems: 'center', paddingVertical: Theme.spacing.lg },
  aiCore: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.colors.primary, marginBottom: Theme.spacing.md, shadowColor: Theme.colors.primary, shadowOpacity: 1, shadowRadius: 20, elevation: 15 },
  loadingText: { color: Theme.colors.primary, fontWeight: 'bold', letterSpacing: 2 },
  themeScroll: { marginBottom: Theme.spacing.md, paddingBottom: 5 },
  themeCard: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.sm, borderRadius: Theme.borderRadius.md, borderWidth: 1, marginRight: Theme.spacing.sm, backgroundColor: 'rgba(0,0,0,0.2)' },
  themeColorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: Theme.spacing.sm },
  themeText: { fontSize: 13, fontWeight: 'bold' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#000' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalCloseBtn: { padding: 8 },
  modalCloseText: { color: Theme.colors.primary, fontWeight: 'bold' }
});
