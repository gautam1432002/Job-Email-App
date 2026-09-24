import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { SlideInRight, SlideOutLeft, Easing } from 'react-native-reanimated';
import api from '../../services/api';
import { useAppTheme, typography, spacing, borderRadius } from '../../utils/theme';
import BentoCard from '../../components/BentoCard';
import { Bot } from 'lucide-react-native';

interface EmailLog {
  id: number;
  receiver_email: string;
  company_name: string;
  subject: string;
  status: string;
  sent_at: string;
  ai_used: boolean;
}

export default function HistoryScreen() {
  const { colors, isDark } = useAppTheme();

  const { data: logs, isLoading, isError } = useQuery<EmailLog[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await api.get('history/');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: '#ef4444' }}>Failed to load history.</Text>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: colors.background }]}
      entering={SlideInRight.duration(250).easing(Easing.out(Easing.cubic))} 
      exiting={SlideOutLeft.duration(250)}
    >
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 100 }}
        ListHeaderComponent={
          <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.lg, paddingHorizontal: spacing.sm }]}>History</Text>
        }
        ListEmptyComponent={
          <Text style={[typography.body1, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl }]}>No emails sent yet.</Text>
        }
        renderItem={({ item, index }) => (
          <View>
            <BentoCard style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.recipientInfo}>
                  <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '700' }]}>{item.company_name}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>{item.receiver_email}</Text>
                </View>
                <View style={[styles.dotIndicator, { backgroundColor: item.status === 'sent' ? '#10b981' : '#ef4444' }]} />
              </View>
              
              <Text style={[typography.body2, { color: colors.textPrimary, marginVertical: spacing.md }]} numberOfLines={2}>
                "{item.subject}"
              </Text>
              
              <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />
              
              <View style={styles.footerRow}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{new Date(item.sent_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
                {item.ai_used && (
                  <View style={[styles.aiBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <Bot color={colors.textSecondary} size={14} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>AI ASSISTED</Text>
                  </View>
                )}
              </View>
            </BentoCard>
          </View>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 20, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recipientInfo: { flex: 1, paddingRight: 16 },
  dotIndicator: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  divider: { height: 1, width: '100%', marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }
});
