import { Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, type TouchableOpacityProps } from 'react-native';

export type ThemedButtonProps = TouchableOpacityProps & {
    title: string;
    variant?: 'primary' | 'success' | 'error' | 'warning' | 'outline' | 'secondary';
    size?: 'small' | 'medium' | 'large';
    showBrackets?: boolean;
    icon?: string;
};

export function ThemedButton({
    title,
    variant = 'primary',
    size = 'medium',
    icon,
    style,
    ...otherProps
}: ThemedButtonProps) {
    const tintColor = useThemeColor({}, 'tint');
    const successColor = useThemeColor({}, 'success');
    const errorColor = useThemeColor({}, 'error');
    const warningColor = useThemeColor({}, 'warning');
    const secondary = useThemeColor({}, 'secondary');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    let bg = tintColor;
    let border = tintColor;
    let fg = '#FFFFFF';

    if (variant === 'success') { bg = successColor; border = successColor; }
    else if (variant === 'error') { bg = errorColor; border = errorColor; }
    else if (variant === 'warning') { bg = warningColor; border = warningColor; fg = '#0F1115'; }
    else if (variant === 'secondary') { bg = cardColor; border = cardColor; fg = textColor; }
    else if (variant === 'outline') { bg = 'transparent'; border = tintColor; fg = tintColor; }

    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();

    const py = size === 'small' ? 10 : size === 'large' ? 16 : 13;
    const fs = size === 'small' ? 13 : size === 'large' ? 15 : 14;

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.button, { backgroundColor: bg, borderColor: border, paddingVertical: py }, style]}
                activeOpacity={0.85}
                {...otherProps}
            >
                {icon && <IconSymbol name={icon as any} size={fs + 2} color={fg} style={styles.icon} />}
                <Text style={[styles.text, { color: fg, fontSize: fs }]}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: Radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        borderWidth: 1,
    },
    icon: { marginRight: 8 },
    text: { fontWeight: '600' },
});
