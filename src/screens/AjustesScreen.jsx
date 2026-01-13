import React, { useContext } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { Appbar, Card, Title, Paragraph } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

const menuItems = [
    {
        key: "miPerfil",
        title: "Mi Perfil",
        image: require("../../assets/perfil.png"),
        text: "Ajustes de mi perfil",
        screen: "MiPerfil",
    },
    {
        key: "informacion",
        title: "Información",
        image: require("../../assets/informacion_home.png"),
        text: "Guía de la app",
        screen: "Informacion",
    },
    /*
    {
        key: "devs",
        title: "Desarrolladores",
        image: require("../../assets/devs.png"),
        text: "Equipo de desarrollo",
        screen: "Devs",
    },
    */
    {
        key: "logout",
        title: "Cerrar Sesión",
        image: require("../../assets/logOut_icono.png"),
        text: "Salir de la aplicación",
        action: "logout",
    },
];

export default function AjustesScreen() {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);

    const handlePress = (item) => {
        if (item.action === "logout") {
            logout();
            // App navigator se encargará de redirigir a Login
        } else {
            navigation.navigate(item.screen);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: '#635393' }}>
                <Appbar.Content title="Ajustes y Más" color="white" />
            </Appbar.Header>

            <View style={styles.cardsContainer}>
                <View style={styles.row}>
                    {menuItems.slice(0, 2).map((item) => (
                        <Card key={item.key} style={styles.card}>
                            <Pressable style={styles.pressable} onPress={() => handlePress(item)}>
                                <Title style={styles.cardTitle}>{item.title}</Title>
                                <Image source={item.image} style={styles.image} resizeMode="contain" />
                                <Paragraph style={styles.cardText}>{item.text}</Paragraph>
                            </Pressable>
                        </Card>
                    ))}
                </View>

                <View style={styles.row}>
                    {menuItems.slice(2, 4).map((item) => (
                        <Card key={item.key} style={item.key === 'logout' ? [styles.card, styles.logoutCard] : styles.card}>
                             <Pressable style={styles.pressable} onPress={() => handlePress(item)}>
                                <Title style={item.key === 'logout' ? [styles.cardTitle, styles.logoutTitle] : styles.cardTitle}>{item.title}</Title>
                                <Image source={item.image} style={styles.image} resizeMode="contain" />
                                <Paragraph style={item.key === 'logout' ? [styles.cardText, styles.logoutText] : styles.cardText}>{item.text}</Paragraph>
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
  logoutCard: {
      backgroundColor: '#FFF1F0',
      borderColor: '#FFD6D2',
      borderWidth: 1,
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
  logoutTitle: {
      color: '#D9342B'
  },
  cardText: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    minHeight: 30,
  },
  logoutText: {
      color: '#D9342B'
  }
});
