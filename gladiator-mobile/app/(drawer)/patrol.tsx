import { NFCScanner } from '@/components/NFCScanner';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NfcManager from 'react-native-nfc-manager';
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
    const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);

    useEffect(() => {
        const checkNfc = async () => {
            try {
                const supported = await NfcManager.isSupported();
                setNfcSupported(supported);
            } catch (e) {
                console.warn('NFC_CHECK_FAILED: Native module likely missing');
                setNfcSupported(false);
            }
        };
        checkNfc();
    }, []);

    const handleCheckIn = (id: string) => {
        setCheckpoints(prev => prev.map(cp =>
            cp.id === id ? { ...cp, status: 'completed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : cp
        ));
        Alert.alert('PROTOCOL_SUCCESS', 'CHECKPOINT_VERIFIED // LOG_ENTRY_UPDATED');
    };

    const handleScan = (tagId: string) => {
        // In a real app, tagId would be mapped to a checkpoint ID in the database
        // For this demo, we'll map common tag IDs or use a suffix logic
        // Let's assume tags are labeled like "4A:5B:6C..." or we map specific ones

        // Simulation mapping: tag IDs roughly starting with "cp-" or just matching index
        const cpId = tagId.includes('cp-') ? tagId.replace('cp-', '') : '1';
        const exists = checkpoints.find(cp => cp.id === cpId);

        if (exists) {
            handleCheckIn(cpId);
        } else {
            Alert.alert('PROTOCOL_ERROR', 'UNRECOGNIZED_TAG // UNAUTHORIZED_CHECKPOINT');
        }
    };

    const toggleScanner = async () => {
        if (nfcSupported === false) {
            Alert.alert('HARDWARE_MISMATCH', 'DEVICE_NFC_NOT_SUPPORTED // USE_LEGACY_QR_FALLBACK');
            return;
        }

        try {
            const enabled = await NfcManager.isEnabled();
            if (!enabled) {
                Alert.alert('SENSOR_OFFLINE', 'NFC_DISABLED // PLEASE_ENABLE_NFC_IN_SETTINGS', [
                    { text: 'SETTINGS', onPress: () => NfcManager.goToNfcSetting() },
                    { text: 'CANCEL', style: 'cancel' }
                ]);
                return;
            }
            setScannerVisible(true);
        } catch (e) {
            Alert.alert('HARDWARE_ERROR', 'NFC_HARDWARE_UNAVAILABLE');
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
        <TacticalBackground style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={[styles.title, { color: textColor }]}>PATROL_CYCLE_04</Text>
                    <Text style={[styles.subtitle, { color: '#808080' }]}>SECTOR: G-DELTA // ACTIVE_MONITORING</Text>
                </View>
                <View style={[styles.nfcContainer, { backgroundColor: 'rgba(0, 191, 255, 0.1)' }]}>
                    <IconSymbol size={14} name="sensor.tag.radiowaves.forward.fill" color={tintColor} />
                    <Text style={[styles.nfcText, { color: tintColor }]}>NFC_LINK_ACTIVE</Text>
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
                activeOpacity={0.8}
                onPress={toggleScanner}
            >
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                <IconSymbol name="sensor.tag.radiowaves.forward.fill" size={32} color="#000" />
            </TouchableOpacity>

            <NFCScanner
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScan={handleScan}
            />

            <View style={styles.footer}>
                <Text style={[styles.timestamp, { color: '#808080' }]}>
                    LAST_SYNC: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
                </Text>
            </View>
        </TacticalBackground>
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 191, 255, 0.2)',
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 9,
        fontFamily: 'monospace',
        letterSpacing: 1,
        marginTop: 4,
    },
    nfcContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 255, 0.3)',
    },
    nfcText: {
        fontSize: 9,
        fontWeight: '900',
        marginLeft: 6,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    listContent: {
        padding: 16,
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
        fontSize: 14,
        fontWeight: '800',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    checkpointTime: {
        fontSize: 10,
        fontFamily: 'monospace',
        marginTop: 4,
    },
    checkpointAction: {
        marginLeft: 12,
    },
    checkInButton: {
        width: 110,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    statusText: {
        marginLeft: 6,
        fontWeight: '900',
        fontSize: 10,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    corner: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    footer: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 191, 255, 0.1)',
    },
    timestamp: {
        fontSize: 9,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
});
