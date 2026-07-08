import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import PasswordField from './PasswordField';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordError?: string;
  setOldPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  clearError: () => void;
};

const ChangePasswordModal = ({
  visible,
  onClose,
  onSubmit,
  oldPassword,
  newPassword,
  confirmPassword,
  passwordError,
  setOldPassword,
  setNewPassword,
  setConfirmPassword,
  clearError,
}: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 20,
                gap: 16,
              }}
            >
              <PasswordField
                label="Digite sua senha antiga"
                icon={{ lib: 'MaterialIcons', name: 'lock-outline' }}
                value={oldPassword}
                onChangeText={setOldPassword}
              />

              <PasswordField
                label="Digite sua senha nova"
                icon={{ lib: 'MaterialIcons', name: 'lock' }}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  clearError();
                }}
              />

              <PasswordField
                label="Confirme sua senha"
                icon={{ lib: 'MaterialIcons', name: 'lock-reset' }}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError();
                }}
              />

              {!!passwordError && (
                <Text style={{ color: 'red', fontSize: 14 }}>
                  {passwordError}
                </Text>
              )}

              <TouchableOpacity
                onPress={onSubmit}
                style={{
                  backgroundColor: '#420350ff',
                  padding: 14,
                  borderRadius: 6,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  Alterar senha
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ChangePasswordModal;
