import { Radius } from '@/constants/theme';
import { TENANT } from '@/constants/tenant';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const dimText = useThemeColor({}, 'dimText');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const successColor = useThemeColor({}, 'success');
    const warningColor = useThemeColor({}, 'warning');
    const accentColor = useThemeColor({}, 'accent');
    const insets = useSafeAreaInsets();
    const { theme: currentTheme, setTheme } = useTheme();

    const fadeIn = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

    const STATS = [
        { label: 'Hours', value: '06:42', color: tintColor, icon: 'clock.fill' },
        { label: 'Patrols', value: '12', color: successColor, icon: 'map.fill' },
        { label: 'Incidents', value: '02', color: warningColor, icon: 'exclamationmark.triangle.fill' },
        { label: 'Visitors', value: '08', color: accentColor, icon: 'person.2.fill' },
    ];

    const themes = [
        { key: 'light', label: 'Light', icon: 'sun.max.fill' },
        { key: 'dark', label: 'Dark', icon: 'moon.fill' },
        { key: 'system', label: 'System', icon: 'gear' },
    ];
    const currentThemeKey = currentTheme;

    return (
        <TacticalBackground style={styles.container}>
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
                <Animated.View style={{ opacity: fadeIn }}>
                    {/* Avatar */}
                    <View style={styles.profileTop}>
                        <View style={[styles.avatar, { backgroundColor: `${tintColor}10`, borderColor: cardBorder }]}>
                            <IconSymbol name="person.fill" size={36} color={tintColor} />
                        </View>
                        <Text style={[styles.name, { color: textColor }]}>{TENANT.operatorName}</Text>
                        <Text style={[styles.role, { color: dimText }]}>{TENANT.operatorRole} · {TENANT.accessLevel}</Text>
                    </View>

                    {/* Stats */}
                    <Text style={[styles.sectionLabel, { color: dimText }]}>Shift Overview</Text>
                    <View style={styles.statsGrid}>
                        {STATS.map(stat => (
                            <ThemedCard key={stat.label} style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: `${stat.color}10` }]}>
                                    <IconSymbol name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <Text style={[styles.statValue, { color: textColor }]}>{stat.value}</Text>
                                <Text style={[styles.statLabel, { color: dimText }]}>{stat.label}</Text>
                            </ThemedCard>
                        ))}
                    </View>

                    {/* Info */}
                    <Text style={[styles.sectionLabel, { color: dimText }]}>Personnel Info</Text>
                    <ThemedCard>
                        {[
                            { label: 'Designation', value: TENANT.operatorRole },
                            { label: 'Employee ID', value: TENANT.operatorId },
                            { label: 'Deployment', value: TENANT.deployment },
                            { label: 'Shift Window', value: TENANT.shiftWindow },
                        ].map((item, idx, arr) => (
                            <View key={item.label} style={[styles.infoRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: cardBorder }]}>
                                <Text style={[styles.infoLabel, { color: dimText }]}>{item.label}</Text>
                                <Text style={[styles.infoValue, { color: textColor }]}>{item.value}</Text>
                            </View>
                        ))}
                    </ThemedCard>

                    {/* Theme */}
                    <Text style={[styles.sectionLabel, { color: dimText }]}>Appearance</Text>
                    <View style={styles.themeRow}>
                        {themes.map(theme => {
                            const isActive = theme.key === currentThemeKey;
                            return (
                                <TouchableOpacity
                                    key={theme.key}
                                    style={[styles.themeOption, {
                                        borderColor: isActive ? tintColor : cardBorder,
                                        backgroundColor: isActive ? `${tintColor}08` : 'transparent',
                                    }]}
                                    activeOpacity={0.7}
                                    onPress={() => setTheme(theme.key as 'light' | 'dark' | 'system')}
                                >
                                    <IconSymbol name={theme.icon as any} size={22} color={isActive ? tintColor : dimText} />
                                    <Text style={[styles.themeLabel, { color: isActive ? tintColor : dimText }]}>{theme.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Logout */}
                    <Text style={[styles.sectionLabel, { color: dimText, marginTop: 28 }]}>Security</Text>
                    <TouchableOpacity
                        style={[styles.logoutBtn, { borderColor: `${useThemeColor({}, 'error')}40` }]}
                        onPress={() => router.replace('/login')}
                        activeOpacity={0.7}
                    >
                        <IconSymbol name="rectangle.portrait.and.arrow.right.fill" size={20} color={useThemeColor({}, 'error')} />
                        <Text style={[styles.logoutLabel, { color: useThemeColor({}, 'error') }]}>End Session (Logout)</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    profileTop: { alignItems: 'center', marginBottom: 28 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    name: { fontSize: 22, fontWeight: '700' },
    role: { fontSize: 14, marginTop: 4 },
    sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12, marginTop: 8 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: 16 },
    statCard: { width: '48%', marginHorizontal: '1%', marginBottom: 10, alignItems: 'center', paddingVertical: 16 },
    statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: '700' },
    statLabel: { fontSize: 12, marginTop: 2 },
    infoRow: { paddingVertical: 14 },
    infoLabel: { fontSize: 12, marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: '600' },
    themeRow: { flexDirection: 'row', gap: 10 },
    themeOption: { flex: 1, alignItems: 'center', paddingVertical: 16, borderWidth: 1, borderRadius: Radius.md },
    themeLabel: { fontSize: 13, fontWeight: '500', marginTop: 8 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderWidth: 1,
        borderRadius: Radius.md,
        marginTop: 4,
        gap: 10,
    },
    logoutLabel: { fontSize: 15, fontWeight: '600' },
});
