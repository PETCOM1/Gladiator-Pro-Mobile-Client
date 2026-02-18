import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useThemeColor } from '@/hooks/use-theme-color';

type GladiatorLogoProps = {
    size?: number;
    color?: string;
};

/**
 * Gladiator "G" logo — Refined fusion of the letter "G" and a Spartan helmet.
 * A sleek, modern mark where the helmet's side profile forms the geometry of a "G".
 * Minimalist, balanced, and professional.
 */
export function GladiatorLogo({ size = 40, color = '#3A6EA5' }: GladiatorLogoProps) {
    const cardColor = useThemeColor({}, 'card');

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
                {/* 
                  Refined Design:
                  - The outer curve is a thick, sleek "G".
                  - The 'mouth' or horizontal bar of the G becomes the visor/eye slit of a 
                    side-profile Spartan helmet facing right.
                  - The top part of the G curve is stylized as the helmet's plume/crest.
                */}

                {/* Main "G" + Helmet Silhouette */}
                <Path
                    d="M75 35 
                       C 70 20, 55 12, 40 12 
                       C 20 12, 10 28, 10 50 
                       C 10 72, 20 88, 40 88 
                       C 55 88, 70 80, 78 65 
                       L 78 52 
                       H 45 
                       L 45 42 
                       H 88 
                       V 55 
                       C 88 78, 70 95, 40 95 
                       C 15 95, 0 75, 0 50 
                       C 0 25, 15 5, 40 5 
                       C 60 5, 78 15, 88 32 
                       L 75 35 Z"
                    fill={color}
                    fillRule="evenodd"
                />

                {/* The Helmet Interior Detail (Face/Eye Slit) */}
                <G transform="translate(12, 12)">
                    {/* Visualizing the helmet within the G structure */}
                    <Path
                        d="M33 30 
                           C 33 20, 50 15, 60 25 
                           L 60 40 
                           H 33 
                           V 30 Z"
                        fill={cardColor}
                        opacity={0.8}
                    />

                    {/* Nose guard line */}
                    <Path
                        d="M33 40 L33 55 L38 50 V40 Z"
                        fill={color}
                    />
                </G>

                {/* Subtle Crest / Plume Lines to emphasize the Spartan look */}
                <Path
                    d="M35 12 L32 5 M45 12 L42 5 M55 15 L52 8 M65 22 L62 15"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity={0.9}
                />
            </Svg>
        </View>
    );
}
