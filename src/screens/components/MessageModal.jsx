import React, { useContext } from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { AppContext } from '../../context/AppContext';

const MessageModal = () => {
  const { message, setMessage } = useContext(AppContext);

  if (!message) {
    return null;
  }

  const isError = message.type === 'error';
  const title = isError ? 'Error' : 'Éxito';
  const buttonColor = isError ? '#d9534f' : '#5cb85c';
  const titleColor = isError ? '#d9534f' : '#5cb85c';

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={message !== null}
      onRequestClose={() => setMessage(null)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={[styles.modalTitle, { color: titleColor }]}>{title}</Text>
          <Text style={styles.messageText}>{message.text}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: buttonColor, opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => setMessage(null)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '80%',
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessageModal;
