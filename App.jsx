// App.jsx — versión final con status bar fijo
import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar"; 
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator.jsx";
import { AuthProvider, AuthContext } from "./src/context/AuthContext.jsx";
import { UserProvider } from "./src/context/UserContext.jsx";
import { AppProvider } from "./src/context/AppContext.jsx";
import * as Notifications from "expo-notifications";
import { navigationRef } from "./src/navigation/navigationRef.js";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    onSurfaceVariant: "#333",
    onSurface: "#333",
    primary: "#635393",
  },
};

function AppContent() {
  const { authState, isReady } = React.useContext(AuthContext);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notificación recibida:", response);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#635393" style="light" />
      <AppProvider>
        <AuthProvider>
          <UserProvider>
            <PaperProvider theme={theme}>
              <NavigationContainer ref={navigationRef}>
                <AppContent />
              </NavigationContainer>
            </PaperProvider>
          </UserProvider>
        </AuthProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}