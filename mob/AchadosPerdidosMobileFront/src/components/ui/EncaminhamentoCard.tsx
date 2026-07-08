// src/components/ui/EncaminhamentoCard.tsx
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
  itemNome: string;
  itemNumero: number;
  destino: string;
  dataEnvio: string;
  dataInventario?: string | null;
  onPress: () => void;
};

const EncaminhamentoCard = ({ 
  itemNome, 
  itemNumero, 
  destino, 
  dataEnvio, 
  dataInventario, 
  onPress 
}: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.numeroContainer}>
          <MaterialIcons name="inventory" size={16} color={CORES.primary} />
          <Text style={styles.numero}>Nº {itemNumero}</Text>
        </View>
        <View style={styles.destinoBadge}>
          <Text style={styles.destinoText} numberOfLines={1}>{destino}</Text>
        </View>
      </View>

      <Text style={styles.itemNome} numberOfLines={2}>{itemNome}</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={14} color={CORES.gray500} />
          <Text style={styles.infoText}>Envio: {formatDate(dataEnvio)}</Text>
        </View>
        
        {dataInventario && (
          <View style={styles.infoRow}>
            <MaterialIcons name="assignment" size={14} color={CORES.gray500} />
            <Text style={styles.infoText}>Inventário: {formatDate(dataInventario)}</Text>
          </View>
        )}
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
    borderLeftWidth: 4,
    borderLeftColor: CORES.primary, // Agora azul em vez de amarelo
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CORES.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  numero: {
    fontSize: 14,
    fontWeight: '600',
    color: CORES.primary,
  },
  destinoBadge: {
    backgroundColor: CORES.primary, // Agora azul em vez de amarelo
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '60%',
  },
  destinoText: {
    fontSize: 12,
    fontWeight: '600',
    color: CORES.white,
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

export default EncaminhamentoCard;