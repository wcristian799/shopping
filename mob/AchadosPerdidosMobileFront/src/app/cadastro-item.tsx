import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '@/components/ui/AuthContainer';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import CameraButton from '@/components/ui/CameraButton';
import OperadorField, { OperadorSelecionado } from '@/components/ui/OperadorField';
import { global } from '@/components/ui/styles';
import { tipoService, TipoItem } from '@/services/tipoService';
import { localService, Local } from '@/services/localService';
import { caixaService, Caixa } from '@/services/caixaService';
import { imagemService } from '@/services/imagemService';
import { requisicaoService } from '@/services/requisicaoService';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { CORES } from '@/constants/cores';

type TipoItemEnum = 'generico' | 'eletronico' | 'vestuario';
type EstadoConservacao = 'preservado' | 'desgastado' | 'danificado';
type ModalCadastro = 'local' | 'tipo' | 'caixa' | null;

const estados: { id: string; nome: string }[] = [
  { id: 'preservado', nome: 'Preservado' },
  { id: 'desgastado', nome: 'Desgastado' },
  { id: 'danificado', nome: 'Danificado' },
];

export default function CadastroItemScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [tipos, setTipos] = useState<TipoItem[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [listaUsuarios, setListaUsuarios] = useState<{ id: number; nome: string }[]>([]);

  const [tipoItem, setTipoItem] = useState<TipoItemEnum>('generico');
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [numeroLacre, setNumeroLacre] = useState('');
  const [observacao, setObservacao] = useState('');
  const [nomeEntregador, setNomeEntregador] = useState('');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<{ id: number; nome: string } | null>(null);
  const [operadorSelecionado, setOperadorSelecionado] = useState<OperadorSelecionado | null>(null);

  const [tipo, setTipo] = useState<{ id: number; nome: string } | null>(null);
  const [local, setLocal] = useState<{ id: number; nome: string } | null>(null);
  const [caixa, setCaixa] = useState<{ id: number; nome: string; descricao?: string } | null>(null);
  const [estado, setEstado] = useState<{ id: string; nome: string } | null>(null);

  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [tamanho, setTamanho] = useState<'PP' | 'P' | 'M' | 'G' | 'GG' | ''>('');
  const [imagemUri, setImagemUri] = useState('');

  const [modalCadastro, setModalCadastro] = useState<ModalCadastro>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoPrazoDias, setNovoPrazoDias] = useState('');
  const [novoNumeroCaixa, setNovoNumeroCaixa] = useState('');
  const [novaDescricaoCaixa, setNovaDescricaoCaixa] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoadingData(true);
      const [tiposData, locaisData, caixasData, usuariosResponse] = await Promise.all([
        tipoService.listarTipos(),
        localService.listarLocais(),
        caixaService.listarCaixas(),
        api.get('/usuarios'),
      ]);
      setTipos(tiposData);
      setLocais(locaisData);
      setCaixas(caixasData);
      setListaUsuarios(usuariosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados para cadastro');
    } finally {
      setLoadingData(false);
    }
  };

  const confirmarContinuacao = (titulo: string, mensagem: string) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(titulo, mensagem, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continuar', onPress: () => resolve(true) },
      ]);
    });

  const verificarRequisicoesParecidas = async () => {
    const descricaoBase = (observacao || nome).trim();
    if (!descricaoBase) {
      return true;
    }

    const parecidas = await requisicaoService.buscarParecidas(tipo?.nome, descricaoBase);
    if (!parecidas.length) {
      return true;
    }

    const resumo = parecidas
      .slice(0, 3)
      .map((req) => `• ${req.nome_cliente}: ${req.descricao}`)
      .join('\n');

    return confirmarContinuacao(
      'Requisições parecidas encontradas',
      `Encontrei ${parecidas.length} requisição(ões) parecida(s):\n\n${resumo}\n\nDeseja continuar mesmo assim?`
    );
  };

  const salvarCatalogoRapido = async () => {
    try {
      if (modalCadastro === 'local') {
        if (!novoNome.trim()) {
          Alert.alert('Erro', 'Informe o nome do local');
          return;
        }
        const criado = await localService.criarLocal(novoNome.trim());
        setLocais((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)));
        setLocal(criado);
      }

      if (modalCadastro === 'tipo') {
        if (!novoNome.trim() || !novoPrazoDias) {
          Alert.alert('Erro', 'Informe nome e prazo em dias');
          return;
        }
        const criado = await tipoService.criarTipo(novoNome.trim(), parseInt(novoPrazoDias, 10));
        setTipos((prev) => [...prev, criado].sort((a, b) => a.nome.localeCompare(b.nome)));
        setTipo(criado);
      }

      if (modalCadastro === 'caixa') {
        if (!novoNumeroCaixa || !novaDescricaoCaixa.trim()) {
          Alert.alert('Erro', 'Informe número e descrição da caixa');
          return;
        }
        const criado = await caixaService.criarCaixa(parseInt(novoNumeroCaixa, 10), novaDescricaoCaixa.trim());
        setCaixas((prev) => [...prev, criado].sort((a, b) => a.numero - b.numero));
        setCaixa({ ...criado, nome: `Caixa ${criado.numero} - ${criado.descricao}` });
      }

      setModalCadastro(null);
      setNovoNome('');
      setNovoPrazoDias('');
      setNovoNumeroCaixa('');
      setNovaDescricaoCaixa('');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao criar cadastro rápido');
    }
  };

  const executarCadastro = async () => {
    const usuarioResponsavelId = responsavelSelecionado?.id || user?.id;

    if (!usuarioResponsavelId) {
      Alert.alert('Erro', 'Selecione o responsável pelo cadastro');
      return;
    }

    const dadosBase = {
      nome,
      marca: marca || undefined,
      numero_lacre: parseInt(numeroLacre, 10),
      estado_conservacao: estado!.id as EstadoConservacao,
      observacao: observacao || undefined,
      nome_entregador: nomeEntregador || undefined,
      local_id: local!.id,
      tipo_id: tipo!.id,
      caixa_id: caixa?.id || null,
      usuario_responsavel_id: usuarioResponsavelId,
      operador_id: operadorSelecionado?.operador_id || null,
      assinatura_operador: operadorSelecionado?.assinatura_operador || null,
    };

    let endpoint = '/itens/generico';
    let dados: Record<string, any> = dadosBase;

    if (tipoItem === 'eletronico') {
      endpoint = '/itens/eletronico';
      dados = { ...dadosBase, modelo };
    } else if (tipoItem === 'vestuario') {
      endpoint = '/itens/vestuario';
      dados = { ...dadosBase, cor, tamanho };
    }

    const response = await api.post(endpoint, dados);
    const itemId = response.data.item_id;

    if (imagemUri && itemId) {
      await imagemService.uploadImagemItem(itemId, imagemUri);
    }
  };

  const handleSubmit = async () => {
    if (!nome || !numeroLacre || !tipo || !local || !estado || !nomeEntregador) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (tipoItem === 'eletronico' && !modelo) {
      Alert.alert('Erro', 'Modelo é obrigatório para itens eletrônicos');
      return;
    }

    if (tipoItem === 'vestuario' && (!cor || !tamanho)) {
      Alert.alert('Erro', 'Cor e tamanho são obrigatórios para itens de vestuário');
      return;
    }

    const podeContinuar = await verificarRequisicoesParecidas();
    if (!podeContinuar) {
      return;
    }

    try {
      setLoading(true);
      await executarCadastro();
      Alert.alert('Sucesso', 'Item cadastrado com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao cadastrar item');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AuthContainer title="Carregando...">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.primary} />
        </View>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title="Novo Item" subtitle="Cadastre um item perdido">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={global.content}>
            <CameraButton onImageSelected={setImagemUri} imageUri={imagemUri} />

            <View style={global.inputGroup}>
              <Text style={global.label}>Tipo de Item *</Text>
              <View style={styles.tipoContainer}>
                {['generico', 'eletronico', 'vestuario'].map((tipoAtual) => (
                  <TouchableOpacity
                    key={tipoAtual}
                    onPress={() => setTipoItem(tipoAtual as TipoItemEnum)}
                    style={[
                      styles.tipoButton,
                      { backgroundColor: tipoItem === tipoAtual ? CORES.primary : CORES.gray100 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tipoButtonText,
                        { color: tipoItem === tipoAtual ? CORES.white : CORES.gray700 },
                      ]}
                    >
                      {tipoAtual === 'generico'
                        ? 'Genérico'
                        : tipoAtual === 'eletronico'
                          ? 'Eletrônico'
                          : 'Vestuário'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextField
              label="Nome do Item *"
              icon={{ lib: 'MaterialIcons', name: 'inventory' }}
              placeholder="Ex: Celular, Carteira, Óculos..."
              value={nome}
              onChangeText={(masked) => setNome(masked)}
            />

            <TextField
              label="Marca"
              icon={{ lib: 'MaterialIcons', name: 'branding-watermark' }}
              placeholder="Ex: Samsung, Nike, Ray-Ban..."
              value={marca}
              onChangeText={(masked) => setMarca(masked)}
            />

            <TextField
              label="Número do Lacre *"
              icon={{ lib: 'MaterialIcons', name: 'qr-code' }}
              placeholder="Digite o número do lacre"
              value={numeroLacre}
              onChangeText={(masked) => setNumeroLacre(masked)}
              keyboardType="numeric"
            />

            <Select
              label="Estado de Conservação *"
              icon="info-outline"
              value={estado}
              options={estados}
              onSelect={setEstado}
              placeholder="Selecione o estado"
            />

            <Select
              label="Local *"
              icon="place"
              value={local}
              options={locais}
              onSelect={setLocal}
              placeholder="Selecione o local"
              actionLabel="Novo local"
              onActionPress={() => setModalCadastro('local')}
            />

            <Select
              label="Categoria *"
              icon="category"
              value={tipo}
              options={tipos}
              onSelect={setTipo}
              placeholder="Selecione a categoria"
              actionLabel="Nova categoria"
              onActionPress={() => setModalCadastro('tipo')}
            />

            <Select
              label="Caixa (opcional)"
              icon="inbox"
              value={caixa}
              options={caixas.map((c) => ({ ...c, nome: `Caixa ${c.numero} - ${c.descricao}` }))}
              onSelect={setCaixa}
              placeholder="Selecione uma caixa"
              actionLabel="Nova caixa"
              onActionPress={() => setModalCadastro('caixa')}
            />

            <TextField
              label="Entregue por *"
              icon={{ lib: 'MaterialIcons', name: 'person-add' }}
              placeholder="Quem entregou o item?"
              value={nomeEntregador}
              onChangeText={(masked) => setNomeEntregador(masked)}
            />

            <Select
              label="Cadastrado por *"
              icon="person"
              value={responsavelSelecionado}
              options={listaUsuarios.map((u) => ({ id: u.id, nome: u.nome }))}
              onSelect={setResponsavelSelecionado}
              placeholder="Selecione o responsável"
            />

            <OperadorField value={operadorSelecionado} onChange={setOperadorSelecionado} />

            {tipoItem === 'eletronico' && (
              <TextField
                label="Modelo *"
                icon={{ lib: 'MaterialIcons', name: 'devices' }}
                placeholder="Digite o modelo"
                value={modelo}
                onChangeText={(masked) => setModelo(masked)}
              />
            )}

            {tipoItem === 'vestuario' && (
              <>
                <TextField
                  label="Cor *"
                  icon={{ lib: 'MaterialIcons', name: 'palette' }}
                  placeholder="Digite a cor"
                  value={cor}
                  onChangeText={(masked) => setCor(masked)}
                />

                <View style={global.inputGroup}>
                  <Text style={global.label}>Tamanho *</Text>
                  <View style={styles.tamanhoContainer}>
                    {['PP', 'P', 'M', 'G', 'GG'].map((tam) => (
                      <TouchableOpacity
                        key={tam}
                        onPress={() => setTamanho(tam as any)}
                        style={[
                          styles.tamanhoButton,
                          { backgroundColor: tamanho === tam ? CORES.primary : CORES.gray100 },
                        ]}
                      >
                        <Text style={[styles.tamanhoText, { color: tamanho === tam ? CORES.white : CORES.gray700 }]}>
                          {tam}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            <TextField
              label="Observação"
              icon={{ lib: 'MaterialIcons', name: 'notes' }}
              placeholder="Observações adicionais..."
              value={observacao}
              onChangeText={(masked) => setObservacao(masked)}
              multiline
              numberOfLines={3}
              style={styles.observacaoInput}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalCadastro !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalCadastro === 'local' && 'Novo local'}
                {modalCadastro === 'tipo' && 'Nova categoria'}
                {modalCadastro === 'caixa' && 'Nova caixa'}
              </Text>
              <TouchableOpacity onPress={() => setModalCadastro(null)}>
                <MaterialIcons name="close" size={24} color={CORES.primary} />
              </TouchableOpacity>
            </View>

            {(modalCadastro === 'local' || modalCadastro === 'tipo') && (
              <TextField
                label="Nome"
                icon={{ lib: 'MaterialIcons', name: 'edit' }}
                placeholder="Digite o nome"
                value={novoNome}
                onChangeText={(masked) => setNovoNome(masked)}
              />
            )}

            {modalCadastro === 'tipo' && (
              <TextField
                label="Prazo em dias"
                icon={{ lib: 'MaterialIcons', name: 'schedule' }}
                placeholder="Ex: 90"
                value={novoPrazoDias}
                onChangeText={(masked) => setNovoPrazoDias(masked)}
                keyboardType="numeric"
              />
            )}

            {modalCadastro === 'caixa' && (
              <>
                <TextField
                  label="Número da caixa"
                  icon={{ lib: 'MaterialIcons', name: 'pin' }}
                  placeholder="Ex: 12"
                  value={novoNumeroCaixa}
                  onChangeText={(masked) => setNovoNumeroCaixa(masked)}
                  keyboardType="numeric"
                />
                <TextField
                  label="Descrição"
                  icon={{ lib: 'MaterialIcons', name: 'description' }}
                  placeholder="Ex: Prateleira B"
                  value={novaDescricaoCaixa}
                  onChangeText={(masked) => setNovaDescricaoCaixa(masked)}
                />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setModalCadastro(null)}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={salvarCatalogoRapido}>
                <Text style={styles.primaryButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 40,
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tipoButtonText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tamanhoContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tamanhoButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tamanhoText: {
    fontWeight: '600',
  },
  observacaoInput: {
    height: 80,
    textAlignVertical: 'top',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    backgroundColor: CORES.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalPrimary: {
    flex: 1,
    backgroundColor: CORES.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  modalSecondary: {
    flex: 1,
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
});
