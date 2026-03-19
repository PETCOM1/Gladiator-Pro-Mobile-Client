import { Radius } from '@/constants/theme';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedScanner } from '@/components/ThemedScanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';
import { parseSaIdDocument, parseSaLicenceDisc } from '@/utils/saIdParser';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, View, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { baseUrl } from '@/constants/api';

export default function VisitorsScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const dimText = useThemeColor({}, 'dimText');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const accentColor = useThemeColor({}, 'accent');
    const successColor = useThemeColor({}, 'success');
    const insets = useSafeAreaInsets();

    const [showScanner, setShowScanner] = useState(false);
    const [surnameInitials, setSurnameInitials] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [institution, setInstitution] = useState('');
    const [vehicleReg, setVehicleReg] = useState('');
    const [townVillage, setTownVillage] = useState('');
    const [cellNumber, setCellNumber] = useState('');
    const [purpose, setPurpose] = useState('');
    const [hostName, setHostName] = useState('');

    const { user, token } = useAuth();
    const [visitors, setVisitors] = useState<any[]>([]);
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(user?.siteId);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Entry mode: 'foot' = pedestrian, 'vehicle' = arrived by car
    const [entryMode, setEntryMode] = useState<'foot' | 'vehicle'>('foot');
    // scanTarget tells the scanner callback what to do with the result
    const [scanTarget, setScanTarget] = useState<'id' | 'disc'>('id');

    const fadeIn = useRef(new Animated.Value(0)).current;
    const flashAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => { Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

    const flashGreen = () => Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const parseSAIdBarcode = (data: string) => {
        const result = parseSaIdDocument(data);

        if (result.type === 'id_number_only') {
            setIdNumber(result.idNumber ?? '');
            flashGreen();

        } else if (result.type === 'green_id') {
            if (result.idNumber) setIdNumber(result.idNumber);
            if (result.surname || result.initials) {
                setSurnameInitials(`${result.surname ?? ''} ${result.initials ?? ''}`.trim());
            }
            flashGreen();

        } else if (result.type === 'drivers_licence') {
            if (result.idNumber) {
                setIdNumber(result.idNumber);
                flashGreen();
                Alert.alert(
                    "Driver's Licence Detected",
                    `ID number pre-filled (${result.idNumber}). The driver's licence card is encrypted, so please complete the remaining fields (name, institution, etc.) manually.`
                );
            } else {
                Alert.alert(
                    "Driver's Licence Detected",
                    "The driver's licence card is encrypted and could not be decoded automatically. Please enter the visitor's details manually."
                );
            }

        } else {
            // Unknown barcode — use raw value as fallback
            setIdNumber(data.substring(0, 30));
            flashGreen();
        }
    };

    const handleScan = (data: string) => {
        setShowScanner(false);
        if (scanTarget === 'disc') {
            handleDiscScan(data);
        } else {
            parseSAIdBarcode(data);
        }
    };

    const handleDiscScan = (data: string) => {
        const result = parseSaLicenceDisc(data);
        if (!result.detected) {
            Alert.alert('Not a Licence Disc', 'Could not detect a licence disc barcode. Please try again or enter the vehicle registration manually.');
            return;
        }
        if (result.registrationNumber) {
            setVehicleReg(result.registrationNumber);
            flashGreen();
            const details = [
                `Reg: ${result.registrationNumber}`,
                result.vin ? `VIN: ${result.vin}` : null,
                result.expiryDate ? `Expires: ${result.expiryDate}` : null,
            ].filter(Boolean).join('\n');
            Alert.alert('Licence Disc Scanned ✓', `Vehicle registration pre-filled.\n\n${details}`);
        } else {
            Alert.alert(
                'Licence Disc Detected',
                'The disc was detected but the registration number could not be extracted automatically (encrypted). Please enter the vehicle reg manually.',
            );
        }
    };

    const openIdScanner = () => { setScanTarget('id'); setShowScanner(true); };
    const openDiscScanner = () => { setScanTarget('disc'); setShowScanner(true); };

    const fetchVisitors = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/api/visitors`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            const data = await response.json();
            if (response.ok) {
                // Filter for signed-in visitors locally just in case, though backend might handle it
                setVisitors(data.filter((v: any) => v.status === 'signed-in'));
            }
        } catch (error) {
            console.error('Error fetching visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSites = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${baseUrl}/api/sites`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSites(data);
                if (!selectedSiteId && data.length > 0) {
                    setSelectedSiteId(data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching sites:', error);
        }
    };

    useEffect(() => { 
        fetchVisitors();
        if (!selectedSiteId) fetchSites();
    }, [token, selectedSiteId]);

    const handleSubmit = async () => {
        if (!surnameInitials || !idNumber) { Alert.alert('Missing Fields', 'Surname/Initials and ID are required.'); return; }
        
        setIsSubmitting(true);
        try {
            const response = await fetch(`${baseUrl}/api/visitors/check-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({
                    surnameInitials,
                    idNumber,
                    institution,
                    vehicleReg,
                    townVillage,
                    cellNumber,
                    purpose,
                    hostName,
                    siteId: selectedSiteId || user?.siteId
                }),
            });

            if (response.ok) {
                const newVisitor = await response.json();
                Alert.alert('Visitor Logged', `Badge: VIS-${newVisitor.id.substring(0, 4).toUpperCase()}`);
                setSurnameInitials(''); setIdNumber(''); setInstitution(''); setVehicleReg(''); setTownVillage(''); setCellNumber(''); setPurpose(''); setHostName('');
                fetchVisitors();
            } else {
                Alert.alert('Error', 'Failed to log visitor.');
            }
        } catch (error) {
            Alert.alert('Network Error', 'Could not connect to server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckOut = async (id: string) => {
        Alert.alert(
            'Check Out Visitor',
            'Are you sure you want to sign this visitor out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Check Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${baseUrl}/api/visitors/check-out/${id}`, {
                                method: 'PATCH',
                                headers: { 
                                    'Authorization': `Bearer ${token}`,
                                    'Bypass-Tunnel-Reminder': 'true'
                                }
                            });

                            if (response.ok) {
                                fetchVisitors();
                            } else {
                                Alert.alert('Error', 'Failed to check out visitor.');
                            }
                        } catch (error) {
                            Alert.alert('Network Error', 'Could not connect to server.');
                        }
                    }
                }
            ]
        );
    };

    // Show scanner full screen when active
    if (showScanner) {
        return (
            <ThemedScanner
                visible
                onScan={handleScan}
                onClose={() => setShowScanner(false)}
                scannerType="id" // Both ID and Disc use PDF417
                title={scanTarget === 'disc' ? 'Scan Licence Disc' : 'Scan ID Document'}
            />
        );
    }

    return (
        <TacticalBackground style={styles.container}>
            <Animated.View style={[styles.flash, { opacity: flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.08] }), backgroundColor: successColor }]} pointerEvents="none" />

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
                <Animated.View style={{ opacity: fadeIn }}>

                    {/* ── Entry Mode Toggle ── */}
                    <View style={[styles.modeToggle, { backgroundColor: `${cardBorder}30`, borderColor: cardBorder }]}>
                        <TouchableOpacity
                            style={[styles.modeBtn, entryMode === 'foot' && { backgroundColor: accentColor }]}
                            onPress={() => setEntryMode('foot')}
                        >
                            <Text style={[styles.modeBtnText, { color: entryMode === 'foot' ? '#fff' : dimText }]}>🚶 On Foot</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modeBtn, entryMode === 'vehicle' && { backgroundColor: accentColor }]}
                            onPress={() => setEntryMode('vehicle')}
                        >
                            <Text style={[styles.modeBtnText, { color: entryMode === 'vehicle' ? '#fff' : dimText }]}>🚗 In Vehicle</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Scan Button(s) ── */}
                    {entryMode === 'foot' ? (
                        // On Foot: single scan button for ID / driver's licence
                        <ThemedCard style={styles.scanCard} pressable onPress={openIdScanner}>
                            <View style={[styles.scanIcon, { backgroundColor: `${accentColor}10` }]}>
                                <IconSymbol name="barcode.viewfinder" size={36} color={accentColor} />
                            </View>
                            <View>
                                <Text style={[styles.scanTitle, { color: textColor }]}>Scan ID Document</Text>
                                <Text style={[styles.scanSub, { color: dimText }]}>SA ID book or driver's licence</Text>
                            </View>
                        </ThemedCard>
                    ) : (
                        // In Vehicle: two scan buttons
                        <View style={styles.dualScanRow}>
                            <ThemedCard style={[styles.scanCardHalf, { flex: 1, marginRight: 8 }]} pressable onPress={openIdScanner}>
                                <View style={[styles.scanIcon, { backgroundColor: `${accentColor}10`, width: 44, height: 44, borderRadius: 22 }]}>
                                    <IconSymbol name="person.crop.rectangle" size={24} color={accentColor} />
                                </View>
                                <Text style={[styles.scanTitle, { color: textColor, fontSize: 13, textAlign: 'center', marginTop: 6 }]}>Scan ID / Licence</Text>
                            </ThemedCard>
                            <ThemedCard style={[styles.scanCardHalf, { flex: 1, marginLeft: 8 }]} pressable onPress={openDiscScanner}>
                                <View style={[styles.scanIcon, { backgroundColor: `${tintColor}10`, width: 44, height: 44, borderRadius: 22 }]}>
                                    <IconSymbol name="car.fill" size={24} color={tintColor} />
                                </View>
                                <Text style={[styles.scanTitle, { color: textColor, fontSize: 13, textAlign: 'center', marginTop: 6 }]}>Scan Licence Disc</Text>
                            </ThemedCard>
                        </View>
                    )}

                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: cardBorder }]} />
                        <Text style={[styles.dividerText, { color: dimText }]}>or manual entry</Text>
                        <View style={[styles.dividerLine, { backgroundColor: cardBorder }]} />
                    </View>

                    {/* Visitor Form */}
                    <ThemedCard headerTitle="Visitor Registration">
                        <ThemedInput label="Surname & Initials" placeholder="e.g. Smith J" value={surnameInitials} onChangeText={setSurnameInitials} icon="person.fill" />
                        <ThemedInput label="ID Number" placeholder="SA ID or passport" value={idNumber} onChangeText={setIdNumber} keyboardType="numeric" icon="creditcard.fill" />
                        <ThemedInput label="Institution" placeholder="Organization/Company" value={institution} onChangeText={setInstitution} icon="building.2.fill" />
                        <ThemedInput label="Vehicle Reg" placeholder="Plate number" value={vehicleReg} onChangeText={setVehicleReg} icon="car.fill" />
                        <ThemedInput label="Town/Village" placeholder="Residence" value={townVillage} onChangeText={setTownVillage} icon="mappin.and.ellipse" />
                        <ThemedInput label="Cell Number" placeholder="Contact number" value={cellNumber} onChangeText={setCellNumber} keyboardType="phone-pad" icon="phone.fill" />
                        <ThemedInput label="Purpose" placeholder="Reason for visit" value={purpose} onChangeText={setPurpose} icon="doc.text.fill" />
                        <ThemedInput label="Host Contact" placeholder="Person to meet" value={hostName} onChangeText={setHostName} icon="person.2.fill" />

                        <View style={styles.submitWrap}>
                            <ThemedButton title={isSubmitting ? "Granting..." : "Grant Access"} variant="success" size="large" onPress={handleSubmit} disabled={isSubmitting} />
                        </View>
                    </ThemedCard>

                    {/* Active Visitors List */}
                    <View style={styles.activeSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: dimText }]}>ACTIVE VISITORS ON SITE</Text>
                            <TouchableOpacity onPress={fetchVisitors}>
                                <IconSymbol name="arrow.clockwise" size={16} color={tintColor} />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator color={tintColor} style={{ marginTop: 20 }} />
                        ) : visitors.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={{ color: dimText }}>No visitors currently signed in.</Text>
                            </View>
                        ) : (
                            visitors.map((visitor) => (
                                <View key={visitor.id} style={[styles.visitorItem, { backgroundColor: `${cardBorder}10`, borderColor: cardBorder }]}>
                                    <View style={styles.visitorInfo}>
                                        <Text style={[styles.visitorName, { color: textColor }]}>{visitor.surnameInitials}</Text>
                                        <Text style={[styles.visitorMeta, { color: dimText }]}>{visitor.idNumber} • {visitor.vehicleReg || 'No Vehicle'}</Text>
                                        <Text style={[styles.visitorMeta, { color: dimText }]}>{visitor.institution || 'Private'} • {visitor.cellNumber || 'No Phone'}</Text>
                                        <Text style={[styles.visitorTime, { color: successColor }]}>
                                            In: {new Date(visitor.signedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <ThemedButton 
                                        title="Check Out" 
                                        variant="secondary" 
                                        size="small" 
                                        onPress={() => handleCheckOut(visitor.id)} 
                                    />
                                </View>
                            ))
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </TacticalBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flash: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
    content: { padding: 20 },
    modeToggle: { 
        flexDirection: 'row', 
        padding: 4, 
        borderRadius: Radius.lg, 
        borderWidth: 1, 
        marginBottom: 20 
    },
    modeBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 10, 
        borderRadius: Radius.md 
    },
    modeBtnText: { fontSize: 14, fontWeight: '600' },
    dualScanRow: { 
        flexDirection: 'row', 
        marginBottom: 20 
    },
    scanCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20 },
    scanCardHalf: { 
        alignItems: 'center', 
        paddingVertical: 16, 
        paddingHorizontal: 8 
    },
    scanIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    scanTitle: { fontSize: 17, fontWeight: '700' },
    scanSub: { fontSize: 13, marginTop: 2 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: 13, marginHorizontal: 14 },
    submitWrap: { marginTop: 12 },
    activeSection: { marginTop: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    emptyState: { padding: 40, alignItems: 'center' },
    visitorItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: Radius.md, 
        borderWidth: 1, 
        marginBottom: 10 
    },
    visitorInfo: { flex: 1 },
    visitorName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    visitorMeta: { fontSize: 13, marginBottom: 4 },
    visitorTime: { fontSize: 12, fontWeight: '600' },
});
