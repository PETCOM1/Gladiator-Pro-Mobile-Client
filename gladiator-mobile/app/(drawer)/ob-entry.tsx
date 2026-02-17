import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedPicker, type PickerOption } from '@/components/ThemedPicker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INCIDENT_TYPES: PickerOption[] = [
    { label: 'Theft / Robbery', value: 'theft', icon: 'shield.slash.fill', color: '#EF4444' },
    { label: 'Fire / Smoke', value: 'fire', icon: 'flame.fill', color: '#F59E0B' },
    { label: 'Medical Emergency', value: 'medical', icon: 'cross.case.fill', color: '#3B82F6' },
    { label: 'Property Damage', value: 'damage', icon: 'hammer.fill', color: '#9BA1A6' },
    { label: 'Suspicious Activity', value: 'suspicious', icon: 'eye.fill', color: '#F59E0B' },
    { label: 'Unauthorized Access', value: 'access', icon: 'lock.open.fill', color: '#EF4444' },
    { label: 'Maintenance Issue', value: 'maintenance', icon: 'wrench.and.screwdriver.fill', color: '#22C55E' },
    { label: 'Other', value: 'other', icon: 'questionmark.circle.fill', color: '#9BA1A6' },
];

const SEVERITY_LEVELS: PickerOption[] = [
    { label: 'Low - Informational', value: 'low', icon: 'info.circle.fill', color: '#3B82F6' },
    { label: 'Medium - Warning', value: 'medium', icon: 'exclamationmark.triangle.fill', color: '#F59E0B' },
    { label: 'High - Urgent', value: 'high', icon: 'exclamationmark.circle.fill', color: '#EF4444' },
    { label: 'Critical - Immediate', value: 'critical', icon: 'bolt.fill', color: '#EF4444' },
];

export default function OBEntryScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const successColor = useThemeColor({}, 'success');
    const cardColor = useThemeColor({}, 'card');
    const insets = useSafeAreaInsets();

    const [showForm, setShowForm] = useState(false);
    const [incidentType, setIncidentType] = useState('');
    const [severity, setSeverity] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const now = new Date();
    const dateTimeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    const handleAllClear = () => {
        alert('Log Entry: All Clear submitted for ' + dateTimeString);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmitIncident = () => {
        if (!incidentType || !description || !severity) {
            alert('Please fill in incident type, severity and description');
            return;
        }
        alert('Incident Reported: ' + INCIDENT_TYPES.find(i => i.value === incidentType)?.label);
        setShowForm(false);
        resetForm();
    };

    const resetForm = () => {
        setIncidentType('');
        setSeverity('');
        setDescription('');
        setLocation('');
        setImage(null);
    };

    return (
        <TacticalBackground style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 40 }
                ]}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>OB_ENTRY_PROTOCOL</Text>
                    <Text style={[styles.timeText, { color: '#808080' }]}>TIMESTAMP: {dateTimeString} UTC</Text>
                </View>

                {!showForm ? (
                    <>
                        <ThemedCard style={styles.quickActionCard} showBrackets={true}>
                            <Text style={[styles.cardTitle, { color: textColor }]}>ROUTINE_STATUS_CHECK</Text>
                            <Text style={styles.cardSubtitle}>SECURE_ESTABLISHED // ALL_CLEAR_MONITORING</Text>

                            <TouchableOpacity
                                style={[styles.allClearButton, { backgroundColor: successColor }]}
                                activeOpacity={0.8}
                                onPress={handleAllClear}
                            >
                                <IconSymbol name="checkmark.shield.fill" size={24} color="#000" />
                                <Text style={styles.allClearText}>SUBMIT_ALL_CLEAR</Text>
                            </TouchableOpacity>
                        </ThemedCard>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.divider} />
                        </View>

                        <ThemedButton
                            title="Report an Incident"
                            variant="error"
                            onPress={() => setShowForm(true)}
                        />
                    </>
                ) : (
                    <ThemedCard style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <Text style={[styles.formTitle, { color: textColor }]}>Incident Details</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <Text style={{ color: tintColor, fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <ThemedPicker
                            label="Incident Type"
                            placeholder="What happened?"
                            options={INCIDENT_TYPES}
                            selectedValue={incidentType}
                            onValueChange={setIncidentType}
                        />

                        <ThemedPicker
                            label="Severity Level"
                            placeholder="Choose severity"
                            options={SEVERITY_LEVELS}
                            selectedValue={severity}
                            onValueChange={setSeverity}
                        />

                        <ThemedInput
                            label="Location"
                            placeholder="Where did it happen?"
                            value={location}
                            onChangeText={setLocation}
                        />

                        <ThemedInput
                            label="Description"
                            placeholder="Describe the incident..."
                            multiline
                            numberOfLines={3}
                            style={styles.textArea}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <View style={styles.photoSection}>
                            <Text style={[styles.label, { color: textColor }]}>Evidence Photo (Optional)</Text>
                            {image ? (
                                <TouchableOpacity onPress={pickImage} style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: image }} style={styles.imagePreview} />
                                    <View style={styles.imageOverlay}>
                                        <Text style={styles.imageOverlayText}>Tap to change</Text>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.uploadButton, { backgroundColor: cardColor, borderColor: 'rgba(155, 161, 166, 0.2)' }]}
                                    onPress={pickImage}
                                >
                                    <IconSymbol name="camera.fill" size={32} color={tintColor} />
                                    <Text style={[styles.uploadText, { color: '#9BA1A6' }]}>Tap to upload photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                            <ThemedButton
                                title="Submit Incident Report"
                                variant="error"
                                onPress={handleSubmitIncident}
                            />
                        </View>
                    </ThemedCard>
                )}
            </ScrollView>
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 191, 255, 0.2)',
        paddingBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    timeText: {
        fontSize: 9,
        marginTop: 6,
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    quickActionCard: {
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 8,
        fontFamily: 'monospace',
        letterSpacing: 1.5,
    },
    cardSubtitle: {
        fontSize: 9,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'monospace',
        letterSpacing: 1,
        color: '#808080',
    },
    allClearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        width: '100%',
        justifyContent: 'center',
    },
    allClearText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '900',
        marginLeft: 12,
        fontFamily: 'monospace',
        letterSpacing: 1.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(155, 161, 166, 0.2)',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9BA1A6',
        fontWeight: 'bold',
    },
    formCard: {
        padding: 20,
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    photoSection: {
        marginTop: 16,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    uploadButton: {
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
    },
    imagePreviewContainer: {
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageOverlayText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    buttonRow: {
        marginTop: 8,
    },
});
