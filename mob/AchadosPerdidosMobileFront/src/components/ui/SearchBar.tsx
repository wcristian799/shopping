// src/components/ui/SearchBar.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CORES } from '../../constants/cores';

type Props = {
  onSearch: (text: string) => void;
  placeholder?: string;
};

const SearchBar = ({ onSearch, placeholder }: Props) => {
  const [text, setText] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleChangeText = (newText: string) => {
    setText(newText);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (newText.trim()) {
      searchTimeout.current = setTimeout(() => {
        onSearch(newText);
      }, 500);
    } else {
      onSearch('');
    }
  };

  const handleClear = () => {
    setText('');
    onSearch('');
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color={CORES.gray500} />
      <TextInput
        placeholder={placeholder || "Buscar..."}
        placeholderTextColor={CORES.gray400}
        value={text}
        onChangeText={handleChangeText}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={() => onSearch(text)}
      />
      {text.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <MaterialIcons name="close" size={20} color={CORES.gray500} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: CORES.gray200,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: CORES.gray900,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;