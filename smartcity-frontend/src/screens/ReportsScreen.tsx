//Arnau
import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ScrollView, Alert } from 'react-native';
import {
    Text,
    useTheme,
    ActivityIndicator,
    Searchbar,
    Chip,
    Menu,
    Button,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { incidentsAPI } from '../services/api';
import { Incident } from '../types';
import ReportCard from '../components/ReportCard';
import { useUser } from '../context/UserContext';

type StatusFilter = 'all' | 'waiting' | 'accepted' | 'in_progress' | 'denied' | 'finished' | 'hidden';
type SortOption = 'date_desc' | 'date_asc' | 'status';

const HIDDEN_KEY = 'hidden_incident_ids';

export default function ReportsScreen({ navigation }: any) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { isWorker, user } = useUser();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('date_desc');
    const [hiddenIds, setHiddenIds] = useState<number[]>([]);

    useEffect(() => {
        const loadHidden = async () => {
            try {
                const raw = await AsyncStorage.getItem(HIDDEN_KEY);
                if (raw) {
                    const parsed: number[] = JSON.parse(raw);
                    setHiddenIds(parsed);
                }
            } catch (e) {
                console.error('Error loading hidden incidents', e);
            }
        };
        loadHidden();
    }, []);

    const saveHiddenIds = async (ids: number[]) => {
        setHiddenIds(ids);
        try {
            await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
        } catch (e) {
            console.error('Error saving hidden incidents', e);
        }
    };

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
        const unsubscribe = navigation.addListener('focus', () => {
            fetchIncidents();
        });

        fetchIncidents();

        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIncidents();
    };

    const handleOpenDetail = (item: Incident) => {
        navigation.navigate('ReportDetail', { incident: item, isWorker });
    };

    const handleHideIncident = (id: number) => {
        const updated = [...new Set([...hiddenIds, id])];
        saveHiddenIds(updated);
    };

    const handleUnhideIncident = (id: number) => {
        const updated = hiddenIds.filter((h) => h !== id);
        saveHiddenIds(updated);
    };

    const handleDeleteIncident = async (id: number) => {
        Alert.alert(
            t('reports.deleteTitle'),
            t('reports.deleteConfirmMessage'),
            [
                {
                    text: t('reports.deleteCancel'),
                    style: 'cancel',
                },
                {
                    text: t('reports.deleteConfirm'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await incidentsAPI.delete(id);
                            fetchIncidents();
                        } catch (error) {
                            console.error('Error deleting incident:', error);
                            Alert.alert(t('createReport.error'), t('reports.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    const filteredAndSortedIncidents = useMemo(() => {
        let base = incidents;

        if (statusFilter === 'hidden') {
            base = incidents.filter((i) => hiddenIds.includes(i.id));
        } else {
            base = incidents.filter((i) => !hiddenIds.includes(i.id));
        }

        if (!isWorker && user?.id) {
            base = base.filter((incident) => incident.reporter === user.name);
        }

        let filtered = [...base];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (incident) =>
                    incident.title.toLowerCase().includes(query) ||
                    incident.description.toLowerCase().includes(query) ||
                    incident.location.toLowerCase().includes(query) ||
                    incident.reporter.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all' && statusFilter !== 'hidden') {
            filtered = filtered.filter((incident) => incident.status === statusFilter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date_desc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'date_asc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'status':
                    const statusOrder = ['waiting', 'accepted', 'in_progress', 'finished', 'denied'];
                    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [incidents, searchQuery, statusFilter, sortBy, hiddenIds, isWorker, user?.id]);

    const getStatusCount = (status: StatusFilter) => {
        if (status === 'hidden') {
            if (!isWorker && user?.name) {
                return incidents.filter(
                    (i) => hiddenIds.includes(i.id) && i.reporter === user.name
                ).length;
            }
            return hiddenIds.length;
        }

        let visible = incidents.filter((i) => !hiddenIds.includes(i.id));

        if (!isWorker && user?.name) {
            visible = visible.filter((i) => i.reporter === user.name);
        }

        if (status === 'all') return visible.length;

        return visible.filter((i) => i.status === status).length;
    };


    const statusFilters: { key: StatusFilter; label: string; icon: string }[] = [
        { key: 'all', label: t('reports.filters.all'), icon: 'format-list-bulleted' },
        { key: 'waiting', label: t('reports.filters.waiting'), icon: 'clock-outline' },
        { key: 'accepted', label: t('reports.filters.accepted'), icon: 'check-circle' },
        { key: 'in_progress', label: t('reports.filters.in_progress'), icon: 'progress-clock' },
        { key: 'finished', label: t('reports.filters.finished'), icon: 'check-decagram' },
        { key: 'denied', label: t('reports.filters.denied'), icon: 'close-circle' },
        { key: 'hidden', label: t('reports.filters.hidden'), icon: 'eye-off' },
    ];

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const isHiddenView = statusFilter === 'hidden';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>


                <Searchbar
                    placeholder={t('reports.searchPlaceholder')}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    icon="magnify"
                    clearIcon="close"
                />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {statusFilters.map((filter) => (
                        <Chip
                            key={filter.key}
                            selected={statusFilter === filter.key}
                            onPress={() => setStatusFilter(filter.key)}
                            style={[
                                styles.filterChip,
                                statusFilter === filter.key && {
                                    backgroundColor: theme.colors.primaryContainer,
                                },
                            ]}
                            icon={() => (
                                <MaterialCommunityIcons
                                    name={filter.icon as any}
                                    size={18}
                                    color={
                                        statusFilter === filter.key
                                            ? theme.colors.onPrimaryContainer
                                            : theme.colors.onSurfaceVariant
                                    }
                                />
                            )}
                            textStyle={{
                                color:
                                    statusFilter === filter.key
                                        ? theme.colors.onPrimaryContainer
                                        : theme.colors.onSurfaceVariant,
                            }}
                        >
                            {filter.label} ({getStatusCount(filter.key)})
                        </Chip>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredAndSortedIncidents}
                renderItem={({ item }) => (
                    <ReportCard
                        incident={item}
                        isWorker={isWorker}
                        onPress={() => handleOpenDetail(item)}
                        onHide={() =>
                            isHiddenView
                                ? handleUnhideIncident(item.id)
                                : handleHideIncident(item.id)
                        }
                        isHiddenView={isHiddenView}
                        onDelete={!isWorker ? () => handleDeleteIncident(item.id) : undefined}
                    />
                )}
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
                        <MaterialCommunityIcons
                            name="file-document-outline"
                            size={64}
                            color={theme.colors.onSurfaceVariant}
                            style={styles.emptyIcon}
                        />
                        <Text
                            variant="titleMedium"
                            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
                        >
                            {t('reports.noReports')}
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
                        >
                            {searchQuery || statusFilter !== 'all'
                                ? t('reports.tryAdjust')
                                : t('reports.noAvailable')}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 16, paddingBottom: 8 },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    headerTitle: { fontWeight: 'bold' },
    countText: {
        color: '#666',
        fontWeight: '500',
    },
    searchBar: {
        marginHorizontal: 16,
        marginBottom: 12,
        elevation: 2,
    },
    filtersContainer: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 12,
    },
    filterChip: {
        marginRight: 8,
    },
    sortContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    sortButton: {
        borderRadius: 8,
    },
    sortButtonContent: {
        flexDirection: 'row-reverse',
    },
    list: { padding: 16, paddingTop: 8 },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 64,
        paddingHorizontal: 32,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
});
