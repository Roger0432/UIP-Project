import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

export default function ProfileScreen() {
    const theme = useTheme();
    const { isWorker, setIsWorker } = useUser();
    const { isDark, setThemeMode } = useAppTheme();

    const [profile, setProfile] = React.useState({
        name: 'Joel Garcia',
        phone: '+34 612 123 123',
        email: 'joelgarcia@gmail.com',
    });
    const [editVisible, setEditVisible] = React.useState(false);
    const [tempProfile, setTempProfile] = React.useState(profile);

    const openEdit = () => {
        setTempProfile(profile);
        setEditVisible(true);
    };

    const saveEdit = () => {
        setProfile(tempProfile);
        setEditVisible(false);
    };

    const toggleWorkerStatus = () => {
        setIsWorker(!isWorker);
    };

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.content}
            >
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
                        {profile.name}
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
                        onPress={() => { }}
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
