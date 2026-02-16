import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type ViewProps } from 'react-native';

export type ThemedCardProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
    showBrackets?: boolean;
    showScanline?: boolean;
    headerTitle?: string;
};

export function ThemedCard({
    style,
    lightColor,
    darkColor,
    showBrackets = true,
    showScanline = false,
    headerTitle,
    children,
    ...otherProps
}: ThemedCardProps) {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');
    const tintColor = useThemeColor({}, 'tint');
    const scanlineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showScanline) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanlineAnim, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanlineAnim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [showScanline, scanlineAnim]);

    const translateY = scanlineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 200], // Approximate height
    });

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor,
                    borderColor: 'rgba(0, 191, 255, 0.25)',
                    borderLeftColor: tintColor,
                },
                style
            ]}
            {...otherProps}
        >
            {headerTitle && (
                <View style={[styles.header, { borderBottomColor: 'rgba(0, 191, 255, 0.15)' }]}>
                    <Text style={[styles.headerText, { color: tintColor }]}>
                        {headerTitle.toUpperCase()}
                    </Text>
                </View>
            )}

            {showBrackets && (
                <>
                    <View style={[styles.corner, styles.topLeft, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.topRight, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.bottomLeft, { borderColor: tintColor }]} />
                    <View style={[styles.corner, styles.bottomRight, { borderColor: tintColor }]} />
                </>
            )}

            {showScanline && (
                <Animated.View
                    style={[
                        styles.scanline,
                        {
                            backgroundColor: tintColor,
                            opacity: 0.1,
                            transform: [{ translateY }]
                        }
                    ]}
                />
            )}

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    card: {
        borderRadius: 0,
        overflow: 'hidden',
        borderWidth: 1,
        borderLeftWidth: 3,
        position: 'relative',
    },
    content: {
        padding: 16,
    },
    header: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomWidth: 1,
        backgroundColor: 'rgba(0, 191, 255, 0.05)',
    },
    headerText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        fontFamily: 'monospace',
    },
    corner: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderWidth: 1.5,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    scanline: {
        position: 'absolute',
        height: 1.5,
        width: '100%',
        zIndex: 5,
    }
});
