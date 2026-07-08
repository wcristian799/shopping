import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Cadastro" }} />
      <Stack.Screen name="resetPassword" options={{ title: "Esqueci minha senha" }} />
    </Stack>
  );
}