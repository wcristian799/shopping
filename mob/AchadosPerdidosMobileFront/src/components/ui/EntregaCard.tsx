// src/components/ui/EntregaCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CORES } from '../../constants/cores';

type Props = {
  codigo: string;
  data: string;
  proprietario: string;
  proprietarioNome?: string;
  item: string;
  itemNome?: string;
  tipo: string;
  onPress: () => void;
};

const EntregaCard = ({ 
  codigo, 
  data, 
  proprietario,
  proprietarioNome,
  item,
  itemNome,
  tipo,
  onPress 
}: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const nomeProprietario = proprietarioNome || proprietario;
  const nomeItem = itemNome || item;

  const getTipoStyle = () => {
    return tipo === 'Procedimento padrão' ? styles.tipoPadrao : styles.tipoEvidencia;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.codigoContainer}>
          <MaterialIcons name="qr-code" size={16} color={CORES.primary} />
          <Text style={styles.codigo}>{codigo}</Text>
        </View>
        <View style={[styles.tipoBadge, getTipoStyle()]}>
          <Text style={styles.tipoText}>
            {tipo === 'Procedimento padrão' ? 'Padrão' : 'Evidência'}
          </Text>
        </View>
      </View>

      <Text style={styles.itemNome} numberOfLines={2}>{nomeItem}</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={14} color={CORES.gray500} />
          <Text style={styles.infoText} numberOfLines={1}>{nomeProprietario}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={14} color={CORES.gray500} />
          <Text style={styles.infoText}>{formatDate(data)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: CORES.gray200,
    borderLeftWidth: 4,         // ← ADICIONADO: faixa azul na esquerda
    borderLeftColor: CORES.primary, // ← ADICIONADO: cor azul
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codigoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CORES.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  codigo: {
    fontSize: 14,
    fontWeight: '600',
    color: CORES.primary,
  },
  tipoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipoPadrao: {
    backgroundColor: CORES.primarySoft,
  },
  tipoEvidencia: {
    backgroundColor: '#FEF3C7', // Amarelo claro mantido
  },
  tipoText: {
    fontSize: 10,
    fontWeight: '600',
    color: CORES.gray700,
  },
  itemNome: {
    fontSize: 18,
    fontWeight: '600',
    color: CORES.gray900,
    marginBottom: 12,
  },
  infoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: CORES.gray600,
    flex: 1,
  },
});

export default EntregaCard;