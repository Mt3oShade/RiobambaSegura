import React, { useState, useEffect, useContext } from "react";
import { TextInput, Button, Appbar, IconButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import Notificacion from "./components/Notificacion";
import api from "../api/api";

export default function DenunciaScreen() {
    const { authState } = useContext(AuthContext);
    const { setLoading, setMessage } = useContext(AppContext);
    const navigation = useNavigation();

    const [marker, setMarker] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const [tipos, setTipos] = useState([]);
    const [subtipos, setSubtipos] = useState([]);

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const tipoDenuncia = watch("id_tipo");

    useEffect(() => {
        const fetchTipos = async () => {
            setLoading(true);
            try {
                const response = await api.get('/subtipos/tipos');
                const filteredTipos = response.data.filter(t => t.id_tipo === 2 || t.id_tipo === 3);
                setTipos(filteredTipos);
            } catch (error) {
                setMessage({ type: 'error', text: "Error al cargar tipos de solicitud." });
            } finally {
                setLoading(false);
            }
        };

        const getLocation = async () => {
            setLoading(true);
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setMessage({ type: 'error', text: "Permiso de ubicación denegado." });
                    return;
                }
                let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                const { latitude, longitude } = location.coords;
                setValue("puntoGPS", `${latitude},${longitude}`);
                setMarker({ latitude, longitude });
                setInitialRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            } catch (error) {
                setMessage({ type: 'error', text: "Error al obtener la ubicación." });
            } finally {
                setLoading(false);
            }
        };

        fetchTipos();
        getLocation();
    }, []);

    useEffect(() => {
        if (tipoDenuncia) {
            const fetchSubtipos = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/subtipos/tipos/${tipoDenuncia}/subtipos`);
                    setSubtipos(response.data);
                    setValue("id_subtipo", null); // Reset subtipo when tipo changes
                } catch (error) {
                    setMessage({ type: 'error', text: "Error al cargar subtipos de solicitud." });
                } finally {
                    setLoading(false);
                }
            };
            fetchSubtipos();
        } else {
            setSubtipos([]);
        }
    }, [tipoDenuncia]);

    const onSubmit = async (data) => {
        setLoading(true);
        const denunciaData = { ...data, id_persona: authState.user };
        try {
            await api.post('/solicitud/nuevaSolicitud', denunciaData);
            setMessage({ type: 'success', text: "Tu solicitud ha sido registrada con éxito." });
            navigation.navigate("MisDenuncias");
        } catch (error) {
            // Error is handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#635393'}}>
                <Appbar.Content title="Crear Solicitud" color="white"/>
                <IconButton
                    icon="clipboard-list-outline"
                    iconColor="white"
                    size={24}
                    onPress={() => navigation.navigate("MisDenuncias")}
                />
                <Notificacion/>
            </Appbar.Header>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {initialRegion ? (
                    <View style={styles.mapContainer}>
                        <MapView style={styles.map} region={initialRegion}>
                            {marker && <Marker coordinate={marker} title="Ubicación Actual" />}
                        </MapView>
                    </View>
                ) : <Text style={styles.loadingText}>Cargando mapa...</Text>}
                
                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="id_tipo"
                        rules={{ required: "Debes seleccionar un tipo" }}
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.pickerContainer, errors.id_tipo && styles.inputError]}>
                                <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                                    <Picker.Item label="Seleccione tipo de solicitud" value="" />
                                    {tipos.map((tipo) => (
                                        <Picker.Item key={tipo.id_tipo} label={tipo.descripcion} value={tipo.id_tipo} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    />
                    {errors.id_tipo && <Text style={styles.errorText}>{errors.id_tipo.message}</Text>}

                    <Controller
                        control={control}
                        name="id_subtipo"
                        rules={{ required: "Debes seleccionar un subtipo" }}
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.pickerContainer, errors.id_subtipo && styles.inputError]}>
                                <Picker selectedValue={value} onValueChange={onChange} style={styles.picker} enabled={subtipos.length > 0}>
                                    <Picker.Item label="Seleccione subtipo de solicitud" value="" />
                                    {subtipos.map((subtipo) => (
                                        <Picker.Item key={subtipo.id_subtipo} label={subtipo.descripcion} value={subtipo.id_subtipo} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    />
                    {errors.id_subtipo && <Text style={styles.errorText}>{errors.id_subtipo.message}</Text>}

                    <Controller
                        control={control}
                        name="observacion"
                        rules={{ required: "La descripción es obligatoria" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                             <TextInput
                                label="Agrega una observación o descripción"
                                mode="outlined"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                style={styles.input}
                                multiline
                                numberOfLines={3}
                            />
                        )}
                    />
                    {errors.observacion && <Text style={styles.errorText}>{errors.observacion.message}</Text>}
                   
                    <Controller
                        control={control}
                        name="direccion"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Referencia de ubicación (opcional)"
                                mode="outlined"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                style={styles.input}
                            />
                        )}
                    />
                    
                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.buttonDenuncia}
                        buttonColor="#635393"
                    >
                        Emitir solicitud
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    scrollContent: {
        padding: 10,
        flexGrow: 1,
    },
    mapContainer: {
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingText: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 16
    },
    formContainer: {
        paddingBottom: 20,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white'
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 4,
        marginBottom: 12,
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    picker: {
        height: 56,
        width: "100%",
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        marginTop: -8,
        marginLeft: 2
    },
    buttonDenuncia: {
        marginTop: 10,
        paddingVertical: 8,
    },
});
