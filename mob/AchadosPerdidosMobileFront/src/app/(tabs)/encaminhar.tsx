// src/app/(tabs)/encaminhar.tsx
import React from 'react';
import { View } from 'react-native';
import RenderEncaminhamento from '@/components/encaminhamento';

export default function EncaminharScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <RenderEncaminhamento />
    </View>
  );
}