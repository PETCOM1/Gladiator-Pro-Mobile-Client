import { Radius } from '@/constants/theme';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedPicker, PickerOption } from '@/components/ThemedPicker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';
import { ThemedToast } from '@/components/ThemedToast';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INCIDENT_TYPES: PickerOption[] = [
    { label: 'Suspicious Activity', value: 'suspicious', icon: 'eye.fill', color: '#C2A24A' },
    { label: 'Unauthorized Access', value: 'unauthorized', icon: 'lock.shield.fill', color: '#8B5E3C' },
    { label: 'Property Damage', value: 'damage', icon: 'exclamationmark.triangle.fill', color: '#C2A24A' },
    { label: 'Medical Emergency', value: 'medical', icon: 'cross.case.fill', color: '#8B5E3C' },
    { label: 'Fire / Hazard', value: 'fire', icon: 'flame.fill', color: '#8B5E3C' },
    { label: 'Theft', value: 'theft', icon: 'bag.fill', color: '#5C6773' },
    { label: 'All Clear / Status Normal', value: 'all_clear', icon: 'shield.checkered', color: '#4E8F6A' },
    { label: 'Other', value: 'other', icon: 'questionmark.circle.fill', color: '#5C6773' },
];

const SEVERITY_LEVELS: PickerOption[] = [
    { label: 'Low', value: 'low', icon: 'minus.circle.fill', color: '#4E8F6A' },
    { label: 'Medium', value: 'medium', icon: 'equal.circle.fill', color: '#C2A24A' },
    { label: 'High', value: 'high', icon: 'exclamationmark.circle.fill', color: '#C2A24A' },
    { label: 'Critical', value: 'critical', icon: 'xmark.octagon.fill', color: '#8B5E3C' },
];

export default function OBEntryScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const successColor = useThemeColor({}, 'success');
    const dimText = useThemeColor({}, 'dimText');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const warningColor = useThemeColor({}, 'warning');
    const cardColor = useThemeColor({}, 'card');
    const insets = useSafeAreaInsets();

    const { user, token } = useAuth();
    const [incidentType, setIncidentType] = useState('');
    const [severity, setSeverity] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
        visible: false,
        message: '',
        type: 'success'
    });

    const baseUrl = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://146.141.180.199:5000';

    const fetchEntries = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/api/ob-entries`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setEntries(data);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEntries(); }, [token]);

    const handleSubmit = () => {
        if (!incidentType || !severity || !description) { Alert.alert('Missing Fields', 'Please fill in all required fields.'); return; }
        setConfirmVisible(true);
    };

    const confirmSubmit = async () => {
        setConfirmVisible(false);
        setIsSubmitting(true);
        try {
            const response = await fetch(`${baseUrl}/api/ob-entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    incidentType,
                    severity,
                    location,
                    description,
                    image
                }),
            });

            if (response.ok) {
                const newEntry = await response.json();
                setIncidentType(''); setSeverity(''); setDescription(''); setLocation(''); setImage(null);
                setShowForm(false);
                Alert.alert('Report Logged', `Ref: ${newEntry.id.substring(0, 8).toUpperCase()}`);
                fetchEntries();
            } else {
                Alert.alert('Error', 'Failed to save the report. Please try again.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Network Error', 'Could not connect to the server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmAllClear = async () => {
        setIsSubmitting(true);
        try {
            console.log('[OB] Submitting All Clear to:', `${baseUrl}/api/ob-entries`);
            const response = await fetch(`${baseUrl}/api/ob-entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    incidentType: 'all_clear',
                    severity: 'low',
                    location: 'Post/Shift',
                    description: 'Status Normal - No incidents to report.',
                    image: null
                }),
            });

            if (response.ok) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setToast({ visible: true, message: 'All Clear recorded successfully.', type: 'success' });
                fetchEntries();
            } else {
                const errData = await response.json().catch(() => ({}));
                console.error('[OB] All Clear Fail:', response.status, errData);
                Alert.alert('Error', `Failed to log status (${response.status}).`);
            }
        } catch (error) {
            console.error('[OB] All Clear Network Error:', error);
            Alert.alert('Network Error', 'Check your connection to the server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAllClear = () => {
        console.log('[OB] handleAllClear pressed');
        Alert.alert(
            'Confirm All Clear',
            'Are you sure you want to log a "Status Normal / All Clear" report for this hour?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: confirmAllClear }
            ]
        );
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    return (
        <TacticalBackground style={styles.container}>
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
                {/* All Clear */}
                <TouchableOpacity activeOpacity={0.7} onPress={handleAllClear}>
                    <ThemedCard style={styles.allClear}>
                        <View style={[styles.shieldIcon, { backgroundColor: `${successColor}10` }]}>
                            <IconSymbol size={32} name="shield.checkered" color={successColor} />
                        </View>
                        <View>
                            <Text style={[styles.allClearTitle, { color: successColor }]}>All Clear</Text>
                            <Text style={[styles.allClearSub, { color: dimText }]}>No incidents to report</Text>
                        </View>
                    </ThemedCard>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: cardBorder }]} />
                    <Text style={[styles.dividerText, { color: dimText }]}>or report incident</Text>
                    <View style={[styles.dividerLine, { backgroundColor: cardBorder }]} />
                </View>

                {/* Form Toggle Button */}
                {!showForm && (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowForm(true)}>
                        <ThemedCard style={styles.showFormBtn}>
                            <View style={[styles.reportIcon, { backgroundColor: `${warningColor}10` }]}>
                                <IconSymbol size={24} name="pencil.and.outline" color={warningColor} />
                            </View>
                            <Text style={[styles.showFormLabel, { color: textColor }]}>Create New Incident Report</Text>
                            <IconSymbol size={20} name="chevron.down" color={dimText} />
                        </ThemedCard>
                    </TouchableOpacity>
                )}

                {/* Incident Form (Retractable) */}
                {showForm && (
                    <ThemedCard
                        headerTitle="New Incident Report"
                        style={styles.formCard}
                    >
                        <ThemedPicker label="Incident Type" options={INCIDENT_TYPES} selectedValue={incidentType} onValueChange={setIncidentType} placeholder="Select category..." />
                        <ThemedPicker label="Severity" options={SEVERITY_LEVELS} selectedValue={severity} onValueChange={setSeverity} placeholder="Select level..." />
                        <ThemedInput label="Location" placeholder="Area or checkpoint" value={location} onChangeText={setLocation} icon="map.fill" />
                        <ThemedInput label="Description" placeholder="Describe what happened..." value={description} onChangeText={setDescription} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: 'top' }} />

                        {image ? (
                            <View style={styles.imageWrap}>
                                <Image source={{ uri: image }} style={styles.imagePreview} />
                                <TouchableOpacity style={styles.removeImg} onPress={() => setImage(null)}>
                                    <IconSymbol name="xmark.circle.fill" size={24} color={warningColor} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ThemedButton title="Attach Photo" variant="secondary" onPress={pickImage} icon="camera.fill" />
                        )}

                        <View style={styles.submitWrap}>
                            <ThemedButton title="Submit Report" variant="primary" size="large" onPress={handleSubmit} disabled={isSubmitting} />
                            {isSubmitting && <ActivityIndicator style={{ marginTop: 12 }} color={tintColor} />}
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                                <Text style={{ color: dimText, fontSize: 13, fontWeight: '500' }}>Cancel / Hide Form</Text>
                            </TouchableOpacity>
                        </View>
                    </ThemedCard>
                )}

                {/* Recent Entries */}
                <View style={{ marginTop: 24 }}>
                    <View style={styles.entriesHeader}>
                        <Text style={[styles.sectionLabel, { color: dimText, marginTop: 0 }]}>Recent Entries</Text>
                        <TouchableOpacity onPress={fetchEntries}>
                            <IconSymbol name="arrow.clockwise" size={18} color={tintColor} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={tintColor} style={{ marginTop: 12 }} />
                    ) : entries.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={{ color: dimText }}>No entries found for this shift.</Text>
                        </View>
                    ) : (
                        entries.map((entry) => {
                            const isAllClear = entry.incidentType === 'all_clear';
                            const badgeColor = isAllClear ? successColor : tintColor;
                            
                            return (
                                <ThemedCard key={entry.id} style={styles.entryItem}>
                                    <View style={styles.entryRow}>
                                        <View style={[styles.typeBadge, { backgroundColor: `${badgeColor}15` }]}>
                                            <Text style={[styles.typeText, { color: badgeColor }]}>
                                                {isAllClear ? 'STATUS NORMAL' : entry.incidentType.toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={[styles.entryDate, { color: dimText }]}>
                                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <Text style={[styles.entryDesc, { color: textColor }]}>{entry.description}</Text>
                                    <View style={styles.entryFooter}>
                                        <View style={styles.footerItem}>
                                            <IconSymbol name="map.fill" size={12} color={dimText} />
                                            <Text style={[styles.footerText, { color: dimText }]}>{entry.location || 'Unknown'}</Text>
                                        </View>
                                        {!isAllClear && (
                                            <View style={styles.footerItem}>
                                                <IconSymbol name="exclamationmark.circle.fill" size={12} color={warningColor} />
                                                <Text style={[styles.footerText, { color: warningColor }]}>{entry.severity.toUpperCase()}</Text>
                                            </View>
                                        )}
                                    </View>
                                </ThemedCard>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Confirm Modal */}
            <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.confirmCard, { backgroundColor: cardColor, borderColor: cardBorder }]}>
                        <View style={[styles.confirmIcon, { backgroundColor: `${warningColor}15` }]}>
                            <IconSymbol name="exclamationmark.triangle.fill" size={28} color={warningColor} />
                        </View>
                        <Text style={[styles.confirmTitle, { color: textColor }]}>Confirm Submission</Text>
                        <Text style={[styles.confirmSub, { color: dimText }]}>This will log the incident to the central database. Continue?</Text>
                        <View style={styles.confirmActions}>
                            <ThemedButton title="Cancel" variant="secondary" style={styles.confirmBtn} onPress={() => setConfirmVisible(false)} />
                            <ThemedButton title="Confirm" variant="primary" style={styles.confirmBtn} onPress={confirmSubmit} />
                        </View>
                    </View>
                </View>
            </Modal>

            <ThemedToast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    allClear: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
    shieldIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    allClearTitle: { fontSize: 17, fontWeight: '700' },
    allClearSub: { fontSize: 13, marginTop: 2 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: 13, marginHorizontal: 14 },
    imageWrap: { position: 'relative', width: '100%', marginBottom: 12 },
    imagePreview: { width: '100%', height: 200, borderRadius: Radius.sm, resizeMode: 'cover' },
    removeImg: { position: 'absolute', top: 8, right: 8 },
    submitWrap: { marginTop: 12 },
    cancelBtn: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
    showFormBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16
    },
    reportIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    showFormLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
    formCard: {
        marginTop: 0,
        borderTopWidth: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 32 },
    confirmCard: { width: '100%', borderRadius: Radius.lg, borderWidth: 1, padding: 28, alignItems: 'center' },
    confirmIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    confirmTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    confirmSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    confirmActions: { flexDirection: 'row', gap: 12, width: '100%' },
    confirmBtn: { flex: 1 },
    entriesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    entryItem: { marginBottom: 10, padding: 16 },
    entryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    typeText: { fontSize: 10, fontWeight: '700' },
    entryDate: { fontSize: 12 },
    entryDesc: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
    entryFooter: { flexDirection: 'row', gap: 16 },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontSize: 11, fontWeight: '500' },
    sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
});
