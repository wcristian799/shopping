// src/components/ui/PasswordField.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import TextField from "./TextField";
import { CORES } from '../../constants/cores';

type Props = React.ComponentProps<typeof TextField>

const PasswordField = (props: Props) => {
    const [show, setShow] = useState(false);

    return (
        <View style={styles.container}>
            <TextField
                icon={{ lib: "MaterialIcons", name: "lock" }}
                {...props}
                secureTextEntry={!show}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShow((showTrue) => !showTrue)}
                activeOpacity={0.7}
            >
                <Ionicons 
                    name={show ? "eye-outline" : "eye-off-outline"} 
                    size={23} 
                    color={CORES.primary} 
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 42, // Posição perfeita para o ícone
        zIndex: 10,
        padding: 8, // Área de toque maior
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PasswordField;