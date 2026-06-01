import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCameraFormat,
} from 'react-native-vision-camera';
import { useBarcodeScanner, type BarcodeType, type Barcode } from '@mgcrea/vision-camera-barcode-scanner';
import * as Haptics from 'expo-haptics';

export type ThemedScannerProps = {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    title?: string;
    /** 'id' for PDF417 (ID/Licence), 'disc' for vehicle disc, 'qr' for standard QR */
    scannerType?: 'id' | 'qr' | 'disc';
};

/** ZXing barcode types for each scan mode */
const ID_BARCODE_TYPES: BarcodeType[] = [
    'pdf-417',     // SA ID book, driver's licence, licence disc
    'qr',
    'aztec',
    'data-matrix',
    'code-128',
    'code-39',
    'code-93',
    'ean-13',
    'ean-8',
    'upc-a',
    'upc-e',
];

const QR_BARCODE_TYPES: BarcodeType[] = ['qr', 'data-matrix'];

export function ThemedScanner({
    visible,
    onClose,
    onScan,
    title = 'Scan Document',
    scannerType = 'id',
}: ThemedScannerProps) {
    const textColor       = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor       = useThemeColor({}, 'tint');
    const insets          = useSafeAreaInsets();

    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');

    const [scanned, setScanned]   = useState(false);
    const [torch, setTorch]       = useState<'on' | 'off'>('off');
    const [zoom, setZoom]         = useState(scannerType === 'disc' ? 2 : 1.5);
    const [isActive, setIsActive] = useState(false);
    const [coachingText, setCoachingText] = useState('');

    const laserAnim = useRef(new Animated.Value(0)).current;
    const scannedRef = useRef(false); // Use ref to avoid stale closure in worklet

    const format = useCameraFormat(device, [
        { videoResolution: { width: 1920, height: 1080 } },
        { fps: 30 },
    ]);

    // Activate camera only while the modal is visible
    useEffect(() => {
        if (visible) {
            setScanned(false);
            scannedRef.current = false;
            setIsActive(true);
            setCoachingText('');
            const t1 = setTimeout(() => setCoachingText('Hold steady, move closer'), 5000);
            const t2 = setTimeout(() => setCoachingText('Try better lighting or tap the torch'), 10000);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        } else {
            setIsActive(false);
        }
    }, [visible]);

    // Animated laser sweep
    useEffect(() => {
        if (isActive && visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(laserAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                    Animated.timing(laserAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            laserAnim.stopAnimation();
        }
    }, [isActive, visible, laserAnim]);

    // Request permission when first opened
    useEffect(() => {
        if (visible && !hasPermission) {
            requestPermission();
        }
    }, [visible, hasPermission]);

    const handleBarcodeScanned = useCallback(
        (barcodes: Barcode[]) => {
            if (scannedRef.current || barcodes.length === 0) return;
            const value = barcodes[0].value;
            if (!value) return;

            scannedRef.current = true;
            setScanned(true);
            console.log(`[SCAN-ZX] ZXing decoded, type: ${barcodes[0].type}, length: ${value.length}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onScan(value);
            // Allow re-scan after 2s
            setTimeout(() => {
                scannedRef.current = false;
                setScanned(false);
            }, 2000);
        },
        [onScan],
    );

    // ZXing-backed frame processor via @mgcrea/vision-camera-barcode-scanner
    const { props: zxingProps } = useBarcodeScanner({
        barcodeTypes: scannerType === 'qr' ? QR_BARCODE_TYPES : ID_BARCODE_TYPES,
        onBarcodeScanned: handleBarcodeScanned,
    });

    // ── Loading ─────────────────────────────────────────────────────────────
    if (!hasPermission) {
        return (
            <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
                <SafeAreaView style={[styles.container, { backgroundColor }]}>
                    <View style={styles.permissionContainer}>
                        <Text style={[styles.permissionText, { color: textColor }]}>
                            Camera access is required to scan documents.
                        </Text>
                        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                            <Text style={styles.buttonText}>Grant Permission</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 20 }} onPress={onClose}>
                            <Text style={{ color: tintColor }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    if (!device) {
        return (
            <Modal visible={visible} transparent>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <Text style={[{ color: '#fff', marginTop: 12 }]}>Starting camera…</Text>
                </View>
            </Modal>
        );
    }

    // ── Main scanner UI ─────────────────────────────────────────────────────
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={[styles.header, { marginTop: insets.top }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.scannerWrapper}>
                    {/* Camera with ZXing frame processor spread via zxingProps */}
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={isActive && visible}
                        format={format}
                        torch={torch}
                        zoom={zoom}
                        enableZoomGesture
                        onError={(e) => console.error('[CAMERA] Error:', e)}
                        {...zxingProps}
                    />

                    {/* Controls overlay */}
                    <View style={styles.topControls}>
                        {/* Flashlight */}
                        <TouchableOpacity
                            style={[
                                styles.controlButton,
                                { backgroundColor: torch === 'on' ? '#FACC15' : 'rgba(0,0,0,0.5)' },
                            ]}
                            onPress={() => setTorch(t => (t === 'on' ? 'off' : 'on'))}
                        >
                            <IconSymbol
                                name={torch === 'on' ? 'flashlight.on.fill' : 'flashlight.off.fill'}
                                size={22}
                                color={torch === 'on' ? '#000' : '#FFF'}
                            />
                        </TouchableOpacity>

                        {/* Zoom controls */}
                        <View style={styles.zoomControls}>
                            <TouchableOpacity
                                style={styles.zoomButton}
                                onPress={() => setZoom(prev => Math.max(1, parseFloat((prev - 0.5).toFixed(1))))}
                            >
                                <Text style={styles.zoomText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.zoomDivider} />
                            <TouchableOpacity
                                style={styles.zoomButton}
                                onPress={() => setZoom(prev => Math.min(6, parseFloat((prev + 0.5).toFixed(1))))}
                            >
                                <Text style={styles.zoomText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ZXing badge */}
                    <View style={styles.engineBadge}>
                        <Text style={styles.engineText}>⚡ ZXing</Text>
                    </View>

                    {/* Scan frame overlay */}
                    <View style={styles.overlay}>
                        <View style={styles.unfocusedContainer} />
                        <View style={[styles.middleContainer, { height: scannerType === 'qr' ? 220 : scannerType === 'disc' ? 100 : 120 }]}>
                            <View style={styles.unfocusedContainer} />
                            <View style={[styles.focusedContainer, { flex: scannerType === 'qr' ? 3 : 10 }]}>
                                <View style={styles.cornerTopLeft} />
                                <View style={styles.cornerTopRight} />
                                <View style={styles.cornerBottomLeft} />
                                <View style={styles.cornerBottomRight} />
                                <Animated.View style={[styles.laser, {
                                    transform: [{
                                        translateY: laserAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [
                                                scannerType === 'qr' ? -100 : scannerType === 'disc' ? -40 : -50,
                                                scannerType === 'qr' ? 100  : scannerType === 'disc' ? 40  : 50,
                                            ],
                                        })
                                    }]
                                }]} />
                            </View>
                            <View style={styles.unfocusedContainer} />
                        </View>
                        <View style={styles.unfocusedContainer} />
                    </View>

                    {/* Hint */}
                    <View style={styles.hintContainer}>
                        {coachingText ? (
                            <View style={styles.coachingBanner}>
                                <Text style={styles.coachingText}>{coachingText}</Text>
                            </View>
                        ) : null}
                        <Text style={styles.hintText}>ALIGN BARCODE WITHIN RECTANGLE</Text>
                        <Text style={styles.subHintText}>
                            {scannerType === 'id'
                                ? "Works with ID books & driver's licences"
                                : scannerType === 'disc'
                                ? 'Hold disc level, fill the frame'
                                : 'Scan any QR code'}
                        </Text>
                        <View style={[styles.macroBadge, { backgroundColor: zoom > 1 ? '#3B82F6' : 'rgba(255,255,255,0.2)' }]}>
                            <Text style={styles.macroText}>Zoom: {zoom.toFixed(1)}x</Text>
                        </View>
                    </View>

                    {/* Scanned flash indicator */}
                    {scanned && (
                        <View style={styles.scannedOverlay}>
                            <Text style={styles.scannedText}>✓ Scanned!</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { fontSize: 18, fontWeight: 'bold' },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    permissionText: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: { color: '#FFF', fontWeight: 'bold' },
    scannerWrapper: { flex: 1, overflow: 'hidden' },
    overlay: { flex: 1 },
    unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
    middleContainer: { flexDirection: 'row', height: 180 },
    focusedContainer: {
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    topControls: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoomControls: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 22,
        padding: 4,
        alignItems: 'center',
    },
    zoomButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoomText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    zoomDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
    engineBadge: {
        position: 'absolute',
        top: 72,
        right: 20,
        backgroundColor: 'rgba(16,185,129,0.85)',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 12,
        zIndex: 10,
    },
    engineText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cornerTopLeft: {
        position: 'absolute', top: 0, left: 0,
        width: 40, height: 40,
        borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#FACC15',
    },
    cornerTopRight: {
        position: 'absolute', top: 0, right: 0,
        width: 40, height: 40,
        borderTopWidth: 4, borderRightWidth: 4, borderColor: '#FACC15',
    },
    cornerBottomLeft: {
        position: 'absolute', bottom: 0, left: 0,
        width: 40, height: 40,
        borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#FACC15',
    },
    cornerBottomRight: {
        position: 'absolute', bottom: 0, right: 0,
        width: 40, height: 40,
        borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#FACC15',
    },
    laser: {
        position: 'absolute',
        top: '50%',
        left: '5%',
        right: '5%',
        height: 2,
        backgroundColor: '#FF0000',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 4,
        elevation: 4,
    },
    hintContainer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        overflow: 'hidden',
        textAlign: 'center',
    },
    coachingBanner: {
        backgroundColor: '#F59E0B',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    coachingText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subHintText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '500',
        textShadowColor: 'black',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    macroBadge: {
        marginTop: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    macroText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    scannedOverlay: {
        position: 'absolute',
        top: '45%',
        alignSelf: 'center',
        backgroundColor: 'rgba(16,185,129,0.9)',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 32,
    },
    scannedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
