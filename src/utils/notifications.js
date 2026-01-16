// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.API_URL;

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

// --- Función 1: Guardar Token (LOGIN) ---
export async function saveTokenToBackend(fcmToken) {
  try {
    const jwt = await SecureStore.getItemAsync("userToken");
    if (!jwt) return;

    await fetch(`${API_URL}/notificacion/token-fcm`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}` // Usa JWT
      },
      body: JSON.stringify({ fcmToken }), // Solo enviamos el token
    });
    console.log("✅ FCM enviado al Login");
  } catch (error) {
    console.error("Error guardando FCM:", error);
  }
}

// --- Función 2: Borrar Token (LOGOUT) ---
export async function removeTokenFromBackend(userId, fcmToken) {
  try {
    const jwt = await SecureStore.getItemAsync("userToken");
    // Incluso en logout enviamos JWT si es posible para pasar el middleware,
    // pero la lógica fuerte está en el body.
    
    await fetch(`${API_URL}/notificacion/logout-fcm`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({ 
        id_persona: userId, 
        fcmToken: fcmToken // Enviamos el token actual para validar match
      }),
    });
    console.log("🚪 Petición de desvinculación enviada");
  } catch (error) {
    console.error("Error borrando FCM:", error);
  }
}