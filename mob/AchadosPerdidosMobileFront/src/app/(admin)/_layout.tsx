// src/app/(admin)/_layout.tsx
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="usuarios" options={{ title: "Usuários" }} />
      <Stack.Screen name="novo-usuario" options={{ title: "Novo Usuário" }} />
      <Stack.Screen name="relatorios" options={{ title: "Relatórios" }} />
    </Stack>
  );
}