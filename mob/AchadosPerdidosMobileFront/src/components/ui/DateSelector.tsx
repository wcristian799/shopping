// src/components/ui/DateSelector.tsx
import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { CORES } from '../../constants/cores';

// Configurar calendário em português do Brasil
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};

LocaleConfig.defaultLocale = 'pt-br';

type Props = {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  label?: string;
};

const DateSelector = ({ onSelectDate, selectedDate = '', label = 'Selecionar data' }: Props) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Data mínima (hoje) no formato YYYY-MM-DD
  const hoje = new Date();
  const anoHoje = hoje.getFullYear();
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
  const diaHoje = String(hoje.getDate()).padStart(2, '0');
  const minDate = `${anoHoje}-${mesHoje}-${diaHoje}`;

  const formatDate = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSelectDate = (date: any) => {
    setModalVisible(false);
    
    // SOLUÇÃO DEFINITIVA: Extrair a data diretamente da string YYYY-MM-DD
    // e reconstruir manualmente sem depender do objeto Date do JavaScript
    const [year, month, day] = date.dateString.split('-').map(Number);
    
    // Criar a data no formato YYYY-MM-DD manualmente (sem conversão de fuso)
    const ano = year;
    const mes = String(month).padStart(2, '0');
    const dia = String(day).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    console.log('📅 Data selecionada:', {
      original: date.dateString,
      formatada: dataFormatada,
      ano,
      mes,
      dia
    });
    
    onSelectDate(dataFormatada);
  };

  // Garantir que a data selecionada esteja no formato YYYY-MM-DD
  const markedDate = selectedDate ? selectedDate.split('T')[0] : '';

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.button}
      >
        <MaterialIcons name="calendar-today" size={20} color={CORES.primary} />
        <Text style={[styles.buttonText, selectedDate ? styles.selectedText : styles.placeholderText]}>
          {selectedDate ? formatDate(selectedDate) : label}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: CORES.primary }]}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={CORES.primary} />
              </TouchableOpacity>
            </View>

            <Calendar
              onDayPress={handleSelectDate}
              minDate={minDate}
              markedDates={markedDate ? {
                [markedDate]: {
                  selected: true,
                  selectedColor: CORES.primary
                }
              } : {}}
              theme={{
                selectedDayBackgroundColor: CORES.primary,
                todayTextColor: CORES.primary,
                arrowColor: CORES.primary,
                monthTextColor: CORES.primary,
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
              }}
              firstDay={1}
              enableSwipeMonths={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.gray100,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: CORES.gray300,
  },
  buttonText: {
    fontSize: 14,
    flex: 1,
  },
  selectedText: {
    color: CORES.gray900,
    fontWeight: '500',
  },
  placeholderText: {
    color: CORES.gray500,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: CORES.white,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: CORES.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DateSelector;