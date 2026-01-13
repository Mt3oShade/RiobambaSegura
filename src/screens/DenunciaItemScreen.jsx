import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Card, Title, Paragraph } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../api/api";
import { AppContext } from "../context/AppContext";

const getStatusColor = (estado) => {
  switch (estado) {
    case 'Pendiente': return '#3498db';
    case 'En progreso': return '#f1c40f';
    case 'Resuelto': return '#2ecc71';
    case 'Falso': return '#e74c3c';
    default: return '#95a5a6';
  }
};

const DenunciaItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setMessage } = useContext(AppContext);
  const { denunciaId } = route.params;

  const [denuncia, setDenuncia] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const obtenerDetalleDenuncia = async () => {
      setLoadingData(true);
      try {
        const response = await api.get(`/solicitud/${denunciaId}`);
        setDenuncia(response.data);
      } catch (error) {
        setMessage({ type: 'error', text: 'No se pudo obtener el detalle de la solicitud.' });
        navigation.goBack();
      } finally {
        setLoadingData(false);
      }
    };
    obtenerDetalleDenuncia();
  }, [denunciaId, setMessage, navigation]);

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" color="#635393" />
        <Text style={styles.loadingText}>Cargando detalle...</Text>
      </View>
    );
  }

  if (!denuncia) {
    return (
      <View style={styles.center}>
      <Text style={styles.errorText}>No se encontró la solicitud.</Text>
    </View>
    );
  }

  // === Helper: emoji según autor ===
  const getAuthorEmoji = (persona) => {
    if (!persona || !denuncia.policia_asignado) return '👤';
    return persona.id_persona === denuncia.policia_asignado.id_persona ? '👮' : '👤';
  };

  // === Render: Observación ===
  const renderObservacion = ({ item }) => (
    <View style={styles.logEntry}>
      <Text style={styles.logAuthor}>
        {getAuthorEmoji(item.persona)}{' '}
        <Text style={styles.bold}>
          {item.persona?.nombres || ''} {item.persona?.apellidos || ''}
        </Text>
      </Text>
      <Text style={styles.logDate}>
        {new Date(item.fecha).toLocaleString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <Paragraph style={styles.logContent}>"{item.observacion}"</Paragraph>
    </View>
  );

  // === Render: Evento ===
  const renderEvento = ({ item }) => (
    <View style={styles.logEntry}>
      <Text style={styles.logAuthor}>
        {getAuthorEmoji(item.persona)}{' '}
        <Text style={styles.bold}>
          {item.persona?.nombres || ''} {item.persona?.apellidos || ''}
        </Text>
      </Text>
      <Text style={styles.logDate}>
        {new Date(item.fecha_creacion).toLocaleString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <Paragraph style={styles.logContent}>"{item.id_evento}"</Paragraph>
    </View>
  );

  // === Dirección alternativa ===
  const displayAddress =
    denuncia.direccion ||
    'Sin dirección proporcionada';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* === Tarjeta principal: datos básicos === */}
      <Card style={styles.mainCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.mainTitle}>{denuncia.subtipo || "Sin subtipo"}</Title>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(denuncia.estado) }]}>
              <Text style={styles.statusText}>{denuncia.estado}</Text>
            </View>
          </View>
          <Paragraph style={styles.subtitle}>{denuncia.tipo}</Paragraph>
          <Text style={styles.detailText}>
            Creada: {new Date(denuncia.fecha_creacion).toLocaleString('es-ES', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </Text>
          <Text style={styles.address}>{displayAddress}</Text>
        </Card.Content>
      </Card>

      {/* === Sección: Ubicación del Incidente === */}
      {denuncia.puntoGPS && (
        <>
          <Text style={styles.sectionHeader}>Ubicación del Incidente</Text>
          <View style={styles.mapContainer}>
            {(() => {
              const [lat, lng] = denuncia.puntoGPS.split(',').map(Number);
              const region = { latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 };
              return (
                <MapView style={styles.map} region={region} scrollEnabled={false} zoomEnabled={true}>
                  <Marker coordinate={region} />
                </MapView>
              );
            })()}
          </View>
        </>
      )}

      {/* === Sección: Observaciones === */}
      <Text style={styles.sectionHeader}>Observaciones</Text>
      {denuncia.Observacions?.length > 0 ? (
        <FlatList
          data={denuncia.Observacions}
          renderItem={renderObservacion}
          keyExtractor={(obs) => obs.id_observacion?.toString() || obs.fecha}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No hay observaciones registradas.</Text>
      )}

      {/* === Sección: Registro de Eventos === */}
      <Text style={styles.sectionHeader}>Registro de Eventos</Text>
      {denuncia.SolicitudEventoPersonas?.length > 0 ? (
        <FlatList
          data={denuncia.SolicitudEventoPersonas}
          renderItem={renderEvento}
          keyExtractor={(evt) => evt.id_solicitud_evento?.toString() || evt.fecha_creacion}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No existen eventos registrados.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginHorizontal: 20,
  },

  // === Tarjeta principal ===
  mainCard: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#222',
    lineHeight: 20,
  },

  // === Encabezados de sección ===
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginVertical: 12,
    marginLeft: 4,
  },

  // === Mapa ===
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  map: {
    width: '100%',
    height: '100%',
  },

  // === Listas (observaciones / eventos) ===
  listContainer: {
    paddingBottom: 8,
  },
  logEntry: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  logAuthor: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  logDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },
  logContent: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 14,
  },
});

export default DenunciaItemScreen;