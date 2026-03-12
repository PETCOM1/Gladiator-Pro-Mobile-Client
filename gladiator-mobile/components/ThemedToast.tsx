import { Radius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ThemedToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide?: () => void;
  duration?: number;
}

export function ThemedToast({
  visible,
  message,
  type = 'success',
  onHide,
  duration = 3000,
}: ThemedToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const infoColor = useThemeColor({}, 'tint');
  const textColor = '#FFFFFF';
  const cardColor = useThemeColor({}, 'card');

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Hide timer
      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -10,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible && (opacity as any)._value === 0) return null;

  let bg = successColor;
  let icon = 'checkmark.shield.fill';

  if (type === 'error') {
    bg = errorColor;
    icon = 'exclamationmark.octagon.fill';
  } else if (type === 'warning') {
    bg = warningColor;
    icon = 'exclamationmark.triangle.fill';
  } else if (type === 'info') {
    bg = infoColor;
    icon = 'info.circle.fill';
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: bg,
        },
      ]}
    >
      <View style={styles.content}>
        <IconSymbol name={icon as any} size={20} color={textColor} style={styles.icon} />
        <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
