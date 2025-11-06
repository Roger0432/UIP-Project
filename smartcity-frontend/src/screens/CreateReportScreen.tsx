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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { incidentsAPI } from '../services/api';

export default function CreateReportScreen({ navigation }: any) {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        reporter: 'Joel Garcia', // Este valor vendría del usuario autenticado
        phone: '+34 612 123 123',
        email: 'joelgarcia@gmail.com',
    });
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera roll permissions are required!');
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
            Alert.alert('Permission needed', 'Location permissions are required!');
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

    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.location) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await incidentsAPI.create({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                reporter: formData.reporter,
                status: 'open',
            });

            Alert.alert('Success', 'Report created successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset form
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
            Alert.alert('Error', 'Failed to create report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            <Text variant="headlineMedium" style={styles.title}>
                Create a new report
            </Text>

            <View style={styles.row}>
                <TextInput
                    label="Name"
                    value={formData.reporter}
                    onChangeText={(text) => setFormData({ ...formData, reporter: text })}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                />
                <TextInput
                    label="Phone number"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                    keyboardType="phone-pad"
                />
            </View>

            <TextInput
                label="Mail"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
            />

            <TextInput
                label="Title of the incidence"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
            />

            <View style={styles.locationContainer}>
                <TextInput
                    label="Location"
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
                    Select your location
                </Button>
            </View>

            <View style={styles.photosContainer}>
                <Text variant="titleSmall" style={styles.photosLabel}>
                    Photos
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
                Create Report
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
