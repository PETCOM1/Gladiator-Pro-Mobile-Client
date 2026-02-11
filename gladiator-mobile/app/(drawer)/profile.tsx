import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.avatarText}>MP</Text>
                </View>
                <Text style={[styles.name, { color: textColor }]}>Munyadziwa Petrus</Text>
                <Text style={[styles.role, { color: '#9BA1A6' }]}>Senior Security Officer</Text>
            </View>

            <View style={styles.content}>
                <ThemedCard style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: '#9BA1A6' }]}>Company</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>Gladiator Pro Systems</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: '#9BA1A6' }]}>Tenant ID</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>GPS-10293</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: '#9BA1A6' }]}>Employee ID</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>GARD-442</Text>
                    </View>
                </ThemedCard>

                <View style={styles.logoutContainer}>
                    <ThemedButton
                        title="Logout"
                        variant="error"
                        onPress={() => router.replace('/login')}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        padding: 40,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(155, 161, 166, 0.2)',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    role: {
        fontSize: 16,
        marginTop: 4,
    },
    content: {
        padding: 20,
    },
    infoCard: {
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(155, 161, 166, 0.2)',
    },
    logoutContainer: {
        marginTop: 40,
    },
});
