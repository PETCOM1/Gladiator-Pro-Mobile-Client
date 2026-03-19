import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
    Camera, 
    useCameraDevice, 
    useCameraPermission, 
    useCodeScanner 
} from 'react-native-vision-camera';

export type ThemedScannerProps = {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    title?: string;
    /** 'id' for PDF417 (ID/Licence), 'qr' for standard QR */
    scannerType?: 'id' | 'qr';
};

export function ThemedScanner({
    visible,
    onClose,
    onScan,
    title = 'Scan QR Code',
    scannerType = 'id'
}: ThemedScannerProps) {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const insets = useSafeAreaInsets();
    
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const [zoom, setZoom] = useState(scannerType === 'id' ? 0.08 : 0);

    // Request permissions on mount if visible
    useEffect(() => {
        if (visible && !hasPermission) {
            requestPermission();
        }
    }, [visible, hasPermission]);

    const handleCodeScanned = useCallback((codes: any[]) => {
        if (codes.length > 0 && !scanned) {
            const data = codes[0].value;
            if (data) {
                setScanned(true);
                onScan(data);
                // Reset scanned state after 2s to allow subsequent scans if needed
                setTimeout(() => setScanned(false), 2000);
            }
        }
    }, [scanned, onScan]);

    const codeScanner = useCodeScanner({
        codeTypes: scannerType === 'id' ? ['pdf-417'] : ['qr', 'code-128'],
        onCodeScanned: handleCodeScanned
    });

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
            <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
                <SafeAreaView style={[styles.container, { backgroundColor }]}>
                    <View style={styles.permissionContainer}>
                        <Text style={[styles.permissionText, { color: textColor }]}>No camera device found.</Text>
                        <TouchableOpacity onPress={onClose}><Text style={{ color: tintColor }}>Close</Text></TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom']}>
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
                        isActive={visible}
                        codeScanner={codeScanner}
                        torch={torch ? 'on' : 'off'}
                        zoom={zoom}
                    />
                    
                    {/* Flashlight & Zoom Controls */}
                    <View style={styles.topControls}>
                        <TouchableOpacity 
                            style={[styles.controlButton, { backgroundColor: torch ? '#FACC15' : 'rgba(0,0,0,0.5)' }]} 
                            onPress={() => setTorch(!torch)}
                        >
                            <IconSymbol name={torch ? "flashlight.on.fill" : "flashlight.off.fill"} size={22} color={torch ? "#000" : "#FFF"} />
                        </TouchableOpacity>

                        <View style={styles.zoomControls}>
                            <TouchableOpacity 
                                style={styles.zoomButton} 
                                onPress={() => setZoom(Math.max(device.minZoom, zoom - 0.02))}
                            >
                                <Text style={styles.zoomText}>-</Text>
                            </TouchableOpacity>
                            <View style={styles.zoomDivider} />
                            <TouchableOpacity 
                                style={styles.zoomButton} 
                                onPress={() => setZoom(Math.min(device.maxZoom, zoom + 0.02))}
                            >
                                <Text style={styles.zoomText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.overlay}>
                        <View style={styles.unfocusedContainer}></View>
                        <View style={styles.middleContainer}>
                            <View style={styles.unfocusedContainer}></View>
                            <View style={styles.focusedContainer}>
                                <View style={styles.cornerTopLeft}></View>
                                <View style={styles.cornerTopRight}></View>
                                <View style={styles.cornerBottomLeft}></View>
                                <View style={styles.cornerBottomRight}></View>
                                <View style={styles.laser}></View>
                            </View>
                            <View style={styles.unfocusedContainer}></View>
                        </View>
                        <View style={styles.unfocusedContainer}></View>
                    </View>

                    <View style={styles.hintContainer}>
                        <Text style={styles.hintText}>ALIGN BARCODE WITHIN RECTANGLE</Text>
                        <Text style={styles.subHintText}>Use + / - to adjust zoom if blurry</Text>
                        <View style={[styles.macroBadge, { backgroundColor: zoom > 0.05 ? '#3B82F6' : 'rgba(255,255,255,0.2)' }]}>
                            <Text style={styles.macroText}>Digital Zoom: {Math.round(zoom * 100)}%</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
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
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    scannerWrapper: {
        flex: 1,
        overflow: 'hidden',
    },
    overlay: {
        flex: 1,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 180,
    },
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
    zoomText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    zoomDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#FACC15',
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#FACC15',
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#FACC15',
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#FACC15',
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
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '600',
        textShadowColor: 'black',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        textAlign: 'center',
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
});
