import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

export function ProtocolReminder() {
    const [visible, setVisible] = useState(false);
    const tintColor = useThemeColor({}, 'tint');
    const errorColor = useThemeColor({}, 'error');
    const textColor = useThemeColor({}, 'text');

    const flashAnim = useRef(new Animated.Value(0)).current;
    const lastReminderTime = useRef<number>(Date.now());

    useEffect(() => {
        // Hourly check (every 1 minute for testing, or use logic for real hour)
        // For a real production app, we'd use Background tasks, 
        // but for this tactical UI demo, an interval is perfect.
        const interval = setInterval(() => {
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;

            if (now - lastReminderTime.current >= oneHour) {
                setVisible(true);
                lastReminderTime.current = now;
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(flashAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.timing(flashAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
                ])
            ).start();
        } else {
            flashAnim.setValue(0);
        }
    }, [visible, flashAnim]);

    const handleAcknowledge = () => {
        setVisible(false);
        router.push('/(drawer)/ob-entry');
    };

    const handleDismiss = () => {
        setVisible(false);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleDismiss}
        >
            <View style={styles.overlay}>
                <ThemedCard style={styles.modalCard} showBrackets={true} showScanline={true}>
                    <View style={styles.header}>
                        <Animated.View style={[styles.urgentTag, {
                            backgroundColor: errorColor,
                            opacity: flashAnim
                        }]}>
                            <Text style={styles.urgentText}>[ URGENT ]</Text>
                        </Animated.View>
                        <Text style={[styles.protocolLabel, { color: tintColor }]}>SYSTEM_PROTOCOL_ALERT</Text>
                    </View>

                    <View style={styles.content}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={errorColor} style={styles.icon} />
                        <Text style={[styles.message, { color: textColor }]}>
                            OPERATIONAL_REQUIREMENT: HOURLY_OB_ENTRY_PENDING
                        </Text>
                        <Text style={styles.subMessage}>
                            PROTOCOL_ID: GPS-REM-109 // STATUS: AWAITING_LOG_VERIFICATION
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <ThemedButton
                            title="INITIALIZE_LOG_ENTRY"
                            variant="primary"
                            onPress={handleAcknowledge}
                            showBrackets={true}
                            style={styles.button}
                        />
                        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
                            <Text style={[styles.dismissText, { color: '#808080' }]}>DEFER_PROTOCOL_60S</Text>
                        </TouchableOpacity>
                    </View>
                </ThemedCard>
            </View>
        </Modal>
    );
}

import { TouchableOpacity } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 191, 255, 0.2)',
        paddingBottom: 12,
    },
    urgentTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    urgentText: {
        color: '#000000',
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'monospace',
    },
    protocolLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    content: {
        alignItems: 'center',
        marginBottom: 30,
    },
    icon: {
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
        fontFamily: 'monospace',
        marginBottom: 12,
    },
    subMessage: {
        fontSize: 9,
        color: '#808080',
        textAlign: 'center',
        fontFamily: 'monospace',
        letterSpacing: 0.5,
    },
    footer: {
        gap: 12,
    },
    button: {
        width: '100%',
    },
    dismissButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    dismissText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    }
});
