import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../utils/theme';
import EyeOnIcon from '../../assets/images/eye.svg'
import EyeOffIcon from '../../assets/images/eye-off.svg'



type Props = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    isPassword?: boolean;
};

export default function AuthTextInput({ label, value, onChangeText, isPassword = false }: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={`Input your ${label.toLowerCase()}`}
                    placeholderTextColor="#999"
                    secureTextEntry={isPassword && !isPasswordVisible}
                />
                {isPassword && (
                    <Pressable style={styles.icon} onPress={togglePasswordVisibility}>
                        {isPasswordVisible ? (
                            <EyeOffIcon width={24} height={24} />
                        ) : (
                            <EyeOnIcon width={24} height={24} />
                        )}
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 6,
        color: theme.colors.greenText
    },
    input: {
        paddingLeft: 14,
        backgroundColor: '#f5f5ff',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 16,
    },
    icon: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
});
