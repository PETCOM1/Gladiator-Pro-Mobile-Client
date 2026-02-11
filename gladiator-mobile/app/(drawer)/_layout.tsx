import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

export default function DrawerLayout() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: textColor,
        drawerStyle: {
          backgroundColor,
          width: 280,
        },
        drawerActiveTintColor: tintColor,
        drawerInactiveTintColor: textColor,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Gladiator Pro',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="ob-entry"
        options={{
          drawerLabel: 'OB Entry',
          title: 'New OB Entry',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={24} name="pencil.and.outline" color={color} />,
        }}
      />
      <Drawer.Screen
        name="patrol"
        options={{
          drawerLabel: 'Patrol',
          title: 'Patrol Checkpoint',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={24} name="map.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="visitors"
        options={{
          drawerLabel: 'Visitors',
          title: 'Visitor Log',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Guard Profile',
          drawerIcon: ({ color }: { color: string }) => <IconSymbol size={24} name="person.crop.circle.fill" color={color} />,
        }}
      />
    </Drawer>
  );
}
