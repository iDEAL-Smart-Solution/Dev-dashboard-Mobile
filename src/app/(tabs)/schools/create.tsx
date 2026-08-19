import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSchoolStore } from '@/stores/schoolStore';
import { useAuthStore } from '@/stores/authStore';
import { showSuccess, showError } from '@/utils/notifications';

// Preset color swatches matching the web's design palette
const COLOR_PRESETS = [
  '#4F46E5', '#3B82F6', '#06B6D4', '#10B981', '#84CC16',
  '#EAB308', '#F97316', '#EF4444', '#EC4899', '#8B5CF6',
  '#6366F1', '#14B8A6', '#F59E0B', '#DC2626', '#7C3AED',
  '#1D4ED8', '#059669', '#D97706', '#BE123C', '#4338CA',
];

export default function CreateSchoolScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createSchool, isLoading } = useSchoolStore();

  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    phoneNumber: '',
    address: '',
    domain: '',
    colorCode: '#4F46E5',
  });

  // Logo state — store the full ImagePicker asset so we can build FormData
  const [logoAsset, setLogoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // Color picker modal
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [colorInputDraft, setColorInputDraft] = useState(formData.colorCode);

  // ─── Logo picker ─────────────────────────────────────────────────────────────
  const handlePickLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showError('Permission to access photos is required to upload a logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setLogoAsset(result.assets[0]);
    }
  };

  const handleRemoveLogo = () => setLogoAsset(null);

  // ─── Color picker ─────────────────────────────────────────────────────────────
  const openColorPicker = () => {
    setColorInputDraft(formData.colorCode);
    setColorPickerVisible(true);
  };

  const handleSelectPreset = (color: string) => {
    setColorInputDraft(color);
    setFormData(prev => ({ ...prev, colorCode: color }));
  };

  const handleColorInputChange = (text: string) => {
    setColorInputDraft(text);
    // Apply to form immediately if it looks like a valid hex
    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
      setFormData(prev => ({ ...prev, colorCode: text }));
    }
  };

  const handleColorPickerConfirm = () => {
    const trimmed = colorInputDraft.trim();
    // Accept 3 or 6 digit hex, with or without #
    const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (/^#[0-9A-Fa-f]{3}$/.test(hex) || /^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setFormData(prev => ({ ...prev, colorCode: hex }));
    }
    setColorPickerVisible(false);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
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
    if (!user?.id) {
      showError('User ID not found');
      return;
    }

    try {
      // Build the logo file object in the format FormData expects for RN
      let logoFile: any = null;
      if (logoAsset) {
        const uri = logoAsset.uri;
        const fileName = uri.split('/').pop() || 'logo.jpg';
        const type = logoAsset.mimeType || 'image/jpeg';
        logoFile = { uri, name: fileName, type } as any;
      }

      await createSchool({
        ...formData,
        schoolLogoFilePath: logoFile,
        userId: user.id,
      });
      showSuccess('School created successfully');
      router.back();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create school');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      {/* Header — sits outside the scroll so it stays fixed */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register School</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── School Logo ─────────────────────────────────────── */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>School Logo</Text>
          {logoAsset ? (
            <View style={styles.logoPreviewContainer}>
              <Image source={{ uri: logoAsset.uri }} style={styles.logoPreview} />
              <TouchableOpacity style={styles.removeLogoButton} onPress={handleRemoveLogo}>
                <X color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.logoPickerButton}
              onPress={handlePickLogo}
              disabled={isLoading}
            >
              <ImageIcon color="#6B7280" size={32} />
              <Text style={styles.logoPickerText}>Tap to select logo</Text>
              <Text style={styles.logoPickerSubtext}>PNG, JPG up to 10MB</Text>
            </TouchableOpacity>
          )}
          {logoAsset && (
            <TouchableOpacity
              style={styles.changeLogoButton}
              onPress={handlePickLogo}
              disabled={isLoading}
            >
              <Text style={styles.changeLogoText}>Change Logo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── School Name ─────────────────────────────────────── */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>School Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter school name"
            value={formData.schoolName}
            onChangeText={(text) => setFormData({ ...formData, schoolName: text })}
            editable={!isLoading}
            returnKeyType="next"
          />
        </View>

        {/* ── Email ───────────────────────────────────────────── */}
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
            returnKeyType="next"
          />
        </View>

        {/* ── Phone Number ────────────────────────────────────── */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="phone-pad"
            editable={!isLoading}
            returnKeyType="next"
          />
        </View>

        {/* ── Address ─────────────────────────────────────────── */}
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
            textAlignVertical="top"
          />
        </View>

        {/* ── Domain ──────────────────────────────────────────── */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Domain</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., school.edu"
            value={formData.domain}
            onChangeText={(text) => setFormData({ ...formData, domain: text })}
            autoCapitalize="none"
            editable={!isLoading}
            returnKeyType="next"
          />
        </View>

        {/* ── Brand Color ─────────────────────────────────────── */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Brand Color</Text>
          <View style={styles.colorRow}>
            {/* Swatch tappable — opens picker */}
            <TouchableOpacity
              style={[styles.colorSwatch, { backgroundColor: formData.colorCode }]}
              onPress={openColorPicker}
              disabled={isLoading}
            />
            {/* Hex input — always editable, stays in sync */}
            <TextInput
              style={[styles.input, styles.colorInput]}
              placeholder="#4F46E5"
              value={formData.colorCode}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, colorCode: text }));
                setColorInputDraft(text);
              }}
              autoCapitalize="none"
              editable={!isLoading}
              maxLength={7}
            />
            <TouchableOpacity
              style={styles.colorPickerTrigger}
              onPress={openColorPicker}
              disabled={isLoading}
            >
              <Text style={styles.colorPickerTriggerText}>Pick</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>Tap the swatch or "Pick" to choose a color visually</Text>
        </View>

        {/* ── Submit ──────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create School</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Color Picker Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={colorPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setColorPickerVisible(false)}
        />
        <View style={styles.colorPickerSheet}>
          <View style={styles.colorPickerHeader}>
            <Text style={styles.colorPickerTitle}>Choose Brand Color</Text>
            <TouchableOpacity onPress={() => setColorPickerVisible(false)}>
              <X color="#6B7280" size={22} />
            </TouchableOpacity>
          </View>

          {/* Preview swatch */}
          <View style={[styles.colorPickerPreview, { backgroundColor: colorInputDraft }]} />

          {/* Preset grid */}
          <Text style={styles.colorPickerSectionLabel}>Presets</Text>
          <View style={styles.colorGrid}>
            {COLOR_PRESETS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorGridItem,
                  { backgroundColor: color },
                  colorInputDraft === color && styles.colorGridItemSelected,
                ]}
                onPress={() => handleSelectPreset(color)}
              />
            ))}
          </View>

          {/* Manual hex input */}
          <Text style={styles.colorPickerSectionLabel}>Custom hex code</Text>
          <View style={styles.colorHexRow}>
            <View style={[styles.colorHexPreview, { backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorInputDraft) ? colorInputDraft : '#E5E7EB' }]} />
            <TextInput
              style={[styles.input, styles.colorHexInput]}
              value={colorInputDraft}
              onChangeText={handleColorInputChange}
              placeholder="#4F46E5"
              autoCapitalize="none"
              maxLength={7}
            />
          </View>

          <TouchableOpacity style={styles.colorPickerConfirm} onPress={handleColorPickerConfirm}>
            <Text style={styles.colorPickerConfirmText}>Apply Color</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingBottom: 48,
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
  },

  // Logo picker
  logoPickerButton: {
    height: 120,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  logoPickerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  logoPickerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  logoPreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  logoPreview: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  removeLogoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeLogoButton: {
    marginTop: 8,
  },
  changeLogoText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },

  // Color
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  colorInput: {
    flex: 1,
  },
  colorPickerTrigger: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  // Submit
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
    marginBottom: 16,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },

  // Color picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  colorPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  colorPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  colorPickerPreview: {
    height: 48,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorPickerSectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  colorGridItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorGridItemSelected: {
    borderColor: '#1F2937',
  },
  colorHexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  colorHexPreview: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorHexInput: {
    flex: 1,
  },
  colorPickerConfirm: {
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
