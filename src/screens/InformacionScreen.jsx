import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Card, Title, Paragraph } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const sections = [
    {
        title: "Botón de Emergencia",
        content: "Permite acceder rápidamente a funciones de emergencia, enviando tu ubicación a las autoridades.",
        image: require("../../assets/sos_home.png"),
    },
    {
        title: "Panel de Denuncia",
        content: "Permite seleccionar tipo de denuncia, ubicación y adjuntar fotos. Envía la denuncia para ser vista por las autoridades.",
        image: require("../../assets/denuncia.jpg"),
    },
    {
        title: "Lista de Denuncias",
        content: "Muestra una lista con filtros para ver y detallar las denuncias realizadas.",
        image: require("../../assets/denuncias.png"),
    },
    {
        title: "Perfil de Usuario",
        content: "Permite configurar y editar tu perfil de usuario, así como cambiar tu contraseña.",
        image: require("../../assets/perfil.png"),
    }
];

const InformacionScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sections.map((section, index) => (
            <Card key={index} style={styles.card}>
                <Card.Cover source={section.image} style={styles.image} />
                <Card.Content>
                    <Title style={styles.title}>{section.title}</Title>
                    <Paragraph style={styles.paragraph}>{section.content}</Paragraph>
                </Card.Content>
            </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: 'white',
  },
  image: {
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
      fontWeight: 'bold',
      marginTop: 10,
      color: '#343a40'
  },
  paragraph: {
      fontSize: 14,
      color: '#6c757d',
      lineHeight: 20,
  }
});

export default InformacionScreen;
