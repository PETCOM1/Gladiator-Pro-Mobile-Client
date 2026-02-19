import { GladiatorLogo } from '@/components/GladiatorLogo';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const dimText = useThemeColor({}, 'dimText');
    const cardColor = useThemeColor({}, 'card');
    const cardBorder = useThemeColor({}, 'cardBorder');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const fadeIn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    const handleLogin = async () => {
        if (!username || !password) { Alert.alert('Missing Fields', 'Please enter your credentials.'); return; }
        setLoading(true); setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => { if (prev >= 100) { clearInterval(interval); return 100; } return prev + Math.random() * 15; });
        }, 100);
        setTimeout(() => { clearInterval(interval); setProgress(100); setLoading(false); router.replace('/(drawer)'); }, 1800);
    };

    return (
        <TacticalBackground style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <Animated.View style={[styles.content, { opacity: fadeIn }]}>
                        <View style={styles.logoContainer}>
                            <GladiatorLogo size={100} />
                        </View>

                        <Text style={[styles.subtitle, { color: dimText }]}>Security Command System</Text>

                        <View style={[styles.card, { backgroundColor: cardColor, borderColor: cardBorder }]}>
                            <ThemedInput label="Username" placeholder="Enter your username" value={username} onChangeText={setUsername} autoCapitalize="none" icon="person.fill" />
                            <ThemedInput label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry icon="lock.fill" />

                            {loading && (
                                <View style={styles.progressWrap}>
                                    <View style={[styles.track, { backgroundColor: cardBorder }]}>
                                        <View style={[styles.fill, { width: `${Math.min(progress, 100)}%`, backgroundColor: tintColor }]} />
                                    </View>
                                    <Text style={[styles.progressLabel, { color: dimText }]}>Authenticating... {Math.min(Math.round(progress), 100)}%</Text>
                                </View>
                            )}

                            <ThemedButton title={loading ? 'Signing in...' : 'Sign In'} variant="primary" size="large" onPress={handleLogin} disabled={loading} />
                        </View>

                        <Text style={[styles.footer, { color: dimText }]}>Gladiator Pro v2.0 · Enterprise Security</Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    content: { alignItems: 'center' },
    logoContainer: { width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    subtitle: { fontSize: 15, fontWeight: '400', marginBottom: 32 },
    card: { width: '100%', borderRadius: Radius.md, borderWidth: 1, padding: 20, marginBottom: 24 },
    progressWrap: { marginBottom: 16 },
    track: { height: 4, borderRadius: 2, width: '100%', overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 2 },
    progressLabel: { fontSize: 12, marginTop: 6 },
    footer: { fontSize: 12 },
});
