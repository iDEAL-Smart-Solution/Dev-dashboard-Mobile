/**
 * This screen is never rendered — the Profile tab button is intercepted
 * in _layout.tsx to open a modal instead of navigating here.
 * expo-router requires a file to exist for every registered route.
 */
import { View } from 'react-native';
export default function ProfileScreen() {
  return <View />;
}
