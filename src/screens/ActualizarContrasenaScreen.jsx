import React, { useState, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button, Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Constants from 'expo-constants';
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function ActualizarContrasenaScreen() {
    const { authState } = useContext(AuthContext);
    const { setLoading, setMessage } = useContext(AppContext);
    const navigation = useNavigation();
    const [contrasenaActual, setContrasenaActual] = useState("");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mostrarCamposNuevos, setMostrarCamposNuevos] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const verificarContrasena = async () => {
        setIsSubmitting(true);
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/persona/verificar-contrasena/${authState.user}`,
                { contrasena: contrasenaActual }
            );

            if (response.data.mensaje === "Contraseña correcta") {
                setMostrarCamposNuevos(true);
                setMessage({ text: "Contraseña verificada. Ahora puedes crear una nueva.", type: "success" });
            } else {
                setMessage({ text: "La contraseña actual es incorrecta.", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "No se pudo verificar la contraseña.", type: "error" });
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const actualizarContrasena = async () => {
        if (nuevaContrasena !== confirmarContrasena) {
            setMessage({ text: "Las nuevas contraseñas no coinciden.", type: "error" });
            return;
        }

        if (nuevaContrasena.length < 6) {
            setMessage({ text: "La nueva contraseña debe tener al menos 6 caracteres.", type: "error" });
            return;
        }
        
        setIsSubmitting(true);
        setLoading(true);
        try {
            const response = await axios.put(
                `${API_URL}/persona/actualizar-contrasena/${authState.user}`,
                { nuevaContrasena }
            );

            if (response.status === 200) {
                setMessage({ text: "Contraseña actualizada correctamente.", type: "success" });
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error al actualizar contraseña:", error);
            setMessage({ text: "No se pudo actualizar la contraseña.", type: "error" });
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                {!mostrarCamposNuevos ? (
                    <>
                        <TextInput
                            label="Contraseña Actual"
                            mode="outlined"
                            secureTextEntry
                            value={contrasenaActual}
                            onChangeText={setContrasenaActual}
                            style={styles.input}
                            activeOutlineColor="#635393"
                        />
                        <Button 
                            mode="contained" 
                            onPress={verificarContrasena} 
                            style={styles.button}
                            disabled={isSubmitting}
                            loading={isSubmitting}
                            buttonColor="#635393"
                        >
                            Verificar
                        </Button>
                    </>
                ) : (
                    <>
                        <TextInput
                            label="Nueva Contraseña"
                            mode="outlined"
                            secureTextEntry
                            value={nuevaContrasena}
                            onChangeText={setNuevaContrasena}
                            style={styles.input}
                            activeOutlineColor="#635393"
                        />
                        <TextInput
                            label="Confirmar Nueva Contraseña"
                            mode="outlined"
                            secureTextEntry
                            value={confirmarContrasena}
                            onChangeText={setConfirmarContrasena}
                            style={styles.input}
                            activeOutlineColor="#635393"
                        />
                        <Button 
                            mode="contained" 
                            onPress={actualizarContrasena} 
                            style={styles.button}
                            disabled={isSubmitting}
                            loading={isSubmitting}
                            buttonColor="#635393"
                        >
                            Guardar Cambios
                        </Button>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    formContainer: { 
        flex: 1, 
        padding: 20,
        justifyContent: 'center',
    },
    input: { 
        marginBottom: 15,
    },
    button: { 
        marginTop: 10,
        paddingVertical: 5,
    },
});
