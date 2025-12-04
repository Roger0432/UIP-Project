// AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import ReportsScreen from '../screens/ReportsScreen';
import CreateReportScreen from '../screens/CreateReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useUser } from '../context/UserContext';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    const theme = useTheme();
    const { isWorker } = useUser();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#A0B5B0',
                tabBarStyle: {
                    backgroundColor: '#184B44',
                    borderTopWidth: 1,
                    borderTopColor: '#2A6B5F',
                },
                headerBackground: undefined,
                headerStyle: {
                    backgroundColor: '#184B44',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                    color: '#FFFFFF',
                },
            }}
        >
            <Tab.Screen
                name="Reports"
                component={ReportsScreen}
                options={{
                    title: 'Reports',
                    tabBarLabel: 'Reports',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="file-document-multiple"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            {!isWorker && (
                <Tab.Screen
                    name="Create a report"
                    component={CreateReportScreen}
                    options={{
                        title: 'Create a report',
                        tabBarLabel: 'Create',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons
                                name="plus-circle"
                                size={size}
                                color={color}
                            />
                        ),
                    }}
                />
            )}

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
