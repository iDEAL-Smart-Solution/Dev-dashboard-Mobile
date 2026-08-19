import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '@/config/axios';
import { showSuccess, showError } from '@/utils/notifications';

type Bank = {
  id: number;
  name: string;
  code: string;
};

type School = {
  id: string;
  schoolName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

type PaymentAccount = {
  schoolId: string;
  schoolName: string;
  paystackSubaccountCode: string | null;
  paystackAccountName: string | null;
  paystackBankCode: string | null;
  paystackAccountNumber: string | null;
  paystackEnabled: boolean;
  paystackConnectedAt: string | null;
};

type ResolvedAccount = {
  accountName: string;
  accountNumber: string;
  bankCode: string;
};

export default function PaymentSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [schools, setSchools] = useState<School[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccount, setResolvedAccount] = useState<ResolvedAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, banksRes, accountsRes] = await Promise.all([
        axiosInstance.get<School[]>('/School/get-all'),
        axiosInstance.get<{ data: Bank[] }>('/Payment/get-banks'),
        axiosInstance.get<{ data: PaymentAccount[] }>('/Payment/payment-accounts'),
      ]);

      setSchools(schoolsRes.data || []);
      setBanks(banksRes.data.data || []);
      setPaymentAccounts(accountsRes.data.data || []);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAccount = async () => {
    if (!selectedBankCode || !accountNumber) {
      showError('Please select a bank and enter account number');
      return;
    }

    setResolving(true);
    setResolvedAccount(null);

    try {
      const response = await axiosInstance.post<{
        success: boolean;
        accountName: string;
        message: string;
      }>('/Payment/resolve-account', {
        bankCode: selectedBankCode,
        accountNumber,
      });

      if (response.data.success) {
        setResolvedAccount({
          accountName: response.data.accountName,
          accountNumber,
          bankCode: selectedBankCode,
        });
        showSuccess('Account verified successfully');
      } else {
        showError(response.data.message || 'Unable to verify account');
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to verify account');
    } finally {
      setResolving(false);
    }
  };

  const handleConnectPaystack = async () => {
    if (!resolvedAccount || !selectedSchoolId) {
      showError('Please select a school and verify the account first');
      return;
    }

    setConnecting(true);

    try {
      const response = await axiosInstance.post<{
        success: boolean;
        message: string;
      }>(`/Payment/connect-paystack?schoolId=${selectedSchoolId}`, {
        bankCode: resolvedAccount.bankCode,
        accountNumber: resolvedAccount.accountNumber,
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        setSelectedSchoolId('');
        setSelectedBankCode('');
        setAccountNumber('');
        setResolvedAccount(null);
        fetchData();
      } else {
        showError(response.data.message);
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to connect Paystack account');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading payment settings...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <ScrollView style={styles.container}>
      {/* Linked Accounts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linked Payment Accounts</Text>
        {paymentAccounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payment accounts connected yet</Text>
          </View>
        ) : (
          paymentAccounts.map((account) => (
            <View key={account.schoolId} style={styles.accountCard}>
              <Text style={styles.accountSchool}>{account.schoolName}</Text>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Account Name:</Text>
                <Text style={styles.accountValue}>
                  {account.paystackAccountName || '-'}
                </Text>
              </View>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Account Number:</Text>
                <Text style={styles.accountValue}>
                  {account.paystackAccountNumber || '-'}
                </Text>
              </View>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Subaccount Code:</Text>
                <Text style={styles.accountCode}>
                  {account.paystackSubaccountCode || '-'}
                </Text>
              </View>
              {account.paystackConnectedAt && (
                <Text style={styles.accountDate}>
                  Connected: {new Date(account.paystackConnectedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Connect New Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connect New Account</Text>
        <Text style={styles.sectionDesc}>
          Select a school and enter bank details to set up payment collection
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Select School *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSchoolId}
              onValueChange={(value) => {
                setSelectedSchoolId(value);
                setResolvedAccount(null);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select a school" value="" />
              {schools.map((school) => (
                <Picker.Item
                  key={school.id}
                  label={school.schoolName}
                  value={school.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bank</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBankCode}
              onValueChange={(value) => setSelectedBankCode(value)}
              enabled={!!selectedSchoolId}
              style={styles.picker}
            >
              <Picker.Item label="Select your bank" value="" />
              {banks.map((bank) => (
                <Picker.Item key={bank.code} label={bank.name} value={bank.code} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Account Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit account number"
            value={accountNumber}
            onChangeText={(text) => setAccountNumber(text.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
            keyboardType="numeric"
            editable={!!selectedSchoolId}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!selectedSchoolId || !selectedBankCode || accountNumber.length !== 10) && styles.buttonDisabled]}
          onPress={handleResolveAccount}
          disabled={!selectedSchoolId || !selectedBankCode || accountNumber.length !== 10 || resolving}
        >
          {resolving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify Account</Text>
          )}
        </TouchableOpacity>

        {resolvedAccount && (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>✓ Account Verified</Text>
            <Text style={styles.successText}>
              <Text style={styles.successLabel}>Account Name: </Text>
              {resolvedAccount.accountName}
            </Text>
            <Text style={styles.successText}>
              <Text style={styles.successLabel}>Account Number: </Text>
              {resolvedAccount.accountNumber}
            </Text>
            <Text style={styles.confirmText}>
              Please confirm this is the correct account for{' '}
              <Text style={styles.confirmSchool}>
                {schools.find((s) => s.id === selectedSchoolId)?.schoolName}
              </Text>
            </Text>
          </View>
        )}

        {resolvedAccount && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSuccess]}
            onPress={handleConnectPaystack}
            disabled={connecting}
          >
            {connecting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Confirm & Connect Account</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            By connecting an account, you authorize us to create a Paystack subaccount
            for the selected school. Student payments will be automatically split and
            sent to this account.
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountSchool: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  accountLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 130,
  },
  accountValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  accountCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1F2937',
    flex: 1,
  },
  accountDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
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
  button: {
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSuccess: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 4,
  },
  successLabel: {
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 13,
    color: '#047857',
    marginTop: 8,
  },
  confirmSchool: {
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
