import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { decode as atob } from "base-64";
import Constants from 'expo-constants';
import { registerForPushNotificationsAsync, sendTokenToBackend } from "../utils/notifications";
import { AppContext } from "./AppContext";
import { useContext } from "react";

const API_URL = Constants.expoConfig?.extra?.API_URL;
console.log("📌 API en uso:", API_URL);

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { setMessage } = useContext(AppContext);
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    errorLogin: null,
    role: null,
    fcmToken: null,
  });

  const handlePushRegistration = async (userId) => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await sendTokenToBackend(token, userId); // 👈 pasamos userId
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
            await handlePushRegistration(userId);
          } else {
            await SecureStore.deleteItemAsync("userToken");
            setAuthState({
              isAuthenticated: false,
              user: null,
              token: null,
              errorLogin: "Acceso no autorizado",
              role: null,
            });
          }
        }
      } catch (e) {
        console.warn("Error al cargar token", e);
        setAuthState(prev => ({ ...prev, isAuthenticated: false }));
      } finally {
        setIsReady(true); // ✅ Clave: después de todo
      }
    };

    loadToken();
  }, []);

const login = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, userData);

            const decodedToken = parseJwt(response.data.token);

            if (
                decodedToken.roles.includes(3) ||
                decodedToken.roles.includes(4)
            ) {
                await SecureStore.setItemAsync(
                    "userToken",
                    response.data.token
                );

                const userId = decodedToken.id_persona;

                setAuthState(prevState => ({
                    ...prevState,
                    isAuthenticated: true,
                    user: userId,
                    token: response.data.token,
                    errorLogin: null,
                    role: decodedToken.roles,
                }));
                
                setMessage({ type: "success", text: "Inicio de sesión exitoso." }); // opcional aquí
                // Register for push notifications on login
                await handlePushRegistration();
                return true;
            } else {
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    errorLogin: "Acceso no autorizado",
                    role: null,
                });
                return false;
            }
        } catch (error) {
            let errorMessage = "Error al iniciar sesión";
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                errorMessage = error.response.data.message;
            }

            setMessage({ type: "error", text: errorMessage });

            setAuthState({
                isAuthenticated: false,
                user: null,
                token: null,
                errorLogin: errorMessage,
                role: null,
            });
            return false;
        }
    };

 const logout = async () => {
  if (authState.user) {
    await sendTokenToBackend(null, authState.user); // fcmToken = null → desvincular
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
                atob(base64)
                    .split("")
                    .map(function (c) {
                        return (
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join("")
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