// src/components/resetPassword/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '../ui/AuthContainer';
import TextField from '../ui/TextField';
import { global } from '../ui/styles';

const RenderPasswordReset = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Erro', 'Digite seu e-mail');
      return;
    }

    try {
      setLoading(true);
      // Aqui você vai integrar com a API depois
      console.log('Reset senha:', email);
      Alert.alert('Sucesso', 'Instruções enviadas para seu e-mail');
      router.push('/(auth)');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao solicitar redefinição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 50, left: 10, zIndex: 10 }}
        onPress={() => router.back()}
      >
        <MaterialIcons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <AuthContainer
        title="Redefinir senha"
        subtitle="Digite seu e-mail para receber instruções"
      >
        <View style={global.content}>
          <TextField
            label="E-mail"
            icon={{ lib: 'MaterialIcons', name: 'email' }}
            placeholder="user@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[global.primaryButton, loading && global.primaryButtonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={global.primaryButtonText}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Text>
          </TouchableOpacity>
        </View>
      </AuthContainer>
    </View>
  );
};

export default RenderPasswordReset;