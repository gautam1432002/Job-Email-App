import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import api from '../../services/api';
import { useAppTheme, typography, spacing } from '../../utils/theme';
import BentoCard from '../../components/BentoCard';

interface Company {
  id: number;
  name: string;
  email: string;
  notes: string;
}

export default function AddressBookScreen() {
  const { colors } = useAppTheme();
  
  const { data: companies, isLoading, isError } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('companies/');
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
        <Text style={{ color: '#ef4444' }}>Failed to load address book.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 60, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={[typography.body1, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl }]}>No companies saved yet.</Text>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 100)}>
            <BentoCard style={{ marginBottom: spacing.md, padding: 20 }}>
              <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.xs }]}>{item.name}</Text>
              <Text style={[typography.body2, { color: colors.textSecondary, marginBottom: spacing.sm }]}>{item.email}</Text>
              {item.notes ? <Text style={[typography.caption, { color: colors.textSecondary, fontStyle: 'italic' }]}>{item.notes}</Text> : null}
            </BentoCard>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
