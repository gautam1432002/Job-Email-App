import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { SlideInRight, SlideOutLeft, Easing } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAppTheme, typography, spacing, shadows } from '../../utils/theme';
import BentoCard from '../../components/BentoCard';
import { PenLine, Send, MessageSquare, Clock } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: spacing.lg, paddingTop: 60 }}>
      <Animated.View entering={SlideInRight.duration(250).easing(Easing.out(Easing.cubic))} exiting={SlideOutLeft.duration(250)}>
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

      </Animated.View>
    </ScrollView>
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
