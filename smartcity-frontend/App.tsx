import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

function Main() {
    const { theme, isDark } = useAppTheme();

    return (
        <PaperProvider theme={theme}>
            <UserProvider>
                <NavigationContainer>
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                    <RootNavigator />
                </NavigationContainer>
            </UserProvider>
        </PaperProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <Main />
        </ThemeProvider>
    );
}
