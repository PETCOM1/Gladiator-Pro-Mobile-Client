import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export type ThemedInputProps = TextInputProps & {
    label?: string;
    error?: string;
    icon?: any; // SF Symbol name
};

export function ThemedInput({ label, error, icon, style, ...otherProps }: ThemedInputProps) {
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'card');
    const errorColor = useThemeColor({}, 'error');
    const tintColor = useThemeColor({}, 'tint'); // Tactical green

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: tintColor }]}>{label}</Text>}
            <View style={styles.inputWrapper}>
                {icon && (
                    <View style={styles.iconContainer}>
                        <IconSymbol name={icon} size={18} color={tintColor} />
                    </View>
                )}
                <View style={[styles.accentBar, { backgroundColor: tintColor }]} />
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor,
                            color: textColor,
                            borderColor: error ? errorColor : tintColor,
                            borderWidth: 1,
                            paddingLeft: icon ? 44 : 14,
                        },
                        style
                    ]}
                    placeholderTextColor="#808080"
                    {...otherProps}
                />
            </View>
            {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        width: '100%',
    },
    label: {
        fontSize: 11,
        marginBottom: 6,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        position: 'relative',
        width: '100%',
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        zIndex: 2,
    },
    iconContainer: {
        position: 'absolute',
        left: 14,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
    input: {
        padding: 14,
        borderRadius: 0, // Sharp, angular
        fontSize: 15,
        fontFamily: 'monospace',
    },
    errorText: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
