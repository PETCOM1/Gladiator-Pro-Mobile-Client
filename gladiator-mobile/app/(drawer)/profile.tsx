import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { useTheme } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint'); // Tactical green
    const { theme, setTheme } = useTheme();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Personnel Header */}
            <View style={styles.systemHeader}>
                <Text style={[styles.systemText, { color: tintColor }]}>PERSONNEL FILE</Text>
                <View style={[styles.statusDot, { backgroundColor: tintColor }]} />
            </View>

            {/* ID Badge */}
            <View style={styles.header}>
                <View style={[styles.avatarPlaceholder, { borderColor: tintColor }]}>
                    <Text style={[styles.avatarText, { color: tintColor }]}>MP</Text>
                </View>
                <Text style={[styles.name, { color: textColor }]}>MUNYADZIWA PETRUS</Text>
                <Text style={[styles.role, { color: tintColor }]}>SR. SECURITY OFFICER</Text>
                <View style={styles.clearanceBadge}>
                    <Text style={[styles.clearanceText, { color: '#000000', backgroundColor: tintColor }]}>
                        CLEARANCE: LEVEL 3
                    </Text>
                </View>
            </View>

            {/* Personnel Data */}
            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: tintColor }]}>[ PERSONNEL DATA ]</Text>

                <ThemedCard style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: '#808080' }]}>ORGANIZATION</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>GLADIATOR PRO SYSTEMS</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: '#808080' }]}>TENANT ID</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>GPS-10293</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: '#808080' }]}>OPERATOR ID</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>GARD-442</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: '#808080' }]}>STATUS</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusIndicator, { backgroundColor: tintColor }]} />
                            <Text style={[styles.infoValue, { color: tintColor }]}>ACTIVE</Text>
                        </View>
                    </View>
                </ThemedCard>

                {/* Theme Protocol */}
                <Text style={[styles.sectionTitle, { color: tintColor }]}>[ THEME PROTOCOL ]</Text>
                <ThemedCard style={styles.infoCard}>
                    <View style={styles.themeToggleContainer}>
                        <ThemedButton
                            title="LIGHT"
                            variant={theme === 'light' ? 'primary' : 'outline'}
                            size="small"
                            style={styles.themeButton}
                            onPress={() => setTheme('light')}
                        />
                        <ThemedButton
                            title="DARK"
                            variant={theme === 'dark' ? 'primary' : 'outline'}
                            size="small"
                            style={styles.themeButton}
                            onPress={() => setTheme('dark')}
                        />
                        <ThemedButton
                            title="SYSTEM"
                            variant={theme === 'system' ? 'primary' : 'outline'}
                            size="small"
                            style={styles.themeButton}
                            onPress={() => setTheme('system')}
                        />
                    </View>
                </ThemedCard>

                {/* System Actions */}
                <Text style={[styles.sectionTitle, { color: tintColor }]}>[ SYSTEM ACTIONS ]</Text>
                <View style={styles.logoutContainer}>
                    <ThemedButton
                        title="TERMINATE SESSION"
                        variant="error"
                        onPress={() => router.replace('/login')}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    systemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 191, 255, 0.3)',
    },
    systemText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    statusDot: {
        width: 8,
        height: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 191, 255, 0.3)',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    role: {
        fontSize: 11,
        marginTop: 6,
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    },
    clearanceBadge: {
        marginTop: 12,
    },
    clearanceText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        paddingHorizontal: 12,
        paddingVertical: 4,
        fontFamily: 'monospace',
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    },
    infoCard: {
        padding: 16,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        fontFamily: 'monospace',
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 6,
        height: 6,
        marginRight: 6,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0, 191, 255, 0.2)',
    },
    logoutContainer: {
        marginTop: 20,
    },
    themeToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    themeButton: {
        flex: 1,
    },
});
