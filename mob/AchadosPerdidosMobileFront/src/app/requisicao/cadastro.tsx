import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Masks } from 'react-native-mask-input';
import AuthContainer from '@/components/ui/AuthContainer';
import TextField from '@/components/ui/TextField';
import Select from '@/components/ui/Select';
import OperadorField, { OperadorSelecionado } from '@/components/ui/OperadorField';
import { global } from '@/components/ui/styles';
import { requisicaoService } from '@/services/requisicaoService';
import { tipoService } from '@/services/tipoService';
import { itemService } from '@/services/itemService';
import { CORES } from '@/constants/cores';

export default function CadastroRequisicaoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [categoria, setCategoria] = useState<{ id: number; nome: string } | null>(null);
  const [descricao, setDescricao] = useState('');
  const [responsavelCadastro, setResponsavelCadastro] = useState('');
  const [operadorSelecionado, setOperadorSelecionado] = useState<OperadorSelecionado | null>(null);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const tipos = await tipoService.listarTipos();
      setCategorias(tipos);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const confirmarContinuacao = (titulo: string, mensagem: string) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(titulo, mensagem, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continuar', onPress: () => resolve(true) },
      ]);
    });

  const verificarItensParecidos = async () => {
    const itens = await itemService.buscarItensParecidos(categoria?.id ?? null, descricao);
    if (!itens.length) {
      return true;
    }

    const resumo = itens
      .slice(0, 3)
      .map((item) => `• #${item.numero_registro} ${item.nome}`)
      .join('\n');

    return confirmarContinuacao(
      'Itens parecidos encontrados',
      `Encontrei ${itens.length} item(ns) parecido(s):\n\n${resumo}\n\nDeseja continuar mesmo assim?`
    );
  };

  const handleSubmit = async () => {
    if (!nomeCliente || !telefone || !descricao) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const podeContinuar = await verificarItensParecidos();
    if (!podeContinuar) {
      return;
    }

    try {
      setLoading(true);

      const dados = {
        nome_cliente: nomeCliente,
        telefone,
        categoria_objeto: categoria?.nome || undefined,
        descricao,
        responsavel_cadastro: responsavelCadastro || undefined,
        operador_id: operadorSelecionado?.operador_id || null,
        assinatura_operador: operadorSelecionado?.assinatura_operador || null,
      };

      await requisicaoService.cadastrarRequisicao(dados);

      Alert.alert('Sucesso', 'Requisição cadastrada com sucesso! Em breve entraremos em contato.');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao cadastrar requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer title="Nova Requisição" subtitle="Registrar pedido de cliente">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={global.content}>
            <TextField
              label="Nome do Cliente *"
              icon={{ lib: 'MaterialIcons', name: 'person' }}
              placeholder="Nome completo"
              value={nomeCliente}
              onChangeText={(masked) => setNomeCliente(masked)}
            />

            <TextField
              label="Telefone *"
              icon={{ lib: 'MaterialIcons', name: 'phone' }}
              placeholder="(00) 00000-0000"
              value={telefone}
              onChangeText={(_masked, unmasked) => setTelefone(unmasked ?? '')}
              mask={Masks.BRL_PHONE}
              keyboardType="phone-pad"
            />

            <Select
              label="Categoria do Objeto"
              icon="category"
              value={categoria}
              options={categorias}
              onSelect={setCategoria}
              placeholder="Selecione a categoria do objeto"
            />

            <TextField
              label="Responsável pelo Cadastro"
              icon={{ lib: 'MaterialIcons', name: 'badge' }}
              placeholder="Nome do atendente"
              value={responsavelCadastro}
              onChangeText={(masked) => setResponsavelCadastro(masked)}
            />

            <OperadorField value={operadorSelecionado} onChange={setOperadorSelecionado} />

            <TextField
              label="Descrição do Objeto *"
              icon={{ lib: 'MaterialIcons', name: 'description' }}
              placeholder="Descreva o objeto perdido com detalhes"
              value={descricao}
              onChangeText={(masked) => setDescricao(masked)}
              multiline
              numberOfLines={4}
              style={styles.descricaoInput}
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
                <Text style={styles.primaryButtonText}>{loading ? 'Enviando...' : 'Enviar Requisição'}</Text>
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
  descricaoInput: {
    height: 100,
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
});
