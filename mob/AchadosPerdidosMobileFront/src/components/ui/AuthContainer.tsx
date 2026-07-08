// src/components/ui/AuthContainer.tsx
import React from "react";
import { View, Text, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CORES } from '../../constants/cores';

type Props = {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
}

const AuthContainer = ({ title, subtitle, children }: Props) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ 
            flex: 1, 
            backgroundColor: CORES.white,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }}>
            <StatusBar barStyle="dark-content" backgroundColor={CORES.white} />
            
            <View style={{ flex: 1 }}>
                {(title || subtitle) && (
                    <View style={{ 
                        paddingHorizontal: 16,
                        paddingTop: Platform.OS === 'android' ? 8 : 0,
                        paddingBottom: 8,
                        backgroundColor: CORES.white,
                        borderBottomWidth: 1,
                        borderBottomColor: CORES.gray200,
                    }}>
                        {title && (
                            <Text style={{ 
                                fontSize: 24, 
                                fontWeight: '700', 
                                color: CORES.primary, // ← AZUL!
                                marginBottom: subtitle ? 4 : 0,
                            }}>
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text style={{ 
                                fontSize: 14, 
                                color: CORES.gray600,
                            }}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                )}
                
                <View style={{ flex: 1, backgroundColor: CORES.white }}>
                    {children}
                </View>
            </View>
        </View>
    );
};

export default AuthContainer;