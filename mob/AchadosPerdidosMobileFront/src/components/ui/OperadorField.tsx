import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Masks } from 'react-native-mask-input';
import TextField from './TextField';
import { global } from './styles';
import { CORES } from '@/constants/cores';
import { Operador, operadorService } from '@/services/operadorService';

export type OperadorSelecionado = {
  operador_id: number;
  operador_nome: string;
  assinatura_operador: string;
};

type Props = {
  label?: string;
  value: OperadorSelecionado | null;
  onChange: (value: OperadorSelecionado | null) => void;
};

export default function OperadorField({ label = 'Operador', value, onChange }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [searchText, setSearchText] = useState('');
  const [etapa, setEtapa] = useState<'lista' | 'novo' | 'validar'>('lista');
  const [operadorAtual, setOperadorAtual] = useState<Operador | null>(null);
  const [cpfValidacao, setCpfValidacao] = useState('');
  const [assinatura, setAssinatura] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [novaDataNascimento, setNovaDataNascimento] = useState('');

  const operadoresFiltrados = useMemo(
    () => operadores.filter((operador) => operador.nome_completo.toLowerCase().includes(searchText.toLowerCase())),
    [operadores, searchText]
  );

  const carregarOperadores = async () => {
    try {
      setLoading(true);
      const data = await operadorService.listarOperadores();
      setOperadores(data);
    } finally {
      setLoading(false);
    }
  };

  const abrir = async () => {
    setModalVisible(true);
    setEtapa('lista');
    setSearchText('');
    await carregarOperadores();
  };

  const iniciarValidacao = (operador: Operador) => {
    setOperadorAtual(operador);
    setCpfValidacao('');
    setAssinatura('');
    setEtapa('validar');
  };

  const confirmarValidacao = async () => {
    if (!operadorAtual || !cpfValidacao || !assinatura.trim()) {
      Alert.alert('Erro', 'Informe CPF e assinatura do operador');
      return;
    }

    try {
      setLoading(true);
      await operadorService.validarOperador(operadorAtual.id, cpfValidacao);
      onChange({
        operador_id: operadorAtual.id,
        operador_nome: operadorAtual.nome_completo,
        assinatura_operador: assinatura.trim(),
      });
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao validar operador');
    } finally {
      setLoading(false);
    }
  };

  const criarOperador = async () => {
    if (!novoNome.trim() || !novoCpf || !novaDataNascimento.trim()) {
      Alert.alert('Erro', 'Preencha nome, CPF e data de nascimento');
      return;
    }

    try {
      setLoading(true);
      const id = await operadorService.criarOperador({
        nome_completo: novoNome.trim(),
        cpf: novoCpf,
        data_nascimento: novaDataNascimento.trim(),
      });

      const data = await operadorService.listarOperadores();
      setOperadores(data);

      const criado = data.find((operador) => operador.id === id) || {
        id,
        nome_completo: novoNome.trim(),
        cpf: novoCpf.replace(/\D/g, ''),
        data_nascimento: novaDataNascimento.trim(),
        ativo: true,
      };

      setNovoNome('');
      setNovoCpf('');
      setNovaDataNascimento('');
      iniciarValidacao(criado);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao criar operador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={global.inputGroup}>
      <Text style={global.label}>{label}</Text>

      <TouchableOpacity onPress={abrir} style={styles.trigger}>
        <MaterialIcons name="badge" size={23} color={CORES.primary} />
        <Text style={[styles.triggerText, { color: value ? CORES.gray900 : CORES.gray400 }]}>
          {value ? `${value.operador_nome} • assinado` : 'Selecionar e validar operador'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={CORES.primary} />
      </TouchableOpacity>

      {value && (
        <TouchableOpacity style={styles.clearButton} onPress={() => onChange(null)}>
          <Text style={styles.clearButtonText}>Limpar operador</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {etapa === 'lista' && 'Selecionar operador'}
                {etapa === 'novo' && 'Cadastrar operador'}
                {etapa === 'validar' && 'Validar operador'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={CORES.primary} />
              </TouchableOpacity>
            </View>

            {etapa === 'lista' && (
              <>
                <TextField
                  label="Buscar operador"
                  icon={{ lib: 'MaterialIcons', name: 'search' }}
                  placeholder="Digite o nome"
                  value={searchText}
                  onChangeText={(masked) => setSearchText(masked)}
                />
                <FlatList
                  data={operadoresFiltrados}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.optionItem} onPress={() => iniciarValidacao(item)}>
                      <Text style={styles.optionTitle}>{item.nome_completo}</Text>
                      <Text style={styles.optionSubtitle}>CPF final {item.cpf.slice(-4)}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={styles.helperText}>{loading ? 'Carregando operadores...' : 'Nenhum operador encontrado.'}</Text>}
                />
                <TouchableOpacity style={styles.primaryButton} onPress={() => setEtapa('novo')}>
                  <MaterialIcons name="add-circle-outline" size={20} color={CORES.white} />
                  <Text style={styles.primaryButtonText}>Cadastrar operador</Text>
                </TouchableOpacity>
              </>
            )}

            {etapa === 'novo' && (
              <>
                <TextField
                  label="Nome completo"
                  icon={{ lib: 'MaterialIcons', name: 'person' }}
                  placeholder="Nome completo"
                  value={novoNome}
                  onChangeText={(masked) => setNovoNome(masked)}
                />
                <TextField
                  label="CPF"
                  icon={{ lib: 'MaterialIcons', name: 'badge' }}
                  placeholder="000.000.000-00"
                  value={novoCpf}
                  onChangeText={(masked) => setNovoCpf(masked)}
                  mask={Masks.BRL_CPF}
                  keyboardType="numeric"
                />
                <TextField
                  label="Nascimento"
                  icon={{ lib: 'MaterialIcons', name: 'calendar-today' }}
                  placeholder="YYYY-MM-DD"
                  value={novaDataNascimento}
                  onChangeText={(masked) => setNovaDataNascimento(masked)}
                />
                <View style={styles.rowButtons}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => setEtapa('lista')}>
                    <Text style={styles.secondaryButtonText}>Voltar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryButtonCompact} onPress={criarOperador}>
                    <Text style={styles.primaryButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {etapa === 'validar' && operadorAtual && (
              <>
                <View style={styles.selectedCard}>
                  <Text style={styles.optionTitle}>{operadorAtual.nome_completo}</Text>
                  <Text style={styles.optionSubtitle}>CPF final {operadorAtual.cpf.slice(-4)}</Text>
                </View>
                <TextField
                  label="Confirmar CPF"
                  icon={{ lib: 'MaterialIcons', name: 'badge' }}
                  placeholder="000.000.000-00"
                  value={cpfValidacao}
                  onChangeText={(masked) => setCpfValidacao(masked)}
                  mask={Masks.BRL_CPF}
                  keyboardType="numeric"
                />
                <TextField
                  label="Assinatura do operador"
                  icon={{ lib: 'MaterialIcons', name: 'draw' }}
                  placeholder="Digite a assinatura"
                  value={assinatura}
                  onChangeText={(masked) => setAssinatura(masked)}
                />
                <View style={styles.rowButtons}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => setEtapa('lista')}>
                    <Text style={styles.secondaryButtonText}>Trocar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryButtonCompact} onPress={confirmarValidacao}>
                    <Text style={styles.primaryButtonText}>{loading ? 'Validando...' : 'Confirmar'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.primary,
    borderRadius: 10,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: CORES.danger,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    backgroundColor: CORES.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.primary,
  },
  helperText: {
    color: CORES.gray500,
    textAlign: 'center',
    paddingVertical: 16,
  },
  optionItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.gray900,
  },
  optionSubtitle: {
    marginTop: 4,
    color: CORES.gray600,
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: CORES.primary,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonCompact: {
    flex: 1,
    backgroundColor: CORES.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: CORES.white,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: CORES.primary,
    fontWeight: '700',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  selectedCard: {
    backgroundColor: CORES.primarySoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
});
