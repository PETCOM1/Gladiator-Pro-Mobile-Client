import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const [tenant, setTenant] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Basic validation
        if (!tenant || !username || !password) {
            alert('Please fill in all fields');
            return;
        }
        // Navigate to Dashboard
        router.replace('/');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoIconText}>GP</Text>
                        </View>
                        <Text style={[styles.logoText, { color: textColor }]}>Gladiator Pro</Text>
                        <Text style={styles.sloganText}>Security Operations Platform</Text>
                    </View>

                    <View style={styles.form}>
                        <ThemedInput
                            label="Company / Tenant"
                            placeholder="e.g. secure_solutions"
                            value={tenant}
                            onChangeText={setTenant}
                            autoCapitalize="none"
                        />
                        <ThemedInput
                            label="Username"
                            placeholder="Enter your username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                        <ThemedInput
                            label="Password"
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View style={styles.buttonContainer}>
                            <ThemedButton
                                title="Sign In"
                                variant="primary"
                                size="large"
                                onPress={handleLogin}
                            />
                        </View>

                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>SaaS Enterprise Edition v1.0</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        padding: 30,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logoIconText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    sloganText: {
        color: '#9BA1A6',
        fontSize: 14,
        marginTop: 4,
    },
    form: {
        width: '100%',
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 16,
    },
    forgotText: {
        textAlign: 'center',
        color: '#3B82F6',
        fontWeight: '500',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 40,
        alignItems: 'center',
    },
    footerText: {
        color: '#9BA1A6',
        fontSize: 12,
    },
});
