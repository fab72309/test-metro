import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Layout } from '@/constants/Layout';
import { Typography as TypographyTokens } from '@/constants/Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    containerStyle?: StyleProp<ViewStyle>;
    labelMinHeight?: number;
    autoFilled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Input({
    label,
    error,
    helperText,
    containerStyle,
    labelMinHeight,
    autoFilled = false,
    style,
    leftIcon,
    rightIcon,
    onFocus,
    onBlur,
    ...rest
}: InputProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const [isFocused, setIsFocused] = React.useState(false);
    const autoFillBackground = theme === 'light' ? '#D9DEE6' : '#121821';
    const autoFillBorder = theme === 'light' ? '#BDC4D0' : '#2C3440';
    const inputBackground = autoFilled ? autoFillBackground : colors.inputBackground;
    const inputBorder = autoFilled ? autoFillBorder : colors.inputBorder;
    const activeBorderColor = error
        ? colors.error
        : isFocused
            ? colors.inputBorderFocus
            : inputBorder;
    const activeBackgroundColor = isFocused
        ? theme === 'dark'
            ? '#242D3A'
            : colors.card
        : inputBackground;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <View style={[styles.labelContainer, labelMinHeight ? { minHeight: labelMinHeight } : null]}>
                    <Text style={[styles.label, { color: colors.secondaryText }]}>
                        {label}
                    </Text>
                </View>
            )}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: activeBackgroundColor,
                    borderColor: activeBorderColor,
                    borderWidth: isFocused ? 1.5 : 1,
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
                    onFocus={(event) => {
                        setIsFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setIsFocused(false);
                        onBlur?.(event);
                    }}
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
        marginBottom: Layout.spacing.lg,
        width: '100%',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
    },
    labelContainer: {
        justifyContent: 'flex-end',
        marginBottom: Layout.spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: Layout.sizes.controlHeight,
        borderRadius: Layout.radius.md,
        paddingHorizontal: Layout.spacing.md,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: TypographyTokens.body.fontSize,
        lineHeight: TypographyTokens.body.lineHeight,
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
        fontSize: TypographyTokens.caption.fontSize,
        marginTop: Layout.spacing.xs,
    },
    helperText: {
        fontSize: TypographyTokens.caption.fontSize,
        marginTop: Layout.spacing.xs,
    },
});
