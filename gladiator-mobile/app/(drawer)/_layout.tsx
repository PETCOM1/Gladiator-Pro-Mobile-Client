import { GladiatorLogo } from '@/components/GladiatorLogo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TENANT } from '@/constants/tenant';
import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DrawerLayout() {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const dimText = useThemeColor({}, 'dimText');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const background = useThemeColor({}, 'background');
  const errorColor = useThemeColor({}, 'error');
  const navigation = useNavigation();

  return (
    <Drawer
      drawerContent={(props) => (
        <View style={{ flex: 1, backgroundColor: background }}>
          <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
            {/* Header placeholder - already handled by screen header but good to have if needed */}
            <View style={{ height: 60 }} />
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
          <View style={[styles.drawerFooter, { borderTopColor: cardBorder }]}>
            <TouchableOpacity
              style={[styles.drawerLogoutBtn, { backgroundColor: `${errorColor}08` }]}
              onPress={() => router.replace('/login')}
              activeOpacity={0.7}
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right.fill" size={20} color={errorColor} />
              <Text style={[styles.drawerLogoutText, { color: errorColor }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      screenOptions={{
        headerStyle: {
          backgroundColor: cardColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: cardBorder as string,
        },
        headerTintColor: textColor,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        drawerStyle: {
          backgroundColor: background,
          width: 280,
          borderRightWidth: 0,
        },
        drawerActiveTintColor: tintColor,
        drawerInactiveTintColor: dimText,
        drawerActiveBackgroundColor: `${tintColor}08`,
        drawerLabelStyle: {
          fontWeight: '500',
          fontSize: 15,
          marginLeft: -8,
        },
        drawerItemStyle: {
          borderRadius: Radius.sm,
          marginHorizontal: 8,
          marginVertical: 2,
        },
        header: ({ navigation: drawerNav, options, route }) => (
          <View style={[styles.header, { backgroundColor: cardColor, borderBottomColor: cardBorder }]}>
            <View style={styles.headerRow}>
              <View style={styles.leftGroup}>
                <TouchableOpacity
                  onPress={() => drawerNav.dispatch(DrawerActions.toggleDrawer())}
                  style={styles.menuBtn}
                  activeOpacity={0.6}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={[styles.menuLine, { backgroundColor: textColor }]} />
                  <View style={[styles.menuLine, styles.menuLineShort, { backgroundColor: textColor }]} />
                  <View style={[styles.menuLine, { backgroundColor: textColor }]} />
                </TouchableOpacity>
                <View style={styles.brandRow}>
                  <GladiatorLogo size={42} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.sub, { color: dimText }]}>{TENANT.name}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: '#4E8F6A' }]} />
                <Text style={[styles.statusText, { color: '#4E8F6A' }]}>Online</Text>
              </View>
            </View>
            <Text style={[styles.screenTitle, { color: dimText }]}>{options.title || route.name}</Text>
          </View>
        ),
      }}>
      <Drawer.Screen name="index" options={{
        drawerLabel: 'Dashboard', title: 'Dashboard',
        drawerIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} />,
      }} />
      <Drawer.Screen name="ob-entry" options={{
        drawerLabel: 'OB Entry', title: 'OB Entry',
        drawerIcon: ({ color }) => <IconSymbol size={22} name="pencil.and.outline" color={color} />,
      }} />
      <Drawer.Screen name="patrol" options={{
        drawerLabel: 'Patrol', title: 'Patrol',
        drawerIcon: ({ color }) => <IconSymbol size={22} name="map.fill" color={color} />,
      }} />
      <Drawer.Screen name="visitors" options={{
        drawerLabel: 'Visitors', title: 'Visitors',
        drawerIcon: ({ color }) => <IconSymbol size={22} name="person.2.fill" color={color} />,
      }} />
      <Drawer.Screen name="profile" options={{
        drawerLabel: 'Profile', title: 'Profile',
        drawerIcon: ({ color }) => <IconSymbol size={22} name="person.crop.circle.fill" color={color} />,
      }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 54, paddingBottom: 12, paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  leftGroup: { flexDirection: 'row', alignItems: 'center' },
  brand: { fontSize: 20, fontWeight: '700' },
  sub: { fontSize: 13, fontWeight: '400', marginTop: 1 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(78, 143, 106, 0.08)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  screenTitle: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  menuBtn: { paddingRight: 14, paddingVertical: 4, justifyContent: 'center', gap: 4 },
  menuLine: { width: 20, height: 2, borderRadius: 1 },
  menuLineShort: { width: 14 },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.md,
    gap: 12,
  },
  drawerLogoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
