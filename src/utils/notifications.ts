import { Alert } from 'react-native';

export const showSuccess = (message: string) => {
  Alert.alert('Success', message, [{ text: 'OK' }]);
};

export const showError = (message: string) => {
  Alert.alert('Error', message, [{ text: 'OK' }]);
};

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'OK',
        onPress: onConfirm,
      },
    ]
  );
};
