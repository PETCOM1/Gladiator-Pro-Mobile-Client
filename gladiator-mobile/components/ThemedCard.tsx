import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';

export type ThemedCardProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
    showBrackets?: boolean;
    showScanline?: boolean;
    headerTitle?: string;
    pressable?: boolean;
    onPress?: () => void;
};

export function ThemedCard({
    style,
    lightColor,
    darkColor,
    headerTitle,
    pressable = false,
    onPress,
    children,
    ...otherProps
}: ThemedCardProps) {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const dimText = useThemeColor({}, 'dimText');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!pressable) return;
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        if (!pressable) return;
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }).start();
    };

    const cardContent = (
        <>
            {headerTitle && (
                <View style={[styles.header, { borderBottomColor: cardBorder }]}>
                    <Text style={[styles.headerText, { color: dimText }]}>
                        {headerTitle}
                    </Text>
                </View>
            )}
            <View style={styles.content}>{children}</View>
        </>
    );

    const cardStyle = [
        styles.card,
        {
            backgroundColor,
            borderColor: cardBorder,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
                android: { elevation: 2 },
            }),
        },
        style,
    ];

    if (pressable) {
        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={cardStyle as any} {...otherProps}>
                    {cardContent}
                </Pressable>
            </Animated.View>
        );
    }

    return <View style={cardStyle} {...otherProps}>{cardContent}</View>;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.md,
        overflow: 'hidden',
        borderWidth: 1,
    },
    content: { padding: 16 },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
