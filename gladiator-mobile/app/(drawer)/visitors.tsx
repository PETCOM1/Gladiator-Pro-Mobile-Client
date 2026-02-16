import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedPicker, type PickerOption } from '@/components/ThemedPicker';
import { ThemedScanner } from '@/components/ThemedScanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { parseSAIDBarcode } from '@/utils/sa-id-parser';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VISIT_PURPOSES: PickerOption[] = [
    { label: 'Official Visit', value: 'official', icon: 'briefcase.fill', color: '#3B82F6' },
    { label: 'Private / Social', value: 'private', icon: 'person.fill', color: '#22C55E' },
    { label: 'Delivery', value: 'delivery', icon: 'shippingbox.fill', color: '#F59E0B' },
    { label: 'Maintenance', value: 'maintenance', icon: 'wrench.and.screwdriver.fill', color: '#9BA1A6' },
    { label: 'Other', value: 'other', icon: 'ellipsis.circle.fill', color: '#9BA1A6' },
];

export default function VisitorsScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const successColor = useThemeColor({}, 'success');
    const insets = useSafeAreaInsets();

    const [visitorName, setVisitorName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [purpose, setPurpose] = useState('');
    const [cellNumber, setCellNumber] = useState('');

    // Secondary fields
    const [institution, setInstitution] = useState('');
    const [vehicleReg, setVehicleReg] = useState('');
    const [townVillage, setTownVillage] = useState('');

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = now.toISOString().split('T')[0];

    const handleScan = (data: string) => {
        // Attempt to parse as South African ID Barcode (PDF417)
        const idData = parseSAIDBarcode(data);

        if (idData) {
            setVisitorName(`${idData.firstName} ${idData.lastName}`.trim());
            setIdNumber(idData.idNumber);
            setScannerVisible(false);
            Alert.alert('SUCCESS', 'PROTOCOL_SIGNAL: SA_ID_DATA_DECODED');
            return;
        }

        // Fallback: Expected legacy format: "Name|ID|Phone"
        try {
            const [name, id, phone] = data.split('|');
            if (name) setVisitorName(name);
            if (id) setIdNumber(id);
            if (phone) setCellNumber(phone);

            setScannerVisible(false);
            Alert.alert('SUCCESS', 'PROTOCOL_SIGNAL: LEGACY_DATA_CAPTURED');
        } catch {
            Alert.alert('ERROR', 'PROTOCOL_SIGNAL: UNRECOGNIZED_DATA_FORMAT');
        }
    };

    return (
        <TacticalBackground style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 40 }
                ]}
            >
                {/* Checkpoint Header */}
                <View style={styles.systemHeader}>
                    <View style={styles.headerInfo}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: tintColor }]} />
                            <Text style={[styles.systemText, { color: tintColor }]}>CHECKPOINT_PROTOCOL // SECURE_ACCESS</Text>
                        </View>
                        <Text style={[styles.timestamp, { color: '#808080' }]}>{dateString} // {timeString} UTC</Text>
                    </View>
                </View>

                {/* Main Action: Scanner */}
                <TouchableOpacity
                    style={[styles.scanButton, { borderColor: tintColor, backgroundColor: 'rgba(0, 191, 255, 0.05)' }]}
                    activeOpacity={0.7}
                    onPress={() => setScannerVisible(true)}
                >
                    <View style={[styles.corner, styles.topLeft, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.topRight, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.bottomLeft, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.bottomRight, { borderColor: tintColor }]} />

                    <IconSymbol name="qrcode.viewfinder" size={28} color={tintColor} />
                    <Text style={[styles.scanButtonText, { color: tintColor }]}>INITIALIZE_IDENT_SCAN</Text>
                </TouchableOpacity>

                {/* Form Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: tintColor }]}>VISITOR_ENTRY_LOG</Text>
                    <View style={[styles.sectionLine, { backgroundColor: tintColor }]} />
                </View>

                <ThemedCard
                    style={styles.mainForm}
                    headerTitle="PRIMARY_IDENTIFICATION"
                    showScanline={true}
                >
                    <ThemedInput
                        label="FULL_LEGAL_NAME"
                        placeholder="IDENTIFY SUBJECT"
                        value={visitorName}
                        onChangeText={setVisitorName}
                        icon="person.fill"
                    />

                    <View style={styles.pickerContainer}>
                        <ThemedPicker
                            label="MISSION_PURPOSE"
                            options={VISIT_PURPOSES}
                            selectedValue={purpose}
                            onValueChange={setPurpose}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.flex1}>
                            <ThemedInput
                                label="DOC_ID_NUMBER"
                                placeholder="ID / PASSPORT"
                                keyboardType="numeric"
                                value={idNumber}
                                onChangeText={setIdNumber}
                                icon="person.text.rectangle.fill"
                            />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={styles.flex1}>
                            <ThemedInput
                                label="COMMS_CELL"
                                placeholder="PRIMARY_CH"
                                keyboardType="phone-pad"
                                value={cellNumber}
                                onChangeText={setCellNumber}
                                icon="phone.fill"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.advancedToggle}
                        activeOpacity={0.6}
                        onPress={() => setShowAdvanced(!showAdvanced)}
                    >
                        <Text style={[styles.toggleText, { color: tintColor }]}>
                            {showAdvanced ? '[-] CONCEAL_DATA_FIELDS' : '[+] REVEAL_LOGISTICS_FIELDS'}
                        </Text>
                    </TouchableOpacity>

                    {showAdvanced && (
                        <View style={styles.advancedFields}>
                            <ThemedInput
                                label="ORG_INSTITUTION"
                                placeholder="REPRESENTING_ENTITY"
                                value={institution}
                                onChangeText={setInstitution}
                                icon="building.2.fill"
                            />
                            <View style={styles.row}>
                                <View style={styles.flex1}>
                                    <ThemedInput
                                        label="VEHICLE_REG"
                                        placeholder="PLATE_ID"
                                        value={vehicleReg}
                                        onChangeText={setVehicleReg}
                                        autoCapitalize="characters"
                                        icon="car.fill"
                                    />
                                </View>
                                <View style={{ width: 12 }} />
                                <View style={styles.flex1}>
                                    <ThemedInput
                                        label="ORIG_SECTOR"
                                        placeholder="TOWN_VILLAGE"
                                        value={townVillage}
                                        onChangeText={setTownVillage}
                                        icon="map.fill"
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </ThemedCard>

                <View style={styles.buttonContainer}>
                    <ThemedButton
                        title="EXECUTE_SESSION_LOG"
                        variant="success"
                        size="large"
                        showBrackets={true}
                        onPress={() => alert('PROTOCOL_SIGNAL: VISITOR_LOG_COMMITTED')}
                    />
                </View>

                <ThemedScanner
                    visible={scannerVisible}
                    onClose={() => setScannerVisible(false)}
                    onScan={handleScan}
                    title="SCAN_VISITOR_CREDENTIALS"
                />
            </ScrollView>
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    systemHeader: {
        marginBottom: 24,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 191, 255, 0.2)',
    },
    headerInfo: {
        gap: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        marginRight: 8,
    },
    systemText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    },
    timestamp: {
        fontSize: 9,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    sectionLine: {
        flex: 1,
        height: 1,
        opacity: 0.2,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 1,
        position: 'relative',
        marginBottom: 30,
    },
    scanButtonText: {
        marginLeft: 12,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    mainForm: {
        marginBottom: 20,
    },
    pickerContainer: {
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    flex1: {
        flex: 1,
    },
    advancedToggle: {
        marginTop: 15,
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 191, 255, 0.1)',
    },
    toggleText: {
        fontSize: 10,
        fontWeight: '800',
        fontFamily: 'monospace',
        letterSpacing: 1.5,
    },
    advancedFields: {
        marginTop: 10,
        paddingTop: 10,
    },
    buttonContainer: {
        marginTop: 10,
    },
    corner: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderWidth: 2,
    },
    topLeft: { top: -1, left: -1, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: -1, right: -1, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: -1, left: -1, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: -1, right: -1, borderLeftWidth: 0, borderTopWidth: 0 },
});
