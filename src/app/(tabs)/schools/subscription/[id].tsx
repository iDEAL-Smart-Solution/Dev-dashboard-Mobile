import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSchoolStore } from '@/stores/schoolStore';
import { showSuccess, showError } from '@/utils/notifications';

export default function EditSubscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedSchoolDetails, isLoading, fetchSchoolById, updateSchoolSubscription } = useSchoolStore();
  
  const [formData, setFormData] = useState({
    allowedStudentCount: '',
    registeredStudentCount: '',
    amountPaid: '',
  });

  useEffect(() => {
    if (id) {
      fetchSchoolById(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedSchoolDetails?.schoolSubscription) {
      setFormData({
        allowedStudentCount: selectedSchoolDetails.schoolSubscription.allowedStudentCount.toString(),
        registeredStudentCount: selectedSchoolDetails.schoolSubscription.registeredStudentCount.toString(),
        amountPaid: selectedSchoolDetails.schoolSubscription.amountPaid.toString(),
      });
    }
  }, [selectedSchoolDetails]);

  const handleSubmit = async () => {
    if (!id) return;

    const allowedCount = parseInt(formData.allowedStudentCount);
    const registeredCount = parseInt(formData.registeredStudentCount);
    const amount = parseFloat(formData.amountPaid);

    if (isNaN(allowedCount) || allowedCount < 0) {
      showError('Please enter a valid allowed student count');
      return;
    }
    if (isNaN(registeredCount) || registeredCount < 0) {
      showError('Please enter a valid registered student count');
      return;
    }
    if (isNaN(amount) || amount < 0) {
      showError('Please enter a valid amount');
      return;
    }

    try {
      await updateSchoolSubscription({
        id,
        allowedStudentCount: allowedCount,
        registeredStudentCount: registeredCount,
        amountPaid: amount,
      });
      showSuccess('Subscription updated successfully');
      router.back();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update subscription');
    }
  };

  if (isLoading && !selectedSchoolDetails) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Edit Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* School Info */}
          {selectedSchoolDetails && (
            <View style={styles.infoCard}>
              <Text style={styles.schoolName}>{selectedSchoolDetails.schoolName}</Text>
              <Text style={styles.planType}>Plan: {selectedSchoolDetails.planType}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Allowed Student Count *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter allowed student count"
              value={formData.allowedStudentCount}
              onChangeText={(text) => setFormData({ ...formData, allowedStudentCount: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              editable={!isLoading}
            />
            <Text style={styles.helpText}>Maximum number of students allowed</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Registered Student Count *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter registered student count"
              value={formData.registeredStudentCount}
              onChangeText={(text) => setFormData({ ...formData, registeredStudentCount: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              editable={!isLoading}
            />
            <Text style={styles.helpText}>Current number of registered students</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Amount Paid (₦) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount paid"
              value={formData.amountPaid}
              onChangeText={(text) => setFormData({ ...formData, amountPaid: text.replace(/[^0-9.]/g, '') })}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            <Text style={styles.helpText}>Total amount paid for subscription</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Update Subscription</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  planType: {
    fontSize: 14,
    color: '#6B7280',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  submitButton: {
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
