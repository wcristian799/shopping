// src/components/login/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AuthContainer from '../ui/AuthContainer';
import TextField from '../ui/TextField';
import PasswordField from '../ui/PasswordField';
import { useAuth } from '../../contexts/AuthContext';
import { CORES } from '../../constants/cores';

const { width, height } = Dimensions.get('window');

// Import da logo
const logo = require('../../../assets/images/logo.png');

const RenderLogin = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ops!', 'Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert(
        'Erro no login',
        error.response?.data?.erro || 'Credenciais inválidas'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Gradient */}
        <LinearGradient
          colors={[CORES.gradientStart, CORES.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Logo e título */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <View style={[styles.logoBackground, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                {/* ============================================ */}
                {/* SUBSTITUÍDO ÍCONE PELA LOGO */}
                {/* ============================================ */}
                <Image 
                  source={logo}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={[styles.title, { color: CORES.white }]}>
              Achados & Perdidos
            </Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.9)' }]}>
              Sistema de gerenciamento de objetos perdidos
            </Text>
          </View>

          {/* Card de login */}
          <View style={[styles.card, { backgroundColor: CORES.white }]}>
            <Text style={[styles.cardTitle, { color: CORES.primary }]}>
              Bem-vindo de volta!
            </Text>
            <Text style={[styles.cardSubtitle, { color: CORES.gray600 }]}>
              Faça login para continuar
            </Text>

            <View style={styles.form}>
              <TextField
                label="E-mail"
                icon={{ lib: 'MaterialIcons', name: 'email' }}
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.inputContainer}
              />

              <PasswordField
                label="Senha"
                icon={{ lib: 'MaterialIcons', name: 'lock' }}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                containerStyle={styles.inputContainer}
              />

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[CORES.primary, CORES.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={CORES.white} />
                  ) : (
                    <View style={styles.loginButtonContent}>
                      <Text style={[styles.loginButtonText, { color: CORES.white }]}>
                        Entrar
                      </Text>
                      <MaterialIcons name="arrow-forward" size={20} color={CORES.white} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.7)' }]}>
              © 2026 Shopping Iguatemi - Todos os direitos reservados
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    minHeight: height,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  // ============================================
  // NOVO ESTILO PARA A LOGO
  // ============================================
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default RenderLogin;