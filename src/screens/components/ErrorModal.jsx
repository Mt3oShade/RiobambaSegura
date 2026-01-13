
import React, { useContext } from 'react';
import { View, Text, Modal, StyleSheet, Button } from 'react-native';
import { AppContext } from '../../context/AppContext';

const ErrorModal = () => {
  const { error, setError } = useContext(AppContext);

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={error !== null}
      onRequestClose={() => {
        setError(null);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Cerrar" onPress={() => setError(null)} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ErrorModal;
