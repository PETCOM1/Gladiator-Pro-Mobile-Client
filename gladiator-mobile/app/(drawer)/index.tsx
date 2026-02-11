import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const insets = useSafeAreaInsets();

  const QuickAction = ({ title, icon, color, route }: { title: string, icon: any, color: string, route: any }) => (
    <TouchableOpacity
      style={styles.quickAction}
      activeOpacity={0.7}
      onPress={() => router.push(route)}
    >
      <ThemedCard style={styles.actionCard}>
        <IconSymbol size={32} name={icon} color={color} />
        <Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text>
      </ThemedCard>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 20 }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.welcome, { color: textColor }]}>Welcome, Officer</Text>
        <Text style={[styles.subtitle, { color: '#9BA1A6' }]}>Your shift started at 08:00 AM</Text>
      </View>

      <View style={styles.grid}>
        <QuickAction title="New OB Entry" icon="pencil.and.outline" color={tintColor} route="/ob-entry" />
        <QuickAction title="Patrol" icon="map.fill" color={successColor} route="/patrol" />
        <QuickAction title="Log Visitor" icon="person.2.fill" color={tintColor} route="/visitors" />
        <QuickAction title="Status" icon="chart.bar.fill" color="#F59E0B" route="/profile" />
      </View>

      <Text style={[styles.sectionTitle, { color: textColor }]}>Today's Summary</Text>

      <ThemedCard style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: successColor }]}>12</Text>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Patrols</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: errorColor }]}>2</Text>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Incidents</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: tintColor }]}>45</Text>
            <Text style={[styles.summaryLabel, { color: '#9BA1A6' }]}>Visitors</Text>
          </View>
        </View>
      </ThemedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAction: {
    width: '48%',
    marginBottom: 16,
  },
  actionCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  actionTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryCard: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
