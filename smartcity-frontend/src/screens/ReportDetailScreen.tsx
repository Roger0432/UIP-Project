import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Linking, Pressable, Modal } from 'react-native';
import { Text, useTheme, Chip, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident } from '../types';
import { incidentsAPI } from '../services/api';

export default function ReportDetailScreen({ route, navigation }: any) {
    const theme = useTheme();
    const { incident: initialIncident, isWorker } = route.params as {
        incident: Incident;
        isWorker: boolean;
    };

    const [incident, setIncident] = useState<Incident>(initialIncident);
    const [updating, setUpdating] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [showFullPhoto, setShowFullPhoto] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return '#E57373';
            case 'in_progress':
                return '#FFB74D';
            case 'accepted':
                return '#81C784';
            case 'denied':
                return '#9E9E9E';
            case 'finished':
                return '#4CAF50';
            default:
                return theme.colors.primary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'clock-outline';
            case 'in_progress':
                return 'progress-clock';
            case 'accepted':
                return 'check-circle';
            case 'denied':
                return 'close-circle';
            case 'finished':
                return 'check-decagram';
            default:
                return 'information';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'Waiting to be accepted';
            case 'in_progress':
                return 'In progress';
            case 'accepted':
                return 'Accepted';
            case 'denied':
                return 'Denied';
            case 'finished':
                return 'Finished';
            default:
                return status;
        }
    };

    const getAvailableActions = () => {
        switch (incident.status) {
            case 'waiting':
                return [
                    { label: 'Accept', next: 'accepted' as const },
                    { label: 'Deny', next: 'denied' as const },
                ];
            case 'accepted':
                return [{ label: 'Mark in progress', next: 'in_progress' as const }];
            case 'in_progress':
                return [{ label: 'Mark finished', next: 'finished' as const }];
            case 'denied':
            case 'finished':
            default:
                return [];
        }
    };

    const handleChangeStatus = async (nextStatus: 'accepted' | 'denied' | 'in_progress' | 'finished') => {
        try {
            setUpdating(true);
            const updated = await incidentsAPI.update(incident.id, { status: nextStatus });
            setIncident(updated as Incident);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleLocationPress = () => {
        const encodedLocation = encodeURIComponent(incident.location);
        const googleMapsUrl = `https://www.google.com/maps/search/${encodedLocation}`;
        const appleMapsUrl = `maps://maps.apple.com/?q=${encodedLocation}`;
        
        Linking.canOpenURL(appleMapsUrl).then(supported => {
            const url = supported ? appleMapsUrl : googleMapsUrl;
            Linking.openURL(url);
        }).catch(() => {
            Linking.openURL(googleMapsUrl);
        });
    };

    const handlePhotoPress = (uri: string) => {
        console.log('📸 Obrint foto:', uri); // Debug
        setSelectedPhoto(uri);
        setShowFullPhoto(true);
    };

    const actions = isWorker ? getAvailableActions() : [];

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.content}
            >
                <Text variant="headlineMedium" style={styles.title}>
                    {incident.title}
                </Text>

                <View style={styles.statusRow}>
                    <Chip
                        icon={() => (
                            <MaterialCommunityIcons
                                name={getStatusIcon(incident.status)}
                                size={18}
                                color={getStatusColor(incident.status)}
                            />
                        )}
                        style={{ backgroundColor: `${getStatusColor(incident.status)}20` }}
                        textStyle={{ color: getStatusColor(incident.status) }}
                    >
                        {getStatusLabel(incident.status)}
                    </Chip>
                </View>

                {isWorker && actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                        {actions.map((a) => (
                            <Button
                                key={a.next}
                                mode="contained"
                                style={styles.actionButton}
                                loading={updating}
                                disabled={updating}
                                onPress={() => handleChangeStatus(a.next)}
                            >
                                {a.label}
                            </Button>
                        ))}
                    </View>
                )}

                {incident.photos && incident.photos.length > 0 && (
                    <View style={styles.photosContainer}>
                        {incident.photos.map((uri, idx) => (
                            <Pressable 
                                key={idx} 
                                onPress={() => handlePhotoPress(uri)}
                                style={({pressed}) => [
                                    styles.photoContainer,
                                    pressed && styles.photoPressed
                                ]}
                            >
                                <Image
                                    source={{ uri }}
                                    style={styles.photo}
                                    resizeMode="cover"
                                />
                            </Pressable>
                        ))}
                    </View>
                )}

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Description
                </Text>
                <Text style={styles.text}>{incident.description}</Text>

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Location
                </Text>
                <Pressable onPress={handleLocationPress}>
                    <Text style={[styles.locationText, { color: theme.colors.primary }]}>
                        {incident.location}
                    </Text>
                </Pressable>

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Reporter
                </Text>
                <Text style={styles.text}>{incident.reporter}</Text>
            </ScrollView>

            {/* Modal Foto Pantalla Completa - CORREGIT */}
            <Modal
                visible={showFullPhoto}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFullPhoto(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Àrea per tancar tocant fora */}
                    <Pressable
                        style={styles.modalCloseArea}
                        onPress={() => setShowFullPhoto(false)}
                    />
                    
                    {/* Container centrada de la foto */}
                    <View style={styles.modalContent}>
                        <IconButton
                            icon="close"
                            size={32}
                            iconColor="white"
                            onPress={() => setShowFullPhoto(false)}
                            style={styles.closeButton}
                        />
                        
                        {selectedPhoto && (
                            <Image
                                source={{ uri: selectedPhoto }}
                                style={styles.fullPhoto}
                                resizeMode="contain"
                                onError={(e) => console.log('❌ Error foto:', e.nativeEvent)}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },
    title: { fontWeight: '600', marginBottom: 12 },
    statusRow: { marginBottom: 16 },
    actionsContainer: {
        marginBottom: 16,
        gap: 8,
    },
    actionButton: {
        borderRadius: 8,
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    photoContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    photoPressed: {
        opacity: 0.8,
    },
    photo: { 
        width: 110, 
        height: 110, 
        borderRadius: 8,
        borderWidth: 3,
        borderColor: '#ddd',
    },
    sectionTitle: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
    text: { marginBottom: 8 },
    locationText: {
        marginBottom: 8,
        textDecorationLine: 'underline',
        fontSize: 16,
    },
    // Estils del Modal CORREGITS ✅
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 20,
        zIndex: 1000,
    },
    fullPhoto: {
        flex: 1,
        width: '100%',
        height: '100%',
        maxHeight: '90%',
        borderRadius: 12,
    },
});
