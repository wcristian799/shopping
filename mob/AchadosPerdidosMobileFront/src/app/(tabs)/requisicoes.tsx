// src/app/(tabs)/requisicoes.tsx
import React from 'react';
import { View } from 'react-native';
import RenderRequisicoes from '@/components/requisicoes';

export default function RequisicoesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <RenderRequisicoes />
    </View>
  );
}