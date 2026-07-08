import { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Masks } from 'react-native-mask-input';

import AuthContainer from '../ui/AuthContainer';
import TextField from '../ui/TextField';
import ChangePasswordModal from "../ui/modal";

const RenderAccount = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não conferem');
      return;
    }

    setPasswordError('');
    setShowPasswordModal(false);
  };

  return (
    <AuthContainer
      title="Minha Conta"
      subtitle="Gerencie suas informações e preferencias"
    >
      <View style={{ gap: 16, marginTop: 24 }}>
        <TextField
          label="Nome"
          icon={{ lib: 'MaterialIcons', name: 'person' }}
          value={name}
          onChangeText={setName}
        />

        <TextField
          label="CPF"
          icon={{ lib: 'MaterialIcons', name: 'badge' }}
          value={cpf}
          keyboardType="numeric"
          mask={Masks.BRL_CPF}
          onChangeText={(masked, unmasked) => setCpf(unmasked ?? '')}
        />

        <TextField
          label="Telefone"
          icon={{ lib: 'MaterialIcons', name: 'phone' }}
          value={phone}
          keyboardType="phone-pad"
          mask={Masks.BRL_PHONE}
          onChangeText={(masked, unmasked) => setPhone(unmasked ?? '')}
        />

        <TextField
          label="Email"
          icon={{ lib: 'MaterialIcons', name: 'email' }}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          onPress={() => {}}
          style={{
            backgroundColor: '#420350ff',
            padding: 14,
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Alterar dados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowPasswordModal(true)}
          style={{
            backgroundColor: '#555',
            padding: 14,
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Privacidade e Segurança
          </Text>
        </TouchableOpacity>
      </View>

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
        oldPassword={oldPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        passwordError={passwordError}
        setOldPassword={setOldPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
        clearError={() => setPasswordError('')}
      />
    </AuthContainer>
  );
};

export default RenderAccount;
