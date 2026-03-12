import { Radius } from '@/constants/theme';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedScanner } from '@/components/ThemedScanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, View, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

    const baseUrl = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://146.141.180.199:5000';

    const fadeIn = useRef(new Animated.Value(0)).current;
    const flashAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => { Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

    const flashGreen = () => Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const parseSAIdBarcode = (data: string) => {
        if (data.length === 13) { setIdNumber(data); flashGreen(); }
        else if (data.length > 20 && data.includes('|')) {
            const parts = data.split('|');
            if (parts.length >= 3) { setIdNumber(parts[0] || ''); setSurnameInitials((parts[1] + ' ' + (parts[2] || '')).trim()); flashGreen(); }
        } else { setIdNumber(data.substring(0, 30)); flashGreen(); }
    };

    const handleScan = (data: string) => { parseSAIdBarcode(data); setShowScanner(false); };

    const fetchVisitors = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/api/visitors`, {
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
                    'Authorization': `Bearer ${token}`
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
        try {
            const response = await fetch(`${baseUrl}/api/visitors/check-out/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchVisitors();
            } else {
                Alert.alert('Error', 'Failed to check out visitor.');
            }
        } catch (error) {
            Alert.alert('Network Error', 'Could not connect to server.');
        }
    };

    if (showScanner) return <ThemedScanner visible onScan={handleScan} onClose={() => setShowScanner(false)} title="Scan ID Document" />;

    return (
        <TacticalBackground style={styles.container}>
            <Animated.View style={[styles.flash, { opacity: flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.08] }), backgroundColor: successColor }]} pointerEvents="none" />

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
                <Animated.View style={{ opacity: fadeIn }}>
                    {/* Scan Card */}
                    <ThemedCard style={styles.scanCard} pressable onPress={() => setShowScanner(true)}>
                        <View style={[styles.scanIcon, { backgroundColor: `${accentColor}10` }]}>
                            <IconSymbol name="barcode.viewfinder" size={36} color={accentColor} />
                        </View>
                        <View>
                            <Text style={[styles.scanTitle, { color: textColor }]}>Scan ID Document</Text>
                            <Text style={[styles.scanSub, { color: dimText }]}>Tap to activate camera</Text>
                        </View>
                    </ThemedCard>

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
    scanCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20 },
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
