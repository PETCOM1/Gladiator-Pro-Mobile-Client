import { Radius } from '@/constants/theme';
import { NFCScanner } from '@/components/NFCScanner';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CHECKPOINTS = [
    { id: '1', name: 'Main Gate', status: 'completed' },
    { id: '2', name: 'Perimeter East', status: 'completed' },
    { id: '3', name: 'Server Room', status: 'current' },
    { id: '4', name: 'Parking Level B1', status: 'pending' },
    { id: '5', name: 'Emergency Exit C', status: 'pending' },
    { id: '6', name: 'Rooftop Access', status: 'pending' },
];

export default function PatrolScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const dimText = useThemeColor({}, 'dimText');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const successColor = useThemeColor({}, 'success');
    const warningColor = useThemeColor({}, 'warning');
    const insets = useSafeAreaInsets();

    const [showNFC, setShowNFC] = useState(false);
    const fadeIn = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const completed = CHECKPOINTS.filter(c => c.status === 'completed').length;
    const progress = completed / CHECKPOINTS.length;

    useEffect(() => {
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        Animated.timing(progressAnim, { toValue: progress, duration: 1000, useNativeDriver: false }).start();
    }, []);

    const handleNFCScan = (id: string) => { Alert.alert('Checkpoint Verified', `Tag: ${id}`); setShowNFC(false); };

    const getColor = (s: string) => s === 'completed' ? successColor : s === 'current' ? warningColor : dimText;
    const getIcon = (s: string) => s === 'completed' ? 'checkmark.circle.fill' : s === 'current' ? 'bolt.circle.fill' : 'circle';

    const size = 80, sw = 6, r = (size - sw) / 2, circ = 2 * Math.PI * r;
    const dashOffset = progressAnim.interpolate({ inputRange: [0, 1], outputRange: [circ, circ * (1 - progress)] });

    return (
        <TacticalBackground style={styles.container}>
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}>
                <Animated.View style={{ opacity: fadeIn }}>
                    {/* Progress */}
                    <View style={styles.progressRow}>
                        <View style={styles.ring}>
                            <Svg width={size} height={size}>
                                <Circle cx={size / 2} cy={size / 2} r={r} stroke={cardBorder as string} strokeWidth={sw} fill="none" />
                                <AnimatedCircle
                                    cx={size / 2} cy={size / 2} r={r} stroke={tintColor}
                                    strokeWidth={sw} fill="none" strokeLinecap="round"
                                    strokeDasharray={`${circ} ${circ}`} strokeDashoffset={dashOffset}
                                    rotation="-90" origin={`${size / 2}, ${size / 2}`}
                                />
                            </Svg>
                            <Text style={[styles.ringText, { color: tintColor }]}>{Math.round(progress * 100)}%</Text>
                        </View>
                        <View style={styles.progressInfo}>
                            <Text style={[styles.patrolTitle, { color: textColor }]}>Active Patrol</Text>
                            <Text style={[styles.patrolSub, { color: dimText }]}>{completed} of {CHECKPOINTS.length} checkpoints cleared</Text>
                        </View>
                    </View>

                    {/* Checkpoints */}
                    <Text style={[styles.sectionLabel, { color: dimText }]}>Checkpoints</Text>
                    <ThemedCard>
                        {CHECKPOINTS.map((cp, idx) => (
                            <View key={cp.id} style={[styles.cpRow, idx < CHECKPOINTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: cardBorder }]}>
                                <View style={[styles.cpIcon, { backgroundColor: `${getColor(cp.status)}10` }]}>
                                    <IconSymbol name={getIcon(cp.status) as any} size={20} color={getColor(cp.status)} />
                                </View>
                                <View style={styles.cpInfo}>
                                    <Text style={[styles.cpName, { color: textColor }]}>{cp.name}</Text>
                                    <Text style={[styles.cpStatus, { color: getColor(cp.status) }]}>
                                        {cp.status.charAt(0).toUpperCase() + cp.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ThemedCard>
                </Animated.View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: tintColor }]}
                onPress={() => setShowNFC(true)}
                activeOpacity={0.85}
            >
                <IconSymbol name="sensor.tag.radiowaves.forward.fill" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <NFCScanner visible={showNFC} onClose={() => setShowNFC(false)} onScan={handleNFCScan} />
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
    ring: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
    ringText: { position: 'absolute', fontSize: 16, fontWeight: '700' },
    progressInfo: { flex: 1 },
    patrolTitle: { fontSize: 20, fontWeight: '700' },
    patrolSub: { fontSize: 13, marginTop: 4 },
    sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
    cpRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
    cpIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    cpInfo: { flex: 1 },
    cpName: { fontSize: 15, fontWeight: '600' },
    cpStatus: { fontSize: 12, marginTop: 2 },
    fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
