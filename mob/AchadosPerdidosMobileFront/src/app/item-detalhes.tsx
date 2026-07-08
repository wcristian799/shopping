// src/app/item-detalhes.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';
import { useItems } from '../contexts/ItemsContext';
import { entregaService } from '../services/entregaService';
import { CORES } from '../constants/cores';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Função para extrair apenas o nome do arquivo do caminho
const getFileName = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  if (path.includes('\\')) {
    const parts = path.split('\\');
    return parts[parts.length - 1];
  }
  
  if (path.includes('/')) {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }
  
  return path;
};

// Função para gerar múltiplas URLs possíveis
const getPossibleImageUrls = (caminho_foto: string | null | undefined): string[] => {
  if (!caminho_foto) return [];
  
  const fileName = getFileName(caminho_foto);
  if (!fileName) return [];
  
  return [
    `${API_URL}/uploads/${fileName}`,
    `${API_URL}/imagens/${fileName}`,
    `${API_URL}/imagem/${fileName}`,
    `${API_URL}/uploads/itens/${fileName}`,
    `${API_URL}/uploads/entregas/${fileName}`,
    `${API_URL}/imagens/itens/${fileName}`,
    `${API_URL}/imagens/entregas/${fileName}`,
  ];
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'preservado': return '#28a745';
    case 'desgastado': return '#ffc107';
    case 'danificado': return '#dc3545';
    default: return '#6c757d';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function ItemDetalhesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { getItemById, getLocalNome, getTipoNome, getCaixaDescricao, getUsuarioNome } = useItems(); // ADICIONAR getUsuarioNome
  
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);
  const [entrega, setEntrega] = useState<any>(null);
  
  // Estados para imagem do item
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);
  const [itemUrlIndex, setItemUrlIndex] = useState(0);
  const [itemAspectRatio, setItemAspectRatio] = useState(1);
  
  // Estados para imagem da entrega
  const [entregaImageUrl, setEntregaImageUrl] = useState<string | null>(null);
  const [entregaUrlIndex, setEntregaUrlIndex] = useState(0);
  const [entregaAspectRatio, setEntregaAspectRatio] = useState(1);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do item
      const itemData = getItemById(Number(id));
      
      if (itemData) {
        // Enriquecer com nomes
        const itemComDetalhes = {
          ...itemData,
          local_nome: getLocalNome(itemData.local_id),
          tipo_nome: getTipoNome(itemData.tipo_id),
          caixa_descricao: getCaixaDescricao(itemData.caixa_id),
          situacao: getSituacaoNome(itemData.situacao_id),
          responsavel_nome: getUsuarioNome(itemData.usuario_responsavel_id), // ADICIONAR ESTA LINHA
        };
        
        setItem(itemComDetalhes);
        
        // Configurar imagem do item
        const possibleUrls = getPossibleImageUrls(itemData.caminho_foto);
        setItemImageUrl(possibleUrls.length > 0 ? possibleUrls[0] : null);
        
        // Buscar entrega deste item
        const entregaData = await entregaService.buscarEntregaPorItemId(Number(id));
        if (entregaData) {
          setEntrega(entregaData);
          
          // Configurar imagem da entrega
          const entregaUrls = getPossibleImageUrls(entregaData.caminho_foto);
          setEntregaImageUrl(entregaUrls.length > 0 ? entregaUrls[0] : null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemImageError = () => {
    if (!item?.caminho_foto) return;
    
    const possibleUrls = getPossibleImageUrls(item.caminho_foto);
    const nextIndex = itemUrlIndex + 1;
    
    if (nextIndex < possibleUrls.length) {
      setItemImageUrl(possibleUrls[nextIndex]);
      setItemUrlIndex(nextIndex);
    }
  };

  const handleEntregaImageError = () => {
    if (!entrega?.caminho_foto) return;
    
    const possibleUrls = getPossibleImageUrls(entrega.caminho_foto);
    const nextIndex = entregaUrlIndex + 1;
    
    if (nextIndex < possibleUrls.length) {
      setEntregaImageUrl(possibleUrls[nextIndex]);
      setEntregaUrlIndex(nextIndex);
    }
  };

  const handleItemImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setItemAspectRatio(width / height);
  };

  const handleEntregaImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setEntregaAspectRatio(width / height);
  };

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

  // FUNÇÃO PARA NAVEGAR PARA A TELA DE ENTREGA
  const handleEntregarItem = () => {
    if (item.situacao_id === 4) {
      Alert.alert('Atenção', 'Este item já foi entregue!');
      return;
    }
    
    if (item.situacao_id === 5) {
      Alert.alert('Atenção', 'Este item já foi finalizado e não pode ser entregue!');
      return;
    }
    
    router.push({
      pathname: '/entrega/cadastro',
      params: { itemId: item.id }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CORES.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color={CORES.gray400} />
        <Text style={styles.errorText}>Item não encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const podeEntregar = item.situacao_id !== 4 && item.situacao_id !== 5;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header fixo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={CORES.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          #{item.numero_registro} - {item.situacao}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ============================================ */}
        {/* FOTO DO CADASTRO (ITEM) */}
        {/* ============================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="photo-camera" size={22} color={CORES.primary} />
            <Text style={styles.sectionTitle}>Foto do Cadastro</Text>
          </View>
          <View style={styles.imageWrapper}>
            {itemImageUrl ? (
              <Image
                source={{ uri: itemImageUrl }}
                style={[
                  styles.image,
                  { aspectRatio: itemAspectRatio }
                ]}
                resizeMode="contain"
                onError={handleItemImageError}
                onLoad={handleItemImageLoad}
              />
            ) : (
              <View style={styles.noImage}>
                <MaterialIcons name="image" size={50} color={CORES.gray400} />
                <Text style={styles.noImageText}>Sem foto de cadastro</Text>
              </View>
            )}
          </View>
        </View>

        {/* ============================================ */}
        {/* FOTO DA ENTREGA (SE HOUVER) */}
        {/* ============================================ */}
        {entrega && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="assignment-return" size={22} color={CORES.success} />
              <Text style={styles.sectionTitle}>Foto da Entrega</Text>
              <View style={styles.entregaBadge}>
                <Text style={styles.entregaBadgeText}>
                  {new Date(entrega.data_entrega).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
            <View style={styles.imageWrapper}>
              {entregaImageUrl ? (
                <Image
                  source={{ uri: entregaImageUrl }}
                  style={[
                    styles.image,
                    { aspectRatio: entregaAspectRatio }
                  ]}
                  resizeMode="contain"
                  onError={handleEntregaImageError}
                  onLoad={handleEntregaImageLoad}
                />
              ) : (
                <View style={styles.noImage}>
                  <MaterialIcons name="image" size={50} color={CORES.gray400} />
                  <Text style={styles.noImageText}>Sem foto da entrega</Text>
                </View>
              )}
            </View>
            
            {/* INFORMAÇÕES DA ENTREGA */}
            <View style={styles.entregaInfo}>
              <View style={styles.entregaInfoRow}>
                <MaterialIcons name="qr-code" size={16} color={CORES.primary} style={styles.entregaIcon} />
                <Text style={styles.entregaLabel}>Código: </Text>
                <Text style={styles.entregaValor} numberOfLines={1} ellipsizeMode="tail">
                  {entrega.codigo_autenticacao}
                </Text>
              </View>
              
              <View style={styles.entregaInfoRow}>
                <MaterialIcons name="info" size={16} color={CORES.primary} style={styles.entregaIcon} />
                <Text style={styles.entregaLabel}>Tipo: </Text>
                <Text style={styles.entregaValor} numberOfLines={1} ellipsizeMode="tail">
                  {entrega.tipo_registro}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ============================================ */}
        {/* NOME DO ITEM */}
        {/* ============================================ */}
        <Text style={styles.itemNome}>{item.nome}</Text>

        {/* ============================================ */}
        {/* DETALHES DO ITEM */}
        {/* ============================================ */}
        <View style={styles.detalhesContainer}>
          {/* Marca */}
          {item.marca && (
            <View style={styles.detalheRow}>
              <MaterialIcons name="tag" size={20} color={CORES.primary} style={styles.detalheIcon} />
              <Text style={styles.detalheLabel}>Marca: </Text>
              <Text style={styles.detalheValue}>{item.marca}</Text>
            </View>
          )}

          {/* Lacre */}
          <View style={styles.detalheRow}>
            <MaterialIcons name="qr-code" size={20} color={CORES.primary} style={styles.detalheIcon} />
            <Text style={styles.detalheLabel}>Lacre: </Text>
            <Text style={styles.detalheValue}>{item.numero_lacre}</Text>
          </View>

          {/* Estado */}
          <View style={styles.detalheRow}>
            <FontAwesome5 name="clock" size={18} color={CORES.primary} style={styles.detalheIcon} />
            <Text style={styles.detalheLabel}>Estado: </Text>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado_conservacao) }]}>
              <Text style={styles.estadoBadgeText}>{item.estado_conservacao}</Text>
            </View>
          </View>

          {/* Data */}
          <View style={styles.detalheRow}>
            <MaterialIcons name="calendar-today" size={20} color={CORES.primary} style={styles.detalheIcon} />
            <Text style={styles.detalheLabel}>Data: </Text>
            <Text style={styles.detalheValue}>{formatDate(item.data_registro)}</Text>
          </View>

          {/* Nome do Entregador */}
          {item.nome_entregador && (
            <View style={styles.detalheRow}>
              <MaterialIcons name="person-add" size={20} color={CORES.primary} style={styles.detalheIcon} />
              <Text style={styles.detalheLabel}>Entregue por: </Text>
              <Text style={styles.detalheValue}>{item.nome_entregador}</Text>
            </View>
          )}

          {/* ============================================ */}
          {/* CADASTRADO POR - NOVO CAMPO */}
          {/* ============================================ */}
          <View style={styles.detalheRow}>
            <MaterialIcons name="person" size={20} color={CORES.primary} style={styles.detalheIcon} />
            <Text style={styles.detalheLabel}>Cadastrado por: </Text>
            <Text style={styles.detalheValue}>{item.responsavel_nome}</Text>
          </View>

          {item.operador_nome && (
            <View style={styles.detalheRow}>
              <MaterialIcons name="badge" size={20} color={CORES.primary} style={styles.detalheIcon} />
              <Text style={styles.detalheLabel}>Operador: </Text>
              <Text style={styles.detalheValue}>{item.operador_nome}</Text>
            </View>
          )}

          {item.assinatura_operador && (
            <View style={styles.detalheRow}>
              <MaterialIcons name="draw" size={20} color={CORES.primary} style={styles.detalheIcon} />
              <Text style={styles.detalheLabel}>Assinatura: </Text>
              <Text style={styles.detalheValue}>{item.assinatura_operador}</Text>
            </View>
          )}

          {/* Local */}
          {item.local_nome && (
            <View style={styles.detalheRow}>
              <MaterialIcons name="location-on" size={20} color={CORES.primary} style={styles.detalheIcon} />
              <Text style={styles.detalheLabel}>Local: </Text>
              <Text style={styles.detalheValue}>{item.local_nome}</Text>
            </View>
          )}

          {/* Tipo */}
          {item.tipo_nome && (
            <View style={styles.detalheRow}>
              <MaterialIcons name="category" size={20} color={CORES.primary} style={styles.detalheIcon} />
              <Text style={styles.detalheLabel}>Tipo: </Text>
              <Text style={styles.detalheValue}>{item.tipo_nome}</Text>
            </View>
          )}

          {/* Caixa */}
          {item.caixa_descricao && (
            <View style={styles.detalheRow}>
              <MaterialIcons name="inbox" size={20} color={CORES.primary} style={styles.detalheIcon} />
              <Text style={styles.detalheLabel}>Caixa: </Text>
              <Text style={styles.detalheValue}>{item.caixa_descricao}</Text>
            </View>
          )}
        </View>

        {/* Observação */}
        {item.observacao && (
          <View style={styles.observacaoContainer}>
            <View style={styles.observacaoHeader}>
              <MaterialIcons name="notes" size={20} color={CORES.primary} />
              <Text style={styles.observacaoTitle}>Observação</Text>
            </View>
            <Text style={styles.observacaoText}>{item.observacao}</Text>
          </View>
        )}

        {/* ============================================ */}
        {/* BOTÃO DE ENTREGA */}
        {/* ============================================ */}
        {podeEntregar && (
          <TouchableOpacity
            style={styles.botaoEntrega}
            onPress={handleEntregarItem}
            activeOpacity={0.8}
          >
            <MaterialIcons name="assignment-return" size={24} color={CORES.white} />
            <Text style={styles.botaoEntregaText}>Realizar Entrega</Text>
            <MaterialIcons name="arrow-forward" size={24} color={CORES.white} />
          </TouchableOpacity>
        )}

        {/* Espaço extra no final */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.gray100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.white,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: CORES.gray600,
    marginTop: 16,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: CORES.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: CORES.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
    backgroundColor: CORES.white,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CORES.gray200,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.gray900,
    flex: 1,
  },
  entregaBadge: {
    backgroundColor: CORES.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  entregaBadgeText: {
    color: CORES.white,
    fontSize: 12,
    fontWeight: '600',
  },
  imageWrapper: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: CORES.gray100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: undefined,
    maxHeight: SCREEN_HEIGHT * 0.35,
  },
  noImage: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.gray100,
  },
  noImageText: {
    color: CORES.gray500,
    marginTop: 8,
    fontSize: 14,
  },
  entregaInfo: {
    marginTop: 12,
    backgroundColor: CORES.gray100,
    padding: 12,
    borderRadius: 8,
  },
  entregaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entregaIcon: {
    marginRight: 8,
  },
  entregaLabel: {
    fontSize: 14,
    color: CORES.gray600,
  },
  entregaValor: {
    fontSize: 14,
    fontWeight: '500',
    color: CORES.gray900,
    flex: 1,
  },
  itemNome: {
    fontSize: 24,
    fontWeight: '600',
    color: CORES.gray900,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  detalhesContainer: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CORES.gray200,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  detalheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detalheIcon: {
    width: 28,
  },
  detalheLabel: {
    fontSize: 15,
    color: CORES.gray600,
    marginRight: 4,
  },
  detalheValue: {
    fontSize: 15,
    fontWeight: '500',
    color: CORES.gray900,
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  estadoBadgeText: {
    color: CORES.white,
    fontSize: 13,
    fontWeight: '600',
  },
  observacaoContainer: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: CORES.gray200,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  observacaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  observacaoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.gray900,
  },
  observacaoText: {
    fontSize: 15,
    color: CORES.gray700,
    lineHeight: 22,
    padding: 12,
    backgroundColor: CORES.gray100,
    borderRadius: 8,
  },
  botaoEntrega: {
    backgroundColor: CORES.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoEntregaText: {
    color: CORES.white,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});
