// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CORES } from '../../constants/cores';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: CORES.primary,
        tabBarInactiveTintColor: CORES.gray500,
        headerShown: true,
        headerStyle: {
          backgroundColor: CORES.white,
          elevation: 2,
          shadowColor: CORES.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: CORES.primary,
        },
        tabBarStyle: {
          backgroundColor: CORES.white,
          borderTopWidth: 1,
          borderTopColor: CORES.gray200,
          paddingBottom: insets.bottom,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: insets.bottom > 0 ? 0 : 5,
        },
      }}
    >
      {/* 1º - INÍCIO */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Botão de FILTRO - azul escuro */}
              <TouchableOpacity 
                onPress={() => router.push('/filtros')}
                style={{ marginRight: 12 }}
              >
                <MaterialIcons 
                  name="filter-list" 
                  size={28} 
                  color={CORES.primary} // Azul escuro
                />
              </TouchableOpacity>
              
              {/* Botão de CADASTRAR - azul médio */}
              <TouchableOpacity 
                onPress={() => router.push('/cadastro-item')}
                style={{ marginRight: 16 }}
              >
                <MaterialIcons 
                  name="add-circle" 
                  size={28} 
                  color={CORES.primaryLight} // ← AZUL MÉDIO!
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* 2º - ENTREGA */}
      <Tabs.Screen
        name="entregar"
        options={{
          title: 'Entrega',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialIcons name="assignment-return" size={24} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/entrega/cadastro')}
              style={{ marginRight: 16 }}
            >
              <MaterialIcons 
                name="add-circle" 
                size={28} 
                color={CORES.success} 
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 3º - ENCAMINHAMENTO */}
      <Tabs.Screen
        name="encaminhar"
        options={{
          title: 'Encaminhar',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialIcons name="send" size={24} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/encaminhamento/cadastro')}
              style={{ marginRight: 16 }}
            >
              <MaterialIcons 
                name="add-circle" 
                size={28} 
                color={CORES.warning} 
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 4º - REQUISIÇÕES */}
      <Tabs.Screen
        name="requisicoes"
        options={{
          title: 'Requisição',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialIcons name="list-alt" size={24} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/requisicao/cadastro')}
              style={{ marginRight: 16 }}
            >
              <MaterialIcons 
                name="add-circle" 
                size={28} 
                color={CORES.roxo} 
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 5º - PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }: { color: string }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />

      {/* Index escondido */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}