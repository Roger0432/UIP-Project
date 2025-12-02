import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    theme: typeof MD3LightTheme;
    isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
    themeMode: 'system',
    setThemeMode: () => { },
    theme: MD3LightTheme,
    isDark: false,
});

const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#6B8E7F',
        primaryContainer: '#C8E6D4',
        secondary: '#52634F',
        secondaryContainer: '#D5E8CE',
        tertiary: '#3A6470',
        surface: '#F8FAF5',
        background: '#F8FAF5',
    },
};

const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#9FD3B8',
        primaryContainer: '#385A4D',
        secondary: '#B9CCB2',
        secondaryContainer: '#3A4B38',
        tertiary: '#A2CCD9',
        surface: '#1A1C1A',
        background: '#1A1C1A',
    },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('app_theme_mode');
            if (savedTheme) {
                setThemeModeState(savedTheme as ThemeMode);
            }
        };
        loadTheme();
    }, []);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        AsyncStorage.setItem('app_theme_mode', mode);
    };

    const isDark =
        themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, theme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);
