import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedScanner } from '@/components/ThemedScanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INITIAL_CHECKPOINTS = [
    { id: '1', name: 'Main Entrance', status: 'pending', time: '10:00 AM' },
    { id: '2', name: 'Rear Gate', status: 'completed', time: '09:15 AM' },
    { id: '3', name: 'Loading Dock', status: 'pending', time: '10:30 AM' },
    { id: '4', name: 'Server Room', status: 'pending', time: '11:00 AM' },
];

export default function PatrolScreen() {
    const textColor = useThemeColor({}, 'text');
    const successColor = useThemeColor({}, 'success');
    const tintColor = useThemeColor({}, 'tint');
    const insets = useSafeAreaInsets();
    const [checkpoints, setCheckpoints] = useState(INITIAL_CHECKPOINTS);
    const [scannerVisible, setScannerVisible] = useState(false);

    const handleCheckIn = (id: string) => {
        setCheckpoints(prev => prev.map(cp =>
            cp.id === id ? { ...cp, status: 'completed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : cp
        ));
        Alert.alert('Success', 'Checkpoint verified!');
    };

    const handleScan = (data: string) => {
        // Simulate finding a checkpoint by scanning its ID (e.g., "cp-1")
        const cpId = data.replace('cp-', '');
        const exists = checkpoints.find(cp => cp.id === cpId);

        if (exists) {
            handleCheckIn(cpId);
            setScannerVisible(false);
        } else {
            Alert.alert('Error', 'Invalid Checkpoint QR Code');
        }
    };

    const renderItem = ({ item }: { item: typeof INITIAL_CHECKPOINTS[0] }) => (
        <ThemedCard style={styles.checkpointCard}>
            <View style={styles.checkpointInfo}>
                <Text style={[styles.checkpointName, { color: textColor }]}>{item.name}</Text>
                <Text style={[styles.checkpointTime, { color: '#9BA1A6' }]}>
                    {item.status === 'completed' ? `Verified at ${item.time}` : `Scheduled: ${item.time}`}
                </Text>
            </View>
            <View style={styles.checkpointAction}>
                {item.status === 'completed' ? (
                    <View style={styles.statusBadge}>
                        <IconSymbol size={20} name="checkmark.circle.fill" color={successColor} />
                        <Text style={[styles.statusText, { color: successColor }]}>Done</Text>
                    </View>
                ) : (
                    <ThemedButton
                        title="Check In"
                        variant="outline"
                        size="small"
                        style={styles.checkInButton}
                        onPress={() => handleCheckIn(item.id)}
                    />
                )}
            </View>
        </ThemedCard>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>Active Patrol Cycle</Text>
                <View style={styles.nfcContainer}>
                    <IconSymbol size={16} name="sensor.tag.radiowaves.forward.fill" color="#9BA1A6" />
                    <Text style={styles.nfcText}>NFC Reading Active</Text>
                </View>
            </View>

            <FlatList
                data={checkpoints}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 100 }
                ]}
            />

            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        backgroundColor: tintColor,
                        bottom: insets.bottom + 20
                    }
                ]}
                onPress={() => setScannerVisible(true)}
            >
                <IconSymbol name="qrcode.viewfinder" size={32} color="#FFF" />
            </TouchableOpacity>

            <ThemedScanner
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScan={handleScan}
                title="Scan Checkpoint QR"
            />

            <View style={styles.footer}>
                <Text style={[styles.timestamp, { color: '#9BA1A6' }]}>Last update: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    nfcContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    nfcText: {
        fontSize: 10,
        color: '#3B82F6',
        marginLeft: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    checkpointCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        padding: 16,
    },
    checkpointInfo: {
        flex: 1,
    },
    checkpointName: {
        fontSize: 16,
        fontWeight: '600',
    },
    checkpointTime: {
        fontSize: 14,
        marginTop: 2,
    },
    checkpointAction: {
        marginLeft: 12,
    },
    checkInButton: {
        width: 100,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginLeft: 4,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    timestamp: {
        fontSize: 12,
    },
});
