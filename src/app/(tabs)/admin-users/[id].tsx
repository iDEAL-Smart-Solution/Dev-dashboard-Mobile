import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useAdminUserStore } from '@/stores/adminUserStore';
import { resolveMediaUrl } from '@/config/media';
import { showSuccess } from '@/utils/notifications';

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedAdminUser, isLoading, fetchAdminUserById } = useAdminUserStore();

  useEffect(() => {
    if (id) {
      fetchAdminUserById(id);
    }
  }, [id]);

  const handleCopyPassword = async () => {
    if (selectedAdminUser?.password) {
      await Clipboard.setStringAsync(selectedAdminUser.password);
      showSuccess('Password copied to clipboard');
    }
  };

  if (isLoading || !selectedAdminUser) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/admin-users/edit/${id}`)}>
          <Edit color="#3B82F6" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            {selectedAdminUser.profilePictureUrl ? (
              <Image
                source={{ uri: resolveMediaUrl(selectedAdminUser.profilePictureUrl) }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: selectedAdminUser.gender === 'Male' ? '#3B82F6' : '#EC4899' },
                ]}
              >
                <Text style={styles.avatarText}>
                  {selectedAdminUser.firstName?.charAt(0) || selectedAdminUser.name.charAt(0)}
                  {selectedAdminUser.lastName?.charAt(0) || selectedAdminUser.name.charAt(1) || ''}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{selectedAdminUser.name}</Text>
              <Text style={styles.schoolName}>{selectedAdminUser.schoolName}</Text>
              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Admin User</Text>
                </View>
                <Text style={styles.uin}>UIN: {selectedAdminUser.uin}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.infoRow}>
              <Mail color="#6B7280" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{selectedAdminUser.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Phone color="#6B7280" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{selectedAdminUser.phoneNumber}</Text>
              </View>
            </View>

            {selectedAdminUser.address && (
              <View style={styles.infoRow}>
                <MapPin color="#6B7280" size={20} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{selectedAdminUser.address}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {selectedAdminUser.gender && (
              <View style={styles.infoRow}>
                <Text style={styles.icon}>{selectedAdminUser.gender === 'Male' ? '👨' : '👩'}</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{selectedAdminUser.gender}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.icon}>🏷️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>UIN</Text>
                <Text style={[styles.infoValue, styles.monospace]}>{selectedAdminUser.uin}</Text>
              </View>
            </View>

            {selectedAdminUser.role && (
              <View style={styles.infoRow}>
                <Text style={styles.icon}>💼</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>{selectedAdminUser.role}</Text>
                </View>
              </View>
            )}

            {selectedAdminUser.password && (
              <View style={styles.infoRow}>
                <Text style={styles.icon}>🔒</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Password</Text>
                  <View style={styles.passwordRow}>
                    <Text style={styles.passwordText}>••••••••</Text>
                    <TouchableOpacity
                      onPress={handleCopyPassword}
                      style={styles.copyButton}
                    >
                      <Copy color="#3B82F6" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Timestamps */}
          {(selectedAdminUser.createdAt || selectedAdminUser.updatedAt) && (
            <>
              <View style={styles.divider} />
              <View style={styles.timestamps}>
                {selectedAdminUser.createdAt && (
                  <Text style={styles.timestamp}>
                    Created: {new Date(selectedAdminUser.createdAt).toLocaleString()}
                  </Text>
                )}
                {selectedAdminUser.updatedAt && (
                  <Text style={styles.timestamp}>
                    Updated: {new Date(selectedAdminUser.updatedAt).toLocaleString()}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  uin: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  icon: {
    fontSize: 20,
    width: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#1F2937',
  },
  monospace: {
    fontFamily: 'monospace',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordText: {
    fontSize: 15,
    color: '#1F2937',
  },
  copyButton: {
    padding: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  timestamps: {
    paddingTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
