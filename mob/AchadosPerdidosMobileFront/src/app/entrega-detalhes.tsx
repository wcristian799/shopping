// src/app/entrega-detalhes.tsx
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';
import { entregaService, EntregaComDetalhes } from '../services/entregaService';
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
    `${API_URL}/uploads/entregas/${fileName}`,
    `${API_URL}/imagens/entregas/${fileName}`,
  ];
};

const formatarTelefone = (telefone: string): string => {
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (numeros.length === 9) {
    return numeros.replace(/^(\d{5})(\d{4})$/, '$1-$2');
  } else if (numeros.length === 8) {
    return numeros.replace(/^(\d{4})(\d{4})$/, '$1-$2');
  }
  return telefone;
};

const formatarCpf = (cpf: string): string => {
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length === 11) {
    return numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return cpf;
};

const formatarRg = (rg: string): string => {
  const numeros = rg.replace(/\D/g, '');
  if (numeros.length === 9) {
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
  } else if (numeros.length === 8) {
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3');
  }
  return rg;
};

const formatarDataHora = (dataString: string): string => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR') + ' às ' + 
         data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function EntregaDetalhesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [entrega, setEntrega] = useState<EntregaComDetalhes | null>(null);
  
  // Estados para imagem da entrega
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  useEffect(() => {
    carregarEntrega();
  }, [id]);

  const carregarEntrega = async () => {
    try {
      setLoading(true);
      const data = await entregaService.buscarPorId(Number(id));
      setEntrega(data);
      
      // Configurar imagem
      if (data?.caminho_foto) {
        const possibleUrls = getPossibleImageUrls(data.caminho_foto);
        setImageUrl(possibleUrls.length > 0 ? possibleUrls[0] : null);
      }
    } catch (error) {
      console.error('Erro ao carregar entrega:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    if (!entrega?.caminho_foto) return;
    
    const possibleUrls = getPossibleImageUrls(entrega.caminho_foto);
    const nextIndex = urlIndex + 1;
    
    if (nextIndex < possibleUrls.length) {
      setImageUrl(possibleUrls[nextIndex]);
      setUrlIndex(nextIndex);
    }
  };

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageAspectRatio(width / height);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CORES.primary} />
      </View>
    );
  }

  if (!entrega) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color={CORES.gray400} />
        <Text style={styles.errorText}>Entrega não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getTipoStyle = () => {
    return entrega.tipo_registro === 'Procedimento padrão' ? styles.tipoPadrao : styles.tipoEvidencia;
  };

  const getTipoIcon = () => {
    return entrega.tipo_registro === 'Procedimento padrão' ? 'check-circle' : 'warning';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header fixo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={CORES.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Detalhes da Entrega
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
        {/* FOTO DA ENTREGA */}
        {/* ============================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="assignment-return" size={22} color={CORES.success} />
            <Text style={styles.sectionTitle}>Foto da Entrega</Text>
          </View>
          <View style={styles.imageWrapper}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={[
                  styles.image,
                  { aspectRatio: imageAspectRatio }
                ]}
                resizeMode="contain"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <View style={styles.noImage}>
                <MaterialIcons name="image" size={50} color={CORES.gray400} />
                <Text style={styles.noImageText}>Sem foto da entrega</Text>
              </View>
            )}
          </View>
        </View>

        {/* ============================================ */}
        {/* INFORMAÇÕES DA ENTREGA */}
        {/* ============================================ */}
        <View style={styles.detalhesContainer}>
          {/* Código de Autenticação */}
          <View style={styles.detalheRow}>
            <MaterialIcons name="qr-code" size={20} color={CORES.primary} style={styles.detalheIcon} />
            <Text style={styles.detalheLabel}>Código:</Text>
            <Text style={styles.detalheValue}>{entrega.codigo_autenticacao}</Text>
          </View>

          {/* Data da Entrega */}
          <View style={styles.detalheRow}>
            <MaterialIcons name="calendar-today" size={20} color={CORES.primary} style={styles.detalheIcon} />
            <Text style={styles.detalheLabel}>Data:</Text>
            <Text style={styles.detalheValue}>{formatarDataHora(entrega.data_entrega)}</Text>
          </View>

          {/* Tipo de Registro */}
          <View style={styles.detalheRow}>
            <MaterialIcons name={getTipoIcon()} size={20} color={CORES.primary} style={styles.detalheIcon} />
            <Text style={styles.detalheLabel}>Tipo:</Text>
            <View style={[styles.tipoBadge, getTipoStyle()]}>
              <Text style={styles.tipoText}>
                {entrega.tipo_registro === 'Procedimento padrão' ? 'Procedimento Padrão' : 'Registro de Evidência'}
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================ */}
        {/* DADOS DO ITEM */}
        {/* ============================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="inventory" size={22} color={CORES.primary} />
            <Text style={styles.sectionTitle}>Item Entregue</Text>
          </View>
          
          <View style={styles.itemContainer}>
            <Text style={styles.itemNome}>{entrega.item_nome || `Item ID: ${entrega.item_id}`}</Text>
            
            <View style={styles.itemDetalhes}>
              {entrega.item_numero_registro && (
                <View style={styles.itemDetalheRow}>
                  <MaterialIcons name="qr-code" size={14} color={CORES.gray500} />
                  <Text style={styles.itemDetalheText}>
                    Nº Registro: {entrega.item_numero_registro}
                  </Text>
                </View>
              )}
              
              {entrega.item_numero_lacre && (
                <View style={styles.itemDetalheRow}>
                  <MaterialIcons name="lock" size={14} color={CORES.gray500} />
                  <Text style={styles.itemDetalheText}>
                    Lacre: {entrega.item_numero_lacre}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ============================================ */}
        {/* DADOS DO PROPRIETÁRIO */}
        {/* ============================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={22} color={CORES.primary} />
            <Text style={styles.sectionTitle}>Proprietário</Text>
          </View>
          
          <View style={styles.proprietarioContainer}>
            <View style={styles.detalheRow}>
              <MaterialIcons name="person" size={16} color={CORES.primary} />
              <Text style={styles.detalheLabel}>Nome:</Text>
              <Text style={styles.detalheValue}>{entrega.proprietario_nome || `ID: ${entrega.proprietario_id}`}</Text>
            </View>
            
            {entrega.proprietario_telefone && (
              <View style={styles.detalheRow}>
                <MaterialIcons name="phone" size={16} color={CORES.primary} />
                <Text style={styles.detalheLabel}>Telefone:</Text>
                <Text style={styles.detalheValue}>{formatarTelefone(entrega.proprietario_telefone)}</Text>
              </View>
            )}
            
            {entrega.proprietario_cpf && (
              <View style={styles.detalheRow}>
                <MaterialIcons name="badge" size={16} color={CORES.primary} />
                <Text style={styles.detalheLabel}>CPF:</Text>
                <Text style={styles.detalheValue}>{formatarCpf(entrega.proprietario_cpf)}</Text>
              </View>
            )}
            
            {entrega.proprietario_rg && (
              <View style={styles.detalheRow}>
                <MaterialIcons name="credit-card" size={16} color={CORES.primary} />
                <Text style={styles.detalheLabel}>RG:</Text>
                <Text style={styles.detalheValue}>{formatarRg(entrega.proprietario_rg)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Botão Voltar */}
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-back" size={24} color={CORES.white} />
          <Text style={styles.botaoVoltarText}>Voltar</Text>
        </TouchableOpacity>

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
    marginRight: 8,
    fontWeight: '500',
  },
  detalheValue: {
    fontSize: 15,
    fontWeight: '500',
    color: CORES.gray900,
    flex: 1,
  },
  tipoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tipoPadrao: {
    backgroundColor: CORES.primarySoft,
  },
  tipoEvidencia: {
    backgroundColor: '#FEF3C7',
  },
  tipoText: {
    fontSize: 13,
    fontWeight: '600',
    color: CORES.gray700,
  },
  itemContainer: {
    gap: 8,
  },
  itemNome: {
    fontSize: 18,
    fontWeight: '600',
    color: CORES.primary,
  },
  itemDetalhes: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  itemDetalheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CORES.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemDetalheText: {
    fontSize: 13,
    color: CORES.gray600,
    fontWeight: '500',
  },
  proprietarioContainer: {
    gap: 8,
  },
  botaoVoltar: {
    backgroundColor: CORES.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoVoltarText: {
    color: CORES.white,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});