import React, { useState, useEffect, useContext } from "react";
import { Appbar, Card, Title, Paragraph, Button } from "react-native-paper";
import * as Location from "expo-location";
import {
    StyleSheet,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function EmergenciaScreen() {
    const { authState } = useContext(AuthContext);
    const { setLoading, setMessage } = useContext(AppContext);
    const [ubicacion, setUbicacion] = useState(null);
    const [marker, setMarker] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const navigation = useNavigation();

    const getLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setMessage({
                    text: "Se necesita el permiso de ubicación para esta funcionalidad.",
                    type: "error",
                });
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
                maximumAge: 10000,
                timeout: 5000,
            });

            const { latitude, longitude } = location.coords;
            const newLocation = { latitude, longitude };
            setUbicacion(newLocation);
            setMarker(newLocation);
            setInitialRegion({
                ...newLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        } catch (error) {
            console.error("Error al obtener la ubicación:", error);
            setMessage({
                text: "No se pudo obtener la ubicación. Inténtelo nuevamente.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (!ubicacion) {
                setMessage({ text: "No se ha podido obtener la ubicación actual.", type: "error" });
                setLoading(false);
                return;
            }

            const { latitude, longitude } = ubicacion;
            const puntoGPS = `${latitude},${longitude}`;

            const emergenciaData = {
                id_persona: authState.user,
                puntoGPS: puntoGPS,
            };

            const response = await axios.post(
                `${API_URL}/solicitud/nuevoBotonEmergencia`,
                emergenciaData
            );

            if (response.status === 201) {
                setMessage({ text: "La alerta de emergencia ha sido enviada.", type: "success" });
            } else {
                setMessage({ text: "Hubo un problema al enviar la alerta.", type: "error" });
            }
        } catch (error) {
            console.error("Error al enviar la alerta de emergencia:", error);
            setMessage({ text: "No se pudo enviar la alerta de emergencia.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {!authState.role?.includes(3) && (
                <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="EMERGENCIA" />
                </Appbar.Header>
            )}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.mapContainer}>
                    {initialRegion ? (
                        <MapView style={styles.map} region={initialRegion}>
                            {marker && (
                                <Marker
                                    coordinate={marker}
                                    title="Ubicación Actual"
                                    description="Esta es tu ubicación actual"
                                />
                            )}
                        </MapView>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <Paragraph>Cargando mapa...</Paragraph>
                        </View>
                    )}
                </View>
                <View style={styles.formContainer}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.title}>BOTÓN DE EMERGENCIA</Title>
                            <Paragraph style={styles.paragraph}>
                                Pulsa para emitir una alerta de emergencia a las autoridades.
                            </Paragraph>
                            <TouchableOpacity onPress={handleSubmit}>
                                <Image
                                    source={require("../../assets/sos_home.png")}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                style={styles.button}
                                buttonColor="#C42424" 
                            >
                                Enviar Alerta
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        padding: 10,
        flexGrow: 1,
    },
    mapContainer: {
        height: 270,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#e9ecef',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    card: {
        width: "95%",
        borderRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        textAlign: "center",
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#343a40',
    },
    paragraph: {
        textAlign: "center",
        marginBottom: 20,
        color: '#6c757d',
    },
    image: {
        width: "100%",
        height: 150,
        alignSelf: 'center',
    },
    button: {
        marginTop: 20,
    }
});
