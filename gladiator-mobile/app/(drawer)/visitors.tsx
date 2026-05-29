import { Radius } from '@/constants/theme';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedPicker } from '@/components/ThemedPicker';
import { ThemedScanner } from '@/components/ThemedScanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';
import { parseSaIdDocument, parseSaLicenceDisc, type ParsedIdDocument } from '@/utils/saIdParser';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, ScrollView, StyleSheet, Text, View, Platform, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { baseUrl } from '@/constants/api';

const PURPOSE_OPTIONS = [
    { label: 'Official Business',      value: 'Official Business',      icon: 'briefcase.fill',         color: '#3B82F6' },
    { label: 'Delivery',               value: 'Delivery',               icon: 'shippingbox.fill',        color: '#F59E0B' },
    { label: 'Maintenance / Repairs',  value: 'Maintenance / Repairs',  icon: 'wrench.and.screwdriver.fill', color: '#8B5CF6' },
    { label: 'Personal Visit',         value: 'Personal Visit',         icon: 'person.fill',             color: '#10B981' },
    { label: 'Contractor',             value: 'Contractor',             icon: 'hammer.fill',             color: '#EF4444' },
    { label: 'Interview / Meeting',    value: 'Interview / Meeting',    icon: 'calendar.badge.plus',     color: '#06B6D4' },
    { label: 'Emergency',              value: 'Emergency',              icon: 'exclamationmark.triangle.fill', color: '#F97316' },
    { label: 'Other',                  value: 'Other',                  icon: 'ellipsis.circle.fill',    color: '#6B7280' },
];


function VisitorsScreen() {
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');
    const dimText = useThemeColor({}, 'dimText');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const accentColor = useThemeColor({}, 'accent');
    const successColor = useThemeColor({}, 'success');
    const insets = useSafeAreaInsets();

    const [showScanner, setShowScanner] = useState(false);
    const surnameInputRef = useRef<TextInput>(null);
    const [surnameInitials, setSurnameInitials] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [institution, setInstitution] = useState('');
    const [vehicleReg, setVehicleReg] = useState('');
    const [townVillage, setTownVillage] = useState('');
    const [cellNumber, setCellNumber] = useState('');
    const [purpose, setPurpose] = useState('');
    const [hostName, setHostName] = useState('');
    // UI feedback for name auto-fill
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [nameRequired, setNameRequired] = useState(false);
    // Scan result confirmation
    const [scanResult, setScanResult] = useState<ParsedIdDocument | null>(null);
    const [showScanResult, setShowScanResult] = useState(false);

    const { user, token } = useAuth();

    const lookupVisitor = async (idNum: string, currentName: string) => {
        setIsLookingUp(true);
        try {
            const response = await fetch(`${baseUrl}/api/visitors/search/${idNum}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-id': user?.tenantId || '',
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Only use the stored name if we have NO name from the barcode scan
                if (!currentName) {
                    if (data.surnameInitials) {
                        setSurnameInitials(data.surnameInitials);
                        setNameRequired(false);
                    } else {
                        // Visitor unknown & barcode had no name — ask user to type it
                        setNameRequired(true);
                        setTimeout(() => surnameInputRef.current?.focus(), 150);
                    }
                }
                // Always backfill optional fields if not yet set
                if (data.institution && !institution) setInstitution(data.institution);
                if (data.townVillage && !townVillage) setTownVillage(data.townVillage);
                if (data.cellNumber && !cellNumber) setCellNumber(data.cellNumber);
                if (data.vehicleReg && !vehicleReg) setVehicleReg(data.vehicleReg);
            } else {
                // Visitor not found — only flag name field if barcode had no name
                if (!currentName) {
                    setNameRequired(true);
                    setTimeout(() => surnameInputRef.current?.focus(), 150);
                }
            }
        } catch (error) {
            console.log('[Autofill] Lookup failed:', error);
            if (!currentName) {
                setNameRequired(true);
                setTimeout(() => surnameInputRef.current?.focus(), 150);
            }
        } finally {
            setIsLookingUp(false);
        }
    };
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
        setNameRequired(false);

        if (result.type === 'unknown') {
            setIdNumber(data.substring(0, 30));
            flashGreen();
            return;
        }

        // Store the result and show confirmation modal
        setScanResult(result);
        setShowScanResult(true);
        flashGreen();
    };

    const confirmScanResult = (result: ParsedIdDocument) => {
        setShowScanResult(false);
        setScanResult(null);

        if (result.type === 'id_number_only') {
            // Bare ID number — no name in barcode, always do a backend lookup
            setIdNumber(result.idNumber ?? '');
            lookupVisitor(result.idNumber ?? '', '');

        } else if (result.type === 'green_id') {
            // Green ID book — name fields are in the barcode (pipe-delimited)
            const idNum = result.idNumber ?? '';
            if (idNum) setIdNumber(idNum);

            // Build the full name from surname + given names
            const surname   = (result.surname ?? '').trim();
            const givenNames = (result.firstName ?? result.initials ?? '').trim();
            // SA Green ID stores: SURNAME | GIVEN-NAMES — put surname first
            const fullName = [surname, givenNames].filter(Boolean).join(' ');

            if (fullName) {
                setSurnameInitials(fullName);
                setNameRequired(false);
                // Still lookup to backfill institution / town / cell for returning visitors
                if (idNum) lookupVisitor(idNum, fullName);
            } else {
                // No name in barcode (rare) — flag and lookup
                setNameRequired(true);
                setTimeout(() => surnameInputRef.current?.focus(), 150);
                if (idNum) lookupVisitor(idNum, '');
            }

        } else if (result.type === 'drivers_licence') {
            if (result.idNumber) {
                setIdNumber(result.idNumber);
                const surname    = (result.surname ?? '').trim();
                const givenNames = (result.firstName ?? result.initials ?? '').trim();
                const extractedName = [surname, givenNames].filter(Boolean).join(' ');

                if (extractedName) {
                    setSurnameInitials(extractedName);
                    setNameRequired(false);
                    // For fuzzy names always verify via lookup; for clean extractions still
                    // lookup to backfill extra fields for returning visitors
                    lookupVisitor(result.idNumber, extractedName);
                } else {
                    setNameRequired(true);
                    setTimeout(() => surnameInputRef.current?.focus(), 150);
                    lookupVisitor(result.idNumber, '');
                }
            }
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
                scannerType="id"
                title={scanTarget === 'disc' ? 'Scan Licence Disc' : 'Scan ID Document'}
            />
        );
    }

    // Scan result confirmation modal
    const ScanResultModal = () => {
        if (!scanResult) return null;
        const docLabel = scanResult.type === 'green_id' ? '🪪 SA Green ID Book'
            : scanResult.type === 'drivers_licence' ? '🚗 Driver\'s Licence'
            : '🔢 ID Number Only';

        // A name was successfully extracted from the barcode
        const hasName = !!((scanResult.surname ?? scanResult.firstName ?? scanResult.initials ?? '').trim());

        const rows: { label: string; value: string | undefined }[] = [
            { label: 'Document Type', value: docLabel },
            { label: 'ID Number',     value: scanResult.idNumber },
            { label: 'Surname',       value: scanResult.surname },
            { label: 'First Name(s)', value: scanResult.firstName ?? scanResult.initials },
            { label: 'Date of Birth', value: scanResult.dateOfBirth },
            { label: 'Gender',        value: scanResult.gender },
            { label: 'Nationality',   value: scanResult.nationality },
        ].filter(r => r.value);

        return (
            <Modal visible={showScanResult} transparent animationType="slide" onRequestClose={() => setShowScanResult(false)}>
                <View style={srStyles.overlay}>
                    <View style={[srStyles.sheet, { backgroundColor: useThemeColor({}, 'card') }]}>
                        <Text style={[srStyles.sheetTitle, { color: textColor }]}>📄 Document Scanned</Text>

                        {/* ✅ Name auto-filled success banner */}
                        {hasName && !scanResult.fuzzyName && (
                            <View style={srStyles.successBanner}>
                                <Text style={srStyles.successText}>✅ Name auto-filled from document</Text>
                            </View>
                        )}

                        {/* ⚠️ Fuzzy name warning — driver's licence encrypted */}
                        {scanResult.fuzzyName && (
                            <View style={srStyles.warningBanner}>
                                <Text style={srStyles.warningText}>⚠️ Name extracted approximately — please verify</Text>
                            </View>
                        )}

                        {/* ⚠️ No name at all — user must type it */}
                        {!hasName && scanResult.type !== 'id_number_only' && (
                            <View style={srStyles.warningBanner}>
                                <Text style={srStyles.warningText}>⚠️ Name not found in barcode — you'll be prompted to enter it</Text>
                            </View>
                        )}

                        {scanResult.partialDriversLicence && !scanResult.idNumber && (
                            <View style={srStyles.warningBanner}>
                                <Text style={srStyles.warningText}>⚠️ Encrypted licence — only ID extracted</Text>
                            </View>
                        )}

                        {rows.map(r => (
                            <View key={r.label} style={[srStyles.row, { borderBottomColor: cardBorder }]}>
                                <Text style={[srStyles.rowLabel, { color: dimText }]}>{r.label}</Text>
                                <Text style={[srStyles.rowValue, { color: textColor }]}>{r.value}</Text>
                            </View>
                        ))}
                        <View style={srStyles.btnRow}>
                            <TouchableOpacity style={[srStyles.btn, { backgroundColor: cardBorder }]} onPress={() => setShowScanResult(false)}>
                                <Text style={[srStyles.btnText, { color: dimText }]}>Re-scan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[srStyles.btn, { backgroundColor: tintColor }]} onPress={() => confirmScanResult(scanResult)}>
                                <Text style={[srStyles.btnText, { color: '#fff' }]}>Confirm ✓</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <TacticalBackground style={styles.container}>
            <ScanResultModal />
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

                    <ThemedCard headerTitle="Visitor Registration">
                        {isLookingUp && (
                            <View style={styles.lookupBanner}>
                                <ActivityIndicator size="small" color={tintColor} />
                                <Text style={[styles.lookupBannerText, { color: dimText }]}>Looking up visitor record…</Text>
                            </View>
                        )}
                        {nameRequired && !isLookingUp && (
                            <View style={[styles.lookupBanner, { backgroundColor: `${accentColor}20`, borderColor: accentColor }]}>
                                <IconSymbol name="exclamationmark.triangle.fill" size={16} color={accentColor} />
                                <Text style={[styles.lookupBannerText, { color: accentColor }]}>Please enter the visitor's name manually</Text>
                            </View>
                        )}
                        <ThemedInput 
                            ref={surnameInputRef}
                            label="Surname & Initials" 
                            placeholder={nameRequired ? 'Type name here…' : 'e.g. Smith J'}
                            value={surnameInitials} 
                            onChangeText={(v) => { setSurnameInitials(v); if (v) setNameRequired(false); }}
                            icon="person.fill"
                        />
                        <ThemedInput label="ID Number" placeholder="SA ID or passport" value={idNumber} onChangeText={setIdNumber} keyboardType="numeric" icon="creditcard.fill" />
                        <ThemedInput label="Institution (Optional)" placeholder="Organization/Company" value={institution} onChangeText={setInstitution} icon="building.2.fill" />
                        <ThemedInput label="Vehicle Reg" placeholder="Plate number" value={vehicleReg} onChangeText={setVehicleReg} icon="car.fill" />
                        <ThemedInput label="Town/Village" placeholder="Residence" value={townVillage} onChangeText={setTownVillage} icon="mappin.and.ellipse" />
                        <ThemedInput label="Cell Number" placeholder="Contact number" value={cellNumber} onChangeText={setCellNumber} keyboardType="phone-pad" icon="phone.fill" />
                        <ThemedPicker
                            label="Purpose of Visit"
                            options={PURPOSE_OPTIONS}
                            selectedValue={purpose}
                            onValueChange={setPurpose}
                            placeholder="Select purpose…"
                        />
                        <ThemedInput label="Host Contact (Optional)" placeholder="Person to meet" value={hostName} onChangeText={setHostName} icon="person.2.fill" />

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
    lookupBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 10,
    },
    lookupBannerText: { fontSize: 13, fontWeight: '500', flex: 1 },
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

export default VisitorsScreen;

const srStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    successBanner: {
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#10B981',
    },
    successText: {
        color: '#10B981',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    warningBanner: {
        backgroundColor: 'rgba(251,191,36,0.15)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FBBF24',
    },
    warningText: {
        color: '#FBBF24',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowLabel: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '700',
        flex: 2,
        textAlign: 'right',
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    btn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
