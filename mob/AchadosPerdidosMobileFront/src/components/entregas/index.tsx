// src/components/entregas/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '../ui/AuthContainer';
import EntregaCard from '../ui/EntregaCard';
import EmptyState from '../ui/EmptyState';
import { entregaService, EntregaComDetalhes } from '@/services/entregaService';
import { CORES } from '@/constants/cores';

const RenderEntregas = () => {
  const router = useRouter();
  const [entregas, setEntregas] = useState<EntregaComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarEntregas = async () => {
    try {
      const data = await entregaService.listarEntregas();
      setEntregas(data);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarEntregas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarEntregas();
  };

  const renderItem = ({ item }: { item: EntregaComDetalhes }) => (
    <EntregaCard
      codigo={item.codigo_autenticacao}
      data={item.data_entrega}
      proprietario={`ID: ${item.proprietario_id}`}
      proprietarioNome={item.proprietario_nome}
      item={`ID: ${item.item_id}`}
      itemNome={item.item_nome}
      tipo={item.tipo_registro}
      onPress={() => router.push(`/entrega-detalhes?id=${item.id}`)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <MaterialIcons name="assignment-return" size={28} color={CORES.primary} />
        <Text style={styles.title}>Entregas</Text>
      </View>
      <View style={styles.statsContainer}>
        <MaterialIcons name="inventory" size={16} color={CORES.primary} />
        <Text style={styles.statsText}>
          {entregas.length} {entregas.length === 1 ? 'entrega realizada' : 'entregas realizadas'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <AuthContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.primary} />
        </View>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <FlatList
        data={entregas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[CORES.primary]}
            tintColor={CORES.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="assignment-return"
            title="Nenhuma entrega"
            subtitle="As entregas realizadas aparecerão aqui"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: CORES.white,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: CORES.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CORES.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statsText: {
    fontSize: 13,
    color: CORES.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
});

export default RenderEntregas;