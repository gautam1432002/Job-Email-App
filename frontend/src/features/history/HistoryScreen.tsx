import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Animated.View entering={FadeInDown.duration(400).springify().damping(20).delay(index * 100)}>
            <BentoCard style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.recipientInfo}>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>{item.company_name}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{item.receiver_email}</Text>
                </View>
                <View style={[styles.statusBadgeFull, { backgroundColor: item.status === 'sent' ? 'rgba(0, 255, 102, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={[typography.caption, { color: item.status === 'sent' ? colors.emerald : '#ef4444', fontWeight: 'bold' }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={[typography.body2, { color: colors.textPrimary, marginVertical: spacing.md }]} numberOfLines={2}>
                "{item.subject}"
              </Text>
              
              <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]} />
              
              <View style={styles.footerRow}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{new Date(item.sent_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
                {item.ai_used && (
                  <View style={[styles.aiBadge, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
                    <Bot color={colors.neonCyan} size={14} style={{ marginRight: 4 }} />
                    <Text style={{ color: colors.neonCyan, fontSize: 10, fontWeight: 'bold' }}>AI DRAFTED</Text>
                  </View>
                )}
              </View>
            </BentoCard>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 20, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recipientInfo: { flex: 1, paddingRight: 16 },
  statusBadgeFull: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, width: '100%', marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }
});
