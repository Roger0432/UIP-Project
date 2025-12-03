import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useUser } from '../context/UserContext';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { isAuthenticated } = useUser();
    const theme = useTheme();

    if (isAuthenticated === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {isAuthenticated ? (
                <>
                    <Stack.Screen
                        name="Tabs"
                        component={AppNavigator}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ReportDetail"
                        component={ReportDetailScreen}
                        options={{
                            title: 'Report detail',
                            headerStyle: {
                                backgroundColor: theme.colors.primary,
                            },
                            headerTintColor: '#fff',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                                color: '#fff',
                            },
                        }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
