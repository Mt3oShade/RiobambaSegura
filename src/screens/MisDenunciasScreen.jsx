import React, { useState, useEffect, useContext, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { Appbar, TextInput, Button, Card, Title, Paragraph } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import api from "../api/api";

const MisDenunciasScreen = () => {
    const { authState } = useContext(AuthContext);
    const { setLoading, setMessage } = useContext(AppContext);
    const navigation = useNavigation();

    const [allDenuncias, setAllDenuncias] = useState([]);
    const [denuncias, setDenuncias] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const obtenerDenuncias = useCallback(async (isRefresh = false) => {
        if (!authState.user) return;
        if (!isRefresh) setLoading(true);
        try {
            const response = await api.get(`/persona/ciudadano/${authState.user}`);
            if (response.data && response.data.solicitudes_creadas) {
                const sortedDenuncias = response.data.solicitudes_creadas.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
                setAllDenuncias(sortedDenuncias);
                setDenuncias(sortedDenuncias);
                setFiltro("");
            }
        } catch (error) {
            setMessage({ type: 'error', text: "No se pudieron cargar las denuncias." });
        } finally {
            if (!isRefresh) setLoading(false);
        }
    }, [authState.user, setLoading, setMessage]);

    useEffect(() => {
        obtenerDenuncias();
    }, [obtenerDenuncias]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await obtenerDenuncias(true);
        setRefreshing(false);
    }, [obtenerDenuncias]);

    const aplicarFiltro = () => {
        const filteredDenuncias = allDenuncias.filter(
            (denuncia) =>
                denuncia.subtipo.toLowerCase().includes(filtro.toLowerCase()) ||
                denuncia.tipo_solicitud.toLowerCase().includes(filtro.toLowerCase())
        );
        setDenuncias(filteredDenuncias);
    };

    const limpiarFiltro = () => {
        setFiltro("");
        setDenuncias(allDenuncias);
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'Pendiente': return '#3498db';
            case 'En progreso': return '#f1c40f';
            case 'Resuelto': return '#2ecc71';
            case 'Falso': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const renderItem = ({ item }) => (
    <Card
        style={styles.denunciaItem}
        onPress={() => {
        if (authState.role?.includes(3)) {
            navigation.navigate("DenunciaDetailPolice", { denunciaId: item.id_solicitud });
        } else {
            navigation.navigate("DenunciaDetail", { denunciaId: item.id_solicitud });
        }
        }}
    >
        <Card.Content>
        <View style={styles.cardHeader}>
            <Title style={styles.denunciaTitulo}>{item.subtipo}</Title>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
            <Text style={styles.statusText}>{item.estado}</Text>
            </View>
        </View>
        <Paragraph style={styles.denunciaTipo}>{item.tipo_solicitud}</Paragraph>
        <Text style={styles.fechaText}>
            {new Date(item.fecha_creacion).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
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
            {denuncias.length === 0 ? (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No se encontraron solicitudes.</Text>
                </View>
            ) : (
                <FlatList
                    data={denuncias}
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
    denunciaItem: {
        marginBottom: 12,
        borderRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    denunciaTitulo: {
        fontSize: 17,
        fontWeight: "bold",
        flex: 1,
        marginRight: 8
    },
    denunciaTipo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    statusText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    fechaText: {
        marginTop: 5,
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
    }
});

export default MisDenunciasScreen;
