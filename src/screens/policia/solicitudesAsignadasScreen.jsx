import React, { useState, useEffect, useContext, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    RefreshControl,
} from "react-native";
import { Appbar, TextInput, Button, Card, Title, Paragraph } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import api from "../../api/api";

const SolicitudesAsignadasScreen = () => {
    const { authState } = useContext(AuthContext);
    const { setLoading, setMessage } = useContext(AppContext);
    const navigation = useNavigation();

    const [allSolicitudes, setAllSolicitudes] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const obtenerSolicitudes = useCallback(async (isRefresh = false) => {
        if (!authState.user) return;
        if (!isRefresh) setLoading(true);
        try {
            const response = await api.get(`/persona/policia/${authState.user}`);
            if (response.data && response.data.solicitudes_asignadas) {
                const solicitudesEnProgreso = response.data.solicitudes_asignadas.filter(
                    (s) => s.estado === "En progreso"
                );
                const sorted = solicitudesEnProgreso.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
                setAllSolicitudes(sorted);
                setSolicitudes(sorted);
                setFiltro("");
            }
        } catch (error) {
            setMessage({ type: 'error', text: "No se pudieron cargar las solicitudes." });
        } finally {
            if (!isRefresh) setLoading(false);
        }
    }, [authState.user, setLoading, setMessage]);

    useEffect(() => {
        obtenerSolicitudes();
    }, [obtenerSolicitudes]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await obtenerSolicitudes(true);
        setRefreshing(false);
    }, [obtenerSolicitudes]);

    const aplicarFiltro = () => {
        const filteredSolicitudes = allSolicitudes.filter(
            (solicitud) =>
                solicitud.subtipo.toLowerCase().includes(filtro.toLowerCase()) ||
                solicitud.tipo_solicitud.toLowerCase().includes(filtro.toLowerCase())
        );
        setSolicitudes(filteredSolicitudes);
    };

    const limpiarFiltro = () => {
        setFiltro("");
        setSolicitudes(allSolicitudes);
    };
    
    const renderItem = ({ item }) => (
        <Card
            style={styles.solicitudItem}
            onPress={() => navigation.navigate("DenunciaDetailPolice", { denunciaId: item.id_solicitud })}
        >
            <Card.Content>
                <Title style={styles.solicitudTitulo}>{item.subtipo}</Title>
                <Paragraph style={styles.solicitudTipo}>{item.tipo_solicitud}</Paragraph>
                <Text style={styles.fechaText}>
                    Asignada: {new Date(item.fecha_creacion).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    label="Buscar por tipo o subtipo"
                    value={filtro}
                    onChangeText={setFiltro}
                    mode="outlined"
                    style={styles.searchInput}
                />
                <View style={styles.buttonContainer}>
                    <Button mode="contained" onPress={aplicarFiltro} style={styles.button} buttonColor="#635393">
                        Filtrar
                    </Button>
                    <Button mode="outlined" onPress={limpiarFiltro} style={styles.button} textColor="#635393" borderColor="#635393">
                        Limpiar
                    </Button>
                </View>
            </View>
            {solicitudes.length === 0 ? (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No hay solicitudes 'En Proceso' asignadas.</Text>
                </View>
            ) : (
                <FlatList
                    data={solicitudes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id_solicitud.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#635393"]} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    listContent: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    solicitudItem: {
        marginBottom: 12,
        borderRadius: 8,
    },
    solicitudTitulo: {
        fontSize: 17,
        fontWeight: "bold",
    },
    solicitudTipo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    fechaText: {
        fontSize: 12,
        color: "#888",
    },
    searchContainer: {
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchInput: {
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noDataText: {
        fontSize: 16,
        color: '#888'
    },
});

export default SolicitudesAsignadasScreen;
