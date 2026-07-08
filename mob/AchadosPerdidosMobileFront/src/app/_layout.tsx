// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ItemsProvider } from '../contexts/ItemsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cadastro-item" options={{ headerShown: false }} />
          <Stack.Screen name="entrega/cadastro" options={{ headerShown: false }} />
          <Stack.Screen name="encaminhamento/cadastro" options={{ headerShown: false }} />
          <Stack.Screen name="requisicao/cadastro" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="filtros" options={{ headerShown: false }} />
          <Stack.Screen name="item-detalhes" options={{ headerShown: false }} />
          <Stack.Screen name="entrega-detalhes" options={{ headerShown: false }} />
          <Stack.Screen name="requisicao-detalhes" options={{ headerShown: false }} />
        </Stack>
      </ItemsProvider>
    </AuthProvider>
  );
}
