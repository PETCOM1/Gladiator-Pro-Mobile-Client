import { Radius } from '@/constants/theme';
import { TENANT } from '@/constants/tenant';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const dimText = useThemeColor({}, 'dimText');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const accentColor = useThemeColor({}, 'accent');
  const insets = useSafeAreaInsets();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const [clock, setClock] = useState('');

  const [dPatrols, setDP] = useState(0);
  const [dCheckpoints, setDC] = useState(0);
  const [dOB, setDO] = useState(0);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    const targets = { p: 12, c: 48, o: 3 };
    let f = 0;
    const counter = setInterval(() => { f++; const t = Math.min(f / 25, 1); setDP(Math.round(t * targets.p)); setDC(Math.round(t * targets.c)); setDO(Math.round(t * targets.o)); if (f >= 25) clearInterval(counter); }, 40);

    const clockInterval = setInterval(() => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000);
    setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    return () => { clearInterval(counter); clearInterval(clockInterval); };
  }, []);

  const STATS = [
    { label: 'Patrols', value: String(dPatrols), color: tintColor, icon: 'map.fill' },
    { label: 'Checkpoints', value: String(dCheckpoints), color: accentColor, icon: 'mappin.circle.fill' },
    { label: 'OB Entries', value: String(dOB), color: successColor, icon: 'doc.text.fill' },
  ];

  const ACTIONS = [
    { title: 'Patrol', icon: 'map.fill', route: '/(drawer)/patrol', color: tintColor },
    { title: 'OB Entry', icon: 'pencil.and.outline', route: '/(drawer)/ob-entry', color: warningColor },
    { title: 'Visitors', icon: 'person.2.fill', route: '/(drawer)/visitors', color: accentColor },
    { title: 'Profile', icon: 'person.crop.circle.fill', route: '/(drawer)/profile', color: successColor },
  ];

  return (
    <TacticalBackground style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Animated.View style={{ opacity: fadeIn }}>
          {/* Greeting */}
          <View style={styles.greeting}>
            <View>
              <Text style={[styles.hello, { color: textColor }]}>Hello, {TENANT.operatorName}</Text>
              <Text style={[styles.greetingSub, { color: dimText }]}>What's your next task?</Text>
            </View>
            <Text style={[styles.clock, { color: dimText }]}>{clock}</Text>
          </View>

          {/* Stats */}
          <Text style={[styles.sectionLabel, { color: dimText }]}>Today's Overview</Text>
          <View style={styles.statsRow}>
            {STATS.map(stat => (
              <ThemedCard key={stat.label} style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}10` }]}>
                  <IconSymbol name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: dimText }]}>{stat.label}</Text>
              </ThemedCard>
            ))}
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionLabel, { color: dimText }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {ACTIONS.map(action => (
              <TouchableOpacity
                key={action.title}
                activeOpacity={0.7}
                onPress={() => router.push(action.route as any)}
                style={styles.actionWrapper}
              >
                <ThemedCard style={styles.actionCard} pressable={false}>
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}10` }]}>
                    <IconSymbol name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={[styles.actionTitle, { color: textColor }]}>{action.title}</Text>
                </ThemedCard>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </TacticalBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  hello: { fontSize: 24, fontWeight: '700' },
  greetingSub: { fontSize: 14, marginTop: 2 },
  clock: { fontSize: 14, fontWeight: '500' },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  actionWrapper: { width: '50%', paddingHorizontal: 5, marginBottom: 10 },
  actionCard: { alignItems: 'center', paddingVertical: 20 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionTitle: { fontSize: 14, fontWeight: '600' },
});
