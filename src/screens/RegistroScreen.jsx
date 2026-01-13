import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import api from "../api/api";
import { AppContext } from "../context/AppContext";

const RegistroScreen = () => {
    const navigation = useNavigation();
    const { setLoading, setMessage } = useContext(AppContext);
    const [subzonas, setSubzonas] = useState([]);
    const [cantones, setCantones] = useState([]);
    const [parroquias, setParroquias] = useState([]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        setError: setFormError,
    } = useForm();
    
    const password = watch("password");

    useEffect(() => {
        const fetchSubzonas = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/circuitos/subzonas`);
                setSubzonas(response.data);
            } catch (error) {
                setMessage({ type: 'error', text: 'No se pudieron cargar las subzonas.' });
            } finally {
                setLoading(false);
            }
        };
        fetchSubzonas();
    }, []);

    const handleSubzonaChange = async (subzonaId) => {
        if (!subzonaId) return;
        setValue("id_subzona", subzonaId);
        setCantones([]);
        setParroquias([]);
        setValue("id_canton", "");
        setValue("id_parroquia", "");
        setLoading(true);
        try {
            const response = await api.get(`/circuitos/subzonas/${subzonaId}/cantones`);
            setCantones(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'No se pudieron cargar los cantones.' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleCantonChange = async (cantonId) => {
        if (!cantonId) return;
        setValue("id_canton", cantonId);
        setParroquias([]);
        setValue("id_parroquia", "");
        setLoading(true);
        try {
            const response = await api.get(`/circuitos/cantones/${cantonId}/parroquias`);
            setParroquias(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'No se pudieron cargar las parroquias.' });
        } finally {
            setLoading(false);
        }
    };
    
    const verifyCedula = async () => {
        const cedula = watch("cedula", "").trim();
        if (!/^\d{10}$/.test(cedula)) {
            setFormError("cedula", { type: "manual", message: "Cédula inválida. Debe tener 10 dígitos." });
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/persona/verificarCedula/${cedula}`);
            if (response.data) {
                const { nombres, apellidos, fecha_nacimiento, genero } = response.data;
                setValue("nombres", nombres);
                setValue("apellidos", apellidos);
                setValue("fecha_nacimiento", fecha_nacimiento.split('T')[0]);
                setValue("genero", genero);
                setMessage({ type: 'success', text: 'Cédula verificada.' });
            }
        } catch (error) {
             // El interceptor de API ya muestra el error.
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post(`/persona/nuevoCiudadano`, data);
            setMessage({ type: 'success', text: '¡Registro exitoso! Ahora puedes iniciar sesión.' });
            navigation.navigate("Login");
        } catch (error) {
            // El interceptor de API ya muestra el error.
        } finally {
            setLoading(false);
        }
    };

    const renderPicker = (name, label, items, onValueChange, enabled = true) => (
         <Controller
            control={control}
            name={name}
            rules={{ required: `${label.split(' ')[0]} es obligatorio` }}
            render={({ field: { onChange, value } }) => (
                <View style={[styles.pickerContainer, errors[name] && styles.inputError]}>
                    <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => {
                            onChange(itemValue);
                            if (onValueChange) onValueChange(itemValue);
                        }}
                        style={styles.picker}
                        enabled={enabled}
                    >
                        <Picker.Item label={`Seleccione ${label.toLowerCase()}`} value="" />
                        {items.map((item) => (
                            <Picker.Item key={item.id} label={item.nombre} value={item.id} />
                        ))}
                    </Picker>
                </View>
            )}
        />
    )

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.formContainer}>
            <Text style={styles.title}>Registro de Ciudadano</Text>

            <View style={styles.row}>
                <Controller
                    control={control}
                    name="cedula"
                    rules={{ required: "La cédula es obligatoria", pattern: { value: /^\d{10}$/, message: "Cédula inválida" } }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            label="Cédula"
                            mode="outlined"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            style={[styles.input, { flex: 1 }]}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    )}
                />
                <Button mode="contained" onPress={verifyCedula} style={styles.verifyButton} buttonColor="#635393">
                    Verificar
                </Button>
            </View>
            {errors.cedula && <Text style={styles.errorText}>{errors.cedula.message}</Text>}

            <Controller control={control} name="nombres" render={({ field: { value } }) => <TextInput label="Nombres" mode="outlined" value={value} style={styles.input} disabled />} />
            <Controller control={control} name="apellidos" render={({ field: { value } }) => <TextInput label="Apellidos" mode="outlined" value={value} style={styles.input} disabled />} />
            
            {renderPicker("id_subzona", "una Subzona", subzonas.map(s => ({ id: s.id_subzona, nombre: s.nombre_subzona })), handleSubzonaChange)}
            {errors.id_subzona && <Text style={styles.errorText}>{errors.id_subzona.message}</Text>}

            {renderPicker("id_canton", "un Cantón", cantones.map(c => ({ id: c.id_canton, nombre: c.nombre_canton })), handleCantonChange, cantones.length > 0)}
            {errors.id_canton && <Text style={styles.errorText}>{errors.id_canton.message}</Text>}
            
            {/* Parroquia es opcional, no tiene validación "required" */}
            <View style={styles.pickerContainer}>
                 <Controller
                    control={control}
                    name="id_parroquia"
                    render={({ field: { onChange, value } }) => (
                        <Picker selectedValue={value} onValueChange={onChange} style={styles.picker} enabled={parroquias.length > 0}>
                            <Picker.Item label="Seleccione una parroquia (opcional)" value="" />
                            {parroquias.map((p) => (
                                <Picker.Item key={p.id_parroquia} label={p.nombre_parroquia} value={p.id_parroquia} />
                            ))}
                        </Picker>
                    )}
                />
            </View>

            <Controller control={control} name="telefono" rules={{ required: "El teléfono es obligatorio", pattern: {value: /^\d{10}$/, message: "Teléfono inválido"} }} render={({ field: { onChange, value } }) => <TextInput label="Teléfono" mode="outlined" keyboardType="phone-pad" onChangeText={onChange} value={value} style={styles.input} maxLength={10} />} />
            {errors.telefono && <Text style={styles.errorText}>{errors.telefono.message}</Text>}

            <Controller control={control} name="email" rules={{ required: "El email es obligatorio", pattern: { value: /(.+)@(.+){2,}\.(.+){2,}/, message: "Email inválido" } }} render={({ field: { onChange, value } }) => <TextInput label="Email" mode="outlined" onChangeText={onChange} value={value} style={styles.input} autoCapitalize="none" keyboardType="email-address" /> } />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            <Controller control={control} name="password" rules={{ required: "La contraseña es obligatoria", minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' } }} render={({ field: { onChange, value } }) => <TextInput label="Contraseña" mode="outlined" onChangeText={onChange} value={value} secureTextEntry style={styles.input} />} />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            <Controller control={control} name="confirmPassword" rules={{ required: "Debe confirmar la contraseña", validate: value => value === password || "Las contraseñas no coinciden" }} render={({ field: { onChange, value } }) => <TextInput label="Confirmar contraseña" mode="outlined" onChangeText={onChange} value={value} secureTextEntry style={styles.input} />} />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button} buttonColor="#635393">
                Registrarse
            </Button>

            <Button onPress={() => navigation.goBack()} textColor="#635393" style={{ marginTop: 10 }}>
                ¿Ya tienes una cuenta? Inicia sesión
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa" },
    formContainer: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: "center", marginBottom: 20, color: '#333' },
    input: { marginBottom: 12, backgroundColor: 'white' },
    inputError: { borderColor: 'red' },
    errorText: { color: "red", marginBottom: 10, marginTop: -8, marginLeft: 2 },
    button: { marginTop: 10, paddingVertical: 8 },
    row: { flexDirection: "row", alignItems: "center" },
    verifyButton: { marginLeft: 10, height: 55, justifyContent: 'center' },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 4,
        marginBottom: 12,
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    picker: {
        height: 56,
        width: "100%",
    },
});

export default RegistroScreen;
