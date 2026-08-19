import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdminUserStore } from '@/stores/adminUserStore';
import axiosInstance from '@/config/axios';
import { showSuccess, showError } from '@/utils/notifications';

type School = {
  id: string;
  schoolName: string;
};

export default function CreateAdminUserScreen() {
  const router = useRouter();
  const { createAdminUser, isLoading } = useAdminUserStore();
  
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [profileImage, setProfileImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '' as 'Male' | 'Female' | '',
    password: '',
    schoolId: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get<School[]>('/School/get-all');
      setSchools(response.data || []);
    } catch (error) {
      showError('Failed to load schools');
    } finally {
      setLoadingSchools(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Permission to access photos is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      showError('Please enter first name');
      return;
    }
    if (!formData.lastName.trim()) {
      showError('Please enter last name');
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
    if (!formData.schoolId) {
      showError('Please select a school');
      return;
    }
    if (!formData.password.trim()) {
      showError('Please enter password');
      return;
    }
    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      // Build the file object the store's FormData expects
      let profilePicture: any = null;
      if (profileImage) {
        const filename = profileImage.uri.split('/').pop() ?? 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        profilePicture = { uri: profileImage.uri, name: filename, type } as any;
      }

      await createAdminUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender || null,
        password: formData.password,
        schoolId: formData.schoolId,
        profilePicture,
        profilePictureUrl: null,
      });
      showSuccess('Admin user created successfully');
      router.back();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create admin user');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Admin User</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 1 }}
      >
        <View style={styles.form}>
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity
              style={styles.profilePicturePicker}
              onPress={handlePickImage}
              disabled={isLoading}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Camera color="#9CA3AF" size={32} />
                  <Text style={styles.profilePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {profileImage && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setProfileImage(null)}
                disabled={isLoading}
              >
                <X color="#FFFFFF" size={14} />
              </TouchableOpacity>
            )}
            <Text style={styles.profilePictureLabel}>Profile Picture</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
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
            <Text style={styles.label}>School *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.schoolId}
                onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
                enabled={!isLoading && !loadingSchools}
                style={styles.picker}
              >
                <Picker.Item label={loadingSchools ? "Loading schools..." : "Select a school"} value="" />
                {schools.map((school) => (
                  <Picker.Item key={school.id} label={school.schoolName} value={school.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'Male' | 'Female' | '' })}
                enabled={!isLoading}
                style={styles.picker}
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
              numberOfLines={3}
              editable={!isLoading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password (min. 6 characters)"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              editable={!isLoading}
            />
            <Text style={styles.helpText}>Minimum 6 characters</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Admin User</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  form: {
    // padding moved to scrollContent so paddingBottom is respected
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profilePicturePicker: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  profilePlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  profilePlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: '28%',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureLabel: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
});
