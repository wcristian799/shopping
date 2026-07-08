// src/app/filtros.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '@/components/ui/AuthContainer';
import { global } from '@/components/ui/styles';
import { useItems } from '@/contexts/ItemsContext';
import { tipoService, TipoItem } from '@/services/tipoService';
import { localService, Local } from '@/services/localService';
import { caixaService, Caixa } from '@/services/caixaService';
import { CORES } from '@/constants/cores';

// Opções de situação
const situacoes = [
  { id: 1, nome: 'No prazo', cor: CORES.badgeNoPrazo, texto: CORES.badgeNoPrazoText },
  { id: 2, nome: 'Vence hoje', cor: CORES.badgeVenceHoje, texto: CORES.badgeVenceHojeText },
  { id: 3, nome: 'Vencido', cor: CORES.badgeVencido, texto: CORES.badgeVencidoText },
  { id: 4, nome: 'Devolvido', cor: CORES.badgeDevolvido, texto: CORES.badgeDevolvidoText },
  { id: 5, nome: 'Finalizado', cor: CORES.badgeFinalizado, texto: CORES.badgeFinalizadoText },
];

// Opções de estado de conservação
const estadosConservacao = [
  { id: 'preservado', nome: 'Preservado' },
  { id: 'desgastado', nome: 'Desgastado' },
  { id: 'danificado', nome: 'Danificado' },
];

export default function FiltrosScreen() {
  const router = useRouter();
  const { filtros: filtrosContext, setFiltros: setFiltrosContext } = useItems();
  const [loading, setLoading] = useState(true);
  
  // Dados para os filtros
  const [tipos, setTipos] = useState<TipoItem[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  
  // Estados dos filtros (cópia local para edição)
  const [filtros, setFiltros] = useState({
    situacoes: [...filtrosContext.situacoes],
    estados: [...filtrosContext.estados],
    tipos: [...filtrosContext.tipos],
    locais: [...filtrosContext.locais],
    caixas: [...filtrosContext.caixas],
  });

  // Controles de "selecionar todos"
  const [selectAllSituacoes, setSelectAllSituacoes] = useState(false);
  const [selectAllEstados, setSelectAllEstados] = useState(false);
  const [selectAllTipos, setSelectAllTipos] = useState(false);
  const [selectAllLocais, setSelectAllLocais] = useState(false);
  const [selectAllCaixas, setSelectAllCaixas] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (situacoes.length > 0) {
      setSelectAllSituacoes(filtros.situacoes.length === situacoes.length);
    }
  }, [filtros.situacoes]);

  useEffect(() => {
    if (estadosConservacao.length > 0) {
      setSelectAllEstados(filtros.estados.length === estadosConservacao.length);
    }
  }, [filtros.estados]);

  useEffect(() => {
    if (tipos.length > 0) {
      setSelectAllTipos(filtros.tipos.length === tipos.length);
    }
  }, [filtros.tipos, tipos]);

  useEffect(() => {
    if (locais.length > 0) {
      setSelectAllLocais(filtros.locais.length === locais.length);
    }
  }, [filtros.locais, locais]);

  useEffect(() => {
    if (caixas.length > 0) {
      setSelectAllCaixas(filtros.caixas.length === caixas.length);
    }
  }, [filtros.caixas, caixas]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [tiposData, locaisData, caixasData] = await Promise.all([
        tipoService.listarTipos(),
        localService.listarLocais(),
        caixaService.listarCaixas(),
      ]);
      setTipos(tiposData);
      setLocais(locaisData);
      setCaixas(caixasData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados para filtros');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FUNÇÕES DE SELEÇÃO
  // ============================================
  const toggleSituacao = (id: number) => {
    setFiltros(prev => ({
      ...prev,
      situacoes: prev.situacoes.includes(id)
        ? prev.situacoes.filter(s => s !== id)
        : [...prev.situacoes, id]
    }));
  };

  const toggleSelectAllSituacoes = () => {
    if (selectAllSituacoes) {
      setFiltros(prev => ({ ...prev, situacoes: [] }));
    } else {
      setFiltros(prev => ({ ...prev, situacoes: situacoes.map(s => s.id) }));
    }
  };

  const toggleEstado = (id: string) => {
    setFiltros(prev => ({
      ...prev,
      estados: prev.estados.includes(id)
        ? prev.estados.filter(e => e !== id)
        : [...prev.estados, id]
    }));
  };

  const toggleSelectAllEstados = () => {
    if (selectAllEstados) {
      setFiltros(prev => ({ ...prev, estados: [] }));
    } else {
      setFiltros(prev => ({ ...prev, estados: estadosConservacao.map(e => e.id) }));
    }
  };

  const toggleTipo = (id: number) => {
    setFiltros(prev => ({
      ...prev,
      tipos: prev.tipos.includes(id)
        ? prev.tipos.filter(t => t !== id)
        : [...prev.tipos, id]
    }));
  };

  const toggleSelectAllTipos = () => {
    if (selectAllTipos) {
      setFiltros(prev => ({ ...prev, tipos: [] }));
    } else {
      setFiltros(prev => ({ ...prev, tipos: tipos.map(t => t.id) }));
    }
  };

  const toggleLocal = (id: number) => {
    setFiltros(prev => ({
      ...prev,
      locais: prev.locais.includes(id)
        ? prev.locais.filter(l => l !== id)
        : [...prev.locais, id]
    }));
  };

  const toggleSelectAllLocais = () => {
    if (selectAllLocais) {
      setFiltros(prev => ({ ...prev, locais: [] }));
    } else {
      setFiltros(prev => ({ ...prev, locais: locais.map(l => l.id) }));
    }
  };

  const toggleCaixa = (id: number) => {
    setFiltros(prev => ({
      ...prev,
      caixas: prev.caixas.includes(id)
        ? prev.caixas.filter(c => c !== id)
        : [...prev.caixas, id]
    }));
  };

  const toggleSelectAllCaixas = () => {
    if (selectAllCaixas) {
      setFiltros(prev => ({ ...prev, caixas: [] }));
    } else {
      setFiltros(prev => ({ ...prev, caixas: caixas.map(c => c.id) }));
    }
  };

  // ============================================
  // APLICAR FILTROS
  // ============================================
  const aplicarFiltros = () => {
    setFiltrosContext({
      situacoes: filtros.situacoes,
      estados: filtros.estados,
      tipos: filtros.tipos,
      locais: filtros.locais,
      caixas: filtros.caixas,
    });
    
    router.back();
  };

  const limparFiltros = () => {
    setFiltros({
      situacoes: [],
      estados: [],
      tipos: [],
      locais: [],
      caixas: [],
    });
  };

  if (loading) {
    return (
      <AuthContainer title="Carregando...">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.primary} />
        </View>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title="Filtrar Itens" subtitle="Selecione os filtros desejados">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={global.content}>
          {/* ============================================ */}
          {/* FILTRO POR SITUAÇÃO */}
          {/* ============================================ */}
          <View style={global.inputGroup}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Situação</Text>
              <TouchableOpacity 
                onPress={toggleSelectAllSituacoes}
                style={styles.selectAllButton}
              >
                <MaterialIcons 
                  name={selectAllSituacoes ? "check-box" : "check-box-outline-blank"} 
                  size={20} 
                  color={CORES.primary} 
                />
                <Text style={styles.selectAllText}>
                  {selectAllSituacoes ? 'Limpar tudo' : 'Selecionar todos'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {situacoes.map((situacao) => (
                <TouchableOpacity
                  key={situacao.id}
                  onPress={() => toggleSituacao(situacao.id)}
                  style={[
                    styles.optionChip,
                    { 
                      backgroundColor: filtros.situacoes.includes(situacao.id) 
                        ? situacao.cor 
                        : CORES.white,
                      borderColor: filtros.situacoes.includes(situacao.id) 
                        ? situacao.texto 
                        : CORES.gray300,
                    }
                  ]}
                >
                  <MaterialIcons 
                    name={filtros.situacoes.includes(situacao.id) ? "check" : "add"} 
                    size={16} 
                    color={filtros.situacoes.includes(situacao.id) ? situacao.texto : CORES.gray600} 
                  />
                  <Text style={[
                    styles.optionText,
                    { 
                      color: filtros.situacoes.includes(situacao.id) 
                        ? situacao.texto 
                        : CORES.gray700
                    }
                  ]}>
                    {situacao.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.counterText}>
              {filtros.situacoes.length} situação(ões) selecionada(s)
            </Text>
          </View>

          {/* ============================================ */}
          {/* FILTRO POR ESTADO DE CONSERVAÇÃO */}
          {/* ============================================ */}
          <View style={global.inputGroup}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Estado de Conservação</Text>
              <TouchableOpacity 
                onPress={toggleSelectAllEstados}
                style={styles.selectAllButton}
              >
                <MaterialIcons 
                  name={selectAllEstados ? "check-box" : "check-box-outline-blank"} 
                  size={20} 
                  color={CORES.primary} 
                />
                <Text style={styles.selectAllText}>
                  {selectAllEstados ? 'Limpar tudo' : 'Selecionar todos'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {estadosConservacao.map((estado) => (
                <TouchableOpacity
                  key={estado.id}
                  onPress={() => toggleEstado(estado.id)}
                  style={[
                    styles.optionChip,
                    { 
                      backgroundColor: filtros.estados.includes(estado.id) 
                        ? CORES.primary 
                        : CORES.white,
                      borderColor: filtros.estados.includes(estado.id) 
                        ? CORES.primary 
                        : CORES.gray300,
                    }
                  ]}
                >
                  <MaterialIcons 
                    name={filtros.estados.includes(estado.id) ? "check" : "add"} 
                    size={16} 
                    color={filtros.estados.includes(estado.id) ? CORES.white : CORES.gray600} 
                  />
                  <Text style={[
                    styles.optionText,
                    { 
                      color: filtros.estados.includes(estado.id) 
                        ? CORES.white 
                        : CORES.gray700
                    }
                  ]}>
                    {estado.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.counterText}>
              {filtros.estados.length} estado(s) selecionado(s)
            </Text>
          </View>

          {/* ============================================ */}
          {/* FILTRO POR TIPO */}
          {/* ============================================ */}
          <View style={global.inputGroup}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Tipo de Item</Text>
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
                      backgroundColor: filtros.tipos.includes(tipo.id) 
                        ? CORES.primary 
                        : CORES.white,
                      borderColor: filtros.tipos.includes(tipo.id) 
                        ? CORES.primary 
                        : CORES.gray300,
                    }
                  ]}
                >
                  <MaterialIcons 
                    name={filtros.tipos.includes(tipo.id) ? "check" : "add"} 
                    size={16} 
                    color={filtros.tipos.includes(tipo.id) ? CORES.white : CORES.gray600} 
                  />
                  <Text style={[
                    styles.optionText,
                    { 
                      color: filtros.tipos.includes(tipo.id) 
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
              {filtros.tipos.length} tipo(s) selecionado(s)
            </Text>
          </View>

          {/* ============================================ */}
          {/* FILTRO POR LOCAL */}
          {/* ============================================ */}
          <View style={global.inputGroup}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Local</Text>
              <TouchableOpacity 
                onPress={toggleSelectAllLocais}
                style={styles.selectAllButton}
              >
                <MaterialIcons 
                  name={selectAllLocais ? "check-box" : "check-box-outline-blank"} 
                  size={20} 
                  color={CORES.primary} 
                />
                <Text style={styles.selectAllText}>
                  {selectAllLocais ? 'Limpar tudo' : 'Selecionar todos'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {locais.map((local) => (
                <TouchableOpacity
                  key={local.id}
                  onPress={() => toggleLocal(local.id)}
                  style={[
                    styles.optionChip,
                    { 
                      backgroundColor: filtros.locais.includes(local.id) 
                        ? CORES.primary 
                        : CORES.white,
                      borderColor: filtros.locais.includes(local.id) 
                        ? CORES.primary 
                        : CORES.gray300,
                    }
                  ]}
                >
                  <MaterialIcons 
                    name={filtros.locais.includes(local.id) ? "check" : "add"} 
                    size={16} 
                    color={filtros.locais.includes(local.id) ? CORES.white : CORES.gray600} 
                  />
                  <Text style={[
                    styles.optionText,
                    { 
                      color: filtros.locais.includes(local.id) 
                        ? CORES.white 
                        : CORES.gray700
                    }
                  ]}>
                    {local.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.counterText}>
              {filtros.locais.length} local(is) selecionado(s)
            </Text>
          </View>

          {/* ============================================ */}
          {/* FILTRO POR CAIXA */}
          {/* ============================================ */}
          <View style={global.inputGroup}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Caixa</Text>
              <TouchableOpacity 
                onPress={toggleSelectAllCaixas}
                style={styles.selectAllButton}
              >
                <MaterialIcons 
                  name={selectAllCaixas ? "check-box" : "check-box-outline-blank"} 
                  size={20} 
                  color={CORES.primary} 
                />
                <Text style={styles.selectAllText}>
                  {selectAllCaixas ? 'Limpar tudo' : 'Selecionar todos'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {caixas.map((caixa) => (
                <TouchableOpacity
                  key={caixa.id}
                  onPress={() => toggleCaixa(caixa.id)}
                  style={[
                    styles.optionChip,
                    { 
                      backgroundColor: filtros.caixas.includes(caixa.id) 
                        ? CORES.primary 
                        : CORES.white,
                      borderColor: filtros.caixas.includes(caixa.id) 
                        ? CORES.primary 
                        : CORES.gray300,
                    }
                  ]}
                >
                  <MaterialIcons 
                    name={filtros.caixas.includes(caixa.id) ? "check" : "add"} 
                    size={16} 
                    color={filtros.caixas.includes(caixa.id) ? CORES.white : CORES.gray600} 
                  />
                  <Text style={[
                    styles.optionText,
                    { 
                      color: filtros.caixas.includes(caixa.id) 
                        ? CORES.white 
                        : CORES.gray700
                    }
                  ]} numberOfLines={1}>
                    Caixa {caixa.numero} - {caixa.descricao}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.counterText}>
              {filtros.caixas.length} caixa(s) selecionada(s)
            </Text>
          </View>

          {/* ============================================ */}
          {/* BOTÕES */}
          {/* ============================================ */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={limparFiltros}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={aplicarFiltros}
              style={[styles.button, styles.primaryButton]}
            >
              <Text style={styles.primaryButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.primary,
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
    borderWidth: 1.5, // Aumentado para 1.5
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  counterText: {
    fontSize: 12,
    color: CORES.gray500,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: CORES.white,
    borderWidth: 1.5,
    borderColor: CORES.primary,
  },
  secondaryButtonText: {
    color: CORES.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});