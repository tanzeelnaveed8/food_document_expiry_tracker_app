import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { Item, StatsResponse } from '../../types';
import { ItemsStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<ItemsStackParamList, 'ItemsList'>;

const ItemsListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [itemsResponse, statsResponse] = await Promise.all([
        api.getItems({ limit: 50 }),
        api.getStats(),
      ]);
      setItems(itemsResponse.items);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to load items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXPIRED':
        return '#FF3B30';
      case 'EXPIRING_SOON':
        return '#FF9500';
      case 'SAFE':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderItem = ({ item }: { item: Item }) => {
    const daysUntil = getDaysUntilExpiry(item.expiryDate);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() =>
          navigation.navigate('ItemDetail', {
            itemId: item.id,
            itemType: item.type,
          })
        }
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {daysUntil > 0 ? `${daysUntil}d` : 'Expired'}
            </Text>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemCategory}>
            {item.type === 'FOOD' ? (item as any).category : (item as any).type}
          </Text>
          <Text style={styles.itemExpiry}>Expires: {formatDate(item.expiryDate)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF9500' }]}>
              {stats.expiringSoon}
            </Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF3B30' }]}>
              {stats.expired}
            </Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first item
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
  },
  itemExpiry: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});

export default ItemsListScreen;
