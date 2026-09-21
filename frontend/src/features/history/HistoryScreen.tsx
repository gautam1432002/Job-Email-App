import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import api from '../../services/api';
import { Theme } from '../../utils/theme';
import GlassCard from '../../components/GlassCard';

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
  const { data: logs, isLoading, isError } = useQuery<EmailLog[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await api.get('history/');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load history.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: Theme.spacing.md }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No emails sent yet.</Text>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 100)}>
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.companyName}>{item.company_name}</Text>
                <Text style={[styles.status, item.status === 'sent' ? styles.statusSent : styles.statusFailed]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.receiver}>{item.receiver_email}</Text>
              <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
              <View style={styles.footerRow}>
                <Text style={styles.date}>{new Date(item.sent_at).toLocaleDateString()}</Text>
                {item.ai_used && <Text style={styles.aiBadge}>AI Drafted</Text>}
              </View>
            </GlassCard>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Theme.colors.background 
  },
  center: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  status: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.pill,
    overflow: 'hidden',
  },
  statusSent: {
    backgroundColor: 'rgba(0, 250, 154, 0.2)',
    color: Theme.colors.success,
  },
  statusFailed: {
    backgroundColor: 'rgba(255, 76, 76, 0.2)',
    color: Theme.colors.error,
  },
  receiver: {
    color: Theme.colors.textDim,
    fontSize: 12,
    marginBottom: Theme.spacing.xs,
  },
  subject: {
    color: Theme.colors.text,
    fontSize: 14,
    marginBottom: Theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  date: {
    color: Theme.colors.textDim,
    fontSize: 10,
  },
  aiBadge: {
    fontSize: 10,
    color: Theme.colors.background,
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  errorText: {
    color: Theme.colors.error,
  },
  emptyText: {
    color: Theme.colors.textDim,
    textAlign: 'center',
    marginTop: Theme.spacing.xxl,
  }
});
