// Notificacion.jsx (versión mínima funcional)
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { IconButton, Menu } from "react-native-paper";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const Notificacion = () => {
  const [visible, setVisible] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  const cargarNotificaciones = async () => {
    const token = await SecureStore.getItemAsync("auth-token");
    if (!token) return;

    try {
      const API_URL = Constants.expoConfig?.extra?.API_URL;
      const res = await fetch(`${API_URL}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotificaciones(await res.json());
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const openMenu = async () => {
    await cargarNotificaciones();
    setVisible(true);
  };

  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <IconButton icon="bell" color="#fff" size={24} onPress={openMenu} />
      }
    >
      <View style={{ marginTop: 30, maxHeight: 250 }}>
        {notificaciones.length > 0 ? (
          notificaciones.map((n, i) => (
            <Menu.Item key={i} title={n.titulo || n.title} />
          ))
        ) : (
          <Menu.Item title="No hay notificaciones" />
        )}
      </View>
    </Menu>
  );
};

export default Notificacion;