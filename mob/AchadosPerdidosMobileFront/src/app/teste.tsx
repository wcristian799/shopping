// src/app/teste.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TesteScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#420350ff', marginBottom: 20 }}>
        🎉 FUNCIONOU!
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 30 }}>
        Esta é a tela de teste
      </Text>
      
      <TouchableOpacity 
        onPress={() => router.push('/')}
        style={{
          backgroundColor: '#420350ff',
          padding: 15,
          borderRadius: 10,
          marginTop: 20
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}