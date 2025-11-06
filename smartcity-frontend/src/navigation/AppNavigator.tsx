import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import ReportsScreen from '../screens/ReportsScreen';
import CreateReportScreen from '../screens/CreateReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.outlineVariant,
                },
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.onSurface,
            }}
        >
            <Tab.Screen
                name="Reports"
                component={ReportsScreen}
                options={{
                    title: 'Reports',
                    tabBarLabel: 'Reports',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="file-document-multiple" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Create"
                component={CreateReportScreen}
                options={{
                    title: 'Create',
                    tabBarLabel: 'Create',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
