import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Button, TextInput, Title, Paragraph } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import api from "../../api/api";

const getStatusColor = (estado) => {
  switch (estado) {
    case 'Pendiente': return '#3498db';
    case 'En progreso': return '#f1c40f';
    case 'Resuelto': return '#2ecc71';
    case 'Falso': return '#e74c3c';
    default: return '#95a5a6';
  }
};

const DenunciaItemPoliceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { authState } = useContext(AuthContext);
  const { setLoading, setMessage } = useContext(AppContext);

  const { denunciaId } = route.params;
  const [denuncia, setDenuncia] = useState(null);
  const [modalCerrarVisible, setModalCerrarVisible] = useState(false);
  const [modalObservacionVisible, setModalObservacionVisible] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { control: controlObs, handleSubmit: handleSubmitObs, reset: resetObs } = useForm();
  const { control: controlCierre, handleSubmit: handleSubmitCierre, reset: resetCierre } = useForm();

  const obtenerDetalleDenuncia = useCallback(async () => {
    setLoadingData(true);
    try {
      const response = await api.get(`/solicitud/${denunciaId}`);
      setDenuncia(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'No se pudo obtener el detalle.' });
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  }, [denunciaId, setMessage, navigation]);

  useEffect(() => {
    obtenerDetalleDenuncia();
  }, [denunciaId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await obtenerDetalleDenuncia();
    setRefreshing(false);
  }, [obtenerDetalleDenuncia]);

  const handleCerrarSolicitud = async (data) => {
    setLoading(true);
    try {
      await api.post('/solicitud/cerrarSolicitud', {
        id_solicitud: denunciaId,
        observacion: data.observacionCierre,
        estado_cierre: data.estado_cierre,
      });
      setMessage({ type: 'success', text: 'La solicitud se ha cerrado.' });
      setModalCerrarVisible(false);
      resetCierre();
      obtenerDetalleDenuncia();
    } catch (error) { /* handled by interceptor */ }
    finally { setLoading(false); }
  };

  const handleAgregarObservacion = async (data) => {
    setLoading(true);
    try {
      await api.post('/solicitud/agregarObservacion', {
        id_solicitud: denunciaId,
        observacion: data.observacionNueva,
        id_persona: authState.user,
      });
      setMessage({ type: 'success', text: 'Observación agregada.' });
      setModalObservacionVisible(false);
      resetObs();
      obtenerDetalleDenuncia();
    } catch (error) { /* handled by interceptor */ }
    finally { setLoading(false); }
  };

  // === Helper: emoji según autor ===
  const getAuthorEmoji = (persona) => {
    if (!persona || !denuncia?.policia_asignado) return '👤';
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

  const displayAddress = denuncia?.direccion || 'Sin dirección proporcionada';

  if (loadingData && !denuncia) {
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

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#635393']} />
      }
    >
      {/* === Tarjeta principal === */}
      <View style={styles.mainCard}>
        <View style={styles.headerRow}>
          <Title style={styles.mainTitle}>{denuncia.subtipo || "Sin subtipo"}</Title>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(denuncia.estado) }]}>
            <Text style={styles.statusText}>{denuncia.estado || "Desconocido"}</Text>
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
      </View>

      {/* === Ubicación del Incidente === */}
      {denuncia.puntoGPS && (
        <>
          <Text style={styles.sectionHeader}>Ubicación del Incidente</Text>
          <View style={styles.mapContainer}>
            {(() => {
              const [lat, lng] = denuncia.puntoGPS.split(',').map(Number);
              const region = { latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 };
              return (
                <MapView
                  style={styles.map}
                  region={region}
                  scrollEnabled={false}
                  zoomEnabled={true}
                  toolbarEnabled={false}
                >
                  <Marker coordinate={region} />
                </MapView>
              );
            })()}
          </View>
        </>
      )}

      {/* === Acciones Policiales === */}
      <Text style={styles.sectionHeader}>Acciones Policiales</Text>
      <View style={styles.actionsContainer}>
        {denuncia.estado === "En progreso" && (
          <Button
            mode="contained"
            buttonColor="#635393"
            style={styles.actionButton}
            onPress={() => setModalCerrarVisible(true)}
          >
            Cerrar Solicitud
          </Button>
        )}
        <Button
          mode="outlined"
          textColor="#635393"
          style={styles.actionButton}
          onPress={() => setModalObservacionVisible(true)}
        >
          Agregar Observación
        </Button>
      </View>

      {/* === Observaciones === */}
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

      {/* === Registro de Eventos === */}
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

      {/* === MODAL: Cerrar Solicitud === */}
      <Modal visible={modalCerrarVisible} transparent animationType="fade" onRequestClose={() => setModalCerrarVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Cerrar Solicitud</Title>
            <Controller
              control={controlCierre}
              name="estado_cierre"
              defaultValue="Resuelto"
              render={({ field: { onChange, value } }) => (
                <View style={styles.estadoContainer}>
                  <Button
                    mode={value === 'Resuelto' ? 'contained' : 'outlined'}
                    onPress={() => onChange('Resuelto')}
                    style={{ flex: 1, marginRight: 5 }}
                    buttonColor={value === 'Resuelto' ? '#2ecc71' : undefined}
                    textColor={value === 'Resuelto' ? '#fff' : '#2ecc71'}
                  >
                    Resuelto
                  </Button>
                  <Button
                    mode={value === 'Falso' ? 'contained' : 'outlined'}
                    onPress={() => onChange('Falso')}
                    style={{ flex: 1, marginLeft: 5 }}
                    buttonColor={value === 'Falso' ? '#e74c3c' : undefined}
                    textColor={value === 'Falso' ? '#fff' : '#e74c3c'}
                  >
                    Falso
                  </Button>
                </View>
              )}
            />
            <Controller
              control={controlCierre}
              name="observacionCierre"
              rules={{ required: "La observación es obligatoria." }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    label="Observación de Cierre"
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
            <Button
              mode="contained"
              onPress={handleSubmitCierre(handleCerrarSolicitud)}
              buttonColor="#635393"
              style={styles.modalButton}
            >
              Confirmar Cierre
            </Button>
            <Button mode="text" onPress={() => setModalCerrarVisible(false)} textColor="#635393">
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>

      {/* === MODAL: Agregar Observación === */}
      <Modal visible={modalObservacionVisible} transparent animationType="fade" onRequestClose={() => setModalObservacionVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Agregar Observación</Title>
            <Controller
              control={controlObs}
              name="observacionNueva"
              rules={{ required: "La observación no puede estar vacía." }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    label="Nueva Observación"
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
            <Button
              mode="contained"
              onPress={handleSubmitObs(handleAgregarObservacion)}
              buttonColor="#635393"
              style={styles.modalButton}
            >
              Agregar
            </Button>
            <Button mode="text" onPress={() => setModalObservacionVisible(false)} textColor="#635393">
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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

  // === Secciones ===
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginVertical: 16,
    marginLeft: 4,
  },

  // === Mapa ===
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  map: {
    width: '100%',
    height: '100%',
  },

  // === Acciones ===
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 10,
  },

  // === Listas ===
  listContainer: {
    paddingBottom: 8,
  },
  logEntry: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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

  // === Modales ===
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  estadoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  modalButton: {
    marginTop: 10,
    marginBottom: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default DenunciaItemPoliceScreen;