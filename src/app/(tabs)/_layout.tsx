import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Building2, Users, CreditCard, User, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';

export default function TabLayout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const TAB_BAR_HEIGHT = 60 + insets.bottom;

  const handleLogout = () => {
    setProfileOpen(false);
    setTimeout(() => {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]);
    }, 100);
  };

  const initial = (user?.name?.charAt(0) || 'D').toUpperCase();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: TAB_BAR_HEIGHT,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="schools"
          options={{
            title: 'Schools',
            tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="admin-users"
          options={{
            title: 'Admin Users',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="payment-settings"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as any)}
                onPress={() => setProfileOpen((prev) => !prev)}
                accessibilityLabel="Profile"
                accessibilityRole="button"
              />
            ),
          }}
        />
      </Tabs>

      {/* Drop-up popup — rendered outside Tabs so no Modal stacking issues */}
      {profileOpen && (
        <>
          {/* Backdrop: full-screen Pressable closes on tap */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setProfileOpen(false)}
          />

          {/* Card anchored just above the tab bar on the right */}
          <View style={[styles.card, { bottom: TAB_BAR_HEIGHT + 8 }]}>
            {/* User info row */}
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.name} numberOfLines={1}>
                  {user?.name || 'Developer'}
                </Text>
                <Text style={styles.role} numberOfLines={1}>
                  {user?.role || 'Developer'}
                </Text>
                {user?.uin ? (
                  <Text style={styles.uin}>UIN: {user.uin}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Logout button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut color="#EF4444" size={16} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Caret pointing down toward the Profile icon */}
          <View style={[styles.caretWrapper, { bottom: TAB_BAR_HEIGHT }]}>
            <View style={styles.caret} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    right: 12,
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 999,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  role: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginTop: 1,
  },
  uin: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  caretWrapper: {
    position: 'absolute',
    right: 12,
    width: 220,
    alignItems: 'flex-end',
    paddingRight: 20,
    zIndex: 999,
  },
  caret: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
});
