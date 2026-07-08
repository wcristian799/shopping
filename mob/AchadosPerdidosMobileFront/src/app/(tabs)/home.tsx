// src/app/(tabs)/home.tsx
import React from 'react';
import { View } from 'react-native';
import RenderHome from '@/components/home';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <RenderHome />
    </View>
  );
}