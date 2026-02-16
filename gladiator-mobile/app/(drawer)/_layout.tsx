import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DrawerLayout() {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint'); // Tactical blue

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: cardColor,
          borderBottomWidth: 2,
          borderBottomColor: tintColor,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: tintColor,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        },
        drawerStyle: {
          backgroundColor: cardColor,
          width: 280,
          borderRightWidth: 2,
          borderRightColor: tintColor,
        },
        drawerActiveTintColor: tintColor,
        drawerInactiveTintColor: '#808080',
        drawerActiveBackgroundColor: 'rgba(0, 191, 255, 0.1)',
        drawerLabelStyle: {
          fontWeight: '700',
          fontSize: 13,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        },
        drawerItemStyle: {
          borderRadius: 0,
          marginVertical: 2,
          borderLeftWidth: 3,
          borderLeftColor: 'transparent',
        },
        header: ({ options, route }) => (
          <View style={[styles.header, { backgroundColor: cardColor, borderBottomColor: tintColor }]}>
            <View style={styles.headerTop}>
              <View style={styles.brandingContainer}>
                <Text style={[styles.brandText, { color: tintColor }]}>GLADIATOR PRO</Text>
                <Text style={[styles.tenantText, { color: '#808080' }]}>GPS-10293</Text>
              </View>
              <View style={styles.statusBar}>
                <View style={[styles.statusDot, { backgroundColor: tintColor }]} />
                <Text style={[styles.statusText, { color: tintColor }]}>ONLINE</Text>
              </View>
            </View>
            <Text style={[styles.screenTitle, { color: textColor }]}>
              {options.title || route.name}
            </Text>
          </View>
        ),
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'DASHBOARD',
          title: 'TACTICAL OPS',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={22} name="house.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="ob-entry"
        options={{
          drawerLabel: 'OB ENTRY',
          title: 'OB ENTRY LOG',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={22} name="pencil.and.outline" color={color} />,
        }}
      />
      <Drawer.Screen
        name="patrol"
        options={{
          drawerLabel: 'PATROL',
          title: 'PATROL CHECKPOINT',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={22} name="map.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="visitors"
        options={{
          drawerLabel: 'VISITORS',
          title: 'VISITOR LOG',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={22} name="person.2.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'PROFILE',
          title: 'PERSONNEL FILE',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={22} name="person.crop.circle.fill" color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  tenantText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  screenTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});
