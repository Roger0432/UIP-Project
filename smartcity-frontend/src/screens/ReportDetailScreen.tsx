import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Linking, Pressable, Modal, Dimensions } from 'react-native';
import { Text, useTheme, Chip, Button, IconButton, Card, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident } from '../types';
import { incidentsAPI } from '../services/api';

const { width } = Dimensions.get('window');

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
            case 'waiting': return '#E57373';
            case 'in_progress': return '#FFB74D';
            case 'accepted': return '#81C784';
            case 'denied': return '#9E9E9E';
            case 'finished': return '#4CAF50';
            default: return theme.colors.primary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'waiting': return 'clock-outline';
            case 'in_progress': return 'progress-clock';
            case 'accepted': return 'check-circle';
            case 'denied': return 'close-circle';
            case 'finished': return 'check-decagram';
            default: return 'information';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'waiting': return 'Waiting to be accepted';
            case 'in_progress': return 'In progress';
            case 'accepted': return 'Accepted';
            case 'denied': return 'Denied';
            case 'finished': return 'Finished';
            default: return status;
        }
    };

    const getAvailableActions = () => {
        switch (incident.status) {
            case 'waiting':
                return [
                    { label: 'Accept', next: 'accepted' as const, icon: 'check', color: '#81C784' },
                    { label: 'Deny', next: 'denied' as const, icon: 'close', color: '#E57373' },
                ];
            case 'accepted':
                return [{ label: 'Mark in progress', next: 'in_progress' as const, icon: 'progress-clock', color: '#FFB74D' }];
            case 'in_progress':
                return [{ label: 'Mark finished', next: 'finished' as const, icon: 'check-all', color: '#4CAF50' }];
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
        setSelectedPhoto(uri);
        setShowFullPhoto(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const actions = isWorker ? getAvailableActions() : [];

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.content}
            >
                {/* Header Card */}
                <Card style={styles.headerCard}>
                    <Card.Content>
                        <View style={styles.headerTop}>
                            <Chip
                                icon={() => (
                                    <MaterialCommunityIcons
                                        name={getStatusIcon(incident.status)}
                                        size={18}
                                        color={getStatusColor(incident.status)}
                                    />
                                )}
                                style={[styles.statusChip, { backgroundColor: `${getStatusColor(incident.status)}15` }]}
                                textStyle={{ color: getStatusColor(incident.status), fontWeight: 'bold' }}
                            >
                                {getStatusLabel(incident.status)}
                            </Chip>
                        </View>
                        <Text variant="headlineMedium" style={styles.title}>
                            {incident.title}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Photos Section */}
                {incident.photos && incident.photos.length > 0 && (
                    <View style={styles.section}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                            {incident.photos.map((uri, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => handlePhotoPress(uri)}
                                    style={({ pressed }) => [
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
                        </ScrollView>
                    </View>
                )}

                {/* Description Card */}
                <Card style={styles.card}>
                    <Card.Title
                        title="Description"
                        left={(props) => <Avatar.Icon {...props} icon="text-box-outline" style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.onSecondaryContainer} size={40} />}
                    />
                    <Card.Content>
                        <Text variant="bodyLarge" style={styles.descriptionText}>
                            {incident.description}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Details Card */}
                <Card style={styles.card}>
                    <Card.Content style={styles.detailsContent}>
                        <View style={styles.detailRow}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.onSurfaceVariant} />
                            </View>
                            <View style={styles.detailTextContainer}>
                                <Text variant="labelMedium" style={styles.detailLabel}>Date & Time</Text>
                                <Text variant="bodyMedium" style={styles.detailValue}>
                                    {formatDate(incident.createdAt)}
                                </Text>
                            </View>
                        </View>

                        <Divider style={styles.divider} />

                        <Pressable onPress={handleLocationPress} style={styles.detailRow}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                                <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.detailTextContainer}>
                                <Text variant="labelMedium" style={styles.detailLabel}>Location</Text>
                                <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.primary }]}>
                                    {incident.location}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                        </Pressable>

                        <Divider style={styles.divider} />

                        <View style={styles.detailRow}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                                <MaterialCommunityIcons name="account" size={24} color={theme.colors.secondary} />
                            </View>
                            <View style={styles.detailTextContainer}>
                                <Text variant="labelMedium" style={styles.detailLabel}>Reported by</Text>
                                <Text variant="bodyMedium" style={styles.detailValue}>
                                    {incident.reporter}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Worker Actions */}
                {isWorker && actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                        {actions.map((a) => (
                            <Button
                                key={a.next}
                                mode="contained"
                                icon={a.icon}
                                style={[styles.actionButton, { backgroundColor: a.color }]}
                                contentStyle={styles.actionButtonContent}
                                labelStyle={styles.actionButtonLabel}
                                loading={updating}
                                disabled={updating}
                                onPress={() => handleChangeStatus(a.next)}
                            >
                                {a.label}
                            </Button>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Full Screen Photo Modal */}
            <Modal
                visible={showFullPhoto}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFullPhoto(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable
                        style={styles.modalCloseArea}
                        onPress={() => setShowFullPhoto(false)}
                    />
                    <View style={styles.modalContent}>
                        <IconButton
                            icon="close"
                            size={30}
                            iconColor="white"
                            onPress={() => setShowFullPhoto(false)}
                            style={styles.closeButton}
                        />
                        {selectedPhoto && (
                            <Image
                                source={{ uri: selectedPhoto }}
                                style={styles.fullPhoto}
                                resizeMode="contain"
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
    content: { padding: 16, paddingBottom: 40 },
    headerCard: {
        marginBottom: 16,
        elevation: 2,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 12,
    },
    statusChip: {
        height: 32,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dateText: {
        color: '#666',
        marginLeft: 6,
    },
    title: {
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 16,
    },
    photosScroll: {
        gap: 12,
    },
    photoContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        backgroundColor: 'white',
    },
    photoPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    photo: {
        width: 160,
        height: 120,
    },
    card: {
        marginBottom: 16,
        elevation: 1,
    },
    descriptionText: {
        lineHeight: 24,
        color: '#444',
    },
    detailsContent: {
        paddingVertical: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        color: '#666',
        marginBottom: 2,
    },
    detailValue: {
        fontWeight: '500',
    },
    divider: {
        marginVertical: 4,
    },
    actionsContainer: {
        marginTop: 8,
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        elevation: 2,
    },
    actionButtonContent: {
        height: 50,
    },
    actionButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseArea: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    fullPhoto: {
        width: width,
        height: '80%',
    },
});
