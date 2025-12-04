import React from 'react';
import { View, StyleSheet, Image, GestureResponderEvent } from 'react-native';
import { Card, Text, Chip, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident } from '../types';

type Props = {
    incident: Incident;
    isWorker: boolean;
    onPress?: (e: GestureResponderEvent) => void;
    onChangeStatus?: (id: number, status: string) => void;
    onHide?: () => void;
    isHiddenView?: boolean; // si estamos en el filtro "Hidden"
};

export default function ReportCard({
    incident,
    isWorker,
    onPress,
    onChangeStatus,
    onHide,
    isHiddenView,
}: Props) {
    const theme = useTheme();

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

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            mode="elevated"
            onPress={onPress}
        >
            <Card.Content>
                <View style={styles.titleRow}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                        {incident.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.dateText}>
                        {formatDate(incident.createdAt)}
                    </Text>
                </View>

                {incident.photos && incident.photos.length > 0 && (
                    <Image
                        source={{ uri: incident.photos[0] }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.statusRow}>
                    <Chip
                        icon={() => (
                            <MaterialCommunityIcons
                                name={getStatusIcon(incident.status)}
                                size={16}
                                color={getStatusColor(incident.status)}
                            />
                        )}
                        style={[
                            styles.statusChip,
                            { backgroundColor: `${getStatusColor(incident.status)}20` },
                        ]}
                        textStyle={{ color: getStatusColor(incident.status), fontSize: 12 }}
                    >
                        {getStatusLabel(incident.status)}
                    </Chip>

                    {onHide && (
                        <Button
                            mode="text"
                            compact
                            icon={isHiddenView ? 'eye' : 'eye-off'}
                            onPress={onHide}
                            style={styles.hideButton}
                        >
                            {isHiddenView ? 'Unhide' : 'Hide'}
                        </Button>
                    )}
                </View>

                {isWorker && onChangeStatus && false && (
                    <View style={{ marginTop: 12 }} />
                )}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 12,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    cardImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusChip: {
        height: 28,
    },
    hideButton: {
        marginLeft: 8,
    },
});
