import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const insets = useSafeAreaInsets();

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);


  const QuickAction = ({ title, icon, color, route }: { title: string, icon: any, color: string, route: any }) => (
    <TouchableOpacity
      style={styles.quickAction}
      activeOpacity={0.7}
      onPress={() => router.push(route)}
    >
      <ThemedCard style={styles.actionCard} showBrackets={true}>
        <IconSymbol size={28} name={icon} color={color} />
        <Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text>
      </ThemedCard>
    </TouchableOpacity>
  );

  return (
    <TacticalBackground style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 }
        ]}
      >
        {/* System Status Header */}
        <View style={styles.systemHeader}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: tintColor }]} />
            <Text style={[styles.systemStatus, { color: tintColor }]}>OPS CENTER // SECURE_ESTABLISHED</Text>
          </View>
          <Text style={[styles.timestamp, { color: '#808080' }]}>{timestamp} UTC</Text>
        </View>


        {/* Operator Info */}
        <View style={styles.header}>
          <View style={styles.operatorTag}>
            <Text style={[styles.opLabel, { color: tintColor }]}>OPERATOR_STATUS</Text>
            <Text style={[styles.opValue, { color: textColor }]}>OFFICER-442 [ACTIVE]</Text>
          </View>
          <Text style={[styles.subtitle, { color: '#808080' }]}>LOCATION: SECTOR-G // GLADIATOR_PRO_TENANT</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: tintColor }]}>MISSION_PROTOCOLS</Text>
          <View style={[styles.sectionLine, { backgroundColor: tintColor }]} />
        </View>
        <View style={styles.grid}>
          <QuickAction title="OB ENTRY" icon="pencil.and.outline" color={tintColor} route="/ob-entry" />
          <QuickAction title="PATROL" icon="map.fill" color={tintColor} route="/patrol" />
          <QuickAction title="VISITORS" icon="person.2.fill" color={tintColor} route="/visitors" />
          <QuickAction title="PROFILE" icon="chart.bar.fill" color={warningColor} route="/profile" />
        </View>

        {/* Mission Summary */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: tintColor }]}>DATA_TELEMETRY</Text>
          <View style={[styles.sectionLine, { backgroundColor: tintColor }]} />
        </View>

        <ThemedCard style={styles.summaryCard} showScanline={true}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: tintColor }]}>12</Text>
              <Text style={[styles.summaryLabel, { color: '#808080' }]}>PATROLLING</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: errorColor }]}>02</Text>
              <Text style={[styles.summaryLabel, { color: '#808080' }]}>INCIDENTS</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: warningColor }]}>08</Text>
              <Text style={[styles.summaryLabel, { color: '#808080' }]}>VISITORS</Text>
            </View>
          </View>
        </ThemedCard>

      </ScrollView>
    </TacticalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  systemHeader: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 191, 255, 0.2)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 8,
  },
  systemStatus: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 9,
    fontFamily: 'monospace',
  },
  header: {
    marginBottom: 30,
    padding: 12,
    backgroundColor: 'rgba(0, 191, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.08)',
  },
  operatorTag: {
    marginBottom: 4,
  },
  opLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  opValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  quickAction: {
    width: '50%',
    padding: 6,
  },
  actionCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  actionTitle: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0, 191, 255, 0.15)',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  summaryLabel: {
    fontSize: 8,
    marginTop: 4,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  threatCard: {
    marginBottom: 20,
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  threatLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  threatIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  threatLevel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  threatDesc: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
    letterSpacing: 0.5,
  },
});
