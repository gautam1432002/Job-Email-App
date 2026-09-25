import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { SlideInRight, SlideOutLeft, Easing } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAppTheme, typography, spacing, shadows } from '../../utils/theme';
import BentoCard from '../../components/BentoCard';
import { PenLine, Send, MessageSquare, Clock, Zap, Target, Users } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors, isDark } = useAppTheme();

  const { data: history } = useQuery({
    queryKey: ['history_summary'],
    queryFn: async () => {
      const res = await api.get('history/');
      return res.data;
    }
  });

  const [overdueReminders, setOverdueReminders] = React.useState<any[]>([]);
  const [selectedFramework, setSelectedFramework] = React.useState<any>(null);

  const today = new Date().toISOString().split('T')[0];
  const pitchesToday = history?.filter((h: any) => h.sent_at?.startsWith(today)).length || 0;
  const dailyGoal = 5;
  const progress = Math.min(pitchesToday / dailyGoal, 1);
  const radius = 30;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const frameworks = [
    { id: 'standard', title: 'Standard', desc: 'Professional & direct', icon: <Zap color={colors.textPrimary} size={20} />, context: 'Reaching out for a standard application process. Summarize why my profile fits the role.' },
    { id: 'aggressive', title: 'Aggressive Follow-up', desc: 'Show high intent', icon: <Target color={colors.textPrimary} size={20} />, context: 'Following up after a previous conversation or application to show strong, aggressive interest and intent.' },
    { id: 'networking', title: 'Networking', desc: 'Focus on connection', icon: <Users color={colors.textPrimary} size={20} />, context: 'Looking to connect and learn more about the team, not explicitly asking for a job right now.' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      async function fetchReminders() {
        try {
          const existing = await SecureStore.getItemAsync('reminders');
          if (existing) {
            const reminders = JSON.parse(existing);
            const now = new Date();
            const overdue = [];
            for (const key in reminders) {
              const date = new Date(reminders[key].date);
              if (date <= now) {
                overdue.push(reminders[key]);
              }
            }
            setOverdueReminders(overdue);
          }
        } catch (e) {
          console.error(e);
        }
      }
      fetchReminders();
    }, [])
  );

  return (
    <Animated.View 
      style={[{ flex: 1, backgroundColor: colors.background }]}
      entering={SlideInRight.duration(280).easing(Easing.out(Easing.cubic))}
    >
      <ScrollView style={[styles.container]} contentContainerStyle={{ padding: spacing.lg, paddingTop: 60, paddingBottom: 140 }}>
        <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.md }]}>
          ProReach
        </Text>
        <Text style={[typography.body1, { color: colors.textSecondary, marginBottom: spacing.xxl }]}>
          Agentic AI Outreach Platform
        </Text>

        {/* Big Compose Action */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Compose')}>
          <BentoCard style={styles.primaryAction} variant="gradient">
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <PenLine color="#ffffff" size={32} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[typography.h2, { color: '#ffffff' }]}>Draft New Pitch</Text>
              <Text style={[typography.body2, { color: 'rgba(255, 255, 255, 0.8)' }]}>Initialize AI generation flow</Text>
            </View>
          </BentoCard>
        </TouchableOpacity>

        {/* Quick Stats Grid */}
        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.xl }]}>
          Overview
        </Text>
        <View style={styles.statsGrid}>
          <BentoCard style={[styles.statCard, { marginRight: spacing.sm }]}>
            <View style={[styles.smallIconBox, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <Send color={colors.textPrimary} size={20} />
            </View>
            <Text style={[typography.h1, { color: colors.textPrimary, marginVertical: spacing.sm, fontWeight: '800' }]}>{history?.length || 0}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>EMAILS SENT</Text>
          </BentoCard>
          
          <BentoCard style={[styles.statCard, { marginLeft: spacing.sm }]}>
            <View style={[styles.smallIconBox, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <MessageSquare color={colors.textPrimary} size={20} />
            </View>
            <Text style={[typography.h1, { color: colors.textPrimary, marginVertical: spacing.sm, fontWeight: '800' }]}>0</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>RESPONSES</Text>
          </BentoCard>
        </View>

        {/* Daily Outreach Tracker */}
        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.xl }]}>
          Daily Progress
        </Text>
        <BentoCard style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg }}>
           <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
             <Svg width="80" height="80" viewBox="0 0 80 80">
               <Circle cx="40" cy="40" r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
               <Circle cx="40" cy="40" r={radius} stroke={colors.accent} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-90 40 40)" />
             </Svg>
             <Text style={{ position: 'absolute', fontWeight: 'bold', fontSize: 16, color: colors.textPrimary }}>{pitchesToday}/{dailyGoal}</Text>
           </View>
           <View style={{ marginLeft: spacing.lg, flex: 1 }}>
             <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: 4 }]}>Pitches Drafted</Text>
             <Text style={[typography.body2, { color: colors.textSecondary }]}>{pitchesToday >= dailyGoal ? "Goal reached! Great job." : `${dailyGoal - pitchesToday} more to reach your daily goal!`}</Text>
           </View>
        </BentoCard>

        {/* Quick Frameworks */}
        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.xl }]}>
          Quick Frameworks
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.lg }} contentContainerStyle={{ paddingLeft: spacing.lg, paddingRight: spacing.lg * 2, paddingBottom: spacing.lg, paddingTop: spacing.sm }}>
          {frameworks.map((fw) => (
            <BentoCard key={fw.id} style={{ width: 160, marginRight: spacing.sm, minHeight: 120 }}>
              <TouchableOpacity 
                activeOpacity={0.6} 
                onPress={() => setSelectedFramework(fw)}
                style={{ flex: 1, padding: spacing.md, justifyContent: 'space-between' }}
              >
                <View style={[styles.smallIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', marginBottom: 12 }]}>
                  {fw.icon}
                </View>
                <View>
                  <Text style={[typography.body1, { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }]} numberOfLines={1}>{fw.title}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{fw.desc}</Text>
                </View>
              </TouchableOpacity>
            </BentoCard>
          ))}
        </ScrollView>

        {overdueReminders.length > 0 && (
          <Animated.View entering={SlideInRight.duration(250).delay(100)}>
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.xl }]}>
              Action Needed
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('History')}>
              <BentoCard style={[styles.primaryAction, { borderColor: '#ef4444', borderWidth: 1 }]}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Clock color="#ef4444" size={32} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={[typography.h2, { color: colors.textPrimary }]}>{overdueReminders.length} Follow-Up{overdueReminders.length > 1 ? 's' : ''} Due</Text>
                  <Text style={[typography.body2, { color: colors.textSecondary }]} numberOfLines={1}>
                    {overdueReminders.map(r => r.companyName).join(', ')}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>NEEDS FOLLOW-UP</Text>
                </View>
              </BentoCard>
            </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>

      <Modal visible={!!selectedFramework} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 }}>
          <BentoCard variant="gradient" style={{ padding: spacing.xl, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 30, elevation: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.smallIconBox, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 12 }]}>
                  {selectedFramework && React.cloneElement(selectedFramework.icon, { color: '#ffffff' })}
                </View>
                <Text style={[typography.h2, { color: '#ffffff', flexShrink: 1 }]} numberOfLines={1}>{selectedFramework?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFramework(null)} style={{ paddingLeft: 8 }}>
                <Text style={[typography.button, { color: 'rgba(255,255,255,0.7)' }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={[typography.body1, { color: 'rgba(255,255,255,0.9)', marginBottom: spacing.md }]}>{selectedFramework?.desc}</Text>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: spacing.md, marginBottom: spacing.xl, borderRadius: 16 }}>
              <Text style={[typography.body1, { color: '#ffffff', fontStyle: 'italic' }]}>"{selectedFramework?.context}"</Text>
            </View>
            <TouchableOpacity 
              style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 16, alignItems: 'center' }}
              onPress={() => {
                const ctx = selectedFramework.context;
                setSelectedFramework(null);
                navigation.navigate('Compose', { initialContext: ctx });
              }}
            >
              <Text style={[typography.button, { color: colors.accent }]}>Use This Framework</Text>
            </TouchableOpacity>
          </BentoCard>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  smallIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
