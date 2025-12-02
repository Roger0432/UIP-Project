import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, useTheme, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident } from '../types';

export default function ReportDetailScreen({ route }: any) {
    const theme = useTheme();
    const incident: Incident = route.params.incident;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return '#E57373';
            case 'in_progress':
                return '#FFB74D';
            case 'closed':
                return '#81C784';
            default:
                return theme.colors.primary;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return 'alert-circle';
            case 'in_progress':
                return 'progress-clock';
            case 'closed':
                return 'check-circle';
            default:
                return 'information';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open':
                return 'Open';
            case 'in_progress':
                return 'In Progress';
            case 'closed':
                return 'Accepted';
            default:
                return status;
        }
    };

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
