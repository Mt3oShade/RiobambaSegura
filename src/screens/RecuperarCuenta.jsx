import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import api from '../api/api';

const RecuperarCuenta = () => {
  const { setLoading, setMessage } = useContext(AppContext);
  const navigation = useNavigation();
  const [step, setStep] = useState('forgot'); // 'forgot' o 'reset'
  const [email, setEmail] = useState(''); // Guardar el email entre pasos

  const { control, handleSubmit, formState: { errors }, watch } = useForm();
  const newPassword = watch("newPassword");

  const handleSendCode = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: data.email });
      setMessage({ type: 'success', text: response.data.message });
      setEmail(data.email); // Guardar email para el siguiente paso
      setStep('reset');
    } catch (error) {
      // El interceptor ya maneja el mensaje de error
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        code: data.code,
        newPassword: data.newPassword,
      });
      setMessage({ type: 'success', text: response.data.message });
      navigation.navigate('Login');
    } catch (error) {
       // El interceptor ya maneja el mensaje de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      {step === 'forgot' ? (
        <>
          <Controller
            control={control}
            name="email"
            rules={{ required: 'El email es obligatorio', pattern: { value: /(.+)@(.+){2,}\.(.+){2,}/, message: 'Email inválido' } }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                activeOutlineColor="#635393"
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          <Button
            mode="contained"
            onPress={handleSubmit(handleSendCode)}
            style={styles.button}
            buttonColor="#635393"
          >
            Enviar código
          </Button>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Se ha enviado un código a {email}. Revisa tu correo e ingresa el código y tu nueva contraseña.
          </Text>
          <Controller
            control={control}
            name="code"
            rules={{ required: 'El código es obligatorio', minLength: { value: 4, message: "El código debe tener 4 dígitos" } }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Código de 4 dígitos"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                maxLength={4}
                activeOutlineColor="#635393"
              />
            )}
          />
          {errors.code && <Text style={styles.errorText}>{errors.code.message}</Text>}

          <Controller
            control={control}
            name="newPassword"
            rules={{ required: 'La nueva contraseña es obligatoria', minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' } }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Nueva contraseña"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                activeOutlineColor="#635393"
              />
            )}
          />
          {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}
          
          <Controller
            control={control}
            name="confirmPassword"
            rules={{ required: 'Debes confirmar la contraseña', validate: value => value === newPassword || 'Las contraseñas no coinciden' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirmar nueva contraseña"
                mode="outlined"
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                activeOutlineColor="#635393"
              />
            )}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

          <Button
            mode="contained"
            onPress={handleSubmit(handleResetPassword)}
            style={styles.button}
            buttonColor="#635393"
          >
            Restablecer contraseña
          </Button>
        </>
      )}
       <Button onPress={() => navigation.goBack()} textColor="#635393" style={{ marginTop: 15 }}>
          Volver a Inicio de Sesión
        </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
    lineHeight: 22,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
   errorText: { 
    color: "red", 
    marginBottom: 10, 
    marginTop: -8, 
    marginLeft: 2 
  },
});

export default RecuperarCuenta;
