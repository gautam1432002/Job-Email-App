import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { themeColors, typography, spacing } = useTheme();

  // Basic stats could be fetched here
  const { data: history } = useQuery({
    queryKey: ['history_summary'],
    queryFn: async () => {
      const res = await api.get('history/');
      return res.data;
    }
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} contentContainerStyle={{ padding: spacing.lg, paddingTop: 60 }}>
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={[typography.h1, { color: themeColors.textPrimary, marginBottom: spacing.md }]}>
          ProReach
        </Text>
        <Text style={[typography.body1, { color: themeColors.textSecondary, marginBottom: spacing.xxl }]}>
          Agentic AI Outreach Platform
        </Text>

        {/* Big Compose Action */}
        <TouchableOpacity 
          style={[styles.primaryAction, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}
          onPress={() => navigation.navigate('Compose')}
        >
          <View style={[styles.iconBox, { backgroundColor: themeColors.aiAccentGlow }]}>
            <Text style={{ fontSize: 32, color: themeColors.aiAccent }}>✍️</Text>
          </View>
          <View>
            <Text style={[typography.h2, { color: themeColors.textPrimary }]}>Draft New Pitch</Text>
            <Text style={[typography.body2, { color: themeColors.textSecondary }]}>Initialize AI generation flow</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats Grid */}
        <Text style={[typography.h3, { color: themeColors.textPrimary, marginBottom: spacing.md, marginTop: spacing.xl }]}>
          Overview
        </Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h1, { color: themeColors.aiAccent }]}>{history?.length || 0}</Text>
            <Text style={[typography.caption, { color: themeColors.textSecondary }]}>EMAILS SENT</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.elevatedSurface, borderColor: themeColors.border }]}>
            <Text style={[typography.h1, { color: themeColors.success }]}>0</Text>
            <Text style={[typography.caption, { color: themeColors.textSecondary }]}>RESPONSES</Text>
          </View>
        </View>

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
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
