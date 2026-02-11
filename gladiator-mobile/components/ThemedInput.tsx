import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export type ThemedInputProps = TextInputProps & {
    label?: string;
    error?: string;
};

export function ThemedInput({ label, error, style, ...otherProps }: ThemedInputProps) {
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'tint');
    const errorColor = useThemeColor({}, 'error');

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor,
                        color: textColor,
                        borderColor: error ? errorColor : 'transparent',
                        borderWidth: error ? 1 : 0
                    },
                    style
                ]}
                placeholderTextColor="#9BA1A6"
                {...otherProps}
            />
            {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        width: '100%',
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '500',
    },
    input: {
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
});
