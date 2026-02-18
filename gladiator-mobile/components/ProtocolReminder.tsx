import { Radius } from '@/constants/theme';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ProtocolReminder() {
    const [visible, setVisible] = useState(false);
    const tintColor = useThemeColor({}, 'tint');
    const warningColor = useThemeColor({}, 'warning');
    const textColor = useThemeColor({}, 'text');
    const dimText = useThemeColor({}, 'dimText');
    const cardColor = useThemeColor({}, 'card');
    const cardBorder = useThemeColor({}, 'cardBorder');

    const lastReminderTime = useRef<number>(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            if (Date.now() - lastReminderTime.current >= 60 * 60 * 1000) {
                setVisible(true);
                lastReminderTime.current = Date.now();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: cardColor, borderColor: cardBorder }]}>
                    <View style={[styles.iconWrap, { backgroundColor: `${warningColor}15` }]}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={28} color={warningColor} />
                    </View>
                    <Text style={[styles.title, { color: textColor }]}>Hourly OB Entry Due</Text>
                    <Text style={[styles.subtitle, { color: dimText }]}>
                        Your scheduled observation book entry is pending. Please log your report.
                    </Text>
                    <ThemedButton title="Log Entry" variant="primary" onPress={() => { setVisible(false); router.push('/(drawer)/ob-entry'); }} style={styles.btn} />
                    <TouchableOpacity onPress={() => setVisible(false)} style={styles.dismiss}>
                        <Text style={[styles.dismissText, { color: dimText }]}>Remind me later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 32 },
    card: { width: '100%', borderRadius: Radius.lg, borderWidth: 1, padding: 28, alignItems: 'center' },
    iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    btn: { width: '100%', marginBottom: 12 },
    dismiss: { paddingVertical: 8 },
    dismissText: { fontSize: 14, fontWeight: '500' },
});
