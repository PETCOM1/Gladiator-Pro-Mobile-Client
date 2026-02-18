/**
 * Gladiator Pro — Security SaaS Design System
 * Clean · Minimal · Enterprise-grade
 * 
 * Inspired by @VISUXCREATIVE minimal card aesthetic
 * Powered by Gladiator Security palette
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#14161A',
    background: '#EAEBEE',        // Warm off-white (not pure white)
    tint: '#345E8A',              // Slightly deeper Steel Blue
    icon: '#14161A',
    tabIconDefault: '#5C6773',
    tabIconSelected: '#345E8A',
    card: '#F5F6F8',              // Soft warm white (not pure #FFF)
    cardAlt: '#EDEEF1',
    success: '#457D5D',           // Deeper Tactical Green
    error: '#7A5234',             // Deeper Copper Brown
    warning: '#A8893E',           // Deeper Muted Amber
    accent: '#7E99B8',            // Deeper Ice Blue
    dimText: '#6B737D',           // Darker muted text for contrast
    secondary: '#4F5966',         // Deeper Slate Gray
    glowColor: 'rgba(52, 94, 138, 0.06)',
    cardBorder: 'rgba(0, 0, 0, 0.10)',  // More visible border
    border: 'rgba(0, 0, 0, 0.10)',
  },
  dark: {
    text: '#E6EAF0',          // Cloud White
    background: '#0F1115',    // Carbon Black
    tint: '#3A6EA5',          // Steel Blue — primary brand
    icon: '#E6EAF0',
    tabIconDefault: '#5C6773',
    tabIconSelected: '#3A6EA5',
    card: '#1C1F26',          // Gunmetal
    cardAlt: '#232830',       // Slightly lighter gunmetal
    success: '#4E8F6A',       // Tactical Green
    error: '#8B5E3C',         // Copper Brown
    warning: '#C2A24A',       // Muted Amber
    accent: '#9FB4CC',        // Ice Blue
    dimText: '#6B7280',       // Muted text
    secondary: '#5C6773',     // Slate Gray
    glowColor: 'rgba(58, 110, 165, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.06)',
  },
};

/** Shared design tokens */
export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
};

export const Fonts = Platform.select({
  ios: { sans: 'System', mono: 'Menlo' },
  default: { sans: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "SFMono-Regular, Menlo, Consolas, monospace",
  },
});
