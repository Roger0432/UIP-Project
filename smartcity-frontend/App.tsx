import React from 'react';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useColorScheme } from 'react-native';

const theme = {
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

export default function App() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <PaperProvider theme={isDark ? darkTheme : theme}>
            <NavigationContainer>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <AppNavigator />
            </NavigationContainer>
        </PaperProvider>
    );
}
