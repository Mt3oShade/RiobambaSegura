import React from "react";
import { Image, ScrollView, StyleSheet, View, Text } from "react-native";
import { Appbar, Card, Title, Paragraph } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const developers = [
  { id: 1, name: "Kevin Colcha", email: "kevin.colcha@espoch.edu.ec", role: "Frontend & Mobile Lead", image: require("../../assets/develop1.png") },
  { id: 2, name: "Anthony Córdova", email: "anthony.cordova@espoch.edu.ec", role: "Backend Lead", image: require("../../assets/develop2.png") },
  { id: 3, name: "Cristian Cuchipe", email: "cristian.cuchipe@espoch.edu.ec", role: "Mobile Developer", image: require("../../assets/develop3.png") },
  { id: 4, name: "Danny Poma", email: "danny.poma@espoch.edu.ec", role: "Fullstack Developer", image: require("../../assets/develop4.png") },
];

const DevsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content style={styles.contentCenter}>
            <Image source={require("../../assets/logoEspoch.png")} style={styles.logo} />
            <Title style={styles.mainTitle}>Escuela Superior Politécnica de Chimborazo</Title>
            <Paragraph style={styles.paragraph}>Facultad de Informática y Electrónica</Paragraph>
            <Paragraph style={styles.paragraph}>Ingeniería de Software</Paragraph>
            <Image source={require("../../assets/logoFie.png")} style={styles.logo} />
          </Card.Content>
        </Card>

        <Title style={styles.devsTitle}>EQUIPO DE DESARROLLO</Title>
        <View style={styles.developersContainer}>
          {developers.map((dev) => (
            <Card key={dev.id} style={styles.cardDev}>
              <Card.Cover source={dev.image} style={styles.avatar} />
              <Card.Content style={styles.contentCenter}>
                <Title style={styles.devName}>{dev.name}</Title>
                <Paragraph style={styles.devRole}>{dev.role}</Paragraph>
                <Paragraph style={styles.devEmail}>{dev.email}</Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Card style={styles.card}>
            <Card.Content style={styles.contentCenter}>
                <Image source={require("../../assets/Escudo_Policia.jpg")} style={styles.logo} />
                <Title style={styles.mainTitle}>Policía Nacional del Ecuador</Title>
                <Paragraph style={styles.paragraph}>
                    Proyecto de Vinculación en colaboración con la UPC de la ciudad de Riobamba.
                </Paragraph>
            </Card.Content>
        </Card>

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
  },
  cardDev: {
    width: "48%",
    marginBottom: 15,
    elevation: 3,
  },
  contentCenter: {
    alignItems: "center",
    padding: 10,
  },
  mainTitle: {
    textAlign: "center",
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  devsTitle: {
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 15,
      color: '#343a40'
  },
  paragraph: {
    textAlign: "center",
    color: '#6c757d'
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: 10,
  },
  developersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  avatar: {
      height: 140,
  },
  devName: {
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 8,
  },
  devRole: {
      fontSize: 13,
      textAlign: 'center',
      color: '#635393',
      fontWeight: '600'
  },
  devEmail: {
      fontSize: 11,
      textAlign: 'center',
      color: '#6c757d'
  }
});

export default DevsScreen;
