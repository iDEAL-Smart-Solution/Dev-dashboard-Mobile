import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search, Eye, Edit3, Power } from 'lucide-react-native';
import { useSchoolStore } from '@/stores/schoolStore';
import { resolveMediaUrl } from '@/config/media';
import { GetSchoolResponse } from '@/types/school';

export default function SchoolsListScreen() {
  const router = useRouter();
  const { schools, isLoading, error, fetchSchools, updateSchoolSubscription } = useSchoolStore();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchools();
    setRefreshing(false);
  };

  const handleToggleSubscription = async (school: GetSchoolResponse) => {
    try {
      await updateSchoolSubscription({
        id: school.id,
        allowedStudentCount: 0,
        registeredStudentCount: 0,
        amountPaid: 0,
      });
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.phoneNumber?.includes(searchTerm);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && school.isSubscrptionActive) ||
      (filterStatus === 'inactive' && !school.isSubscrptionActive);

    return matchesSearch && matchesStatus;
  });

  const renderSchoolItem = ({ item }: { item: GetSchoolResponse }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.schoolInfo}>
          {item.schoolLogoFilePath ? (
            <Image
              source={{ uri: resolveMediaUrl(item.schoolLogoFilePath) }}
              style={styles.logo}
            />
          ) : (
            <View
              style={[
                styles.logoPlaceholder,
                { backgroundColor: item.colorCode || '#3B82F6' },
              ]}
            >
              <Text style={styles.logoText}>
                {item.schoolName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.schoolDetails}>
            <Text style={styles.schoolName}>{item.schoolName}</Text>
            {item.domain && <Text style={styles.domain}>{item.domain}</Text>}
            <View
              style={[
                styles.statusBadge,
                item.isSubscrptionActive
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.isSubscrptionActive
                    ? styles.statusTextActive
                    : styles.statusTextInactive,
                ]}
              >
                {item.isSubscrptionActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        {item.email && (
          <Text style={styles.infoText} numberOfLines={1}>
            📧 {item.email}
          </Text>
        )}
        {item.phoneNumber && (
          <Text style={styles.infoText}>📞 {item.phoneNumber}</Text>
        )}
        {item.address && (
          <Text style={styles.infoText} numberOfLines={2}>
            📍 {item.address}
          </Text>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(tabs)/schools/${item.id}`)}
        >
          <Eye color="#3B82F6" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(tabs)/schools/edit/${item.id}`)}
        >
          <Edit3 color="#6B7280" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleSubscription(item)}
        >
          <Power
            color={item.isSubscrptionActive ? '#EF4444' : '#10B981'}
            size={20}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && schools.length === 0) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading schools...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schools..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'active' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus('active')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'active' && styles.filterTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === 'inactive' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus('inactive')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'inactive' && styles.filterTextActive,
              ]}
            >
              Inactive
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{schools.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={styles.statValue}>
            {schools.filter((s) => s.isSubscrptionActive).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, styles.statCardRed]}>
          <Text style={styles.statValue}>
            {schools.filter((s) => !s.isSubscrptionActive).length}
          </Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {/* Schools List */}
      <FlatList
        data={filteredSchools}
        renderItem={renderSchoolItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No schools found</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/schools/create')}
      >
        <Plus color="#FFFFFF" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCardGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  statCardRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    marginBottom: 12,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  schoolDetails: {
    flex: 1,
    marginLeft: 12,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  domain: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#065F46',
  },
  statusTextInactive: {
    color: '#991B1B',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
