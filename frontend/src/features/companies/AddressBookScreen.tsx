import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import api from '../../services/api';
import { Theme } from '../../utils/theme';
import GlassCard from '../../components/GlassCard';

interface Company {
  id: number;
  name: string;
  email: string;
  notes: string;
}

export default function AddressBookScreen() {
  const { data: companies, isLoading, isError } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('companies/');
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
        <Text style={styles.errorText}>Failed to load address book.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: Theme.spacing.md }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No companies saved yet.</Text>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 100)}>
            <GlassCard style={styles.card}>
              <Text style={styles.companyName}>{item.name}</Text>
              <Text style={styles.companyEmail}>{item.email}</Text>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
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
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  companyEmail: {
    color: Theme.colors.text,
    fontSize: 14,
    marginBottom: Theme.spacing.sm,
  },
  notes: {
    color: Theme.colors.textDim,
    fontSize: 12,
    fontStyle: 'italic',
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
