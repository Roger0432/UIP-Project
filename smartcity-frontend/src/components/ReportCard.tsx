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
};

export default function ReportCard({ incident, isWorker, onPress, onChangeStatus }: Props) {
    const theme = useTheme();

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
        <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            mode="elevated"
            onPress={onPress}
        >
            <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                    {incident.title}
                </Text>

                {incident.photos && incident.photos.length > 0 && (
                    <Image
                        source={{ uri: incident.photos[0] }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.statusContainer}>
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
                </View>

                {isWorker && onChangeStatus && (
                    <View style={{ marginTop: 12 }}>
                        <Button
                            mode="contained"
                            onPress={() => onChangeStatus(incident.id, 'in_progress')}
                            style={{ marginBottom: 6 }}
                        >
                            Mark In Progress
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => onChangeStatus(incident.id, 'closed')}
                            style={{ marginBottom: 6 }}
                        >
                            Mark Closed
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => onChangeStatus(incident.id, 'open')}
                        >
                            Re-open
                        </Button>
                    </View>
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
    cardTitle: {
        fontWeight: '600',
        marginBottom: 12,
    },
    cardImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusChip: {
        height: 28,
    },
});
