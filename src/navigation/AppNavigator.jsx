import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen";
import RecuperarCuenta from "../screens/RecuperarCuenta";
import HomeNavigation from "./HomeNavigation"; // Tab navigator for citizens
import PoliceNavigation from "./PoliceNavigation"; // Tab navigator for police
import MisDenunciasScreen from "../screens/MisDenunciasScreen";
/*import MisServiciosScreen from "../screens/MisServiciosScreen";*/
import InformacionScreen from "../screens/InformacionScreen";
import MiPerfilScreen from "../screens/MiPerfilScreen";
import DevsScreen from "../screens/DevsScreen";
import DenunciaItemScreen from "../screens/DenunciaItemScreen";
import SolicitudesAsignadasScreen from "../screens/policia/solicitudesAsignadasScreen";
import DenunciaItemPoliceScreen from "../screens/policia/DenunciaItemPoliceScreen";
import ResumenActividadScreen from "../screens/policia/ResumenActividadScreen";
import EmergenciaScreen from "../screens/Emergencia";
import ActualizarContrasenaScreen from "../screens/ActualizarContrasenaScreen";
import { AuthContext } from "../context/AuthContext";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { authState } = useContext(AuthContext);

  const screenOptions = {
    headerStyle: {
      backgroundColor: '#635393',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerBackTitleVisible: false,
  };

  const authScreens = {
    Login: LoginScreen,
    Registro: RegistroScreen,
    RecuperarCuenta: RecuperarCuenta,
  };

  const citizenScreens = {
    MainCitizen: HomeNavigation,
    MisDenuncias: MisDenunciasScreen,
    /*MisServicios: MisServiciosScreen,*/
    DenunciaDetail: DenunciaItemScreen,
  };

  const policeScreens = {
    MainPolice: PoliceNavigation,
    DenunciasAsignadas: SolicitudesAsignadasScreen,
    DenunciaDetailPolice: DenunciaItemPoliceScreen,
    ResumenActividad: ResumenActividadScreen,
  };

  const commonScreens = {
    Informacion: InformacionScreen,
    MiPerfil: MiPerfilScreen,
    ActualizarContrasena: ActualizarContrasenaScreen,
    Devs: DevsScreen,
    Emergencia: EmergenciaScreen,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!authState.isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: "Crear Cuenta" }} />
          <Stack.Screen name="RecuperarCuenta" component={RecuperarCuenta} options={{ title: "Recuperar Cuenta" }} />
        </>
      ) : (
        <>
          {/* Ciudadanos */}
          {authState.role?.includes(4) && (
            <>
              <Stack.Screen name="MainCitizen" component={HomeNavigation} options={{ headerShown: false }} />
              <Stack.Screen name="MisDenuncias" component={MisDenunciasScreen} options={{ title: "Mis Denuncias" }} />
              <Stack.Screen name="DenunciaDetail" component={DenunciaItemScreen} options={{ title: "Detalle de Solicitud" }} />
            </>
          )}

          {/* Policía */}
          {authState.role?.includes(3) && (
            <>
              <Stack.Screen name="MainPolice" component={PoliceNavigation} options={{ headerShown: false }} />
              <Stack.Screen name="DenunciasAsignadas" component={SolicitudesAsignadasScreen} options={{ title: "Solicitudes Asignadas" }} />
              <Stack.Screen name="DenunciaDetailPolice" component={DenunciaItemPoliceScreen} options={{ title: "Gestionar de Solicitud" }} />
              <Stack.Screen name="ResumenActividad" component={ResumenActividadScreen} options={{ title: "Resumen de Actividad" }} />
              {/* Policía también ve lista de denuncias ciudadanas */}
              <Stack.Screen name="MisDenuncias" component={MisDenunciasScreen} options={{ title: "Denuncias Ciudadanas" }} />
            </>
          )}

          {/* Pantallas comunes */}
          <Stack.Screen name="Informacion" component={InformacionScreen} options={{ title: "Información" }} />
          <Stack.Screen name="MiPerfil" component={MiPerfilScreen} options={{ title: "Mi Perfil" }} />
          <Stack.Screen name="ActualizarContrasena" component={ActualizarContrasenaScreen} options={{ title: "Actualizar Contraseña" }} />
          <Stack.Screen name="Devs" component={DevsScreen} options={{ title: "Desarrolladores" }} />
          <Stack.Screen name="Emergencia" component={EmergenciaScreen} options={{ title: "Emergencia" }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
