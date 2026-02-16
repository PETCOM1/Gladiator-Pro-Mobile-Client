import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export type ThemedScannerProps = {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
    title?: string;
};

export function ThemedScanner({
    visible,
    onClose,
    onScan,
    title = 'Scan QR Code'
}: ThemedScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const insets = useSafeAreaInsets();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible && !permission?.granted) {
            requestPermission();
        }
    }, [visible, permission, requestPermission]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        onScan(data);
        setTimeout(() => setScanned(false), 2000); // Prevent duplicate scans
    };

    if (!permission) {
        return null;
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

                {!permission.granted ? (
                    <View style={styles.permissionContainer}>
                        <Text style={[styles.permissionText, { color: textColor }]}>
                            We need your permission to show the camera
                        </Text>
                        <TouchableOpacity
                            style={styles.permissionButton}
                            onPress={requestPermission}
                        >
                            <Text style={styles.buttonText}>Grant Permission</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.scannerWrapper}>
                        <CameraView
                            style={styles.camera}
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr", "pdf417", "code128"],
                            }}
                        >
                            <View style={styles.overlay}>
                                <View style={styles.unfocusedContainer}></View>
                                <View style={styles.middleContainer}>
                                    <View style={styles.unfocusedContainer}></View>
                                    <View style={styles.focusedContainer}>
                                        <View style={styles.cornerTopLeft}></View>
                                        <View style={styles.cornerTopRight}></View>
                                        <View style={styles.cornerBottomLeft}></View>
                                        <View style={styles.cornerBottomRight}></View>
                                    </View>
                                    <View style={styles.unfocusedContainer}></View>
                                </View>
                                <View style={styles.unfocusedContainer}></View>
                            </View>
                        </CameraView>
                        <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>POINT CAMERA AT BARCODE OR ID CARD</Text>
                        </View>
                    </View>
                )}
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
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#3B82F6',
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#3B82F6',
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#3B82F6',
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#3B82F6',
    },
    hintContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        color: '#FFF',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
    },
});
