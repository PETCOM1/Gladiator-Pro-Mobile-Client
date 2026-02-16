import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, type TouchableOpacityProps } from 'react-native';

export type ThemedButtonProps = TouchableOpacityProps & {
    title: string;
    variant?: 'primary' | 'success' | 'error' | 'warning' | 'outline';
    size?: 'small' | 'medium' | 'large';
    showBrackets?: boolean;
};

export function ThemedButton({
    title,
    variant = 'primary',
    size = 'medium',
    showBrackets = false,
    style,
    ...otherProps
}: ThemedButtonProps) {
    const tintColor = useThemeColor({}, 'tint');
    const successColor = useThemeColor({}, 'success');
    const errorColor = useThemeColor({}, 'error');
    const warningColor = useThemeColor({}, 'warning');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    let backgroundColor = successColor;
    let borderColor = successColor;
    let buttonTextColor = '#000000';

    if (variant === 'error') {
        backgroundColor = errorColor;
        borderColor = errorColor;
        buttonTextColor = '#FFFFFF';
    } else if (variant === 'warning') {
        backgroundColor = warningColor;
        borderColor = warningColor;
        buttonTextColor = '#000000';
    } else if (variant === 'outline') {
        backgroundColor = 'transparent';
        borderColor = tintColor;
        buttonTextColor = tintColor;
    }

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const paddingVertical = size === 'small' ? 8 : size === 'large' ? 16 : 12;
    const fontSize = size === 'small' ? 11 : size === 'large' ? 15 : 13;

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.button,
                    {
                        backgroundColor,
                        borderColor,
                        borderWidth: 1.5,
                        paddingVertical,
                    },
                    style
                ]}
                activeOpacity={0.8}
                {...otherProps}
            >
                {/* HUD Glow overlay for primary */}
                {variant === 'primary' && (
                    <View style={[StyleSheet.absoluteFill, styles.glow, { shadowColor: tintColor }]} />
                )}

                {showBrackets && (
                    <>
                        <View style={[styles.corner, styles.topLeft, { borderColor: buttonTextColor }]} />
                        <View style={[styles.corner, styles.topRight, { borderColor: buttonTextColor }]} />
                        <View style={[styles.corner, styles.bottomLeft, { borderColor: buttonTextColor }]} />
                        <View style={[styles.corner, styles.bottomRight, { borderColor: buttonTextColor }]} />
                    </>
                )}

                <Text style={[styles.text, { color: buttonTextColor, fontSize }]}>
                    {title.toUpperCase()}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    text: {
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    glow: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderWidth: 1,
        opacity: 0.6,
    },
    topLeft: { top: 2, left: 2, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 2, right: 2, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 2, left: 2, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 2, right: 2, borderLeftWidth: 0, borderTopWidth: 0 },
});
