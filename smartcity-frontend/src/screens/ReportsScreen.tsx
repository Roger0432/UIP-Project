import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import {
    Text,
    useTheme,
    ActivityIndicator,
    Searchbar,
} from 'react-native-paper';
import { incidentsAPI } from '../services/api';
import { Incident } from '../types';
import ReportCard from '../components/ReportCard';
import { useUser } from '../context/UserContext';

export default function ReportsScreen({ navigation }: any) {
    const theme = useTheme();
    const { isWorker } = useUser();
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
                    {isWorker ? 'All reports' : 'Your reports'}
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
                renderItem={({ item }) => (
                    <ReportCard
                        incident={item}
                        isWorker={isWorker}
                        onPress={() => handleOpenDetail(item)}
                        onChangeStatus={undefined}
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
                        <Text
                            variant="bodyLarge"
                            style={{ color: theme.colors.onSurfaceVariant }}
                        >
                            No reports found.
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
    header: { padding: 16 },
    headerTitle: { marginBottom: 16, fontWeight: '600' },
    searchBar: { elevation: 2 },
    list: { padding: 16, paddingTop: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 32 },
});
