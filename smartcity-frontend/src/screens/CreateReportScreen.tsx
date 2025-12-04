//Arnau
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import {
    TextInput,
    Button,
    useTheme,
    Text,
    IconButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { incidentsAPI, profilesAPI } from '../services/api';
import { useUser } from '../context/UserContext';
import { ActivityIndicator } from 'react-native';

export default function CreateReportScreen({ navigation }: any) {
    const theme = useTheme();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        reporter: '',
        phone: '',
        email: '',
    });
    const [userId, setUserId] = useState<string | null>(null);
    const { user, setUser, ensureAnonymousUser } = useUser();
    const [profileLoading, setProfileLoading] = useState<boolean>(true);
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(t('createReport.permissionTitle'), t('createReport.permissionPhotos'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(t('createReport.permissionTitle'), t('createReport.permissionLocation'));
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });

        if (address[0]) {
            const addressString = `${address[0].street || ''}, ${address[0].city || ''}`;
            setFormData({ ...formData, location: addressString });
        }
    };

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
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        return data.secure_url;
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.location) {
            Alert.alert(t('createReport.error'), t('createReport.fillRequired'));
            return;
        }

        try {
            setLoading(true);

            const uploadedPhotoUrls: string[] = [];
            for (const photoUri of photos) {
                const url = await uploadPhotoAsync(photoUri);
                uploadedPhotoUrls.push(url);
            }

            if (userId) {
                try {
                    const res = await profilesAPI.updateProfile(userId, {
                        name: formData.reporter,
                        phone: formData.phone,
                        email: formData.email,
                    });
                    if (setUser) setUser({ id: res.id, name: res.name, phone: res.phone, email: res.email, role: res.role });
                } catch (err) {
                    console.warn('Warning: failed to persist profile when creating report', err);
                }
            }

            await incidentsAPI.create({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                reporter: formData.reporter,
                phone: formData.phone,
                email: formData.email,
                status: 'waiting',
                photos: uploadedPhotoUrls,
            });

            Alert.alert(t('createReport.successTitle'), t('createReport.successMessage'), [
                {
                    text: t('createReport.ok'),
                    onPress: () => {
                        setFormData({
                            ...formData,
                            title: '',
                            description: '',
                            location: '',
                        });
                        setPhotos([]);
                        navigation.navigate('Reports');
                    },
                },
            ]);
        } catch (error) {
            console.error('Error creating report:', error);
            Alert.alert(t('createReport.error'), t('createReport.failedCreate'));
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const init = async () => {
            try {
                if (!user?.id) {
                    await ensureAnonymousUser();
                }

                const currentUserId = user?.id;
                if (currentUserId) {
                    setUserId(currentUserId);
                    setFormData((prev) => ({ ...prev, reporter: user.name || '', phone: user.phone || '', email: user.email || '' }));
                } else {
                    try {
                        setProfileLoading(true);
                        const randomUserId = `user_${Date.now()}`;
                        const data = await profilesAPI.getProfile(randomUserId);
                        setFormData((prev) => ({ ...prev, reporter: data.name || '', phone: data.phone || '', email: data.email || '' }));
                    } catch (err: any) {
                        if (err?.response?.status === 404) {
                        } else {
                            console.error('Error fetching profile for report:', err);
                        }
                    }
                }
            } catch (err) {
                console.error('CreateReport init error', err);
            } finally {
                setProfileLoading(false);
            }
        };

        init();
    }, []);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >

            {profileLoading && (
                <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginBottom: 12 }} />
            )}

            <View style={styles.row}>
                <TextInput
                    label={t('createReport.name')}
                    value={formData.reporter}
                    editable={false}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                />
                <TextInput
                    label={t('createReport.phone')}
                    value={formData.phone}
                    editable={false}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    keyboardType="phone-pad"
                />
            </View>

            <TextInput
                label={t('createReport.mail')}
                value={formData.email}
                editable={false}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
            />

            <TextInput
                label={t('createReport.title')}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label={t('createReport.description')}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                mode="outlined"
                multiline
                style={styles.input}
                contentStyle={{ minHeight: 120, textAlignVertical: 'top' }}
            />

            <View style={styles.locationContainer}>
                <TextInput
                    label={t('createReport.location')}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    style={[styles.input, styles.locationInput]}
                    mode="outlined"
                />
                <Button
                    mode="contained"
                    onPress={getCurrentLocation}
                    style={styles.locationButton}
                    icon="map-marker"
                    buttonColor={theme.colors.onSurface}
                >
                    {t('createReport.selectLocation')}
                </Button>
            </View>

            <View style={styles.photosContainer}>
                <Text variant="titleSmall" style={styles.photosLabel}>
                    {t('createReport.photos')}
                </Text>
                <View style={styles.photosGrid}>
                    <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                        <MaterialCommunityIcons name="plus" size={32} color={theme.colors.onSurfaceVariant} />
                    </TouchableOpacity>
                    {photos.map((photo, index) => (
                        <View key={index} style={styles.photoContainer}>
                            <Image source={{ uri: photo }} style={styles.photo} />
                            <IconButton
                                icon="close-circle"
                                size={20}
                                onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                                style={styles.removePhotoButton}
                            />
                        </View>
                    ))}
                </View>
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
            >
                {t('createReport.createReport')}
            </Button>
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
    title: {
        marginBottom: 24,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    locationContainer: {
        marginBottom: 16,
    },
    locationInput: {
        marginBottom: 8,
    },
    locationButton: {
        borderRadius: 8,
    },
    photosContainer: {
        marginBottom: 24,
    },
    photosLabel: {
        marginBottom: 12,
    },
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    addPhotoButton: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    photoContainer: {
        position: 'relative',
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        margin: 0,
    },
    submitButton: {
        marginTop: 8,
        paddingVertical: 8,
        borderRadius: 8,
    },
});
