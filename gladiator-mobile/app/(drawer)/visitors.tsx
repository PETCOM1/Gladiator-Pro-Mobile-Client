import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedPicker, type PickerOption } from '@/components/ThemedPicker';
import { ThemedScanner } from '@/components/ThemedScanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
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
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleScan = (data: string) => {
        // Expected format: "Name|ID|Phone" e.g. "John Doe|8508261234081|0721234567"
        try {
            const [name, id, phone] = data.split('|');
            if (name) setVisitorName(name);
            if (id) setIdNumber(id);
            if (phone) setCellNumber(phone);

            setScannerVisible(false);
            Alert.alert('Success', 'Visitor data captured!');
        } catch (e) {
            Alert.alert('Error', 'Invalid QR format');
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingBottom: insets.bottom + 40 }
            ]}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>Visitor Entry</Text>
                <Text style={[styles.timeLabel, { color: '#9BA1A6' }]}>Entry Time: {timeString}</Text>
            </View>

            <TouchableOpacity
                style={[styles.scanButton, { borderColor: tintColor }]}
                onPress={() => setScannerVisible(true)}
            >
                <IconSymbol name="qrcode.viewfinder" size={24} color={tintColor} />
                <Text style={[styles.scanButtonText, { color: tintColor }]}>Scan Visitor ID / QR</Text>
            </TouchableOpacity>

            <ThemedCard style={styles.mainForm}>
                <ThemedInput
                    label="Full Name"
                    placeholder="Visitor's name"
                    value={visitorName}
                    onChangeText={setVisitorName}
                />

                <ThemedPicker
                    label="Purpose of Visit"
                    options={VISIT_PURPOSES}
                    selectedValue={purpose}
                    onValueChange={setPurpose}
                />

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <ThemedInput
                            label="ID Number"
                            placeholder="ID / Passport"
                            keyboardType="numeric"
                            value={idNumber}
                            onChangeText={setIdNumber}
                        />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={styles.flex1}>
                        <ThemedInput
                            label="Cell Phone"
                            placeholder="Primary contact"
                            keyboardType="phone-pad"
                            value={cellNumber}
                            onChangeText={setCellNumber}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.advancedToggle}
                    onPress={() => setShowAdvanced(!showAdvanced)}
                >
                    <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>
                        {showAdvanced ? 'Show Less' : 'Add Vehicle / Company Info +'}
                    </Text>
                </TouchableOpacity>

                {showAdvanced && (
                    <View style={styles.advancedFields}>
                        <ThemedInput
                            label="Institution / Company"
                            placeholder="Representing who?"
                            value={institution}
                            onChangeText={setInstitution}
                        />
                        <View style={styles.row}>
                            <View style={styles.flex1}>
                                <ThemedInput
                                    label="Vehicle Reg"
                                    placeholder="License plate"
                                    value={vehicleReg}
                                    onChangeText={setVehicleReg}
                                    autoCapitalize="characters"
                                />
                            </View>
                            <View style={{ width: 12 }} />
                            <View style={styles.flex1}>
                                <ThemedInput
                                    label="Town / Village"
                                    placeholder="Area of origin"
                                    value={townVillage}
                                    onChangeText={setTownVillage}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </ThemedCard>

            <View style={styles.buttonContainer}>
                <ThemedButton
                    title="Sign & Log Visitor"
                    variant="success"
                    size="large"
                    onPress={() => alert('Visitor Logged!')}
                />
            </View>

            <ThemedScanner
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScan={handleScan}
                title="Scan Visitor ID"
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    timeLabel: {
        fontSize: 14,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    scanButtonText: {
        marginLeft: 8,
        fontWeight: 'bold',
    },
    mainForm: {
        padding: 16,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    flex1: {
        flex: 1,
    },
    advancedToggle: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    advancedFields: {
        marginTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(155, 161, 166, 0.2)',
        paddingTop: 16,
    },
    buttonContainer: {
        marginTop: 8,
    },
});
