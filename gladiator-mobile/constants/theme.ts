/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0A0A0A', // Near black for light mode
    background: '#E0E0E0', // Light gray
    tint: '#0066CC', // Tactical blue (darker for light mode)
    icon: '#0A0A0A',
    tabIconDefault: '#808080',
    tabIconSelected: '#0066CC',
    card: '#F5F5F5',
    success: '#00BFFF', // Tactical blue
    error: '#FF0000', // Red alert
    warning: '#FFA500', // Amber alert
  },
  dark: {
    text: '#E0E0E0', // Off-white
    background: '#000000', // Pure black
    tint: '#00BFFF', // Tactical blue (electric/deep sky blue)
    icon: '#E0E0E0',
    tabIconDefault: '#808080',
    tabIconSelected: '#00BFFF',
    card: '#0A0A0A', // Near black
    success: '#00BFFF', // Tactical blue
    error: '#FF0000', // Red alert
    warning: '#FFA500', // Amber alert
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
