// src/app/(admin)/novo-usuario.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '@/components/ui/AuthContainer';
import TextField from '@/components/ui/TextField';
import PasswordField from '@/components/ui/PasswordField';
import Select from '@/components/ui/Select';
import { global } from '@/components/ui/styles';
import { CORES } from '@/constants/cores';
import api from '@/services/api';

type NivelAcesso = {
  id: number;
  nome: string;
};

const niveisAcesso: NivelAcesso[] = [
  { id: 2, nome: 'Operador' },
  { id: 1, nome: 'Administrador' },
];

export default function NovoUsuarioScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState<{ id: number; nome: string } | null>(null);

  // Validações
  const [senhaError, setSenhaError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    // Resetar erros
    setSenhaError('');
    setEmailError('');

    // Validações
    if (!nome || !email || !senha || !confirmarSenha || !nivelAcesso) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (!validarEmail(email)) {
      setEmailError('E-mail inválido');
      return;
    }

    if (senha.length < 6) {
      setSenhaError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);

      const dados = {
        nome,
        email,
        senha,
        nivel_acesso_id: nivelAcesso.id,
      };

      // Chamar a API para cadastrar o usuário
      const response = await api.post('/auth/cadastro', dados);

      Alert.alert(
        'Sucesso',
        `Usuário ${nome} cadastrado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error);
      
      if (error.response?.data?.erro === 'Email já cadastrado') {
        setEmailError('Este e-mail já está em uso');
      } else {
        Alert.alert('Erro', error.response?.data?.erro || 'Falha ao cadastrar usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Novo Usuário" subtitle="Cadastre um novo usuário no sistema">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={global.content}>
            {/* Nome */}
            <TextField
              label="Nome *"
              icon={{ lib: "MaterialIcons", name: "person" }}
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
            />

            {/* E-mail */}
            <TextField
              label="E-mail *"
              icon={{ lib: "MaterialIcons", name: "email" }}
              placeholder="usuario@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              errorText={emailError}
            />

            {/* Senha */}
            <PasswordField
              label="Senha *"
              icon={{ lib: "MaterialIcons", name: "lock" }}
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={setSenha}
              errorText={senhaError}
            />

            {/* Confirmar Senha */}
            <PasswordField
              label="Confirmar Senha *"
              icon={{ lib: "MaterialIcons", name: "lock" }}
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            {/* Nível de Acesso */}
            <Select
              label="Nível de Acesso *"
              icon="admin-panel-settings"
              value={nivelAcesso}
              options={niveisAcesso}
              onSelect={setNivelAcesso}
              placeholder="Selecione o nível de acesso"
            />

            {/* Informações adicionais */}
            <View style={styles.infoContainer}>
              <MaterialIcons name="info-outline" size={20} color={CORES.primary} />
              <Text style={styles.infoText}>
                O usuário receberá um e-mail com as instruções de acesso.
              </Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[
                  styles.button, 
                  styles.primaryButton,
                  loading && styles.buttonDisabled
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={CORES.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Cadastrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 40,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: CORES.primarySoft,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CORES.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: CORES.gray700,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: Platform.OS === 'android' ? 20 : 0,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: CORES.primary,
  },
  primaryButtonText: {
    color: CORES.white,
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.primary,
  },
  secondaryButtonText: {
    color: CORES.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});