// src/app/entrega/cadastro.tsx (VERSÃO COMPLETA COM ITEM POR PARÂMETRO)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Masks } from 'react-native-mask-input';
import AuthContainer from '@/components/ui/AuthContainer';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import CameraButton from '@/components/ui/CameraButton';
import SignatureModal from '@/components/ui/SignatureModal';
import { global } from '@/components/ui/styles';
import { entregaService } from '@/services/entregaService';
import { requisicaoService, Requisicao } from '@/services/requisicaoService';
import { termoEntregaService } from '@/services/termoEntregaService';
import { useAuth } from '@/contexts/AuthContext';
import { CORES } from '@/constants/cores';

type TipoRegistro = 'Procedimento padrão' | 'Registro adicional de evidência';
type BuscaTipo = 'registro' | 'nome' | 'lacre';

const tiposRegistro: { id: TipoRegistro; nome: string }[] = [
  { id: 'Procedimento padrão', nome: 'Procedimento padrão' },
  { id: 'Registro adicional de evidência', nome: 'Registro adicional de evidência' },
];

export default function CadastroEntregaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();
  const [loading, setLoading] = useState(false);
  const [buscandoItem, setBuscandoItem] = useState(false);
  const [gerandoTermo, setGerandoTermo] = useState(false);
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);

  // Estados para assinatura e termo
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [assinaturaBase64, setAssinaturaBase64] = useState<string>('');
  const [termoGerado, setTermoGerado] = useState(false);
  const [termoPath, setTermoPath] = useState<string>('');

  // Campos do formulário
  const [tipoRegistro, setTipoRegistro] = useState<{ id: TipoRegistro; nome: string } | null>(null);
  
  // Busca de item
  const [buscaTipo, setBuscaTipo] = useState<BuscaTipo>('nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  
  // Requisição associada
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState<{ id: number; nome: string } | null>(null);
  
  // Dados do proprietário
  const [proprietarioNome, setProprietarioNome] = useState('');
  const [proprietarioTelefone, setProprietarioTelefone] = useState('');
  const [proprietarioCpf, setProprietarioCpf] = useState('');
  const [proprietarioRg, setProprietarioRg] = useState('');

  // Imagem da entrega
  const [imagemUri, setImagemUri] = useState('');

  // ============================================
  // EFECT PARA CARREGAR ITEM VINDO DOS PARÂMETROS
  // ============================================
  useEffect(() => {
    carregarRequisicoes();
  }, []);

  useEffect(() => {
    if (itemId) {
      carregarItemPorId(Number(itemId));
    }
  }, [itemId]);

  const carregarRequisicoes = async () => {
    try {
      const data = await requisicaoService.listarPendentes();
      setRequisicoes(data);
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
    }
  };

  const carregarItemPorId = async (id: number) => {
    try {
      setBuscandoItem(true);
      const item = await entregaService.buscarItemPorId(id);
      
      if (item) {
        if (item.situacao_id === 4) {
          Alert.alert('Erro', 'Este item já foi entregue');
          return;
        }
        
        if (item.situacao_id === 5) {
          Alert.alert('Erro', 'Este item já foi finalizado e não pode ser entregue');
          return;
        }
        
        setItemSelecionado(item);
        Alert.alert('Sucesso', `Item carregado: ${item.nome}`);
      } else {
        Alert.alert('Erro', 'Item não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar item:', error);
      Alert.alert('Erro', 'Não foi possível carregar o item');
    } finally {
      setBuscandoItem(false);
    }
  };

  const buscarItem = async () => {
    if (!termoBusca.trim()) {
      Alert.alert('Erro', 'Digite um termo para busca');
      return;
    }

    try {
      setBuscandoItem(true);
      setMostrarResultados(true);
      
      let resultados: any[] = [];
      
      if (buscaTipo === 'registro' && /^\d+$/.test(termoBusca)) {
        const item = await entregaService.buscarItemPorNumeroRegistro(parseInt(termoBusca));
        resultados = item ? [item] : [];
      } else if (buscaTipo === 'lacre' && /^\d+$/.test(termoBusca)) {
        resultados = await entregaService.buscarItemPorLacre(parseInt(termoBusca));
      } else {
        resultados = await entregaService.buscarItemPorTermo(termoBusca);
      }
      
      setResultadosBusca(resultados);
      
      if (resultados.length === 0) {
        Alert.alert('Aviso', 'Nenhum item encontrado');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao buscar itens');
      setResultadosBusca([]);
    } finally {
      setBuscandoItem(false);
    }
  };

  const selecionarItem = (item: any) => {
    if (item.situacao_id === 4) {
      Alert.alert('Erro', 'Este item já foi entregue');
      return;
    }

    if (item.situacao_id === 5) {
      Alert.alert('Erro', 'Este item já foi finalizado e não pode ser entregue');
      return;
    }

    setItemSelecionado(item);
    setMostrarResultados(false);
    setTermoBusca('');
    setResultadosBusca([]);
    
    if (requisicaoSelecionada) {
      const requisicao = requisicoes.find(r => r.id === requisicaoSelecionada.id);
      if (requisicao) {
        setProprietarioNome(requisicao.nome_cliente);
        setProprietarioTelefone(requisicao.telefone);
      }
    }
  };

  const selecionarRequisicao = (req: any) => {
    setRequisicaoSelecionada(req);
    setProprietarioNome(req.nome_cliente);
    setProprietarioTelefone(req.telefone);
  };

  // ============================================
  // FUNÇÃO PARA GERAR O TERMO
  // ============================================
  const gerarTermoEntrega = async () => {
    if (!itemSelecionado || !proprietarioNome || !proprietarioTelefone) {
      Alert.alert('Erro', 'Selecione um item e preencha os dados do proprietário primeiro');
      return;
    }

    if (!assinaturaBase64) {
      Alert.alert('Atenção', 'Você precisa assinar o termo primeiro');
      setSignatureModalVisible(true);
      return;
    }

    try {
      setGerandoTermo(true);

      // Gerar código de autenticação temporário
      const codigoTemp = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Formatar data atual
      const dataAtual = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const dadosTermo = {
        codigo: codigoTemp,
        dataEntrega: dataAtual,
        proprietario: {
          nome: proprietarioNome,
          telefone: proprietarioTelefone,
          cpf: proprietarioCpf,
          rg: proprietarioRg,
        },
        item: {
          nome: itemSelecionado.nome,
          numeroRegistro: itemSelecionado.numero_registro,
          numeroLacre: itemSelecionado.numero_lacre,
          marca: itemSelecionado.marca,
        },
        assinaturaBase64: assinaturaBase64,
      };

      // Gerar PDF
      const pdfPath = await termoEntregaService.gerarTermo(dadosTermo);
      setTermoPath(pdfPath);
      setTermoGerado(true);

      // Abrir o PDF para visualização
      await termoEntregaService.visualizarPDF(pdfPath);

      Alert.alert('Sucesso', 'Termo gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar termo:', error);
      Alert.alert('Erro', 'Não foi possível gerar o termo de entrega');
    } finally {
      setGerandoTermo(false);
    }
  };

  const handleAssinaturaSalva = (signature: string) => {
    setAssinaturaBase64(signature);
    Alert.alert('Sucesso', 'Assinatura salva com sucesso!');
  };

  const handleSubmit = async () => {
    if (!tipoRegistro || !itemSelecionado || !proprietarioNome || !proprietarioTelefone) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!termoGerado) {
      Alert.alert('Atenção', 'Você precisa gerar o termo de entrega antes de registrar');
      return;
    }

    try {
      setLoading(true);

      const dados = {
        tipo_registro: tipoRegistro.id,
        proprietario: {
          nome: proprietarioNome,
          telefone: proprietarioTelefone,
          cpf: proprietarioCpf || undefined,
          rg: proprietarioRg || undefined,
        },
        item_id: itemSelecionado.id,
      };

      const response = await entregaService.registrarEntrega(dados);
      const entregaId = response.entrega_id;
      
      if (imagemUri && entregaId) {
        await entregaService.uploadImagemEntrega(entregaId, imagemUri);
      }
      
      if (requisicaoSelecionada) {
        await requisicaoService.associarItemEncontrado(requisicaoSelecionada.id, itemSelecionado.id);
      }
      
      Alert.alert(
        'Sucesso', 
        `Entrega registrada com sucesso!\nCódigo: ${response.entrega_id}`
      );
      router.back();
      
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao registrar entrega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Nova Entrega" subtitle="Registrar devolução de item">
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
            {/* Botão de Câmera */}
            <CameraButton
              onImageSelected={setImagemUri}
              imageUri={imagemUri}
            />

            {/* Tipo de Registro */}
            <Select
              label="Tipo de Registro *"
              icon="assignment"
              value={tipoRegistro}
              options={tiposRegistro}
              onSelect={setTipoRegistro}
              placeholder="Selecione o tipo"
            />

            {/* Requisição Associada */}
            <Select
              label="Requisição (opcional)"
              icon="list-alt"
              value={requisicaoSelecionada}
              options={requisicoes.map(r => ({ 
                id: r.id, 
                nome: `${r.nome_cliente} - ${r.descricao.substring(0, 30)}...` 
              }))}
              onSelect={selecionarRequisicao}
              placeholder="Selecione uma requisição"
            />

            {/* Busca de Item */}
            <View style={global.inputGroup}>
              <Text style={global.label}>Buscar Item *</Text>
              
              <View style={styles.buscaTipoContainer}>
                {[
                  { id: 'registro', label: 'Nº Registro', icon: 'qr-code' },
                  { id: 'nome', label: 'Nome', icon: 'search' },
                  { id: 'lacre', label: 'Lacre', icon: 'lock' },
                ].map((tipo) => (
                  <TouchableOpacity
                    key={tipo.id}
                    onPress={() => setBuscaTipo(tipo.id as BuscaTipo)}
                    style={[
                      styles.buscaTipoButton,
                      { 
                        backgroundColor: buscaTipo === tipo.id 
                          ? CORES.primary 
                          : CORES.gray100 
                      }
                    ]}
                  >
                    <MaterialIcons 
                      name={tipo.icon as any} 
                      size={16} 
                      color={buscaTipo === tipo.id ? CORES.white : CORES.gray600} 
                    />
                    <Text style={[
                      styles.buscaTipoText,
                      { color: buscaTipo === tipo.id ? CORES.white : CORES.gray600 }
                    ]}>
                      {tipo.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.searchRow}>
                <View style={[global.inputIcon, styles.searchInput]}>
                  <MaterialIcons 
                    name={buscaTipo === 'registro' ? 'qr-code' : buscaTipo === 'lacre' ? 'lock' : 'search'} 
                    size={23} 
                    color={CORES.primary} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={
                      buscaTipo === 'registro' ? "Digite o número de registro" :
                      buscaTipo === 'lacre' ? "Digite o número do lacre" :
                      "Digite o nome do item"
                    }
                    placeholderTextColor={CORES.gray400}
                    value={termoBusca}
                    onChangeText={setTermoBusca}
                    keyboardType={buscaTipo !== 'nome' ? 'numeric' : 'default'}
                    autoCapitalize={buscaTipo === 'nome' ? 'words' : 'none'}
                    onSubmitEditing={buscarItem}
                    returnKeyType="search"
                  />
                </View>
                <TouchableOpacity
                  onPress={buscarItem}
                  disabled={buscandoItem}
                  style={[
                    styles.searchButton,
                    { opacity: buscandoItem ? 0.5 : 1 }
                  ]}
                >
                  {buscandoItem ? (
                    <ActivityIndicator color={CORES.white} />
                  ) : (
                    <MaterialIcons name="search" size={24} color={CORES.white} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {mostrarResultados && resultadosBusca.length > 0 && (
              <View style={styles.resultadosContainer}>
                <ScrollView style={styles.resultadosList}>
                  {resultadosBusca.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => selecionarItem(item)}
                      style={[
                        styles.resultadoItem,
                        itemSelecionado?.id === item.id && styles.resultadoItemSelecionado
                      ]}
                    >
                      <Text style={styles.resultadoNome}>{item.nome}</Text>
                      <View style={styles.resultadoDetalhes}>
                        <Text style={styles.resultadoTexto}>
                          Nº: {item.numero_registro}
                        </Text>
                        <Text style={styles.resultadoTexto}>
                          Lacre: {item.numero_lacre}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {itemSelecionado && (
              <View style={styles.itemSelecionado}>
                <MaterialIcons name="check-circle" size={24} color={CORES.success} />
                <View style={styles.itemSelecionadoInfo}>
                  <Text style={styles.itemSelecionadoNome}>{itemSelecionado.nome}</Text>
                  <Text style={styles.itemSelecionadoDetalhes}>
                    Nº Registro: {itemSelecionado.numero_registro} | Lacre: {itemSelecionado.numero_lacre}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setItemSelecionado(null)}>
                  <MaterialIcons name="close" size={20} color={CORES.gray500} />
                </TouchableOpacity>
              </View>
            )}

            {/* Dados do Proprietário */}
            <Text style={[global.label, styles.sectionLabel]}>
              Dados do Proprietário
            </Text>

            <TextField
              label="Nome *"
              icon={{ lib: "MaterialIcons", name: "person" }}
              placeholder="Nome completo"
              value={proprietarioNome}
              onChangeText={setProprietarioNome}
            />

            <TextField
              label="Telefone *"
              icon={{ lib: "MaterialIcons", name: "phone" }}
              placeholder="(00) 00000-0000"
              value={proprietarioTelefone}
              onChangeText={(masked, unmasked) => setProprietarioTelefone(unmasked ?? '')}
              mask={Masks.BRL_PHONE}
              keyboardType="phone-pad"
            />

            <TextField
              label="CPF (opcional)"
              icon={{ lib: "MaterialIcons", name: "badge" }}
              placeholder="000.000.000-00"
              value={proprietarioCpf}
              onChangeText={(masked, unmasked) => setProprietarioCpf(unmasked ?? '')}
              mask={Masks.BRL_CPF}
              keyboardType="numeric"
            />

            <TextField
              label="RG (opcional)"
              icon={{ lib: "MaterialIcons", name: "credit-card" }}
              placeholder="00.000.000-0"
              value={proprietarioRg}
              onChangeText={(masked, unmasked) => setProprietarioRg(unmasked ?? '')}
              mask={[/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/]}
              keyboardType="numeric"
            />

            {/* ============================================ */}
            {/* SEÇÃO DO TERMO DE ENTREGA */}
            {/* ============================================ */}
            <View style={styles.termoContainer}>
              <View style={styles.termoHeader}>
                <MaterialIcons name="description" size={22} color={CORES.primary} />
                <Text style={styles.termoTitle}>Termo de Entrega</Text>
              </View>

              {/* Botão para abrir modal de assinatura */}
              <TouchableOpacity
                style={[
                  styles.signatureButton,
                  assinaturaBase64 && styles.signatureButtonSuccess
                ]}
                onPress={() => setSignatureModalVisible(true)}
              >
                <MaterialIcons 
                  name={assinaturaBase64 ? "check-circle" : "edit"} 
                  size={24} 
                  color={assinaturaBase64 ? CORES.success : CORES.white} 
                />
                <Text style={[
                  styles.signatureButtonText,
                  assinaturaBase64 && styles.signatureButtonTextSuccess
                ]}>
                  {assinaturaBase64 ? 'Assinatura registrada' : 'Assinar termo'}
                </Text>
              </TouchableOpacity>

              {/* Botão para gerar termo */}
              <TouchableOpacity
                style={[
                  styles.gerarTermoButton,
                  termoGerado && styles.gerarTermoButtonSuccess,
                  gerandoTermo && styles.buttonDisabled
                ]}
                onPress={gerarTermoEntrega}
                disabled={gerandoTermo}
              >
                {gerandoTermo ? (
                  <ActivityIndicator color={CORES.white} />
                ) : (
                  <>
                    <MaterialIcons 
                      name={termoGerado ? "check-circle" : "picture-as-pdf"} 
                      size={24} 
                      color={CORES.white} 
                    />
                    <Text style={styles.gerarTermoButtonText}>
                      {termoGerado ? 'Termo gerado' : 'Gerar Termo de Entrega'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {termoGerado && (
                <View style={styles.termoInfo}>
                  <MaterialIcons name="info" size={16} color={CORES.success} />
                  <Text style={styles.termoInfoText}>
                    Termo gerado e assinado. Pode prosseguir com o registro.
                  </Text>
                </View>
              )}
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.button, styles.secondaryButton]}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || !itemSelecionado || !termoGerado}
                style={[
                  styles.button, 
                  styles.primaryButton,
                  (loading || !itemSelecionado || !termoGerado) && styles.buttonDisabled
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Registrando...' : 'Registrar Entrega'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Assinatura */}
      <SignatureModal
        visible={signatureModalVisible}
        onClose={() => setSignatureModalVisible(false)}
        onSave={handleAssinaturaSalva}
      />
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
  buscaTipoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  buscaTipoButton: {
    flex: 1,
    minWidth: 100,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  buscaTipoText: {
    fontSize: 12,
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
    backgroundColor: CORES.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultadosContainer: {
    marginBottom: 16,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: CORES.gray200,
    borderRadius: 8,
    backgroundColor: CORES.white,
  },
  resultadosList: {
    maxHeight: 200,
  },
  resultadoItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  resultadoItemSelecionado: {
    backgroundColor: CORES.primarySoft,
  },
  resultadoNome: {
    fontWeight: '600',
    color: CORES.gray900,
    marginBottom: 4,
  },
  resultadoDetalhes: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  resultadoTexto: {
    fontSize: 12,
    color: CORES.gray600,
  },
  itemSelecionado: {
    backgroundColor: CORES.primarySoft,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemSelecionadoInfo: {
    flex: 1,
  },
  itemSelecionadoNome: {
    fontWeight: '600',
    fontSize: 16,
    color: CORES.gray900,
  },
  itemSelecionadoDetalhes: {
    color: CORES.gray600,
    fontSize: 12,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
  },
  // Estilos para o termo
  termoContainer: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: CORES.primary,
    borderStyle: 'dashed',
  },
  termoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  termoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.primary,
  },
  signatureButton: {
    backgroundColor: CORES.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  signatureButtonSuccess: {
    backgroundColor: CORES.white,
    borderWidth: 2,
    borderColor: CORES.success,
  },
  signatureButtonText: {
    color: CORES.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signatureButtonTextSuccess: {
    color: CORES.success,
  },
  gerarTermoButton: {
    backgroundColor: CORES.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  gerarTermoButtonSuccess: {
    backgroundColor: CORES.success,
  },
  gerarTermoButtonText: {
    color: CORES.white,
    fontSize: 16,
    fontWeight: '600',
  },
  termoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: CORES.primarySoft,
    borderRadius: 8,
  },
  termoInfoText: {
    flex: 1,
    color: CORES.gray700,
    fontSize: 13,
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
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.primary,
  },
  secondaryButtonText: {
    color: CORES.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});