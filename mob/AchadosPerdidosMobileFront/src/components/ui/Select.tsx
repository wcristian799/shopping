import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { global } from './styles';
import { CORES } from '../../constants/cores';

export type OptionType = {
  id: number | string;
  nome: string;
  descricao?: string;
};

type Props<T extends OptionType> = {
  label: string;
  value: T | null;
  options: T[];
  onSelect: (option: T) => void;
  placeholder?: string;
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  actionLabel?: string;
  onActionPress?: () => void;
};

function Select<T extends OptionType>({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Selecione...',
  error,
  icon,
  actionLabel,
  onActionPress,
}: Props<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredOptions = options.filter((opt) =>
    opt.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (option: T) => {
    onSelect(option);
    setModalVisible(false);
    setSearchText('');
  };

  return (
    <View style={global.inputGroup}>
      <Text style={global.label}>{label}</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[global.inputIcon, error ? global.inputError : null]}
      >
        {icon && (
          <View style={styles.iconWrap}>
            <MaterialIcons
              name={icon}
              size={23}
              color={error ? CORES.danger : CORES.primary}
            />
          </View>
        )}
        <Text style={[global.input, { color: value ? CORES.gray900 : CORES.gray400 }]}>
          {value ? value.nome : placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={error ? CORES.danger : CORES.primary}
        />
      </TouchableOpacity>

      {error && <Text style={global.errorText}>{error}</Text>}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={CORES.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color={CORES.gray500} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                placeholderTextColor={CORES.gray400}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionItem} onPress={() => handleSelect(item as T)}>
                  <Text style={styles.optionText}>{item.nome}</Text>
                  {item.descricao && <Text style={styles.optionDesc}>{item.descricao}</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhuma opção encontrada</Text>
              }
            />

            {actionLabel && onActionPress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setModalVisible(false);
                  setSearchText('');
                  onActionPress();
                }}
              >
                <MaterialIcons name="add-circle-outline" size={20} color={CORES.white} />
                <Text style={styles.actionButtonText}>{actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 16,
    backgroundColor: CORES.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CORES.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: CORES.gray100,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: CORES.gray900,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  optionText: {
    fontSize: 16,
    color: CORES.gray900,
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 4,
    color: CORES.gray500,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: CORES.gray500,
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: CORES.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonText: {
    color: CORES.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default Select;
