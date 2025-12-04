//Arnau
import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
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
    RadioButton,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useUser } from '../context/UserContext';
import { useAppTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profilesAPI } from '../services/api';

export default function ProfileScreen({ navigation }: any) {
    const theme = useTheme();
    const { isWorker, setIsWorker, user, logout } = useUser();
    const { isDark, setThemeMode } = useAppTheme();
    const { t } = useTranslation();

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
        { code: 'ca', label: 'Català', flag: '' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', label: 'Português', flag: '🇵🇹' },
    ];

    const [langDialogVisible, setLangDialogVisible] = React.useState(false);
    const [profile, setProfile] = React.useState<{
        id: string;
        name: string;
        phone: string;
        email: string;
        role: string;
        image: string;
        createdAt: string;
        updatedAt: string;
    } | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [updating, setUpdating] = React.useState<boolean>(false);
    const [userId, setUserId] = React.useState<string | null>(null);
    const [editVisible, setEditVisible] = React.useState(false);
    const [tempProfile, setTempProfile] = React.useState({
        name: '',
        phone: '',
        email: '',
        image: '',
    });
    const [imageUri, setImageUri] = React.useState<string | null>(null);

    const uploadPhotoAsync = async (uri: string): Promise<string> => {
        const cloudName = 'dt2bsrv1r';
        const uploadPreset = 'UIDProject';

        const formData = new FormData();
        formData.append('file', {
            uri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        } as any);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        return data.secure_url;
    };

    const changeLanguage = async (lng: string) => {
        try {
            await i18n.changeLanguage(lng);
        } catch (e) {
            console.error('Language change error', e);
        }
        setLangDialogVisible(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const openEdit = () => {
        if (profile) {
            setTempProfile({
                name: profile.name,
                phone: profile.phone || '',
                email: profile.email,
                image: profile.image || '',
            });
            setImageUri(profile.image);
        }
        setEditVisible(true);
    };

    const saveEdit = async () => {
        try {
            if (!userId) return;

            setUpdating(true);

            let newImageUrl = tempProfile.image;
            if (imageUri && imageUri !== profile?.image) {
                newImageUrl = await uploadPhotoAsync(imageUri);
            }

            const payload: any = {};
            if (tempProfile.name !== profile?.name) payload.name = tempProfile.name;
            if (tempProfile.phone !== profile?.phone) payload.phone = tempProfile.phone;
            if (tempProfile.email !== profile?.email) payload.email = tempProfile.email;
            if (newImageUrl !== profile?.image) payload.image = newImageUrl;

            if (Object.keys(payload).length === 0) {
                setEditVisible(false);
                return;
            }

            const saved = await profilesAPI.updateProfile(userId, payload);
            setProfile(saved);
            setEditVisible(false);
        } catch (err: any) {
            console.error('Error saving profile', err);
            Alert.alert('Error', err.message);
        } finally {
            setUpdating(false);
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
        if (Platform.OS === 'web') {
            try {
                await logout();
            } catch (e) {
                console.error('ProfileScreen: logout error (web)', e);
            }
            return;
        }

        Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmMessage'), [
            {
                text: t('profile.cancel'),
                onPress: () => { console.log('ProfileScreen: logout cancelled'); },
                style: 'cancel',
            },
            {
                text: t('profile.logout'),
                onPress: async () => {
                    try {
                        await logout();
                    } catch (e) {
                        console.error('ProfileScreen: logout error', e);
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    React.useEffect(() => {
        const init = async () => {
            try {
                let id = user?.id || (await AsyncStorage.getItem('app_user_id'));
                if (!id) {
                    id = `user-${Date.now()}`;
                    await AsyncStorage.setItem('app_user_id', id);
                }
                setUserId(id);

                try {
                    setLoading(true);
                    const data = await profilesAPI.getProfile(id);
                    setProfile(data);
                    if (data.role) setIsWorker(data.role === 'worker');
                } catch (fetchErr: any) {
                    if (fetchErr?.response?.status === 404) {
                        setProfile(null);
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

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

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
                            source={{
                                uri: imageUri || profile?.image || 'https://i.pravatar.cc/300?img=12'
                            }}
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
                        {profile?.name || t('profile.unnamed')}
                    </Text>
                </View>

                <View style={styles.section}>
                    <List.Item
                        title={t('profile.phone')}
                        description={profile?.phone || t('profile.notSpecified')}
                        left={(props) => <List.Icon {...props} icon="phone" />}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title={t('profile.mail')}
                        description={profile?.email || t('profile.notSpecified')}
                        left={(props) => <List.Icon {...props} icon="email" />}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title={t('profile.darkMode')}
                        description={t('profile.darkModeDesc')}
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
                        title={t('profile.workerMode')}
                        description={t('profile.workerModeDesc')}
                        left={(props) => <List.Icon {...props} icon="account-hard-hat" />}
                        right={() => (
                            <Switch value={isWorker} onValueChange={toggleWorkerStatus} disabled={updating} />
                        )}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title={t('profile.language')}
                        description={i18n.language}
                        left={(props) => <List.Icon {...props} icon="translate" />}
                        right={() => (
                            <IconButton icon="chevron-right" onPress={() => setLangDialogVisible(true)} />
                        )}
                        onPress={() => setLangDialogVisible(true)}
                        style={styles.listItem}
                    />
                    <Divider />
                    <List.Item
                        title={t('profile.logout')}
                        left={(props) => <List.Icon {...props} icon="logout" />}
                        right={() => (
                            <IconButton
                                icon="chevron-right"
                                onPress={handleLogout}
                                size={24}
                                accessibilityLabel="Logout"
                            />
                        )}
                        onPress={handleLogout}
                        style={styles.listItem}
                    />
                </View>
            </ScrollView>

            <Portal>
                <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)}>
                    <Dialog.Title>{t('profile.editProfile')}</Dialog.Title>
                    <Dialog.Content>
                        {/* Photo preview in dialog */}
                        <View style={styles.photoPreviewContainer}>
                            <Avatar.Image
                                size={80}
                                source={{ uri: imageUri || tempProfile.image || 'https://i.pravatar.cc/300?img=12' }}
                            />
                            <Button
                                icon="camera"
                                mode="outlined"
                                onPress={pickImage}
                                style={styles.changePhotoButton}
                                loading={updating}
                            >
                                {t('profile.changePhoto')}
                            </Button>
                        </View>

                        <TextInput
                            label={t('profile.name')}
                            value={tempProfile.name}
                            onChangeText={(text) => setTempProfile({ ...tempProfile, name: text })}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label={t('profile.phone')}
                            value={tempProfile.phone}
                            onChangeText={(text) => setTempProfile({ ...tempProfile, phone: text })}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            label={t('profile.mail')}
                            value={tempProfile.email}
                            onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setEditVisible(false)} disabled={updating}>
                            {t('profile.cancel')}
                        </Button>
                        <Button
                            onPress={saveEdit}
                            mode="contained"
                            loading={updating}
                            disabled={updating}
                        >
                            {t('profile.save')}
                        </Button>
                    </Dialog.Actions>
                </Dialog>

                <Dialog visible={langDialogVisible} onDismiss={() => setLangDialogVisible(false)}>
                    <Dialog.Title>{t('profile.chooseLanguage')}</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group value={i18n.language} onValueChange={changeLanguage}>
                            {languages.map((lang) => (
                                <View key={lang.code} style={styles.languageOption}>
                                    <RadioButton.Item
                                        label={`${lang.flag} ${lang.label}`}
                                        value={lang.code}
                                        position="leading"
                                        style={styles.radioItem}
                                    />
                                </View>
                            ))}
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setLangDialogVisible(false)}>{t('profile.cancel')}</Button>
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
    languageOption: {
        marginVertical: 4,
    },
    radioItem: {
        paddingVertical: 0,
    },
    photoPreviewContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    changePhotoButton: {
        marginTop: 8,
    },
});
