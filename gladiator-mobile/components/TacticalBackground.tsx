import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

export type TacticalBackgroundProps = ViewProps & {
    pattern?: 'grid' | 'dots' | 'none';
    opacity?: number;
};

export function TacticalBackground({
    pattern = 'grid',
    opacity = 0.05,
    style,
    children,
    ...otherProps
}: TacticalBackgroundProps) {
    const tintColor = useThemeColor({}, 'tint');

    return (
        <View style={[styles.container, style]} {...otherProps}>
            {pattern === 'grid' && (
                <View style={[StyleSheet.absoluteFill, styles.gridContainer]}>
                    <View style={[styles.gridLines, { borderColor: tintColor, opacity }]} />
                </View>
            )}
            {pattern === 'dots' && (
                <View style={[StyleSheet.absoluteFill, styles.dotContainer]}>
                    <View style={[styles.dots, { backgroundColor: tintColor, opacity }]} />
                </View>
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gridContainer: {
        overflow: 'hidden',
    },
    gridLines: {
        width: '200%',
        height: '200%',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        backgroundColor: 'transparent',
        // We use a repeated pattern approach
        position: 'absolute',
        top: -20,
        left: -20,
        // Note: React Native doesn't have native background-repeat image support in View styles
        // so we'll simulate a 40x40 grid
        transform: [{ scale: 1 }],
    },
    dotContainer: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dots: {
        width: '100%',
        height: '100%',
        // Dots are harder without SVGs or images, so we might just use grid for now 
        // or a simple placeholder
    },
});
