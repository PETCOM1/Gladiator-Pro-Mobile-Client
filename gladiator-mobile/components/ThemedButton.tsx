import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

export type ThemedButtonProps = TouchableOpacityProps & {
    title: string;
    variant?: 'primary' | 'success' | 'error' | 'warning' | 'outline';
    size?: 'small' | 'medium' | 'large';
};

export function ThemedButton({
    title,
    variant = 'primary',
    size = 'medium',
    style,
    ...otherProps
}: ThemedButtonProps) {
    const primaryColor = useThemeColor({}, 'tint');
    const successColor = useThemeColor({}, 'success');
    const errorColor = useThemeColor({}, 'error');
    const warningColor = useThemeColor({}, 'warning');
    const textColor = useThemeColor({}, 'text');

    let backgroundColor = primaryColor;
    let borderColor = 'transparent';
    let buttonTextColor = '#FFFFFF';

    if (variant === 'success') backgroundColor = successColor;
    if (variant === 'error') backgroundColor = errorColor;
    if (variant === 'warning') backgroundColor = warningColor;
    if (variant === 'outline') {
        backgroundColor = 'transparent';
        borderColor = primaryColor;
        buttonTextColor = primaryColor;
    }

    const paddingVertical = size === 'small' ? 8 : size === 'large' ? 16 : 12;
    const fontSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor, borderColor, borderWidth: borderColor !== 'transparent' ? 1 : 0, paddingVertical },
                style
            ]}
            activeOpacity={0.7}
            {...otherProps}
        >
            <Text style={[styles.text, { color: buttonTextColor, fontSize }]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    text: {
        fontWeight: '600',
    },
});
