// src/app/(tabs)/entregar.tsx
import React from 'react';
import { View } from 'react-native';
import RenderEntregas from '@/components/entregas';

export default function EntregasScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <RenderEntregas />
    </View>
  );
}