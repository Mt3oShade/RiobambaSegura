import React, { useState } from "react";
import { View } from "react-native";
import { IconButton, Menu } from "react-native-paper";

const MenuOpcionNav = () => {
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton icon="menu" color="white" size={24} onPress={openMenu} />
        }
      >
        <Menu.Item onPress={() => {}} title="Perfil" icon="account" />
        <Menu.Item onPress={() => {}} title="Ayuda" icon="help-circle" />
        <Menu.Item onPress={() => {}} title="Información" icon="information" />
        <Menu.Item onPress={() => {}} title="Cerrar sesión" icon="logout" />
      </Menu>
    </View>
  );
};

export default MenuOpcionNav;
