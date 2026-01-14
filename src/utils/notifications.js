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

export async function sendTokenToBackend(fcmToken) { // Renombrado para claridad
  try {
    const API_URL = Constants.expoConfig?.extra?.API_URL; 
    
    const jwtToken = await getTokenFromStorage();

    const response = await fetch(`${API_URL}/notificacion/token-fcm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken || ''}`,
      },
      body: JSON.stringify({ fcmToken: fcmToken }), // Enviamos el string del token
    });

    if (response.ok) {
      console.log('✅ Token enviado al backend');
    } else {
      const errorText = await response.text();
      console.error('❌ Error al enviar token:', errorText);
    }
  } catch (error) {
    console.error('❌ Error de red al enviar token:', error);
  }
}