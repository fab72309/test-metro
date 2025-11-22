import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Input({
    label,
    error,
    helperText,
    containerStyle,
    style,
    leftIcon,
    rightIcon,
    ...rest
}: InputProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.primary }]}>
                    {label}
                </Text>
            )}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.inputBackground,
                    borderColor: error ? colors.error : colors.border,
                }
            ]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                        },
                        style,
                    ]}
                    placeholderTextColor={colors.secondaryText}
                    {...rest}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
            {error ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : helperText ? (
                <Text style={[styles.helperText, { color: colors.secondaryText }]}>{helperText}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        minWidth: 0, // Critical for flexbox on web
        padding: 0,  // Remove default padding
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
    },
});
