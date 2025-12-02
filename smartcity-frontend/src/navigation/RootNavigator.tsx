import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import ReportDetailScreen from '../screens/ReportDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Tabs"
                component={AppNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ReportDetail"
                component={ReportDetailScreen}
                options={{ title: 'Report detail' }}
            />
        </Stack.Navigator>
    );
}
