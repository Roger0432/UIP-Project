import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import {
    Text,
    List,
    Avatar,
    Divider,
    useTheme,
    Switch,
    Portal,
    Dialog,
    TextInput,
    Button,
    IconButton,
} from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { useAppTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profilesAPI } from '../services/api';

export default function ProfileScreen({ navigation }: any) {
    const theme = useTheme();
    const { isWorker, setIsWorker, user, logout } = useUser();
    const { isDark, setThemeMode } = useAppTheme();

    const [profile, setProfile] = React.useState<{ name: string; phone: string; email: string }>({
        name: 'Joel',
        phone: '123456789',
        email: 'joel@joel.com',
    });
    const [loading, setLoading] = React.useState<boolean>(true);
    const [userId, setUserId] = React.useState<string | null>(null);
    const [editVisible, setEditVisible] = React.useState(false);
    const [tempProfile, setTempProfile] = React.useState(profile);

    const openEdit = () => {
        setTempProfile(profile);
        setEditVisible(true);
    };

    const saveEdit = async () => {
        try {
            if (!userId) return;
            const payload = { name: tempProfile.name, phone: tempProfile.phone, email: tempProfile.email };
            setLoading(true);
            const saved = await profilesAPI.updateProfile(userId, payload);
            setProfile({ name: saved.name ?? '', phone: saved.phone ?? '', email: saved.email ?? '' });
            setEditVisible(false);
        } catch (err) {
            console.error('Error saving profile', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkerStatus = async () => {
        const newVal = !isWorker;
        setIsWorker(newVal);
        try {
            if (!userId) return;
            setLoading(true);
            await profilesAPI.updateProfile(userId, { role: newVal ? 'worker' : 'citizen' });
        } catch (err) {
            console.error('Error updating role', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    await logout();
                    // Navigation will be handled automatically by RootNavigator
                },
                style: 'destructive',
            },
        ]);
    };

    React.useEffect(() => {
        // Ensure we have a userId stored, otherwise create one
        const init = async () => {
            try {
                let id = user?.id || (await AsyncStorage.getItem('app_user_id'));
                if (!id) {
                    // Create a simple ID - for production use UUID
                    id = `user-${Date.now()}`;
                    await AsyncStorage.setItem('app_user_id', id);
                }
                setUserId(id);

                // Fetch profile from backend
                try {
                    setLoading(true);
                    const data = await profilesAPI.getProfile(id);
                    setProfile({ name: data.name || '', phone: data.phone || '', email: data.email || '' });
                    // Sync worker role with UserContext
                    if (data.role) setIsWorker(data.role === 'worker');
                } catch (fetchErr: any) {
                    // If 404 user not found, keep empty profile so user can create
                    if (fetchErr?.response?.status === 404) {
                        setProfile({ name: '', phone: '', email: '' });
                    } else {
                        console.error('Fetch profile error', fetchErr);
                    }
                }
            } catch (err) {
                console.error('Error initializing profile', err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.content}
            >
                {loading && (
                    <View style={{ alignItems: 'center', paddingTop: 20 }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                )}
                {/* Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Avatar.Image
                            size={120}
                            source={{ uri: 'https://i.pravatar.cc/300?img=12' }}
                        />
                        <IconButton
                            icon="pencil-circle"
                            size={30}
                            iconColor={theme.colors.primary}
                            style={styles.editBadge}
                            onPress={openEdit}
                        />
                    </View>
                    <Text variant="headlineSmall" style={styles.profileName}>
                        {profile.name || 'Unnamed user'}
                    </Text>
                </View>

                <View style={styles.section}>
                    <List.Item
                        title="Phone"
                        description={profile.phone}
                        left={(props) => <List.Icon {...props} icon="phone" />}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title="Mail"
                        description={profile.email}
                        left={(props) => <List.Icon {...props} icon="email" />}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title="Dark Mode"
                        description="Choose your theme"
                        left={(props) => (
                            <List.Icon {...props} icon={isDark ? 'weather-night' : 'white-balance-sunny'} />
                        )}
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
                        onPress={handleLogout}
                        style={styles.listItem}
                    />
                </View>
            </ScrollView>

            <Portal>
                <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
                    <Dialog.Title>Edit Profile</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Name"
                            value={tempProfile.name}
                            onChangeText={(text) => setTempProfile({ ...tempProfile, name: text })}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Phone"
                            value={tempProfile.phone}
                            onChangeText={(text) => setTempProfile({ ...tempProfile, phone: text })}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            label="Email"
                            value={tempProfile.email}
                            onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setEditVisible(false)}>Cancel</Button>
                        <Button onPress={saveEdit}>Save</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
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
    avatarContainer: {
        position: 'relative',
    },
    editBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: 'white',
        margin: 0,
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
    input: {
        marginBottom: 12,
    },
});
