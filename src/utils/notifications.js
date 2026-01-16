import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { decode as atob } from "base-64";
import Constants from 'expo-constants';
// ✅ IMPORTANTE: Importamos las nuevas funciones separadas
import { registerForPushNotificationsAsync, saveTokenToBackend, removeTokenFromBackend } from "../utils/notifications";
import { AppContext } from "./AppContext";

const API_URL = Constants.expoConfig?.extra?.API_URL;
console.log("📌 API en uso:", API_URL);

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { setMessage } = useContext(AppContext);
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null, // ID de la persona
    token: null, // JWT
    errorLogin: null,
    role: null,
    fcmToken: null, // Token del dispositivo
  });

  // ✅ HELPER: Gestiona el registro del token FCM al entrar (Login o Auto-login)
  const handleLoginPush = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        // Llamamos al endpoint de LOGIN (que limpia y asigna)
        await saveTokenToBackend(token);
        // Actualizamos el estado local
        setAuthState(prev => ({ ...prev, fcmToken: token }));
      }
    } catch (error) {
      console.warn("Error en handleLoginPush:", error);
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          const decodedToken = parseJwt(token);
          
          // Validamos Roles (3 o 4)
          if (decodedToken?.roles?.some(r => [3, 4].includes(r))) {
            const userId = decodedToken.id_persona;
            
            setAuthState({
              isAuthenticated: true,
              token,
              role: decodedToken.roles,
              user: userId,
              errorLogin: null,
              fcmToken: null // Se llenará un instante después
            });
            
            // ✅ Al recargar la app, refrescamos la vinculación FCM
            await handleLoginPush(); 
            
          } else {
            // Token inválido o sin permisos
            await logout(); 
          }
        }
      } catch (e) {
        console.warn("Error al cargar token", e);
        setAuthState(prev => ({ ...prev, isAuthenticated: false }));
      } finally {
        setIsReady(true);
      }
    };
    loadToken();
  }, []);

  const login = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, userData);
      const token = response.data.token;
      const decodedToken = parseJwt(token);

      if (decodedToken.roles.includes(3) || decodedToken.roles.includes(4)) {
        // 1. Guardamos JWT seguro
        await SecureStore.setItemAsync("userToken", token);
        
        const userId = decodedToken.id_persona;

        // 2. Actualizamos Estado
        setAuthState({
          isAuthenticated: true,
          user: userId,
          token: token,
          errorLogin: null,
          role: decodedToken.roles,
          fcmToken: null,
        });

        // 3. ✅ Vinculamos FCM (Esto llama a saveTokenToBackend internamente)
        await handleLoginPush();
        
        return true; // Éxito
      } else {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          errorLogin: "Acceso no autorizado: Rol insuficiente"
        }));
        setMessage({ type: "error", text: "No tienes permisos para acceder." });
        return false;
      }
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({ type: "error", text: errorMessage });
      setAuthState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        errorLogin: errorMessage 
      }));
      
      return false;
    }
  };

  const logout = async () => {
    try {
      // ✅ LOGOUT SEGURO:
      // Solo intentamos desvincular si tenemos usuario y token FCM en memoria
      if (authState.user && authState.fcmToken) {
        console.log("🚪 Ejecutando logout de FCM...");
        // Llamamos al endpoint de LOGOUT (que valida si el token coincide antes de borrar)
        await removeTokenFromBackend(authState.user, authState.fcmToken);
      }
    } catch (e) {
      console.warn("Error no crítico en logout FCM", e);
    }

    // Limpieza local
    await SecureStore.deleteItemAsync("userToken");
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      errorLogin: null,
      role: null,
      fcmToken: null,
    });
  };

  function parseJwt(token) {
    try {
      var base64Url = token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      var jsonPayload = decodeURIComponent(
        atob(base64).split("").map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding token", e);
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };