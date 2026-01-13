import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { Appbar, Card, Title, Paragraph } from "react-native-paper";
import Notificacion from "./components/Notificacion";
import { useNavigation } from "@react-navigation/native";

const menuItems = [
  {
    key: "misDenuncias",
    title: "Mis Solicitudes",
    image: require("../../assets/escudo_home.png"),
    text: "Solicitudes realizadas",
    screen: "MisDenuncias",
  },
  {
    key: "realizarSolicitud",
    title: "Realizar Solicitud",
    image: require("../../assets/denuncia.jpg"),
    text: "Denuncias y servicios",
    screen: "Denuncia",
  },
  {
    key: "emergencia",
    title: "Emergencia",
    image: require("../../assets/sos_home.png"),
    text: "Botón de Seguridad",
    screen: "Emergencia",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#635393' }}>
        <Appbar.Content title="UPC - Digital" color="white" />
        <Notificacion />
        {/* Aquí puedes re-agregar el botón de notificaciones si es necesario */}
      </Appbar.Header>

      <View style={styles.cardsContainer}>
        <View style={styles.row}>
          {menuItems.slice(0, 2).map((item) => (
            <Card key={item.key} style={styles.card}>
              <Pressable style={styles.pressable} onPress={() => handlePress(item.screen)}>
                <Title style={styles.cardTitle}>{item.title}</Title>
                <Image source={item.image} style={styles.image} resizeMode="contain" />
                <Paragraph style={styles.cardText}>{item.text}</Paragraph>
              </Pressable>
            </Card>
          ))}
        </View>

        <View style={styles.row}>
          {menuItems.slice(2, 3).map((item) => (
            <Card key={item.key} style={styles.card}>
              <Pressable style={styles.pressable} onPress={() => handlePress(item.screen)}>
                <Title style={styles.cardTitle}>{item.title}</Title>
                <Image source={item.image} style={styles.image} resizeMode="contain" />
                <Paragraph style={styles.cardText}>{item.text}</Paragraph>
              </Pressable>
            </Card>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: "white",
  },
  pressable: {
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  cardText: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    minHeight: 30, 
  },
});
