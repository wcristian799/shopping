// src/components/perfil/index.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '../ui/AuthContainer';
import { useAuth } from '../../contexts/AuthContext';
import { CORES } from '../../constants/cores';

const RenderPerfil = () => {
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)');
  };

  return (
    <AuthContainer>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* Card de informações do usuário */}
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={50} color={CORES.white} />
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
              
              <View style={[
                styles.badge,
                isAdmin ? styles.adminBadge : styles.operatorBadge
              ]}>
                <MaterialIcons 
                  name={isAdmin ? "admin-panel-settings" : "person-outline"} 
                  size={16} 
                  color={CORES.white} 
                />
                <Text style={styles.badgeText}>
                  {isAdmin ? 'Administrador' : 'Operador'}
                </Text>
              </View>
            </View>
          </View>

          {/* Botão de Cadastrar Novo Usuário (apenas para admin) */}
          {isAdmin && (
            <TouchableOpacity 
              style={styles.newUserButton}
              onPress={() => router.push('/(admin)/novo-usuario')}
            >
              <View style={styles.newUserButtonContent}>
                <MaterialIcons name="person-add" size={24} color={CORES.white} />
                <Text style={styles.newUserButtonText}>Cadastrar Novo Usuário</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color={CORES.white} />
            </TouchableOpacity>
          )}

          {/* Menu de opções */}
          <View style={styles.menuContainer}>
            {/* Dados pessoais */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: CORES.primarySoft }]}>
                <MaterialIcons name="person" size={22} color={CORES.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Dados pessoais</Text>
                <Text style={styles.menuSubtitle}>Nome, email, telefone</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={CORES.gray400} />
            </TouchableOpacity>

            {/* Segurança */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: CORES.primarySoft }]}>
                <MaterialIcons name="lock" size={22} color={CORES.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Segurança</Text>
                <Text style={styles.menuSubtitle}>Alterar senha</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={CORES.gray400} />
            </TouchableOpacity>

            {/* Notificações */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: CORES.primarySoft }]}>
                <MaterialIcons name="notifications" size={22} color={CORES.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Notificações</Text>
                <Text style={styles.menuSubtitle}>Preferências de alertas</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={CORES.gray400} />
            </TouchableOpacity>

            {/* Ajuda */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: CORES.primarySoft }]}>
                <MaterialIcons name="help" size={22} color={CORES.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Ajuda</Text>
                <Text style={styles.menuSubtitle}>Perguntas frequentes</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={CORES.gray400} />
            </TouchableOpacity>

            {/* Sobre o app */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: CORES.primarySoft }]}>
                <MaterialIcons name="info" size={22} color={CORES.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Sobre o app</Text>
                <Text style={styles.menuSubtitle}>Versão 1.0.0</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={CORES.gray400} />
            </TouchableOpacity>

            {/* Separador antes da área administrativa */}
            <View style={styles.divider} />

            {/* ============================================ */}
            {/* RELATÓRIOS - AGORA DISPONÍVEL PARA OPERADORES TAMBÉM */}
            {/* ============================================ */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(admin)/relatorios')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: CORES.primarySoft }]}>
                <MaterialIcons name="assessment" size={22} color={CORES.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Relatórios</Text>
                <Text style={styles.menuSubtitle}>Estatísticas e relatórios gerenciais</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={CORES.gray400} />
            </TouchableOpacity>

            {/* Área administrativa (apenas para admin) */}
            {isAdmin && (
              <>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => router.push('/(admin)/usuarios')}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: CORES.primarySoft }]}>
                    <MaterialIcons name="people" size={22} color={CORES.primary} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Gerenciar Usuários</Text>
                    <Text style={styles.menuSubtitle}>Lista de usuários do sistema</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={CORES.gray400} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Botão de sair */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color={CORES.white} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

          {/* Versão do app */}
          <Text style={styles.versionText}>Versão 1.0.0</Text>
          
          {/* Espaço extra no final para garantir scroll */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: CORES.gray100,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: CORES.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CORES.gray200,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: CORES.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: CORES.gray900,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: CORES.gray600,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  adminBadge: {
    backgroundColor: CORES.primary,
  },
  operatorBadge: {
    backgroundColor: CORES.gray600,
  },
  badgeText: {
    color: CORES.white,
    fontSize: 12,
    fontWeight: '600',
  },
  newUserButton: {
    backgroundColor: CORES.success,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newUserButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newUserButtonText: {
    color: CORES.white,
    fontSize: 16,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: CORES.white,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.gray200,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.gray900,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: CORES.gray500,
  },
  divider: {
    height: 8,
    backgroundColor: CORES.gray100,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: CORES.gray200,
  },
  logoutButton: {
    backgroundColor: CORES.danger,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: CORES.white,
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: CORES.gray500,
    marginBottom: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default RenderPerfil;