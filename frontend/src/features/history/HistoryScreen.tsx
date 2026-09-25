import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { SlideInRight, SlideOutLeft, Easing } from 'react-native-reanimated';
import api from '../../services/api';
import { useAppTheme, typography, spacing, borderRadius } from '../../utils/theme';
import BentoCard from '../../components/BentoCard';
import { Bot, CheckCircle } from 'lucide-react-native';

interface EmailLog {
  id: number;
  receiver_email: string;
  company_name: string;
  subject: string;
  status: string;
  application_status: string;
  sent_at: string;
  ai_used: boolean;
}

const STATUSES = ['Applied', 'Viewed', 'Interview', 'Offer', 'Rejected'];

export default function HistoryScreen() {
  const { colors, isDark } = useAppTheme();
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const isSelectionMode = selectedIds.size > 0;

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => api.delete(`history/${id}/`)));
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const { data: logs, isLoading, isError } = useQuery<EmailLog[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await api.get('history/');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await api.patch(`history/${id}/`, { application_status: status });
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['history'] });
      const previousLogs = queryClient.getQueryData(['history']);
      queryClient.setQueryData(['history'], (old: any) => 
        old?.map((log: any) => log.id === id ? { ...log, application_status: status } : log)
      );
      return { previousLogs };
    },
    onError: (err, newLog, context) => {
      queryClient.setQueryData(['history'], context?.previousLogs);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
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
      entering={SlideInRight.duration(280).easing(Easing.out(Easing.cubic))}
    >
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 140 }}
        ListHeaderComponent={
          <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.lg, paddingHorizontal: spacing.sm }]}>History</Text>
        }
        ListEmptyComponent={
          <Text style={[typography.body1, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl }]}>No emails sent yet.</Text>
        }
        renderItem={({ item, index }) => {
          const isSelected = selectedIds.has(item.id);
          return (
          <TouchableOpacity 
            activeOpacity={0.8}
            onLongPress={() => {
              if (!isSelectionMode) toggleSelection(item.id);
            }}
            onPress={() => {
              if (isSelectionMode) {
                toggleSelection(item.id);
              } else {
                // standard behavior to open email details
              }
            }}
          >
            <BentoCard style={[styles.card, isSelected && { borderColor: colors.accent, borderWidth: 2 }]}>
              {isSelected && (
                <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                  <CheckCircle color={colors.accent} size={24} fill="rgba(255,255,255,0.8)" />
                </View>
              )}
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

              <View style={{ marginTop: 16 }}>
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>APPLICATION STATUS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {STATUSES.map(s => {
                    const isActive = item.application_status === s;
                    return (
                      <TouchableOpacity 
                        key={s} 
                        onPress={() => updateStatusMutation.mutate({ id: item.id, status: s })}
                        style={[styles.statusChip, { 
                          backgroundColor: isActive ? (isDark ? '#FFFFFF' : '#000000') : 'transparent',
                          borderColor: isActive ? 'transparent' : colors.border
                        }]}
                      >
                        <Text style={[styles.statusChipText, { color: isActive ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary }]}>{s}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>

            </BentoCard>
          </TouchableOpacity>
        )}}
      />

      {isSelectionMode && (
        <Animated.View 
          entering={SlideInRight.duration(200)} 
          style={{ position: 'absolute', bottom: 110, left: spacing.lg, right: spacing.lg }}
        >
          <TouchableOpacity 
            style={{ backgroundColor: '#ef4444', padding: spacing.md, borderRadius: 16, alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
            onPress={() => deleteMutation.mutate(Array.from(selectedIds))}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[typography.button, { color: '#ffffff' }]}>Delete Selected ({selectedIds.size})</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
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
  aiBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  }
});
