import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '../ui/AuthContainer';
import RequisicaoCard from '../ui/RequisicaoCard';
import EmptyState from '../ui/EmptyState';
import { requisicaoService, RequisicaoComDetalhes } from '@/services/requisicaoService';
import { CORES } from '@/constants/cores';

const RenderRequisicoes = () => {
  const router = useRouter();
  const [requisicoes, setRequisicoes] = useState<RequisicaoComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<'pendentes' | 'todas'>('pendentes');

  const carregarRequisicoes = async () => {
    try {
      const data =
        filtro === 'pendentes'
          ? await requisicaoService.listarPendentes()
          : await requisicaoService.listarTodas();
      setRequisicoes(data);
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarRequisicoes();
  }, [filtro]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarRequisicoes();
  };

  const renderItem = ({ item }: { item: RequisicaoComDetalhes }) => (
    <RequisicaoCard
      codigo={item.codigo_requisicao}
      cliente={item.nome_cliente}
      telefone={item.telefone}
      descricao={item.descricao}
      data={item.data_requisicao}
      encontrado={item.encontrado}
      itemEncontrado={item.item_nome}
      onPress={() =>
        router.push({
          pathname: '/requisicao-detalhes',
          params: { id: String(item.id) },
        })
      }
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <MaterialIcons name="list-alt" size={28} color={CORES.primary} />
        <Text style={styles.title}>Requisições</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filtro === 'pendentes' && styles.filterButtonActive]}
          onPress={() => setFiltro('pendentes')}
        >
          <Text style={[styles.filterButtonText, filtro === 'pendentes' && styles.filterButtonTextActive]}>
            Pendentes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filtro === 'todas' && styles.filterButtonActive]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filterButtonText, filtro === 'todas' && styles.filterButtonTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <MaterialIcons name="inventory" size={16} color={CORES.primary} />
        <Text style={styles.statsText}>
          {requisicoes.length} {requisicoes.length === 1 ? 'requisição' : 'requisições'}{' '}
          {filtro === 'pendentes' ? 'pendente(s)' : 'no total'}
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
        data={requisicoes}
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
            icon="list-alt"
            title="Nenhuma requisição"
            subtitle="As requisições de clientes aparecerão aqui"
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
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: CORES.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CORES.gray300,
    backgroundColor: CORES.white,
  },
  filterButtonActive: {
    backgroundColor: CORES.primary,
    borderColor: CORES.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: CORES.gray700,
  },
  filterButtonTextActive: {
    color: CORES.white,
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

export default RenderRequisicoes;
