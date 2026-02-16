import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const [tenant, setTenant] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);

    const handleLogin = () => {
        if (!tenant || !username || !password) {
            alert('PROTOCOL_ERROR: INCOMPLETE_CREDENTIALS');
            return;
        }
        router.replace('/');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingProgress(prev => (prev >= 1 ? 1 : prev + 0.05));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    return (
        <TacticalBackground style={styles.container}>
            <SafeAreaView style={styles.flex1} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.flex1}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* System Header */}
                        <View style={styles.systemHeader}>
                            <View style={styles.headerRow}>
                                <Text style={[styles.systemText, { color: tintColor }]}>SECURE_INIT_SEQUENCE_v1.0.8</Text>
                                <View style={[styles.statusDot, { backgroundColor: loadingProgress < 1 ? '#FFA500' : tintColor }]} />
                            </View>
                            <Text style={[styles.timestampText, { color: '#808080' }]}>{timestamp} UTC // SYS_LOAD: {Math.round(loadingProgress * 100)}%</Text>
                            <View style={styles.loadingTrack}>
                                <View style={[styles.loadingFill, { width: `${loadingProgress * 100}%`, backgroundColor: tintColor }]} />
                            </View>
                        </View>

                        {/* Logo Container */}
                        <View style={styles.logoContainer}>
                            <View style={[styles.logoIcon, { borderColor: tintColor }]}>
                                <Text style={[styles.logoIconText, { color: tintColor }]}>GP</Text>
                                <View style={[styles.logoBracket, styles.logoBL, { borderColor: tintColor }]} />
                                <View style={[styles.logoBracket, styles.logoTR, { borderColor: tintColor }]} />
                            </View>
                            <Text style={[styles.logoText, { color: textColor }]}>GLADIATOR_PRO</Text>
                            <Text style={[styles.sloganText, { color: tintColor }]}>TACTICAL_OPERATIONS_SYSTEM_ENGAGED</Text>
                        </View>

                        {/* Authentication Form */}
                        <View style={styles.form}>
                            <View style={styles.formHeaderContainer}>
                                <View style={[styles.headerLine, { backgroundColor: tintColor }]} />
                                <Text style={[styles.formHeader, { color: tintColor }]}>IDENTITY_VERIFICATION</Text>
                                <View style={[styles.headerLine, { backgroundColor: tintColor }]} />
                            </View>

                            <ThemedInput
                                label="ORG_TENANT_ID"
                                placeholder="IDENTIFIER"
                                value={tenant}
                                onChangeText={setTenant}
                                autoCapitalize="none"
                                icon="building.2.fill"
                            />
                            <ThemedInput
                                label="OPERATOR_CODE"
                                placeholder="CREDENTIALS"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                icon="person.fill"
                            />
                            <ThemedInput
                                label="ENCRYPTED_KEY"
                                placeholder="PASSPHRASE"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                icon="lock.fill"
                            />

                            <View style={styles.buttonContainer}>
                                <ThemedButton
                                    title="INITIALIZE_SESSION"
                                    variant="primary"
                                    size="large"
                                    showBrackets={true}
                                    onPress={handleLogin}
                                />
                            </View>

                            <TouchableOpacity style={styles.recoveryBtn}>
                                <Text style={[styles.forgotText, { color: '#808080' }]}>
                                    SYS_RECOVERY_PROTOCOL_v4
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>PROPRIETARY_SECURE_KERNEL // (C) 2026</Text>
                            <Text style={styles.footerText}>ENCRYPTION_LEVEL: AES-256_ACTIVE</Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex1: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    systemHeader: {
        marginBottom: 30,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    systemText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    timestampText: {
        fontSize: 9,
        marginTop: 4,
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    loadingTrack: {
        height: 2,
        width: '100%',
        backgroundColor: 'rgba(0, 191, 255, 0.1)',
    },
    loadingFill: {
        height: '100%',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        width: 100,
        height: 100,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    logoIconText: {
        fontSize: 44,
        fontWeight: '900',
        fontFamily: 'monospace',
    },
    logoBracket: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderWidth: 3,
    },
    logoBL: { bottom: -5, left: -5, borderRightWidth: 0, borderTopWidth: 0 },
    logoTR: { top: -5, right: -5, borderLeftWidth: 0, borderBottomWidth: 0 },
    logoText: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 6,
        fontFamily: 'monospace',
    },
    sloganText: {
        fontSize: 9,
        marginTop: 10,
        letterSpacing: 2,
        fontWeight: '700',
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
    },
    form: {
        width: '100%',
    },
    formHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 25,
    },
    headerLine: {
        flex: 1,
        height: 1,
        opacity: 0.3,
    },
    formHeader: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    buttonContainer: {
        marginTop: 30,
        marginBottom: 20,
    },
    recoveryBtn: {
        paddingVertical: 10,
    },
    forgotText: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 9,
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 30,
        alignItems: 'center',
    },
    footerText: {
        color: '#606060',
        fontSize: 9,
        letterSpacing: 1.5,
        fontFamily: 'monospace',
        marginVertical: 2,
    },
});
