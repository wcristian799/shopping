// src/components/ui/Loading.tsx
import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

type Props = {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
};

const Loading = ({ size = 'large', color = '#420350ff', text }: Props) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={{ marginTop: 10, color: '#666' }}>{text}</Text>}
    </View>
  );
};

export default Loading;