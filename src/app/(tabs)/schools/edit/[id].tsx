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

export default function EditSchoolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { schools, isLoading, updateSchool, fetchSchools } = useSchoolStore();
  
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    phoneNumber: '',
    address: '',
    domain: '',
    colorCode: '#3B82F6',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (id && schools.length > 0) {
      const school = schools.find(s => s.id === id);
      if (school) {
        setFormData({
          schoolName: school.schoolName,
          email: school.email || '',
          phoneNumber: school.phoneNumber || '',
          address: school.address || '',
          domain: school.domain || '',
          colorCode: school.colorCode || '#3B82F6',
        });
      }
    }
  }, [id, schools]);

  const handleSubmit = async () => {
    if (!id) return;

    // Validation
    if (!formData.schoolName.trim()) {
      showError('Please enter school name');
      return;
    }
    if (!formData.email.trim()) {
      showError('Please enter email');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      showError('Please enter phone number');
      return;
    }

    const school = schools.find(s => s.id === id);
    if (!school) {
      showError('School not found');
      return;
    }

    try {
      await updateSchool({
        id,
        schoolName: formData.schoolName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        domain: formData.domain,
        colorCode: formData.colorCode,
        isSubscrptionActive: school.isSubscrptionActive,
        userId: school.userId,
      });
      showSuccess('School updated successfully');
      router.back();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update school');
    }
  };

  if (isLoading && schools.length === 0) {
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
        <Text style={styles.headerTitle}>Edit School</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>School Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter school name"
              value={formData.schoolName}
              onChangeText={(text) => setFormData({ ...formData, schoolName: text })}
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter school address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Domain</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter school domain"
              value={formData.domain}
              onChangeText={(text) => setFormData({ ...formData, domain: text })}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Brand Color</Text>
            <View style={styles.colorPickerContainer}>
              <View style={[styles.colorPreview, { backgroundColor: formData.colorCode }]} />
              <TextInput
                style={[styles.input, styles.colorInput]}
                placeholder="#3B82F6"
                value={formData.colorCode}
                onChangeText={(text) => setFormData({ ...formData, colorCode: text })}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            <Text style={styles.helpText}>Enter hex color code (e.g., #3B82F6)</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Update School</Text>
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
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  colorInput: {
    flex: 1,
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
