// src/components/ui/TextField.tsx
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { 
  Text, 
  TextInput, 
  TextInputProps, 
  View, 
  StyleProp, 
  ViewStyle,
  StyleSheet,
  Dimensions 
} from "react-native";
import { global } from "./styles";
import MaskInput from "react-native-mask-input"
import { CORES } from '../../constants/cores';

const { width } = Dimensions.get("window");

type NameIcon = 
    | {lib: "MaterialIcons"; name: keyof typeof MaterialIcons.glyphMap }
    | {lib: "FontAwesome6"; name: keyof typeof FontAwesome6.glyphMap }
    | {lib: "FontAwesome5"; name: keyof typeof FontAwesome5.glyphMap };

type Props = Omit<TextInputProps, "onChangeText"> & {
    label: string;
    errorText?: string; 
    icon?: NameIcon;
    mask?: any;
    onChangeText?: (masked: string, unmasked?: string) => void;
    containerStyle?: StyleProp<ViewStyle>;
}

const TextField = ({ 
  label, 
  errorText, 
  icon, 
  style, 
  mask, 
  containerStyle, 
  onLayout,
  ...restInputProps 
}: Props) => {
    const InputComponent = mask ? MaskInput : TextInput;

    return (
        <View 
          style={[global.inputGroup, containerStyle]} 
          onLayout={onLayout}
        >
            <Text style={global.label}>{label}</Text>
            <View style={[styles.inputWrapper, errorText ? global.inputError : null]}>
                {icon && (
                    <View style={styles.iconContainer}>
                        {icon.lib === "MaterialIcons" && (
                            <MaterialIcons 
                                name={icon.name} 
                                size={23} 
                                color={errorText ? CORES.danger : CORES.primary} 
                            />
                        )}
                        {icon.lib === "FontAwesome5" && (
                            <FontAwesome5 
                                name={icon.name} 
                                size={23} 
                                color={errorText ? CORES.danger : CORES.primary} 
                            />
                        )}
                        {icon.lib === "FontAwesome6" && (
                            <FontAwesome6 
                                name={icon.name} 
                                size={23} 
                                color={errorText ? CORES.danger : CORES.primary} 
                            />
                        )}
                    </View>
                )}
                <InputComponent
                    keyboardAppearance="dark"
                    placeholderTextColor={CORES.gray400}
                    style={[styles.input, style]}
                    mask={mask}
                    {...restInputProps}
                />
            </View>   
            {errorText && <Text style={global.errorText}>{errorText}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        backgroundColor: CORES.white,
        borderWidth: 1,
        flexDirection: "row",
        borderColor: CORES.primary,
        borderRadius: 10,
        alignItems: "center",
        paddingLeft: width * 0.02,
        minHeight: 52, // Altura mínima consistente
    },
    iconContainer: {
        marginRight: 8,
        width: 30, // Largura fixa para os ícones
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: 17,
        color: CORES.gray900,
        fontWeight: "500",
        paddingHorizontal: 8,
        paddingVertical: 12, // Padding vertical consistente
        minHeight: 48, // Altura mínima do input
        textAlignVertical: 'center', // Garante alinhamento vertical no Android
    },
});

export default TextField;