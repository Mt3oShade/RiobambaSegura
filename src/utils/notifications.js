// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

async function getTokenFromStorage() {
  try {
    return await SecureStore.getItemAsync('userToken');
  } catch (e) {
    console.warn('⚠️ No se pudo obtener el token JWT');
    return null;
  }
}

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permiso de notificaciones denegado');
    return null;
  }
  
  console.log('Entorno de Ejecución:', Constants.executionEnvironment);

  if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
    try {
      // ✅ getDevicePushTokenAsync devuelve un objeto { type, data }
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      const token = deviceToken.data; 

      console.log('✅ FCM Token:', token);
      
      return token;
    } catch (error) {
      console.error('❌ Error al obtener FCM token:', error);
      return null;
    }
  } else {
    console.log('⚠️ Solo funciona en APK/IPA/Dev Build (no en Expo Go)');
    return null;
  }
}

export async function sendTokenToBackend(fcmToken, userId = null) {
  try {
    const API_URL = Constants.expoConfig?.extra?.API_URL;
    
    // Si no se pasa userId, intentamos obtenerlo del estado (pero mejor pasarlo explícitamente)
    if (userId === null) {
      console.warn("⚠️ sendTokenToBackend llamado sin userId");
      return;
    }

    const response = await fetch(`${API_URL}/notificacion/token-fcm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken, id_persona: userId }),
    });

    if (response.ok) {
      console.log('✅ Token FCM gestionado');
    } else {
      const errorText = await response.text();
      console.error('❌ Error al gestionar FCM:', errorText);
    }
  } catch (error) {
    console.error('❌ Error de red al gestionar FCM:', error);
  }
}