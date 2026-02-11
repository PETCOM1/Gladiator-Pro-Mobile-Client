/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1F2933',
    background: '#E5E7EB',
    tint: '#3B82F6',
    icon: '#1F2933',
    tabIconDefault: '#1F2933',
    tabIconSelected: '#3B82F6',
    card: '#FFFFFF',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    text: '#E5E7EB',
    background: '#0F172A', // Navy Blue
    tint: '#3B82F6', // Accent Blue
    icon: '#E5E7EB',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#3B82F6',
    card: '#1F2933', // Dark Gray
    success: '#22C55E', // Emerald Green
    error: '#EF4444', // Alert Red
    warning: '#F59E0B', // Amber
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
