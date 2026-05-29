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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
    type CodeType,
} from 'react-native-vision-camera';
import * as Haptics from 'expo-haptics';

export type ThemedScannerProps = {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    title?: string;
    /** 'id' for PDF417 (ID/Licence/Disc), 'qr' for standard QR */
    scannerType?: 'id' | 'qr';
};

/** Code types to scan for each mode */
const ID_TYPES: CodeType[] = [
    'pdf-417',   // SA ID book, driver's licence, licence disc
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

const QR_TYPES: CodeType[] = ['qr', 'data-matrix'];

export function ThemedScanner({
    visible,
    onClose,
    onScan,
    title = 'Scan Document',
    scannerType = 'id',
}: ThemedScannerProps) {
    const textColor     = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor     = useThemeColor({}, 'tint');
    const insets        = useSafeAreaInsets();

    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');

    const [scanned, setScanned]   = useState(false);
    const [torch, setTorch]       = useState<'on' | 'off'>('off');
    const [zoom, setZoom]         = useState(scannerType === 'id' ? 1.5 : 1);
    const [isActive, setIsActive] = useState(false);

    // Activate camera only while the modal is visible
    useEffect(() => {
        if (visible) {
            setScanned(false);
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [visible]);

    // Request permission when first opened
    useEffect(() => {
        if (visible && !hasPermission) {
            requestPermission();
        }
    }, [visible, hasPermission]);

    const handleCodeScanned = useCallback(
        (codes: { value?: string | null }[]) => {
            if (scanned || codes.length === 0) return;
            const value = codes[0].value;
            if (!value) return;

            setScanned(true);
            console.log(`[SCAN-VC] type detected, length: ${value.length}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onScan(value);
            // Allow re-scan after 2 s
            setTimeout(() => setScanned(false), 2000);
        },
        [scanned, onScan],
    );

    const codeScanner = useCodeScanner({
        codeTypes: scannerType === 'id' ? ID_TYPES : QR_TYPES,
        onCodeScanned: handleCodeScanned,
    });

    // ── Loading ────────────────────────────────────────────────────────────
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

    // ── Main scanner UI ────────────────────────────────────────────────────
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
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={isActive && visible}
                        codeScanner={codeScanner}
                        torch={torch}
                        zoom={zoom}
                        enableZoomGesture
                        onError={(e) => console.error('[CAMERA] Error:', e)}
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

                    {/* Scan frame overlay */}
                    <View style={styles.overlay}>
                        <View style={styles.unfocusedContainer} />
                        <View style={[styles.middleContainer, { height: scannerType === 'id' ? 120 : 220 }]}>
                            <View style={styles.unfocusedContainer} />
                            <View style={[styles.focusedContainer, { flex: scannerType === 'id' ? 10 : 3 }]}>
                                <View style={styles.cornerTopLeft} />
                                <View style={styles.cornerTopRight} />
                                <View style={styles.cornerBottomLeft} />
                                <View style={styles.cornerBottomRight} />
                                <View style={styles.laser} />
                            </View>
                            <View style={styles.unfocusedContainer} />
                        </View>
                        <View style={styles.unfocusedContainer} />
                    </View>

                    {/* Hint */}
                    <View style={styles.hintContainer}>
                        <Text style={styles.hintText}>ALIGN BARCODE WITHIN RECTANGLE</Text>
                        <Text style={styles.subHintText}>
                            {scannerType === 'id'
                                ? 'Works with ID books, driver\'s licences & licence discs'
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
        height: 1,
        backgroundColor: '#FF0000',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
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
