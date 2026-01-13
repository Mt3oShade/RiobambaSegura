import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { registerForPushNotificationsAsync, sendTokenToBackend } from "../utils/notifications";
import LoadingModal from "./components/LoadingModal";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const { setMessage } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const success = await login(data);
      if (success) {
        setMessage({ type: "success", text: "Inicio de sesión exitoso." });

        const fcmToken = await registerForPushNotificationsAsync();
        if (fcmToken) {
          await sendTokenToBackend(fcmToken);
        }

      } else {
        // Error message is handled by the login function via interceptor
      }
    } catch (error) {
      console.error("Error en onSubmit de Login:", error);
      setMessage({ type: "error", text: "Ocurrió un problema inesperado al iniciar sesión." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("RecuperarCuenta");
  };

  const handleRegistro = () => {
    navigation.navigate("Registro");
  };

  return (
    <>
      <LoadingModal visible={loading} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Image
            source={require("../../assets/Escudo_Policia.jpg")}
            style={styles.logo}
          />
          <Text style={styles.title}>Inicio de Sesión</Text>

          <Controller
            control={control}
            name="email"
            rules={{ required: "El email es obligatorio" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                activeOutlineColor="#635393"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            rules={{ required: "La contraseña es obligatoria" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Contraseña"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                autoCapitalize="none"
                style={styles.input}
                activeOutlineColor="#635393"
              />
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}
          
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            buttonColor="#635393"
          >
            Ingresar
          </Button>

          <View style={styles.bottomLinks}>
            <Button onPress={handleRegistro} textColor="#635393">
              Registrarse
            </Button>
            <Button onPress={handleForgotPassword} textColor="#635393">
              ¿Olvidaste tu contraseña?
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
  },
  formContainer: {
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 2,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default LoginScreen;