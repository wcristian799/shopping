// src/components/ui/SignatureModal.tsx (CORRIGIDO)
import React, { useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Signature from 'react-native-signature-canvas';
import { MaterialIcons } from '@expo/vector-icons';
import { CORES } from '@/constants/cores';

const { width, height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
};

export default function SignatureModal({ visible, onClose, onSave }: Props) {
  // CORREÇÃO: Inicializar com null
  const signatureRef = useRef<any>(null);

  const handleSave = () => {
    signatureRef.current?.readSignature();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleSignature = (signature: string) => {
    onSave(signature);
    onClose();
  };

  const style = `.m-signature-pad--footer { display: none; }`;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Assinatura Digital</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={CORES.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.signatureContainer}>
            <Signature
              ref={signatureRef}
              onOK={handleSignature}
              descriptionText="Assine aqui"
              clearText="Limpar"
              confirmText="Salvar"
              webStyle={style}
              autoClear={false}
              imageType="image/png"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <MaterialIcons name="refresh" size={20} color={CORES.white} />
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <MaterialIcons name="check" size={20} color={CORES.white} />
              <Text style={styles.saveButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.7,
    backgroundColor: CORES.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: CORES.primary,
  },
  signatureContainer: {
    flex: 1,
    backgroundColor: CORES.white,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: CORES.gray200,
  },
  clearButton: {
    flex: 1,
    backgroundColor: CORES.warning,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  clearButtonText: {
    color: CORES.white,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: CORES.success,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: CORES.white,
    fontWeight: '600',
  },
});