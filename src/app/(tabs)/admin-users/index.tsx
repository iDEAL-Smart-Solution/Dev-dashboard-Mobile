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
import { Plus, Search, Eye, Edit3 } from 'lucide-react-native';
import { useAdminUserStore } from '@/stores/adminUserStore';
import { resolveMediaUrl } from '@/config/media';
import { GetAdminUserResponse } from '@/types/adminUser';

export default function AdminUsersListScreen() {
  const router = useRouter();
  const { adminUsers, isLoading, fetchAdminUsers } = useAdminUserStore();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [refreshing, setRefreshing] = useState(false);
  // Track per-item avatar load failures so a broken URL falls back to initials
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAdminUsers();
    setRefreshing(false);
  };

  const filteredUsers = adminUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === 'all' || user.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  // Gender stats — client-side count from the fetched admin-user list, same logic as web
  const maleCount = adminUsers.filter((u) => u.gender === 'Male').length;
  const femaleCount = adminUsers.filter((u) => u.gender === 'Female').length;

  const renderAvatar = (item: GetAdminUserResponse) => {
    const resolvedUri = resolveMediaUrl(item.profilePictureUrl);
    const hasValidUrl = !!resolvedUri && !avatarErrors[item.id];

    if (hasValidUrl) {
      return (
        <Image
          source={{ uri: resolvedUri }}
          style={styles.avatar}
          onError={() =>
            setAvatarErrors((prev) => ({ ...prev, [item.id]: true }))
          }
        />
      );
    }

    // Initials fallback — colour based on gender
    const initial1 = (
      item.firstName?.charAt(0) ||
      item.name.charAt(0) ||
      '?'
    ).toUpperCase();
    const initial2 = (
      item.lastName?.charAt(0) ||
      item.name.charAt(1) ||
      ''
    ).toUpperCase();
    const bgColor = item.gender === 'Female' ? '#EC4899' : '#3B82F6';

    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: bgColor }]}>
        <Text style={styles.avatarText}>
          {initial1}
          {initial2}
        </Text>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: GetAdminUserResponse }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          {renderAvatar(item)}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.schoolName}>{item.schoolName}</Text>
            <Text style={styles.uin}>UIN: {item.uin}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.infoText} numberOfLines={1}>
          📧 {item.email}
        </Text>
        <Text style={styles.infoText}>📞 {item.phoneNumber}</Text>
        {item.gender ? (
          <Text style={styles.infoText}>
            {item.gender === 'Male' ? '👨' : '👩'} {item.gender}
          </Text>
        ) : null}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(tabs)/admin-users/${item.id}`)}
        >
          <Eye color="#3B82F6" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(tabs)/admin-users/edit/${item.id}`)}
        >
          <Edit3 color="#6B7280" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && adminUsers.length === 0) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading admin users...</Text>
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
            placeholder="Search admin users..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <View style={styles.filterContainer}>
          {(['all', 'Male', 'Female'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                genderFilter === f && styles.filterButtonActive,
              ]}
              onPress={() => setGenderFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  genderFilter === f && styles.filterTextActive,
                ]}
              >
                {f === 'all' ? 'All' : f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats — real counts from fetched data */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{adminUsers.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Text style={styles.statValue}>{maleCount}</Text>
          <Text style={styles.statLabel}>Male</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPink]}>
          <Text style={styles.statValue}>{femaleCount}</Text>
          <Text style={styles.statLabel}>Female</Text>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No admin users found</Text>
          </View>
        }
      />

      {/* FAB — Add Admin User */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/admin-users/create')}
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
  statCardBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  statCardPink: {
    backgroundColor: '#FCE7F3',
    borderColor: '#EC4899',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  uin: {
    fontSize: 12,
    color: '#9CA3AF',
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
