// src/components/register/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AuthContainer from '../ui/AuthContainer';
import TextField from '../ui/TextField';
import PasswordField from '../ui/PasswordField';
import { global } from '../ui/styles';

const RenderRegister = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirmSenha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (senha !== confirmSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      // Aqui você vai integrar com a API depois
      console.log('Cadastrando:', { nome, email, senha });
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      router.push('/(auth)');
    } catch (error) {
      Alert.alert('Erro', 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Cadastro" subtitle="Crie sua conta">
      <ScrollView style={{ padding: 16 }}>
        <View style={global.content}>
          <TextField
            label="Nome completo"
            icon={{ lib: 'MaterialIcons', name: 'person' }}
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={setNome}
          />

          <TextField
            label="E-mail"
            icon={{ lib: 'MaterialIcons', name: 'email' }}
            placeholder="user@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordField
            label="Senha"
            icon={{ lib: 'MaterialIcons', name: 'lock' }}
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChangeText={setSenha}
          />

          <PasswordField
            label="Confirmar senha"
            icon={{ lib: 'MaterialIcons', name: 'lock' }}
            placeholder="Digite novamente"
            value={confirmSenha}
            onChangeText={setConfirmSenha}
          />

          <TouchableOpacity
            style={[global.primaryButton, loading && global.primaryButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={global.primaryButtonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: '#420350ff', fontWeight: '600' }}>
              Já tem uma conta? Faça login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AuthContainer>
  );
};

export default RenderRegister;