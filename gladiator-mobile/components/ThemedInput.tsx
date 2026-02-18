import { Radius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export type ThemedInputProps = TextInputProps & {
    label?: string;
    error?: string;
    icon?: any;
};

export function ThemedInput({ label, error, icon, style, ...otherProps }: ThemedInputProps) {
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'card');
    const errorColor = useThemeColor({}, 'error');
    const tintColor = useThemeColor({}, 'tint');
    const cardBorder = useThemeColor({}, 'cardBorder');
    const dimText = useThemeColor({}, 'dimText');
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => { setIsFocused(true); otherProps.onFocus?.(e); };
    const handleBlur = (e: any) => { setIsFocused(false); otherProps.onBlur?.(e); };

    const borderColor = error ? errorColor : isFocused ? tintColor : cardBorder;

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: dimText }]}>{label}</Text>}
            <View style={[styles.inputWrapper, { backgroundColor, borderColor, borderWidth: 1 }]}>
                {icon && (
                    <IconSymbol name={icon} size={18} color={isFocused ? tintColor : dimText} style={styles.icon} />
                )}
                <TextInput
                    style={[styles.input, { color: textColor, paddingLeft: icon ? 0 : 14 }, style]}
                    placeholderTextColor={dimText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...otherProps}
                />
            </View>
            {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 6, width: '100%' },
    label: {
        fontSize: 13,
        marginBottom: 6,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.sm,
        paddingHorizontal: 14,
        minHeight: 48,
    },
    icon: { marginRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
});
