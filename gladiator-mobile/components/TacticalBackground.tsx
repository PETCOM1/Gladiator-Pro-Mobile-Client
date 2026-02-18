import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

export type TacticalBackgroundProps = ViewProps & {};

export function TacticalBackground({ style, children, ...otherProps }: TacticalBackgroundProps) {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <View style={[styles.container, { backgroundColor }, style]} {...otherProps}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
