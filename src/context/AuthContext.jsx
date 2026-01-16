import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { decode as atob } from "base-64";
import Constants from 'expo-constants';
import { registerForPushNotificationsAsync, saveTokenToBackend, removeTokenFromBackend } from "../utils/notifications";
import { AppContext } from "./AppContext";

const API_URL = Constants.expoConfig?.extra?.API_URL;
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { setMessage } = useContext(AppContext);
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null, // Esto guardará el id_persona
    token: null,
    errorLogin: null,
    role: null,
    fcmToken: null,
  });

  // ✅ CORRECCIÓN: Validamos que userId exista antes de intentar registrar
  const handlePushRegistration = async (userId) => {
    if (!userId) {
        console.warn("Intento de registro push sin userId");
        return;
    }
    
    const token = await registerForPushNotificationsAsync();
    
    if (token) {
      // Esto hará match con tu backend (fcmToken: string, id_persona: userId)
      await sendTokenToBackend(token, userId); 
      setAuthState(prev => ({ ...prev, fcmToken: token }));
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          const decodedToken = parseJwt(token);
          
          if (decodedToken?.roles?.some(r => [3, 4].includes(r))) {
            const userId = decodedToken.id_persona;
            
            setAuthState({
              isAuthenticated: true,
              token,
              role: decodedToken.roles,
              user: userId,
              errorLogin: null,
            });
            
            // ✅ CORRECCIÓN: Pasamos el userId recuperado del token guardado
            handlePushRegistration(userId); 
            
          } else {
            // Si el token es inválido o rol incorrecto, limpiamos
            await logout(); 
          }
        }
      } catch (e) {
        console.warn("Error al cargar token", e);
      } finally {
        setIsReady(true);
      }
    };
    loadToken();
  }, []);

  const login = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, userData);
      const decodedToken = parseJwt(response.data.token);

      if (decodedToken.roles.includes(3) || decodedToken.roles.includes(4)) {
        await SecureStore.setItemAsync("userToken", response.data.token);
        const userId = decodedToken.id_persona;

        setAuthState({
          isAuthenticated: true,
          user: userId,
          token: response.data.token,
          errorLogin: null,
          role: decodedToken.roles,
          fcmToken: null,
        });

        // ✅ CORRECCIÓN CRÍTICA: Pasamos el userId al loguearse
        await handlePushRegistration(userId);
        
        return true; // Retorna true para que el LoginScreen sepa que fue exitoso
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
      
      return false; // Retorna false para que LoginScreen no muestre éxito
    }
  };

  const logout = async () => {
    try {
      // ✅ CORRECCIÓN: Si hay usuario, enviamos null al backend
      // Esto hará match con: if (fcmToken === undefined) en tu backend
      if (authState.user) {
        await sendTokenToBackend(null, authState.user);
      }
    } catch (e) {
      console.warn("No se pudo notificar al backend del logout", e);
    }

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