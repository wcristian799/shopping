import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { requisicaoService, RequisicaoComDetalhes } from '@/services/requisicaoService';
import { itemService } from '@/services/itemService';
import { ItemComFoto } from '@/types/item';
import { CORES } from '@/constants/cores';

function formatarDataHora(data: string) {
  const valor = new Date(data);
  return (
    valor.toLocaleDateString('pt-BR') +
    ' às ' +
    valor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function RequisicaoDetalhesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [requisicao, setRequisicao] = useState<RequisicaoComDetalhes | null>(null);
  const [sugestoes, setSugestoes] = useState<ItemComFoto[]>([]);

  const requisicaoId = useMemo(() => Number(id), [id]);

  const carregar = async () => {
    try {
      setLoading(true);
      const dados = await requisicaoService.buscarPorId(requisicaoId);
      setRequisicao(dados);

      if (dados && !dados.encontrado) {
        const itensParecidos = await itemService.buscarItensParecidos(
          null,
          `${dados.categoria_objeto || ''} ${dados.descricao}`.trim()
        );
        setSugestoes(itensParecidos);
      } else {
        setSugestoes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(requisicaoId)) {
      carregar();
    }
  }, [requisicaoId]);

  const vincularItem = async (itemId: number) => {
    if (!requisicao) return;

    try {
      setSalvando(true);
      await requisicaoService.associarItemEncontrado(requisicao.id, itemId);
      Alert.alert('Sucesso', 'Item vinculado à requisição com sucesso.');
      await carregar();
    } catch (error) {
      console.error('Erro ao vincular item:', error);
      Alert.alert('Erro', 'Não foi possível vincular o item.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CORES.primary} />
      </View>
    );
  }

  if (!requisicao) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={56} color={CORES.gray400} />
        <Text style={styles.errorText}>Requisição não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={CORES.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Requisição</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={sugestoes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.card}>
              <View style={styles.badgesRow}>
                <View style={styles.codeBadge}>
                  <MaterialIcons name="qr-code" size={14} color={CORES.primary} />
                  <Text style={styles.codeText}>{requisicao.codigo_requisicao}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    requisicao.encontrado ? styles.statusSuccess : styles.statusWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: requisicao.encontrado ? CORES.success : CORES.warning },
                    ]}
                  >
                    {requisicao.encontrado ? 'Encontrado' : 'Pendente'}
                  </Text>
                </View>
              </View>

              <Text style={styles.nomeCliente}>{requisicao.nome_cliente}</Text>
              <Text style={styles.descricao}>{requisicao.descricao}</Text>

              <Text style={styles.campoLabel}>Telefone</Text>
              <Text style={styles.campoValor}>{requisicao.telefone}</Text>

              <Text style={styles.campoLabel}>Categoria</Text>
              <Text style={styles.campoValor}>{requisicao.categoria_objeto || '-'}</Text>

              <Text style={styles.campoLabel}>Data</Text>
              <Text style={styles.campoValor}>{formatarDataHora(requisicao.data_requisicao)}</Text>

              <Text style={styles.campoLabel}>Responsável</Text>
              <Text style={styles.campoValor}>{requisicao.responsavel_cadastro || '-'}</Text>

              <Text style={styles.campoLabel}>Operador</Text>
              <Text style={styles.campoValor}>{requisicao.operador_nome || '-'}</Text>

              <Text style={styles.campoLabel}>Assinatura</Text>
              <Text style={styles.campoValor}>{requisicao.assinatura_operador || '-'}</Text>
            </View>

            {requisicao.encontrado ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Item Vinculado</Text>
                <Text style={styles.itemNome}>{requisicao.item_nome || 'Item encontrado'}</Text>
                <Text style={styles.itemMeta}>
                  Registro: {requisicao.item_numero_registro || '-'}
                </Text>
                {requisicao.item_id ? (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() =>
                      router.push({
                        pathname: '/item-detalhes',
                        params: { id: String(requisicao.item_id) },
                      })
                    }
                  >
                    <Text style={styles.secondaryButtonText}>Abrir item</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Sugestões de Itens Parecidos</Text>
                <Text style={styles.helperText}>
                  Selecione um item para marcar a requisição como encontrada.
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.sugestaoCard}>
            <Text style={styles.sugestaoNome}>{item.nome}</Text>
            <Text style={styles.sugestaoMeta}>
              Registro #{item.numero_registro} • Lacre {item.numero_lacre}
            </Text>
            <Text style={styles.sugestaoMeta}>
              {item.marca || 'Sem marca'} • {item.estado_conservacao}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => vincularItem(item.id)}
              disabled={salvando}
            >
              <Text style={styles.primaryButtonText}>{salvando ? 'Salvando...' : 'Vincular item'}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !requisicao.encontrado ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={36} color={CORES.gray400} />
              <Text style={styles.emptyTitle}>Nenhum item sugerido</Text>
              <Text style={styles.emptySubtitle}>
                Ainda não apareceu um item parecido para esta requisição.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.gray100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.white,
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: CORES.gray700,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: CORES.white,
    borderBottomWidth: 1,
    borderBottomColor: CORES.gray200,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: CORES.primary,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: CORES.gray200,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CORES.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  codeText: {
    color: CORES.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nomeCliente: {
    fontSize: 22,
    fontWeight: '700',
    color: CORES.gray900,
    marginBottom: 8,
  },
  descricao: {
    fontSize: 15,
    lineHeight: 22,
    color: CORES.gray700,
    marginBottom: 14,
  },
  campoLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: CORES.gray500,
    marginTop: 6,
    marginBottom: 2,
  },
  campoValor: {
    fontSize: 15,
    color: CORES.gray900,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.gray900,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    color: CORES.gray600,
  },
  itemNome: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.primary,
    marginBottom: 6,
  },
  itemMeta: {
    fontSize: 14,
    color: CORES.gray600,
    marginBottom: 12,
  },
  sugestaoCard: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CORES.gray200,
  },
  sugestaoNome: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.gray900,
  },
  sugestaoMeta: {
    marginTop: 4,
    fontSize: 13,
    color: CORES.gray600,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: CORES.primary,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: CORES.white,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: CORES.primary,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: CORES.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    color: CORES.gray700,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
    color: CORES.gray500,
  },
});
