import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import { Card } from "react-native-paper";
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

// Configuración
const ITEMS_PER_PAGE = 10; // Ajusta según necesidad

const ResumenActividadScreen = () => {
    const [policiaData, setPoliciaData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { authState } = useContext(AuthContext);
    const { setMessage } = useContext(AppContext);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchPoliciaData = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/persona/policia/${authState.user}`
                );
                setPoliciaData(response.data);
                setCurrentPage(1); // Reiniciar a la primera página al cargar nuevos datos
            } catch (error) {
                setMessage({ text: "No se pudo cargar la información", type: "error" });
                console.error("Error fetching data:", error);
            }
        };

        if (authState.user) {
            fetchPoliciaData();
        }
    }, [authState.user]);

    const handleNavigateToDetail = (denunciaId) => {
        navigation.navigate("DenunciaDetailPolice", { denunciaId });
    };

    if (!policiaData) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    // Paginación de solicitudes
    const totalItems = policiaData.solicitudes_asignadas.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentSolicitudes = policiaData.solicitudes_asignadas.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // Manejadores de navegación
    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Resumen por tipo */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Resumen de Solicitudes Asignadas</Text>
                    {Object.entries(policiaData.resumen_solicitudes_asignadas).map(([tipo, cantidad], index, array) => (
                        <View key={tipo} style={[
                            styles.tableRow,
                            index < array.length - 1 && styles.dividerBelow // Solo si no es el último
                        ]}>
                            <Text style={styles.labelText}>{tipo}</Text>
                            <Text style={styles.valueText}>{cantidad}</Text>
                        </View>
                    ))}
                </Card.Content>
            </Card>

            {/* Total general */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Total de Solicitudes</Text>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{policiaData.total_solicitudes}</Text>
                    </View>
                </Card.Content>
            </Card>

            {/* Solicitud más resuelta */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Solicitud Más Resuelta</Text>
                    <View style={styles.highlightRow}>
                        <Text style={styles.highlightLabel}>{policiaData.solicitud_mas_resuelta}</Text>
                        <Text style={styles.highlightValue}>
                            {policiaData.resumen_solicitudes_asignadas[policiaData.solicitud_mas_resuelta]}
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            {/* Lista de solicitudes asignadas con paginación */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Solicitudes Asignadas</Text>
                    {currentSolicitudes.length > 0 ? (
                        currentSolicitudes.map((solicitud, index) => (
                            <TouchableOpacity
                                key={solicitud.id_solicitud}
                                onPress={() => handleNavigateToDetail(solicitud.id_solicitud)}
                                style={[
                                    styles.listItem,
                                    index < currentSolicitudes.length - 1 && styles.listItemDivider
                                ]}
                            >
                                <View style={styles.row}>
                                    <Text style={styles.idText}>#{solicitud.id_solicitud}</Text>
                                    <Text style={[
                                        styles.estadoText,
                                        solicitud.estado === "Resuelto" && styles.estadoResuelto,
                                        solicitud.estado === "Falso" && styles.estadoFalso,
                                        solicitud.estado === "En progreso" && styles.estadoProgreso,
                                        solicitud.estado === "Asignada" && styles.estadoAsignada,
                                    ]}>
                                        {solicitud.estado}
                                    </Text>
                                    <Text style={styles.subtipoText}>{solicitud.subtipo}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No hay solicitudes asignadas.</Text>
                    )}

                    {/* Controles de paginación */}
                    {totalPages > 1 && (
                        <View style={styles.paginationContainer}>
                            <TouchableOpacity
                                onPress={goToPreviousPage}
                                disabled={currentPage === 1}
                                style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                            >
                                <Text style={styles.pageButtonText}>Anterior</Text>
                            </TouchableOpacity>

                            <Text style={styles.pageInfo}>
                                Página {currentPage} de {totalPages}
                            </Text>

                            <TouchableOpacity
                                onPress={goToNextPage}
                                disabled={currentPage === totalPages}
                                style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                            >
                                <Text style={styles.pageButtonText}>Siguiente</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 20,
        backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    loadingText: {
        fontSize: 16,
        color: "#888",
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#eee",
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#333",
        marginBottom: 12,
        textAlign: "center",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    dividerBelow: {
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 8,
        marginBottom: 8,
    },
    labelText: {
        fontSize: 14,
        color: "#555",
        fontWeight: "600",
    },
    valueText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "700",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 4,
        backgroundColor: "#f0f0ff",
        borderRadius: 8,
    },
    totalLabel: {
        fontSize: 15,
        paddingLeft: 10,
        fontWeight: "600",
        color: "#635393",
    },
    totalValue: {
        fontSize: 16,
        paddingRight: 10,
        fontWeight: "700",
        color: "#635393",
    },
    highlightRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 4,
        backgroundColor: "#fff8e1",
        borderRadius: 8,
    },
    highlightLabel: {
        fontSize: 14,
        paddingLeft: 10,
        fontWeight: "600",
        color: "#5d4037",
    },
    highlightValue: {
        fontSize: 15,
        paddingRight: 10,
        fontWeight: "700",
        color: "#5d4037",
    },
    listItem: {
        paddingVertical: 10,
        paddingHorizontal: 6,
    },
    listItemDivider: {
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    idText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    subtipoText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
        flex: 2,
        textAlign: "right",
    },
    estadoText: {
        fontSize: 12,
        fontWeight: "600",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        color: "#fff",
    },
    estadoResuelto: {
        backgroundColor: "#4caf50",
    },
    estadoFalso: {
        backgroundColor: "#f44336",
    },
    estadoProgreso: {
        backgroundColor: "#2196f3",
    },
    estadoAsignada: {
        backgroundColor: "#ff9800",
    },
    noDataText: {
        fontSize: 14,
        color: "#888",
        fontStyle: "italic",
        textAlign: "center",
        paddingVertical: 10,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    pageButton: {
        backgroundColor: "#635393",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },
    pageButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    pageInfo: {
        fontSize: 14,
        color: "#555",
        fontWeight: "600",
    },
});

export default ResumenActividadScreen;