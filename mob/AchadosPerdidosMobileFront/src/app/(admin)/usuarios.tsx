import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '@/components/ui/AuthContainer';
import { CORES } from '@/constants/cores';
import { usuarioService, Usuario } from '@/services/usuarioService';

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarUsuarios = async () => {
    try {
      const data = await usuarioService.listarUsuarios();
      setUsuarios(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  if (loading) {
    return (
      <AuthContainer title="Usuários" subtitle="Equipe cadastrada">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.primary} />
        </View>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title="Usuários" subtitle="Equipe cadastrada">
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              carregarUsuarios();
            }}
            colors={[CORES.primary]}
            tintColor={CORES.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={40} color={CORES.gray400} />
            <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={22} color={CORES.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.detalhe}>{item.email}</Text>
              <Text style={styles.detalhe}>{item.cargo || 'Sem cargo informado'}</Text>
            </View>
          </View>
        )}
      />
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    color: CORES.gray600,
    fontSize: 15,
  },
  card: {
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.gray200,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CORES.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.gray900,
    marginBottom: 4,
  },
  detalhe: {
    fontSize: 13,
    color: CORES.gray600,
  },
});
