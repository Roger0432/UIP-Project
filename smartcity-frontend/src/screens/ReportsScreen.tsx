import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Image } from 'react-native';
import {
    Card,
    Text,
    Chip,
    useTheme,
    ActivityIndicator,
    Searchbar,
    FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { incidentsAPI } from '../services/api';
import { Incident } from '../types';

export default function ReportsScreen({ navigation }: any) {
    const theme = useTheme();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const response = await incidentsAPI.getAll();
            setIncidents(response.data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIncidents();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return '#E57373'; // Red
            case 'in_progress':
                return '#FFB74D'; // Orange
            case 'closed':
                return '#81C784'; // Green
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

    const renderIncidentCard = ({ item }: { item: Incident }) => (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
            <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                    {item.title}
                </Text>

                {item.photos && item.photos.length > 0 && (
                    <Image
                        source={{ uri: item.photos[0] }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.statusContainer}>
                    <Chip
                        icon={() => (
                            <MaterialCommunityIcons
                                name={getStatusIcon(item.status)}
                                size={16}
                                color={getStatusColor(item.status)}
                            />
                        )}
                        style={[
                            styles.statusChip,
                            { backgroundColor: `${getStatusColor(item.status)}20` },
                        ]}
                        textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
                    >
                        {getStatusLabel(item.status)}
                    </Chip>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.headerTitle}>
                    Your reports
                </Text>
                <Searchbar
                    placeholder="Search reports..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            <FlatList
                data={incidents}
                renderItem={renderIncidentCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            There are no more reports.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
    },
    headerTitle: {
        marginBottom: 16,
        fontWeight: '600',
    },
    searchBar: {
        elevation: 2,
    },
    list: {
        padding: 16,
        paddingTop: 8,
    },
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 32,
    },
});
