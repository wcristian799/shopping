// src/app/encaminhamento/cadastro.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '@/components/ui/AuthContainer';
import Select from '@/components/ui/Select';
import DateSelector from '@/components/ui/DateSelector';
import TextField from '@/components/ui/TextField';
import { global } from '@/components/ui/styles';
import { encaminhamentoService } from '@/services/encaminhamentoService';
import { itemService } from '@/services/itemService';
import { CORES } from '@/constants/cores';

type ModoEncaminhamento = 'simples' | 'lote';

export default function CadastroEncaminhamentoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buscandoItem, setBuscandoItem] = useState(false);
  const [destinos, setDestinos] = useState<any[]>([]);
  const [itensVencidos, setItensVencidos] = useState<any[]>([]);

  // Modo de encaminhamento
  const [modo, setModo] = useState<ModoEncaminhamento>('simples');

  // ============================================
  // ESTADOS PARA MODO SIMPLES (1 ITEM)
  // ============================================
  const [itemId, setItemId] = useState('');
  const [itemEncontrado, setItemEncontrado] = useState<any>(null);

  // ============================================
  // ESTADOS PARA MODO LOTE (MÚLTIPLOS ITENS)
  // ============================================
  const [tipos, setTipos] = useState<any[]>([]);
  const [tiposSelecionados, setTiposSelecionados] = useState<number[]>([]);
  const [selectAllTipos, setSelectAllTipos] = useState(false);
  const [itensFiltrados, setItensFiltrados] = useState<any[]>([]);
  const [itensSelecionados, setItensSelecionados] = useState<number[]>([]);
  const [selectAllItens, setSelectAllItens] = useState(false);

  // ============================================
  // ESTADOS COMUNS
  // ============================================
  const [destino, setDestino] = useState<{ id: number; nome: string } | null>(null);
  const [dataEnvio, setDataEnvio] = useState('');
  const [dataInventario, setDataInventario] = useState('');
  const [responsavelEncaminhamento, setResponsavelEncaminhamento] = useState('');

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (modo === 'lote') {
      carregarTipos();
    }
  }, [modo]);

  useEffect(() => {
    if (modo === 'lote') {
      filtrarItens();
    }
  }, [tiposSelecionados, itensVencidos]);

  useEffect(() => {
    if (modo === 'lote' && itensFiltrados.length > 0) {
      const todosSelecionados = itensFiltrados.every(item =>
        itensSelecionados.includes(item.id)
      );
      setSelectAllItens(todosSelecionados);
    }
  }, [itensSelecionados, itensFiltrados]);

  // ============================================
  // FUNÇÕES DE CARREGAMENTO
  // ============================================
  const carregarDados = async () => {
    try {
      const [destinosData, itensData] = await Promise.all([
        encaminhamentoService.listarDestinos(),
        encaminhamentoService.listarItensVencidos(),
      ]);
      setDestinos(destinosData);
      setItensVencidos(itensData);
      setItensFiltrados(itensData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const carregarTipos = async () => {
    try {
      const tiposData = await encaminhamentoService.listarTiposItens();
      setTipos(tiposData);
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
    }
  };

  // ============================================
  // FUNÇÕES DO MODO SIMPLES
  // ============================================
  const buscarItem = async () => {
    if (!itemId) {
      Alert.alert('Erro', 'Digite o ID do item');
      return;
    }

    try {
      setBuscandoItem(true);
      const item = await itemService.buscarItemPorId(parseInt(itemId));

      if (item.situacao_id !== 3) {
        Alert.alert('Erro', 'Apenas itens vencidos podem ser encaminhados');
        setItemEncontrado(null);
        return;
      }

      setItemEncontrado(item);
      Alert.alert('Sucesso', `Item encontrado: ${item.nome}`);
    } catch (error) {
      Alert.alert('Erro', 'Item não encontrado');
      setItemEncontrado(null);
    } finally {
      setBuscandoItem(false);
    }
  };

  const selecionarItemVencido = (item: any) => {
    setItemId(item.id.toString());
    setItemEncontrado(item);
  };

  // ============================================
  // FUNÇÕES DO MODO LOTE
  // ============================================
  const toggleTipo = (tipoId: number) => {
    setTiposSelecionados(prev => {
      if (prev.includes(tipoId)) {
        return prev.filter(id => id !== tipoId);
      } else {
        return [...prev, tipoId];
      }
    });
  };

  const toggleSelectAllTipos = () => {
    if (selectAllTipos) {
      setTiposSelecionados([]);
    } else {
      setTiposSelecionados(tipos.map(t => t.id));
    }
    setSelectAllTipos(!selectAllTipos);
  };

  const filtrarItens = () => {
    if (tiposSelecionados.length === 0) {
      setItensFiltrados(itensVencidos);
    } else {
      const filtrados = itensVencidos.filter(item =>
        tiposSelecionados.includes(item.tipo_id)
      );
      setItensFiltrados(filtrados);
    }
  };

  const toggleItem = (itemId: number) => {
    setItensSelecionados(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const toggleSelectAllItens = () => {
    if (selectAllItens) {
      setItensSelecionados([]);
    } else {
      setItensSelecionados(itensFiltrados.map(item => item.id));
    }
    setSelectAllItens(!selectAllItens);
  };

  // ============================================
  // SUBMIT (COMUM)
  // ============================================
  const handleSubmit = async () => {
    // Validações comuns
    if (!destino) {
      Alert.alert('Erro', 'Selecione um destino');
      return;
    }

    if (modo === 'simples' && !itemEncontrado) {
      Alert.alert('Erro', 'Selecione um item para encaminhar');
      return;
    }

    if (modo === 'lote' && itensSelecionados.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um item para encaminhar');
      return;
    }

    try {
      setLoading(true);

      if (modo === 'simples') {
        // Modo simples: 1 item
        const dados = {
          data_envio: dataEnvio,
          data_inventario: dataInventario || null,
          item_id: itemEncontrado.id,
          destino_id: destino.id,
          responsavel_encaminhamento: responsavelEncaminhamento || null,
        };

        await encaminhamentoService.registrarEncaminhamento(dados);

        Alert.alert('Sucesso', 'Encaminhamento registrado com sucesso!');

      } else {
        // Modo lote: múltiplos itens
        let sucessos = 0;
        let erros = 0;

        for (const itemId of itensSelecionados) {
          try {
            await encaminhamentoService.registrarEncaminhamento({
              data_envio: dataEnvio,
              data_inventario: dataInventario || null,
              item_id: itemId,
              destino_id: destino.id,
              responsavel_encaminhamento: responsavelEncaminhamento || null,
            });
            sucessos++;
          } catch (error) {
            erros++;
          }
        }

        Alert.alert(
          'Sucesso',
          `${sucessos} item(ns) encaminhado(s) com sucesso!${erros > 0 ? `\n${erros} erro(s).` : ''}`
        );
      }

      router.back();

    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao registrar encaminhamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Novo Encaminhamento" subtitle="Encaminhar item(ns) vencido(s)">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={global.content}>
            {/* ============================================ */}
            {/* SELETOR DE MODO */}
            {/* ============================================ */}
            <View style={global.inputGroup}>
              <Text style={global.label}>Modo de Encaminhamento</Text>
              <View style={styles.modoContainer}>
                <TouchableOpacity
                  onPress={() => setModo('simples')}
                  style={[
                    styles.modoButton,
                    {
                      backgroundColor: modo === 'simples'
                        ? CORES.primary
                        : CORES.gray100
                    }
                  ]}
                >
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={modo === 'simples' ? CORES.white : CORES.gray600}
                  />
                  <Text style={[
                    styles.modoButtonText,
                    { color: modo === 'simples' ? CORES.white : CORES.gray700 }
                  ]}>
                    Simples (1 item)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModo('lote')}
                  style={[
                    styles.modoButton,
                    {
                      backgroundColor: modo === 'lote'
                        ? CORES.primary
                        : CORES.gray100
                    }
                  ]}
                >
                  <MaterialIcons
                    name="group"
                    size={20}
                    color={modo === 'lote' ? CORES.white : CORES.gray600}
                  />
                  <Text style={[
                    styles.modoButtonText,
                    { color: modo === 'lote' ? CORES.white : CORES.gray700 }
                  ]}>
                    Lote (múltiplos)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ============================================ */}
            {/* MODO SIMPLES */}
            {/* ============================================ */}
            {modo === 'simples' && (
              <>
                {/* Lista de itens vencidos (atalho) */}
                {itensVencidos.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={global.label}>Itens Vencidos:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {itensVencidos.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => selecionarItemVencido(item)}
                          style={[
                            styles.itemVencidoCard,
                            {
                              borderWidth: itemEncontrado?.id === item.id ? 2 : 0,
                              borderColor: CORES.primary,
                              backgroundColor: itemEncontrado?.id === item.id
                                ? CORES.primarySoft
                                : CORES.gray100
                            }
                          ]}
                        >
                          <Text style={styles.itemVencidoNome}>{item.nome}</Text>
                          <Text style={styles.itemVencidoNumero}>
                            Nº: {item.numero_registro}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Busca do Item */}
                <View style={global.inputGroup}>
                  <Text style={global.label}>ID do Item *</Text>
                  <View style={styles.searchRow}>
                    <View style={[global.inputIcon, styles.searchInput]}>
                      <MaterialIcons name="inventory" size={23} color={CORES.primary} />
                      <TextInput
                        style={styles.input}
                        placeholder="Digite o ID do item"
                        placeholderTextColor={CORES.gray400}
                        value={itemId}
                        onChangeText={setItemId}
                        keyboardType="numeric"
                        editable={!itemEncontrado}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={buscarItem}
                      disabled={buscandoItem || !!itemEncontrado}
                      style={[
                        styles.searchButton,
                        {
                          backgroundColor: itemEncontrado ? CORES.gray400 : CORES.primary,
                          opacity: (buscandoItem || !!itemEncontrado) ? 0.5 : 1,
                        }
                      ]}
                    >
                      {buscandoItem ? (
                        <ActivityIndicator color={CORES.white} />
                      ) : (
                        <MaterialIcons
                          name={itemEncontrado ? "check" : "search"}
                          size={24}
                          color={CORES.white}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Item Encontrado */}
                {itemEncontrado && (
                  <View style={styles.itemEncontrado}>
                    <MaterialIcons name="check-circle" size={24} color={CORES.success} />
                    <View style={styles.itemEncontradoInfo}>
                      <Text style={styles.itemEncontradoNome}>{itemEncontrado.nome}</Text>
                      <Text style={styles.itemEncontradoDetalhes}>
                        Nº Registro: {itemEncontrado.numero_registro} | Lacre: {itemEncontrado.numero_lacre}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setItemEncontrado(null)}>
                      <MaterialIcons name="close" size={20} color={CORES.gray500} />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* ============================================ */}
            {/* MODO LOTE */}
            {/* ============================================ */}
            {modo === 'lote' && (
              <>
                {/* FILTRO POR TIPOS */}
                <View style={global.inputGroup}>
                  <View style={styles.headerRow}>
                    <Text style={global.label}>Filtrar por Tipo</Text>
                    <TouchableOpacity
                      onPress={toggleSelectAllTipos}
                      style={styles.selectAllButton}
                    >
                      <MaterialIcons
                        name={selectAllTipos ? "check-box" : "check-box-outline-blank"}
                        size={20}
                        color={CORES.primary}
                      />
                      <Text style={styles.selectAllText}>
                        {selectAllTipos ? 'Limpar tudo' : 'Selecionar todos'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.optionsContainer}>
                    {tipos.map((tipo) => (
                      <TouchableOpacity
                        key={tipo.id}
                        onPress={() => toggleTipo(tipo.id)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: tiposSelecionados.includes(tipo.id)
                              ? CORES.primary
                              : CORES.gray100,
                            borderColor: tiposSelecionados.includes(tipo.id)
                              ? CORES.primary
                              : CORES.gray300,
                          }
                        ]}
                      >
                        <MaterialIcons
                          name={tiposSelecionados.includes(tipo.id) ? "check" : "add"}
                          size={16}
                          color={tiposSelecionados.includes(tipo.id) ? CORES.white : CORES.gray600}
                        />
                        <Text style={[
                          styles.optionText,
                          {
                            color: tiposSelecionados.includes(tipo.id)
                              ? CORES.white
                              : CORES.gray700
                          }
                        ]}>
                          {tipo.nome}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.counterText}>
                    {tiposSelecionados.length} tipo(s) selecionado(s) | {itensFiltrados.length} item(ns) encontrado(s)
                  </Text>
                </View>

                {/* LISTA DE ITENS VENCIDOS */}
                <View style={global.inputGroup}>
                  <View style={styles.headerRow}>
                    <Text style={global.label}>Itens Vencidos Disponíveis</Text>
                    {itensFiltrados.length > 0 && (
                      <TouchableOpacity
                        onPress={toggleSelectAllItens}
                        style={styles.selectAllButton}
                      >
                        <MaterialIcons
                          name={selectAllItens ? "check-box" : "check-box-outline-blank"}
                          size={20}
                          color={CORES.primary}
                        />
                        <Text style={styles.selectAllText}>
                          {selectAllItens ? 'Limpar tudo' : 'Selecionar todos'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {itensFiltrados.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <MaterialIcons name="inbox" size={40} color={CORES.gray400} />
                      <Text style={styles.emptyText}>Nenhum item encontrado</Text>
                    </View>
                  ) : (
                    <View style={[styles.listaContainer, { maxHeight: 300 }]}>
                      <ScrollView
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        style={{ maxHeight: 300 }}
                      >
                        {itensFiltrados.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => toggleItem(item.id)}
                            style={[
                              styles.itemLista,
                              {
                                backgroundColor: itensSelecionados.includes(item.id)
                                  ? CORES.primarySoft
                                  : CORES.white,
                                borderColor: itensSelecionados.includes(item.id)
                                  ? CORES.primary
                                  : CORES.gray200,
                              }
                            ]}
                          >
                            <MaterialIcons
                              name={itensSelecionados.includes(item.id) ? "check-box" : "check-box-outline-blank"}
                              size={24}
                              color={CORES.primary}
                            />
                            <View style={styles.itemListaInfo}>
                              <Text style={styles.itemListaNome}>{item.nome}</Text>
                              <View style={styles.itemListaDetalhes}>
                                <Text style={styles.itemListaTexto}>
                                  Nº: {item.numero_registro}
                                </Text>
                                <Text style={styles.itemListaTexto}>
                                  Lacre: {item.numero_lacre}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <Text style={styles.counterText}>
                    {itensSelecionados.length} item(ns) selecionado(s)
                  </Text>
                </View>
              </>
            )}

            {/* ============================================ */}
            {/* CAMPOS COMUNS */}
            {/* ============================================ */}

            {/* Destino */}
            <Select
              label="Destino *"
              icon="place"
              value={destino}
              options={destinos}
              onSelect={setDestino}
              placeholder="Selecione o destino"
            />

            {/* Data de Envio */}
            <View style={global.inputGroup}>
              <Text style={global.label}>Data de Envio *</Text>
              <DateSelector
                onSelectDate={setDataEnvio}
                selectedDate={dataEnvio}
                label="Selecionar data de envio"
              />
            </View>

            {/* Data de Inventário (opcional) */}
            <View style={global.inputGroup}>
              <Text style={global.label}>Data de Inventário</Text>
              <DateSelector
                onSelectDate={setDataInventario}
                selectedDate={dataInventario}
                label="Selecionar data de inventário"
              />
            </View>

            {/* Botões */}
            <TextField
              label="Responsável pelo Encaminhamento"
              icon={{ lib: "MaterialIcons", name: "badge" }}
              placeholder="Nome do responsável"
              value={responsavelEncaminhamento}
              onChangeText={setResponsavelEncaminhamento}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={
                  loading ||
                  !destino ||
                  (modo === 'simples' && !itemEncontrado) ||
                  (modo === 'lote' && itensSelecionados.length === 0)
                }
                style={[
                  styles.button,
                  styles.primaryButton,
                  (loading || !destino || (modo === 'simples' && !itemEncontrado) || (modo === 'lote' && itensSelecionados.length === 0)) && styles.buttonDisabled
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Processando...' :
                    modo === 'simples' ? 'Registrar' :
                      `Encaminhar ${itensSelecionados.length} item(ns)`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 40,
  },
  modoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modoButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modoButtonText: {
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: CORES.gray900,
    paddingVertical: 12,
  },
  searchButton: {
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemVencidoCard: {
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 150,
  },
  itemVencidoNome: {
    fontWeight: '600',
    color: CORES.gray900,
  },
  itemVencidoNumero: {
    fontSize: 12,
    color: CORES.gray600,
    marginTop: 4,
  },
  itemEncontrado: {
    backgroundColor: CORES.primarySoft,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemEncontradoInfo: {
    flex: 1,
  },
  itemEncontradoNome: {
    fontWeight: '600',
    fontSize: 16,
    color: CORES.gray900,
  },
  itemEncontradoDetalhes: {
    color: CORES.gray600,
    fontSize: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectAllText: {
    color: CORES.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  counterText: {
    fontSize: 12,
    color: CORES.gray500,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: CORES.gray100,
    borderRadius: 8,
  },
  emptyText: {
    color: CORES.gray600,
    marginTop: 10,
  },
  listaContainer: {
    maxHeight: 250,
    borderWidth: 1,
    borderColor: CORES.gray200,
    borderRadius: 8,
    backgroundColor: CORES.white,
  },
  listaScroll: {
    maxHeight: 250,
  },
  itemLista: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemListaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemListaNome: {
    fontWeight: '600',
    color: CORES.gray900,
  },
  itemListaDetalhes: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  itemListaTexto: {
    fontSize: 12,
    color: CORES.gray600,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: Platform.OS === 'android' ? 20 : 0,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: CORES.primary,
  },
  primaryButtonText: {
    color: CORES.white,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.primary,
  },
  secondaryButtonText: {
    color: CORES.primary,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
