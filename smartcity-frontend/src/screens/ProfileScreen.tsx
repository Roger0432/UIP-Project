import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
    Text,
    List,
    Avatar,
    Divider,
    useTheme,
    Switch,
} from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { useAppTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
    const theme = useTheme();
    const { isWorker, setIsWorker } = useUser();
    const { isDark, setThemeMode } = useAppTheme();

    const toggleWorkerStatus = () => {
        setIsWorker(!isWorker); // esto actualiza contexto + AsyncStorage
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.profileHeader}>
                <Avatar.Image
                    size={120}
                    source={{ uri: 'https://i.pravatar.cc/300?img=12' }}
                />
                <Text variant="headlineSmall" style={styles.profileName}>
                    Joel Garcia
                </Text>
            </View>

            <View style={styles.section}>
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
                <Divider />
                <List.Item
                    title="Dark Mode"
                    description="Choose your theme"
                    left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                    right={() => (
                        <Switch
                            value={isDark}
                            onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                        />
                    )}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Worker mode"
                    description="Enable if you are a city worker"
                    left={(props) => <List.Icon {...props} icon="account-hard-hat" />}
                    right={() => (
                        <Switch value={isWorker} onValueChange={toggleWorkerStatus} />
                    )}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Logout"
                    left={(props) => <List.Icon {...props} icon="logout" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => { }}
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
    section: {
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItem: {
        paddingVertical: 8,
    },
});
