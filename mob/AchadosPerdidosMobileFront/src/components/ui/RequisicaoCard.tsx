// src/components/ui/RequisicaoCard.tsx
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
  codigo: string;  // ← CÓDIGO DA REQUISIÇÃO (8 caracteres)
  cliente: string;
  telefone: string;
  descricao: string;
  data: string;
  encontrado: boolean;
  itemEncontrado?: string;
  onPress: () => void;
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

const RequisicaoCard = ({ 
  codigo, 
  cliente, 
  telefone, 
  descricao, 
  data, 
  encontrado, 
  itemEncontrado, 
  onPress 
}: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.codigoContainer}>
          <MaterialIcons name="qr-code" size={14} color={CORES.primary} />
          <Text style={styles.codigo}>{codigo}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          encontrado ? styles.statusEncontrado : styles.statusPendente
        ]}>
          <Text style={[
            styles.statusText,
            { color: encontrado ? CORES.success : CORES.warning }
          ]}>
            {encontrado ? 'Encontrado' : 'Pendente'}
          </Text>
        </View>
      </View>

      <View style={styles.clienteContainer}>
        <MaterialIcons name="person" size={16} color={CORES.primary} />
        <Text style={styles.clienteNome} numberOfLines={1}>{cliente}</Text>
      </View>

      <Text style={styles.descricao} numberOfLines={2}>{descricao}</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={14} color={CORES.gray500} />
          <Text style={styles.infoText}>{formatarTelefone(telefone)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={14} color={CORES.gray500} />
          <Text style={styles.infoText}>{formatDate(data)}</Text>
        </View>

        {itemEncontrado && (
          <View style={styles.infoRow}>
            <MaterialIcons name="check-circle" size={14} color={CORES.success} />
            <Text style={[styles.infoText, styles.itemEncontradoText]} numberOfLines={1}>
              Item: {itemEncontrado}
            </Text>
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
    borderLeftColor: CORES.primary,
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
    fontSize: 12,
    fontWeight: '600',
    color: CORES.primary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPendente: {
    backgroundColor: '#FEF3C7',
  },
  statusEncontrado: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clienteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  clienteNome: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.gray900,
    flex: 1,
  },
  descricao: {
    fontSize: 14,
    color: CORES.gray600,
    marginBottom: 12,
  },
  infoContainer: {
    gap: 6,
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
  itemEncontradoText: {
    color: CORES.success,
  },
});

export default RequisicaoCard;