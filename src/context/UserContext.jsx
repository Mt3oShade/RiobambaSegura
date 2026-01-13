import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
const UserContext = createContext();

import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;
console.log("📌 API en uso:", API_URL);
// Debe mostrar el URL de la API
const UserProvider = ({ children }) => {
    const [userState, setUserState] = useState({
        errorNewUser: null,
        isRegistered: false,
    });

    const registroUsuario = async (userData) => {
        try {
            const response = await axios.post(
                `${API_URL}/persona/nuevoCiudadano`,
                userData
            );
            setUserState({
                errorNewUser: null,
                isRegistered: true,
            });
            return true;
        } catch (error) {
            let errorMessage = "Error al registrar usuario";
            if (error.response) {
                errorMessage = error.response.data.message;
            }
            setUserState({
                errorNewUser: errorMessage,
                isRegistered: false,
            });
            return false;
        }
    };

    return (
        <UserContext.Provider value={{ userState, registroUsuario }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
