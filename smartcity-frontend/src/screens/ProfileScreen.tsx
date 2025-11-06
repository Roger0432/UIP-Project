import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import {
    Text,
    List,
    Switch,
    Avatar,
    Divider,
    useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const theme = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.profileHeader}>
                <Avatar.Image
                    size={120}
                    source={{ uri: 'https://i.pravatar.cc/300?img=12' }}
                />
                <Text variant="headlineSmall" style={styles.profileName}>
                    Joel Garcia
                </Text>
            </View>

            <View style={styles.infoSection}>
                <List.Item
                    title="Phone"
                    description="+34 612 123 123"
                    left={(props) => <List.Icon {...props} icon="phone" />}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Mail"
                    description="joelgarcia@gmail.com"
                    left={(props) => <List.Icon {...props} icon="email" />}
                    style={styles.listItem}
                />
            </View>

            <View style={styles.optionsSection}>
                <List.Item
                    title="Dark mode"
                    left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                    right={() => (
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            color={theme.colors.primary}
                        />
                    )}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Profile details"
                    left={(props) => <List.Icon {...props} icon="account-details" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => {}}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Settings"
                    left={(props) => <List.Icon {...props} icon="cog" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => {}}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Logout"
                    left={(props) => <List.Icon {...props} icon="logout" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => {}}
                    style={styles.listItem}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    profileName: {
        marginTop: 16,
        fontWeight: '600',
    },
    infoSection: {
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    optionsSection: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItem: {
        paddingVertical: 8,
    },
});
