import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, useTheme, Chip, Button } from 'react-native-paper';
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return '#E57373';          // Waiting to be accepted
            case 'in_progress':
                return '#FFB74D';          // In progress
            case 'accepted':
                return '#81C784';          // Accepted
            case 'denied':
                return '#9E9E9E';          // Denied
            case 'finished':
                return '#4CAF50';          // Finished
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

    // Botones disponibles según estado actual
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
            // en tu api, update devuelve el incidente actualizado
            setIncident(updated as Incident);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const actions = isWorker ? getAvailableActions() : [];

    return (
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
                        <Image
                            key={idx}
                            source={{ uri }}
                            style={styles.photo}
                            resizeMode="cover"
                        />
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
            <Text style={styles.text}>{incident.location}</Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
                Reporter
            </Text>
            <Text style={styles.text}>{incident.reporter}</Text>
        </ScrollView>
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
    photo: { width: 110, height: 110, borderRadius: 8 },
    sectionTitle: { marginTop: 8, marginBottom: 4, fontWeight: '600' },
    text: { marginBottom: 8 },
});
