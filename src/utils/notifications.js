// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// ✅ Solo una declaración de getTokenFromStorage
async function getTokenFromStorage() {
  try {
    return await SecureStore.getItemAsync('userToken'); // ← Usa el mismo key que en AuthProvider
  } catch (e) {
    console.warn('⚠️ No se pudo obtener el token JWT');
    return null;
  }
}

export async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permiso de notificaciones denegado');
    return null;
  }

  if (Constants.appOwnership === 'standalone') {
    try {
      const token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('✅ FCM Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Error al obtener FCM token:', error);
      return null;
    }
  } else {
    console.log('⚠️ Solo funciona en APK/IPA (no en Expo Go)');
    return null;
  }
}

export async function sendTokenToBackend(token) {
  try {
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    if (!API_URL) {
      console.error('❌ API_URL no está definida en expo-constants');
      return;
    }

    const jwtToken = await getTokenFromStorage(); // ← await aquí

    const response = await fetch(`${API_URL}/notificacion/token-fcm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken || ''}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });

    if (response.ok) {
      console.log('✅ Token enviado al backend');
    } else {
      console.error('❌ Error al enviar token al backend:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}