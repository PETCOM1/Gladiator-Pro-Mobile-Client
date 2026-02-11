import { useThemeColor } from '@/hooks/use-theme-color';
import { View, type ViewProps } from 'react-native';

export type ThemedCardProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedCard({ style, lightColor, darkColor, ...otherProps }: ThemedCardProps) {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');

    return <View style={[{ backgroundColor, borderRadius: 12, padding: 16, overflow: 'hidden' }, style]} {...otherProps} />;
}
