import { Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { ThemedButton } from './ThemedButton';

let NfcManager: any;
let NfcTech: any = { Ndef: 'Ndef' };
try {
    const nfcModule = require('react-native-nfc-manager');
    NfcManager = nfcModule.default;
    if (nfcModule.NfcTech) NfcTech = nfcModule.NfcTech;
} catch (e) {
    NfcManager = {
        isSupported: async () => false, start: async () => { },
        requestTechnology: async () => { }, getTag: async () => null,
        cancelTechnologyRequest: async () => { },
    };
}

export function NFCScanner({ visible, onClose, onScan }: { visible: boolean; onClose: () => void; onScan: (id: string) => void }) {
    const tintColor = useThemeColor({}, 'tint');
    const dimText = useThemeColor({}, 'dimText');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [statusText, setStatusText] = useState('Searching for tag...');

    const MESSAGES = ['Searching for tag...', 'Scanning 13.56MHz...', 'Awaiting NFC tag...', 'Radio interface active...'];

    useEffect(() => {
        if (visible) {
            initNfc().then(() => startScan());
            Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])).start();
            const interval = setInterval(() => setStatusText(prev => {
                const i = MESSAGES.indexOf(prev);
                return MESSAGES[(i + 1) % MESSAGES.length];
            }), 2500);
            return () => { clearInterval(interval); stopScan(); };
        } else { pulseAnim.setValue(1); }
    }, [visible]);

    const initNfc = async () => { try { if (await NfcManager.isSupported()) await NfcManager.start(); } catch { } };
    const startScan = async () => {
        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();
            if (tag) onScan(tag.id || (tag as any).tagId || 'unknown');
        } catch (ex: any) { if (ex.message !== 'cancelled') Alert.alert('Error', 'NFC read failed'); }
        finally { stopScan(); onClose(); }
    };
    const stopScan = async () => { try { await NfcManager.cancelTechnologyRequest(); } catch { } };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: cardColor, borderColor: cardBorder }]}>
                    <View style={styles.iconArea}>
                        <Animated.View style={[styles.pulse, { borderColor: tintColor, transform: [{ scale: pulseAnim }] }]} />
                        <IconSymbol name="sensor.tag.radiowaves.forward.fill" size={40} color={tintColor} />
                    </View>

                    <Text style={[styles.title, { color: textColor }]}>Ready to Scan</Text>
                    <Text style={[styles.subtitle, { color: dimText }]}>{statusText}</Text>

                    <View style={styles.action}>
                        <ThemedButton title="Cancel" variant="secondary" onPress={onClose} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
    card: { width: '100%', borderRadius: Radius.lg, borderWidth: 1, padding: 32, alignItems: 'center' },
    iconArea: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    pulse: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, opacity: 0.15 },
    title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
    subtitle: { fontSize: 14, marginBottom: 28, textAlign: 'center' },
    action: { width: '100%' },
});
