import React from 'react';
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const MisServiciosScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
            <Text style={styles.title}>Mis Servicios</Text>
            <Text style={styles.subtitle}>Esta sección está en desarrollo.</Text>
            <Text style={styles.text}>
                Aquí podrás ver y gestionar los servicios que has solicitado, como la vigilancia de domicilio o el encargo de domicilio.
            </Text>
        </View>
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
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  }
});

export default MisServiciosScreen;
