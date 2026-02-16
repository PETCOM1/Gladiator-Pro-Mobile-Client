import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const nativeColorScheme = useNativeColorScheme();
    const [theme, setTheme] = useState<Theme>('system');

    const colorScheme = theme === 'system' ? (nativeColorScheme ?? 'dark') : theme;

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colorScheme: colorScheme as 'light' | 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
