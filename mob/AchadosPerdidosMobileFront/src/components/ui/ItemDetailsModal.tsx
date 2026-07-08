// src/components/ui/ItemDetailsModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  item: {
    numero_registro: number;
    nome: string;
    marca?: string | null;
    data_registro: string;
    numero_lacre: number;
    estado_conservacao: string;
    observacao?: string | null;
    local_nome?: string;
    tipo_nome?: string;
    caixa_descricao?: string;
    situacao: string;
    caminho_foto?: string | null;
  };
};

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

const ItemDetailsModal = ({ visible, onClose, item }: Props) => {
  const insets = useSafeAreaInsets();
  
  const possibleUrls = getPossibleImageUrls(item.caminho_foto);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    possibleUrls.length > 0 ? possibleUrls[0] : null
  );
  const [urlIndex, setUrlIndex] = useState(0);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  const handleImageError = () => {
    if (possibleUrls.length === 0) {
      setCurrentImageUrl(null);
      return;
    }
    
    const nextIndex = urlIndex + 1;
    
    if (nextIndex < possibleUrls.length) {
      setCurrentImageUrl(possibleUrls[nextIndex]);
      setUrlIndex(nextIndex);
    } else {
      setCurrentImageUrl(null);
    }
  };

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageAspectRatio(width / height);
  };

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 500,
              maxHeight: SCREEN_HEIGHT * 0.85,
            }}>
              {/* Header fixo */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
              }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#420350ff', flex: 1 }}>
                  #{item.numero_registro} - {item.situacao}
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialIcons name="close" size={24} color="#420350ff" />
                </TouchableOpacity>
              </View>

              {/* ScrollView */}
              <ScrollView 
                style={{ 
                  maxHeight: SCREEN_HEIGHT * 0.6,
                }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                bounces={true}
              >
                <View style={{ padding: 16, gap: 20 }}>
                  {/* Imagem */}
                  <View style={{ alignItems: 'center', width: '100%' }}>
                    {currentImageUrl ? (
                      <Image
                        source={{ uri: currentImageUrl }}
                        style={{
                          width: '100%',
                          height: undefined,
                          aspectRatio: imageAspectRatio,
                          borderRadius: 8,
                          maxHeight: SCREEN_HEIGHT * 0.35,
                        }}
                        resizeMode="contain"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    ) : (
                      <View style={{
                        width: '100%',
                        height: 200,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <MaterialIcons name="image" size={60} color="#ccc" />
                        <Text style={{ color: '#999', marginTop: 12, fontSize: 16 }}>Sem foto</Text>
                      </View>
                    )}
                  </View>

                  {/* Nome */}
                  <Text style={{ fontSize: 22, fontWeight: '600', color: '#333' }}>{item.nome}</Text>

                  {/* Detalhes em formato LINEAR COM ÍCONES */}
                  <View style={{ gap: 12 }}>
                    {/* Linha: Marca */}
                    {item.marca && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="tag" size={20} color="#666" style={{ width: 30 }} />
                        <Text style={{ fontSize: 14, color: '#666', width: 70 }}>Marca:</Text>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', flex: 1 }}>{item.marca}</Text>
                      </View>
                    )}

                    {/* Linha: Lacre */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="qr-code" size={20} color="#666" style={{ width: 30 }} />
                      <Text style={{ fontSize: 14, color: '#666', width: 70 }}>Lacre:</Text>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', flex: 1 }}>{item.numero_lacre}</Text>
                    </View>

                    {/* Linha: Estado */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="clock" size={18} color="#666" style={{ width: 30 }} />
                      <Text style={{ fontSize: 14, color: '#666', width: 70 }}>Estado:</Text>
                      <View style={{
                        backgroundColor: getEstadoColor(item.estado_conservacao),
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                          {item.estado_conservacao}
                        </Text>
                      </View>
                    </View>

                    {/* Linha: Data */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="calendar-today" size={20} color="#666" style={{ width: 30 }} />
                      <Text style={{ fontSize: 14, color: '#666', width: 70 }}>Data:</Text>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', flex: 1 }}>{formatDate(item.data_registro)}</Text>
                    </View>

                    {/* Linha: Local */}
                    {item.local_nome && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="location-on" size={20} color="#666" style={{ width: 30 }} />
                        <Text style={{ fontSize: 14, color: '#666', width: 70 }}>Local:</Text>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', flex: 1 }}>{item.local_nome}</Text>
                      </View>
                    )}

                    {/* Linha: Tipo */}
                    {item.tipo_nome && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="category" size={20} color="#666" style={{ width: 30 }} />
                        <Text style={{ fontSize: 14, color: '#666', width: 70 }}>Tipo:</Text>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', flex: 1 }}>{item.tipo_nome}</Text>
                      </View>
                    )}

                    {/* Linha: Caixa */}
                    {item.caixa_descricao && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="inbox" size={20} color="#666" style={{ width: 30 }} />
                        <Text style={{ fontSize: 14, color: '#666', width: 70 }}>Caixa:</Text>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#333', flex: 1 }}>{item.caixa_descricao}</Text>
                      </View>
                    )}
                  </View>

                  {/* Observação */}
                  {item.observacao && (
                    <View style={{ marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialIcons name="notes" size={20} color="#666" style={{ width: 30 }} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#666' }}>Observação:</Text>
                      </View>
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#333', 
                        backgroundColor: '#f9f9f9', 
                        padding: 12, 
                        borderRadius: 8,
                        lineHeight: 20,
                        marginLeft: 30,
                      }}>
                        {item.observacao}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Botão fixo no final */}
              <View style={{
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
              }}>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#420350ff',
                    padding: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                    Fechar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ItemDetailsModal;