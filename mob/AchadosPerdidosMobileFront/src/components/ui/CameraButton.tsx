// src/components/ui/CameraButton.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { CORES } from '../../constants/cores';

type Props = {
  onImageSelected: (uri: string) => void;
  imageUri?: string;
};

const CameraButton = ({ onImageSelected, imageUri }: Props) => {
  const [showOptions, setShowOptions] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera e galeria');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        setShowOptions(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        setShowOptions(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remover foto',
      'Deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            onImageSelected('');
            setShowOptions(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => setShowOptions(true)}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.changeIcon}>
              <MaterialIcons name="edit" size={20} color={CORES.white} />
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="camera-alt" size={40} color={CORES.gray400} />
            <Text style={styles.placeholderText}>Adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={showOptions} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowOptions(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar imagem</Text>
            
            <TouchableOpacity style={styles.option} onPress={takePhoto}>
              <MaterialIcons name="camera-alt" size={24} color={CORES.primary} />
              <Text style={styles.optionText}>Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={pickFromGallery}>
              <MaterialIcons name="photo-library" size={24} color={CORES.primary} />
              <Text style={styles.optionText}>Escolher da galeria</Text>
            </TouchableOpacity>

            {imageUri && (
              <TouchableOpacity style={[styles.option, styles.removeOption]} onPress={removeImage}>
                <MaterialIcons name="delete" size={24} color={CORES.danger} />
                <Text style={[styles.optionText, styles.removeText]}>Remover foto</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: CORES.gray100,
    borderWidth: 2,
    borderColor: CORES.gray300,
    borderStyle: 'dashed',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: CORES.gray600,
    marginTop: 8,
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: CORES.primary,
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CORES.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CORES.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: CORES.gray900,
  },
  removeOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  removeText: {
    color: CORES.danger,
  },
  cancelButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: CORES.gray100,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: CORES.gray700,
    fontWeight: '600',
  },
});

export default CameraButton;