import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

type GladiatorLogoProps = {
    size?: number;
    resizeMode?: 'contain' | 'cover';
};

/**
 * Gladiator "G" logo — Updated to use high-quality brand mark image.
 */
export function GladiatorLogo({ size = 40, resizeMode = 'contain' }: GladiatorLogoProps) {
    return (
        <View style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: size / 2,
            overflow: 'hidden',
            backgroundColor: '#000' // Matches the dark background of the logo image
        }}>
            <Image
                source={require('@/assets/images/logo.jpg')}
                style={{ width: '100%', height: '100%' }}
                contentFit={resizeMode}
                transition={200}
            />
        </View>
    );
}
