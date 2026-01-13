import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DenunciaScreen from "../screens/DenunciaScreen";
import AjustesScreen from "../screens/AjustesScreen";
import PoliceHomeScreen from "../screens/policia/PoliceHomeScreen"; 

const Tab = createBottomTabNavigator();

export default function PoliceNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "Denuncias") {
            iconName = "police-station";
          } else if (route.name === "Ajustes") {
            iconName = "cog";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: "#78288c",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          paddingBottom: 9, 
          height: 60, // Aumentar altura para mejor toque
        },
        tabBarLabelStyle: { fontWeight: "bold" },
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
      })}
    >
      <Tab.Screen name="Home" component={PoliceHomeScreen} />
      <Tab.Screen name="Denuncias" component={DenunciaScreen} />
      <Tab.Screen name="Ajustes" component={AjustesScreen} />
    </Tab.Navigator>
  );
}
