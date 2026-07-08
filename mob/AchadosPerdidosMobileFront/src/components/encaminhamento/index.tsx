// src/components/encaminhamento/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AuthContainer from '../ui/AuthContainer';
import EncaminhamentoCard from '../ui/EncaminhamentoCard';
import EmptyState from '../ui/EmptyState';
import { encaminhamentoService, EncaminhamentoComDetalhes } from '@/services/encaminhamentoService';
import { CORES } from '@/constants/cores';
import { MaterialIcons } from '@expo/vector-icons';

const RenderEncaminhamento = () => {
  const [encaminhamentos, setEncaminhamentos] = useState<EncaminhamentoComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarEncaminhamentos = async () => {
    try {
      const data = await encaminhamentoService.listarEncaminhamentos();
      setEncaminhamentos(data);
    } catch (error) {
      console.error('Erro ao carregar encaminhamentos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarEncaminhamentos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarEncaminhamentos();
  };

  const renderItem = ({ item }: { item: EncaminhamentoComDetalhes }) => (
    <EncaminhamentoCard
      itemNome={item.item_nome || `Item ID: ${item.item_id}`}
      itemNumero={item.item_numero_registro || item.item_id}
      destino={item.destino_nome || `Destino ID: ${item.destino_id}`}
      dataEnvio={item.data_envio}
      dataInventario={item.data_inventario}
      onPress={() => {
        // TODO: Abrir detalhes do encaminhamento
        console.log('Abrir encaminhamento:', item.id);
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <MaterialIcons name="send" size={28} color={CORES.primary} />
        <Text style={styles.title}>Encaminhamentos</Text>
      </View>
      <View style={styles.statsContainer}>
        <MaterialIcons name="inventory" size={16} color={CORES.primary} />
        <Text style={styles.statsText}>
          {encaminhamentos.length} {encaminhamentos.length === 1 ? 'item encaminhado' : 'itens encaminhados'}
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
        data={encaminhamentos}
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
            icon="send"
            title="Nenhum encaminhamento"
            subtitle="Os itens encaminhados aparecerão aqui"
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

export default RenderEncaminhamento;