import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit, Mail, Phone, MapPin } from 'lucide-react-native';
import { useSchoolStore } from '@/stores/schoolStore';
import { resolveMediaUrl } from '@/config/media';

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedSchoolDetails, isLoading, fetchSchoolById } = useSchoolStore();
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSchoolById(id);
    }
  }, [id]);

  if (isLoading || !selectedSchoolDetails) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading school details...</Text>
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
        <Text style={styles.headerTitle}>School Details</Text>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/schools/edit/${id}`)}>
          <Edit color="#3B82F6" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* School Info Card */}
        <View style={styles.card}>
          <View style={styles.schoolHeader}>
            {selectedSchoolDetails.schoolLogoFilePath ? (
              <Image
                source={{ uri: resolveMediaUrl(selectedSchoolDetails.schoolLogoFilePath) }}
                style={styles.logo}
              />
            ) : (
              <View
                style={[
                  styles.logoPlaceholder,
                  { backgroundColor: selectedSchoolDetails.colorCode || '#3B82F6' },
                ]}
              >
                <Text style={styles.logoText}>
                  {selectedSchoolDetails.schoolName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>{selectedSchoolDetails.schoolName}</Text>
              <Text style={styles.planType}>Plan: {selectedSchoolDetails.planType}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            {selectedSchoolDetails.email && (
              <View style={styles.infoRow}>
                <Mail color="#6B7280" size={20} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{selectedSchoolDetails.email}</Text>
                </View>
              </View>
            )}

            {selectedSchoolDetails.phoneNumber && (
              <View style={styles.infoRow}>
                <Phone color="#6B7280" size={20} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{selectedSchoolDetails.phoneNumber}</Text>
                </View>
              </View>
            )}

            {selectedSchoolDetails.address && (
              <View style={styles.infoRow}>
                <MapPin color="#6B7280" size={20} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{selectedSchoolDetails.address}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Subscription Details Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subscription Details</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/(tabs)/schools/subscription/${id}`)}
            >
              <Edit color="#3B82F6" size={18} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subscriptionGrid}>
            <View style={styles.subscriptionItem}>
              <Text style={styles.subscriptionLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  selectedSchoolDetails.isSubscrptionActive
                    ? styles.statusActive
                    : styles.statusInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    selectedSchoolDetails.isSubscrptionActive
                      ? styles.statusTextActive
                      : styles.statusTextInactive,
                  ]}
                >
                  {selectedSchoolDetails.isSubscrptionActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.subscriptionItem}>
              <Text style={styles.subscriptionLabel}>Allowed Students</Text>
              <Text style={styles.subscriptionValue}>
                {selectedSchoolDetails.schoolSubscription?.allowedStudentCount || 0}
              </Text>
            </View>

            <View style={styles.subscriptionItem}>
              <Text style={styles.subscriptionLabel}>Registered Students</Text>
              <Text style={styles.subscriptionValue}>
                {selectedSchoolDetails.schoolSubscription?.registeredStudentCount || 0}
              </Text>
            </View>

            <View style={styles.subscriptionItem}>
              <Text style={styles.subscriptionLabel}>Amount Paid</Text>
              <Text style={styles.subscriptionValue}>
                ₦{(selectedSchoolDetails.schoolSubscription?.amountPaid || 0).toLocaleString()}
              </Text>
            </View>
          </View>
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
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  schoolInfo: {
    flex: 1,
    marginLeft: 16,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  planType: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
  subscriptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subscriptionItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  subscriptionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  subscriptionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#065F46',
  },
  statusTextInactive: {
    color: '#991B1B',
  },
});
