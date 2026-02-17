import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Modal, StyleSheet, Text, View } from 'react-native';
// Safe import for NFC Manager
let NfcManager: any;
let NfcTech: any = { Ndef: 'Ndef' };
try {
    const nfcModule = require('react-native-nfc-manager');
    NfcManager = nfcModule.default;
    if (nfcModule.NfcTech) NfcTech = nfcModule.NfcTech;
} catch (e) {
    NfcManager = {
        isSupported: async () => false,
        start: async () => { },
        requestTechnology: async () => { },
        getTag: async () => null,
        cancelTechnologyRequest: async () => { },
    };
}
import { ThemedButton } from './ThemedButton';

export function NFCScanner({ visible, onClose, onScan }: { visible: boolean, onClose: () => void, onScan: (id: string) => void }) {
    const tintColor = useThemeColor({}, 'tint');
    const [scanAnim] = useState(new Animated.Value(0));
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const initNfc = async () => {
            try {
                // Check if the native module exists before calling any method
                if (await NfcManager.isSupported()) {
                    await NfcManager.start();
                }
            } catch (e) {
                console.warn('NFC_INIT_ERROR: Hardware or native module unavailable', e);
            }
        };

        if (visible) {
            initNfc().then(() => startScan());
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            stopScan();
            scanAnim.setValue(0);
        }

        return () => {
            stopScan();
        };
    }, [visible]);

    const startScan = async () => {
        try {
            setIsScanning(true);
            // Requesting Ndef technology as it's the most common for checkpoints
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();

            if (tag) {
                // Return Tag ID or specific data (e.g., "CP1")
                // For simplicity, we use the tag ID if available
                const tagId = tag.id || (tag as any).tagId || 'unknown_tag';
                onScan(tagId);
            }
        } catch (ex: any) {
            if (ex.message !== 'cancelled') {
                console.warn('NFC_ERROR:', ex);
                Alert.alert('SENSOR_ERROR', 'PROTOCOL_SIGNAL: NFC_HARDWARE_FAILURE');
            }
        } finally {
            setIsScanning(false);
            stopScan();
            onClose();
        }
    };

    const stopScan = async () => {
        try {
            await NfcManager.cancelTechnologyRequest();
        } catch (ex) {
            // Silently fail
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, { borderColor: tintColor }]}>
                    <View style={styles.header}>
                        <View style={[styles.statusDot, { backgroundColor: tintColor }]} />
                        <Text style={[styles.title, { color: tintColor }]}>NFC_SENSOR_ACTIVE</Text>
                    </View>

                    <View style={styles.sensorArea}>
                        <IconSymbol name="sensor.tag.radiowaves.forward.fill" size={64} color={tintColor} />
                        <Animated.View style={[styles.scanLine, {
                            backgroundColor: tintColor,
                            transform: [{
                                translateY: scanAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 160]
                                })
                            }]
                        }]} />
                    </View>

                    <Text style={[styles.message, { color: '#FFF' }]}>HOLD DEVICE NEAR TACTICAL NFC TAG</Text>
                    <Text style={styles.telemetry}>TRANSMITTING: 13.56MHz // MODE: PASSIVE_READ</Text>

                    <View style={styles.actionArea}>
                        <ThemedButton
                            title="ABORT_SCAN"
                            variant="outline"
                            onPress={onClose}
                            style={styles.button}
                        />
                    </View>

                    {/* Corner Brackets for Tactical Look */}
                    <View style={[styles.corner, styles.topLeft, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.topRight, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.bottomLeft, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.bottomRight, { borderColor: tintColor }]} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 5, 10, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#050A0F',
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    sensorArea: {
        width: 200,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 255, 0.1)',
        backgroundColor: 'rgba(0, 191, 255, 0.02)',
        marginBottom: 30,
        overflow: 'hidden',
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        opacity: 0.5,
    },
    message: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        fontFamily: 'monospace',
        letterSpacing: 1,
        textAlign: 'center',
    },
    telemetry: {
        color: '#808080',
        fontSize: 9,
        fontFamily: 'monospace',
        letterSpacing: 0.5,
        marginBottom: 30,
    },
    actionArea: {
        width: '100%',
    },
    button: {
        width: '100%',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderWidth: 2,
    },
    topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
});
