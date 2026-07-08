import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AuthContainer from '@/components/ui/AuthContainer';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CORES } from '@/constants/cores';
import api from '@/services/api';
import { relatorioService } from '@/services/relatorioService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const { width } = Dimensions.get('window');

type DadosRelatorio = {
  protocoloRelatorio: string;
  periodoDescricao: string;
  tempoPeriodo: string;
  tipoRelatorio: TipoRelatorio;
  itens: any[];
  entregas: any[];
  requisicoes: any[];
  encaminhamentos: any[];
  resumo: {
    totalItens: number;
    totalEntregas: number;
    totalRequisicoes: number;
    totalEncaminhamentos: number;
    totalItensPendentes: number;
    totalItensDevolvidos: number;
    totalItensFinalizados: number;
  };
};

type TipoRelatorio =
  | 'TODOS'
  | 'ITENS_CADASTRADOS'
  | 'ITENS_DEVOLVIDOS'
  | 'ITENS_REQUISITADOS'
  | 'ITENS_ENCAMINHADOS';

const TIPOS_RELATORIO: { value: TipoRelatorio; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ITENS_CADASTRADOS', label: 'Itens' },
  { value: 'ITENS_DEVOLVIDOS', label: 'Entregas' },
  { value: 'ITENS_REQUISITADOS', label: 'Requisições' },
  { value: 'ITENS_ENCAMINHADOS', label: 'Encaminhamentos' },
];

export default function RelatoriosScreen() {
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorio | null>(null);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('TODOS');
  const [showPicker, setShowPicker] = useState<'inicio' | 'fim' | null>(null);

  const formatarData = (data: Date | null) =>
    data ? format(data, 'dd/MM/yyyy', { locale: ptBR }) : '';

  const setHoje = () => {
    const hoje = new Date();
    const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
    setDataInicio(base);
    setDataFim(base);
  };

  const setUltimos7Dias = () => {
    const hoje = new Date();
    setDataFim(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0));
    setDataInicio(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 7, 0, 0, 0));
  };

  const setUltimos30Dias = () => {
    const hoje = new Date();
    setDataFim(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0));
    setDataInicio(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 30, 0, 0, 0));
  };

  const setMesAtual = () => {
    const hoje = new Date();
    setDataInicio(new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0));
    setDataFim(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0));
  };

  const buscarDados = async () => {
    if (!dataInicio || !dataFim) {
      Alert.alert('Atenção', 'Selecione as datas de início e fim');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/relatorios/dados', {
        params: {
          dataInicio: format(dataInicio, 'yyyy-MM-dd'),
          dataFim: format(dataFim, 'yyyy-MM-dd'),
          tipo: tipoRelatorio,
        },
      });
      setDadosRelatorio(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const exportar = async (formato: 'pdf' | 'excel') => {
    if (!dataInicio || !dataFim) {
      Alert.alert('Atenção', 'Selecione as datas de início e fim');
      return;
    }

    try {
      setExportando(true);
      const inicio = format(dataInicio, 'yyyy-MM-dd');
      const fim = format(dataFim, 'yyyy-MM-dd');

      if (formato === 'pdf') {
        await relatorioService.gerarPDFCompleto(inicio, fim, tipoRelatorio);
      } else {
        await relatorioService.gerarExcelCompleto(inicio, fim, tipoRelatorio);
      }

      Alert.alert('Sucesso', `${formato.toUpperCase()} gerado com sucesso!`);
    } catch (error) {
      console.error(`Erro ao exportar ${formato}:`, error);
      Alert.alert('Erro', `Não foi possível gerar o ${formato.toUpperCase()}`);
    } finally {
      setExportando(false);
    }
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(null);
    if (!selectedDate) return;

    const novaData = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0
    );

    if (showPicker === 'inicio') {
      setDataInicio(novaData);
    } else {
      setDataFim(novaData);
    }
  };

  return (
    <AuthContainer title="Relatórios" subtitle="Gerar relatórios por período">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="timer" size={22} color={CORES.primary} />
            <Text style={styles.cardTitle}>Atalhos Rápidos</Text>
          </View>

          <View style={styles.atalhosContainer}>
            <TouchableOpacity style={styles.atalhoBotao} onPress={setHoje}>
              <Text style={styles.atalhoTexto}>Hoje</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.atalhoBotao} onPress={setUltimos7Dias}>
              <Text style={styles.atalhoTexto}>7 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.atalhoBotao} onPress={setUltimos30Dias}>
              <Text style={styles.atalhoTexto}>30 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.atalhoBotao} onPress={setMesAtual}>
              <Text style={styles.atalhoTexto}>Mês atual</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="filter-alt" size={22} color={CORES.primary} />
            <Text style={styles.cardTitle}>Tipo de Relatório</Text>
          </View>

          <View style={styles.tipoContainer}>
            {TIPOS_RELATORIO.map((tipo) => (
              <TouchableOpacity
                key={tipo.value}
                style={[styles.tipoChip, tipoRelatorio === tipo.value && styles.tipoChipActive]}
                onPress={() => setTipoRelatorio(tipo.value)}
              >
                <Text style={[styles.tipoChipText, tipoRelatorio === tipo.value && styles.tipoChipTextActive]}>
                  {tipo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="date-range" size={22} color={CORES.primary} />
            <Text style={styles.cardTitle}>Período</Text>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Data Início</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker('inicio')}>
              <Text style={dataInicio ? styles.dateText : styles.datePlaceholder}>
                {dataInicio ? formatarData(dataInicio) : 'Selecionar data'}
              </Text>
              <MaterialIcons name="calendar-today" size={20} color={CORES.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Data Fim</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker('fim')}>
              <Text style={dataFim ? styles.dateText : styles.datePlaceholder}>
                {dataFim ? formatarData(dataFim) : 'Selecionar data'}
              </Text>
              <MaterialIcons name="calendar-today" size={20} color={CORES.primary} />
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={showPicker === 'inicio' ? dataInicio || new Date() : dataFim || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              locale="pt-BR"
            />
          )}

          <TouchableOpacity
            style={styles.buscarButton}
            onPress={buscarDados}
            disabled={loading || !dataInicio || !dataFim}
          >
            {loading ? <ActivityIndicator color={CORES.white} /> : <Text style={styles.buscarButtonText}>Buscar Dados</Text>}
          </TouchableOpacity>
        </View>

        {dadosRelatorio && (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statsCard}>
                <MaterialIcons name="inventory" size={30} color={CORES.primary} />
                <Text style={styles.statsNumero}>{dadosRelatorio.resumo.totalItens}</Text>
                <Text style={styles.statsLabel}>Itens</Text>
              </View>

              <View style={styles.statsCard}>
                <MaterialIcons name="assignment-return" size={30} color={CORES.success} />
                <Text style={styles.statsNumero}>{dadosRelatorio.resumo.totalEntregas}</Text>
                <Text style={styles.statsLabel}>Entregas</Text>
              </View>

              <View style={styles.statsCard}>
                <MaterialIcons name="list-alt" size={30} color={CORES.roxo} />
                <Text style={styles.statsNumero}>{dadosRelatorio.resumo.totalRequisicoes}</Text>
                <Text style={styles.statsLabel}>Requisições</Text>
              </View>

              <View style={styles.statsCard}>
                <MaterialIcons name="send" size={30} color={CORES.warning} />
                <Text style={styles.statsNumero}>{dadosRelatorio.resumo.totalEncaminhamentos}</Text>
                <Text style={styles.statsLabel}>Encaminhamentos</Text>
              </View>

              <View style={styles.statsCard}>
                <MaterialIcons name="schedule" size={30} color={CORES.gray700} />
                <Text style={styles.statsNumero}>{dadosRelatorio.resumo.totalItensPendentes}</Text>
                <Text style={styles.statsLabel}>Pendentes</Text>
              </View>

              <View style={styles.statsCard}>
                <MaterialIcons name="assignment-return" size={30} color={CORES.success} />
                <Text style={styles.statsNumero}>{dadosRelatorio.resumo.totalItensDevolvidos}</Text>
                <Text style={styles.statsLabel}>Devolvidos</Text>
              </View>

              <View style={styles.statsCard}>
                <MaterialIcons name="task-alt" size={30} color={CORES.primary} />
                <Text style={styles.statsNumero}>{dadosRelatorio.resumo.totalItensFinalizados}</Text>
                <Text style={styles.statsLabel}>Finalizados</Text>
              </View>
            </View>

            <View style={styles.acoesContainer}>
              <TouchableOpacity style={styles.acaoBotao} onPress={() => exportar('pdf')} disabled={exportando}>
                {exportando ? <ActivityIndicator color={CORES.white} size="small" /> : <Text style={styles.acaoBotaoTexto}>Exportar PDF</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acaoBotao, styles.acaoBotaoSecundario]}
                onPress={() => exportar('excel')}
                disabled={exportando}
              >
                {exportando ? <ActivityIndicator color={CORES.primary} size="small" /> : <Text style={styles.acaoBotaoTextoSecundario}>Exportar Excel</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.infoPeriodo}>
              <MaterialIcons name="info-outline" size={16} color={CORES.gray500} />
              <Text style={styles.infoPeriodoTexto}>
                {dadosRelatorio.tipoRelatorio.replace(/_/g, ' ')} | {dadosRelatorio.periodoDescricao}
              </Text>
            </View>

            <View style={styles.infoPeriodo}>
              <MaterialIcons name="badge" size={16} color={CORES.gray500} />
              <Text style={styles.infoPeriodoTexto}>
                Protocolo {dadosRelatorio.protocoloRelatorio} | Tempo analisado: {dadosRelatorio.tempoPeriodo}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CORES.gray200,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.gray900,
  },
  atalhosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  atalhoBotao: {
    minWidth: (width - 64) / 2,
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: CORES.primarySoft,
    borderWidth: 1,
    borderColor: CORES.primary,
  },
  atalhoTexto: {
    color: CORES.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipoChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CORES.gray300,
    backgroundColor: CORES.white,
  },
  tipoChipActive: {
    borderColor: CORES.primary,
    backgroundColor: CORES.primary,
  },
  tipoChipText: {
    color: CORES.gray700,
    fontWeight: '600',
    fontSize: 12,
  },
  tipoChipTextActive: {
    color: CORES.white,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: CORES.gray700,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CORES.gray100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CORES.gray300,
  },
  dateText: {
    fontSize: 14,
    color: CORES.gray900,
  },
  datePlaceholder: {
    fontSize: 14,
    color: CORES.gray500,
  },
  buscarButton: {
    backgroundColor: CORES.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buscarButtonText: {
    color: CORES.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    minWidth: (width - 44) / 2,
    backgroundColor: CORES.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CORES.gray200,
  },
  statsNumero: {
    fontSize: 28,
    fontWeight: '700',
    color: CORES.gray900,
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 13,
    color: CORES.gray600,
  },
  acoesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  acaoBotao: {
    flex: 1,
    backgroundColor: CORES.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acaoBotaoSecundario: {
    backgroundColor: CORES.white,
    borderWidth: 1,
    borderColor: CORES.primary,
  },
  acaoBotaoTexto: {
    color: CORES.white,
    fontWeight: '600',
  },
  acaoBotaoTextoSecundario: {
    color: CORES.primary,
    fontWeight: '600',
  },
  infoPeriodo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: CORES.gray100,
    borderRadius: 8,
  },
  infoPeriodoTexto: {
    fontSize: 13,
    color: CORES.gray600,
    textAlign: 'center',
    flex: 1,
  },
});
