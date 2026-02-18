import { Radius } from '@/constants/theme';
import { TacticalBackground } from '@/components/TacticalBackground';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedScanner } from '@/components/ThemedScanner';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    const [visitorName, setVisitorName] = useState('');
    const [visitorId, setVisitorId] = useState('');
    const [company, setCompany] = useState('');
    const [purpose, setPurpose] = useState('');
    const [hostName, setHostName] = useState('');

    const fadeIn = useRef(new Animated.Value(0)).current;
    const flashAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => { Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

    const flashGreen = () => Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const parseSAIdBarcode = (data: string) => {
        if (data.length === 13) { setVisitorId(data); flashGreen(); }
        else if (data.length > 20 && data.includes('|')) {
            const parts = data.split('|');
            if (parts.length >= 3) { setVisitorId(parts[0] || ''); setVisitorName((parts[1] + ' ' + (parts[2] || '')).trim()); flashGreen(); }
        } else { setVisitorId(data.substring(0, 30)); flashGreen(); }
    };

    const handleScan = (data: string) => { parseSAIdBarcode(data); setShowScanner(false); };

    const handleSubmit = () => {
        if (!visitorName || !visitorId) { Alert.alert('Missing Fields', 'Visitor name and ID are required.'); return; }
        Alert.alert('Visitor Logged', `Badge: VIS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
        setVisitorName(''); setVisitorId(''); setCompany(''); setPurpose(''); setHostName('');
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
                        <ThemedInput label="Full Name" placeholder="Visitor's name" value={visitorName} onChangeText={setVisitorName} icon="person.fill" />
                        <ThemedInput label="ID Number" placeholder="SA ID or passport" value={visitorId} onChangeText={setVisitorId} keyboardType="numeric" icon="creditcard.fill" />
                        <ThemedInput label="Company" placeholder="Organization" value={company} onChangeText={setCompany} icon="building.2.fill" />
                        <ThemedInput label="Purpose" placeholder="Reason for visit" value={purpose} onChangeText={setPurpose} icon="doc.text.fill" />
                        <ThemedInput label="Host Contact" placeholder="Person to meet" value={hostName} onChangeText={setHostName} icon="phone.fill" />

                        <View style={styles.submitWrap}>
                            <ThemedButton title="Grant Access" variant="success" size="large" onPress={handleSubmit} />
                        </View>
                    </ThemedCard>
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
});
