// src/components/ui/ItemCard.tsx
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../constants/api";
import { CORES } from '../../constants/cores';

const { width } = Dimensions.get("window");

type Props = {
  numero_registro: number;
  nome: string;
  marca?: string | null;
  data_registro: string;
  situacao: string;
  situacao_id: number;
  caminho_foto?: string | null;
  onPress: () => void;
};

const getSituacaoColor = (situacao_id: number): { bg: string; text: string; label: string } => {
  switch (situacao_id) {
    case 1: return { 
      bg: CORES.badgeNoPrazo, 
      text: CORES.badgeNoPrazoText, 
      label: "No prazo" 
    };
    case 2: return { 
      bg: CORES.badgeVenceHoje, 
      text: CORES.badgeVenceHojeText, 
      label: "Vence hoje" 
    };
    case 3: return { 
      bg: CORES.badgeVencido, 
      text: CORES.badgeVencidoText, 
      label: "Vencido" 
    };
    case 4: return { 
      bg: CORES.badgeDevolvido, 
      text: CORES.badgeDevolvidoText, 
      label: "Devolvido" 
    };
    case 5: return { 
      bg: CORES.badgeFinalizado, 
      text: CORES.badgeFinalizadoText, 
      label: "Finalizado" 
    };
    default: return { 
      bg: CORES.gray200, 
      text: CORES.gray600, 
      label: "Desconhecido" 
    };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
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

const ItemCard = ({
  numero_registro,
  nome,
  marca,
  data_registro,
  situacao_id,
  caminho_foto,
  onPress,
}: Props) => {
  const situacao = getSituacaoColor(situacao_id);
  
  const possibleUrls = getPossibleImageUrls(caminho_foto);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    possibleUrls.length > 0 ? possibleUrls[0] : null
  );
  const [urlIndex, setUrlIndex] = useState(0);

  const handleImageError = () => {
    if (possibleUrls.length === 0) return;
    
    const nextIndex = urlIndex + 1;
    if (nextIndex < possibleUrls.length) {
      setCurrentImageUrl(possibleUrls[nextIndex]);
      setUrlIndex(nextIndex);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.imageContainer}>
        {currentImageUrl ? (
          <Image
            source={{ uri: currentImageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <MaterialIcons name="image" size={40} color={CORES.gray400} />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Text style={styles.numero}>#{numero_registro}</Text>
          <View style={[styles.situacaoBadge, { backgroundColor: situacao.bg }]}>
            <Text style={[styles.situacaoText, { color: situacao.text }]}>
              {situacao.label}
            </Text>
          </View>
        </View>

        <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
        
        {/* LINHA COM MARCA E DATA - Agora na mesma linha */}
        <View style={styles.marcaDataRow}>
          {marca ? (
            <>
              <View style={styles.marcaContainer}>
                <FontAwesome5 name="tag" size={12} color={CORES.gray500} />
                <Text style={styles.marca} numberOfLines={1}>{marca}</Text>
              </View>
              <View style={styles.dataContainer}>
                <MaterialIcons name="calendar-today" size={12} color={CORES.gray500} />
                <Text style={styles.data}>{formatDate(data_registro)}</Text>
              </View>
            </>
          ) : (
            // Se não tiver marca, a data ocupa a linha inteira à direita
            <View style={styles.dataContainerFull}>
              <MaterialIcons name="calendar-today" size={12} color={CORES.gray500} />
              <Text style={styles.data}>{formatDate(data_registro)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: CORES.gray200,
    minHeight: 100, // Altura mínima para consistência
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    backgroundColor: CORES.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  numero: {
    fontSize: 14,
    fontWeight: "700",
    color: CORES.primary,
  },
  situacaoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  situacaoText: {
    fontSize: 10,
    fontWeight: "700",
  },
  nome: {
    fontSize: 16,
    fontWeight: "600",
    color: CORES.gray900,
    marginBottom: 8,
  },
  // NOVA LINHA: Marca e data na mesma linha
  marcaDataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  marcaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  marca: {
    fontSize: 13,
    color: CORES.gray600,
    flex: 1,
  },
  dataContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dataContainerFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
  },
  data: {
    fontSize: 12,
    color: CORES.gray600,
  },
});

export default ItemCard;