import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Appbar, ActivityIndicator } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function MiPerfilScreen() {
    const { authState } = useContext(AuthContext);
    const { setLoading, setMessage } = useContext(AppContext);
    const navigation = useNavigation();
    const [perfilCargado, setPerfilCargado] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm();

    useEffect(() => {
        const cargarPerfil = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${API_URL}/persona/ciudadanoUser/${authState.user}`
                );
                const data = response.data;
                console.log("Datos del usuario:", data);

                setValue("cedula", data.cedula);
                setValue("nombres", data.nombres);
                setValue("apellidos", data.apellidos);
                setValue("telefono", data.telefono);
                setValue("email", data.email);
                setValue("genero", data.genero ? data.genero.trim() : "");

                setPerfilCargado(true);
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
                setMessage({
                    text: "No se pudo cargar la información del perfil.",
                    type: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        if (authState.user) {
            cargarPerfil();
        }
    }, [authState.user, setValue, setLoading, setMessage]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const actualizacionData = {
                nombres: data.nombres,
                apellidos: data.apellidos,
                telefono: data.telefono,
                email: data.email,
            };

            const response = await axios.put(
                `${API_URL}/persona/${authState.user}`,
                actualizacionData
            );

            if (response.status === 200) {
                setMessage({ text: "Perfil actualizado correctamente.", type: "success" });
            } else {
                setMessage({
                    text: "Hubo un problema al actualizar el perfil.",
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            setMessage({
                text: "No se pudo actualizar la información del perfil.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.formContainer}>
                {!perfilCargado ? (
                    <ActivityIndicator animating={true} size="large" style={{ marginTop: 20 }} />
                ) : (
                    <>
                        {/* Campos deshabilitados */}
                        <Controller
                            control={control}
                            name="cedula"
                            render={({ field: { value } }) => (
                                <TextInput
                                    label="Cédula"
                                    mode="outlined"
                                    value={value}
                                    style={styles.input}
                                    disabled
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="nombres"
                            render={({ field: { value } }) => (
                                <TextInput
                                    label="Nombres"
                                    mode="outlined"
                                    value={value}
                                    style={styles.input}
                                    disabled
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="apellidos"
                            render={({ field: { value } }) => (
                                <TextInput
                                    label="Apellidos"
                                    mode="outlined"
                                    value={value}
                                    style={styles.input}
                                    disabled
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="genero"
                            render={({ field: { value } }) => (
                                <TextInput
                                    label="Género"
                                    mode="outlined"
                                    value={value}
                                    style={styles.input}
                                    disabled
                                />
                            )}
                        />

                        {/* Campos editables */}
                        <Controller
                            control={control}
                            name="telefono"
                            rules={{
                                required: "El teléfono es obligatorio",
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: "Número de teléfono inválido",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Teléfono"
                                    mode="outlined"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={styles.input}
                                    keyboardType="phone-pad"
                                    activeOutlineColor="#635393"
                                />
                            )}
                        />
                        {errors.telefono && (
                            <Text style={styles.errorText}>{errors.telefono.message}</Text>
                        )}

                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "El email es obligatorio",
                                pattern: {
                                    value: /\S+@\S+\.\S+/,
                                    message: "Correo electrónico inválido",
                                },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    label="Email"
                                    mode="outlined"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    style={styles.input}
                                    autoCapitalize="none"
                                    activeOutlineColor="#635393"
                                />
                            )}
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email.message}</Text>
                        )}

                        {/* Botones */}
                        <Button
                            mode="contained"
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            style={styles.button}
                            loading={isSubmitting}
                            buttonColor="#635393"
                        >
                            Actualizar Perfil
                        </Button>

                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate("ActualizarContrasena")}
                            style={styles.button}
                            buttonColor="#635393"
                        >
                            Actualizar Contraseña
                        </Button>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    formContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 12,
    },
    errorText: {
        color: "red",
        marginBottom: 10,
        marginLeft: 10,
    },
    button: {
        marginTop: 10,
    },
    fcmDescription: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 5,
        marginTop: 10,
    }
});

