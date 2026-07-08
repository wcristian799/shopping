// src/components/ui/EmptyState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
};

const EmptyState = ({ icon = 'search-off', title, subtitle }: Props) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <MaterialIcons name={icon} size={80} color="#ccc" />
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16, textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default EmptyState;