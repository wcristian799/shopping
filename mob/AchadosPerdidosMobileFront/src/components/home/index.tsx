// src/components/home/index.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '../ui/AuthContainer';
import ItemCard from '../ui/ItemCard';
import Loading from '../ui/Loading';
import EmptyState from '../ui/EmptyState';
import SearchBar from '../ui/SearchBar';
import { useItems } from '../../contexts/ItemsContext';
import { useAuth } from '../../contexts/AuthContext';
import { ItemComFoto } from '../../types/item';
import { CORES } from '../../constants/cores';

// Função para converter situacao_id em nome da situação
const getSituacaoNome = (situacaoId: number): string => {
  switch (situacaoId) {
    case 1: return 'No prazo';
    case 2: return 'Vence hoje';
    case 3: return 'Vencido';
    case 4: return 'Devolvido';
    case 5: return 'Finalizado';
    default: return 'Desconhecido';
  }
};

const RenderHome = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const {
    filteredItems,
    loading,
    refreshing,
    setSearchTerm,
    refreshItems,
  } = useItems();

  const handleSearch = (text: string) => {
    setSearchTerm(text);
  };

  const openDetails = (item: ItemComFoto) => {
    router.push(`/item-detalhes?id=${item.id}`);
  };

  const renderItem = ({ item }: { item: ItemComFoto }) => {
    return (
      <ItemCard
        numero_registro={item.numero_registro}
        nome={item.nome}
        marca={item.marca}
        data_registro={item.data_registro}
        situacao_id={item.situacao_id}
        situacao={getSituacaoNome(item.situacao_id)}
        caminho_foto={item.caminho_foto}
        onPress={() => openDetails(item)}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Cabeçalho */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Itens Perdidos</Text>
        <View style={styles.statsContainer}>
          <MaterialIcons name="inventory" size={16} color={CORES.primary} />
          <Text style={styles.statsText}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </Text>
        </View>
      </View>

      {/* Barra de busca */}
      <SearchBar
        onSearch={handleSearch}
        placeholder="Buscar por nome, marca, lacre..."
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <AuthContainer>
        <Loading text="Carregando itens..." />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <View style={styles.container}>
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={refreshItems}
              colors={[CORES.primary]} // Android
              tintColor={CORES.primary} // iOS
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-off"
              title="Nenhum item encontrado"
              subtitle="Tente outro termo de busca"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.white,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: CORES.white,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: CORES.primary,
    marginBottom: 4,
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
    paddingBottom: 20,
    flexGrow: 1,
  },
});

export default RenderHome;