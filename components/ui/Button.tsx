import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, PressableProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { triggerHaptic } from '@/utils/haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    style?: ViewStyle;
}

export function Button({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    onPress,
    style,
    disabled,
    ...rest
}: ButtonProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        if (disabled || loading) return;
        scale.value = withSpring(0.96);
    };

    const handlePressOut = () => {
        if (disabled || loading) return;
        scale.value = withSpring(1);
    };

    const handlePress = () => {
        if (disabled || loading) return;
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const getBackgroundColor = () => {
        if (disabled) return colors.border;
        switch (variant) {
            case 'primary': return colors.primary;
            case 'secondary': return colors.card;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.secondaryText;
        switch (variant) {
            case 'primary': return '#fff';
            case 'secondary': return colors.text;
            case 'outline': return colors.primary;
            case 'ghost': return colors.primary;
            default: return '#fff';
        }
    };

    const getBorderColor = () => {
        if (disabled) return 'transparent';
        if (variant === 'outline') return colors.primary;
        if (variant === 'secondary') return colors.border;
        return 'transparent';
    };

    const getPadding = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 6, paddingHorizontal: 12 };
            case 'lg': return { paddingVertical: 14, paddingHorizontal: 24 };
            default: return { paddingVertical: 10, paddingHorizontal: 16 };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm': return 14;
            case 'lg': return 18;
            default: return 16;
        }
    };

    return (
        <AnimatedPressable
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
                },
                getPadding(),
                style,
                animatedStyle,
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon && (
                        <MaterialCommunityIcons
                            name={icon}
                            size={getFontSize() + 4}
                            color={getTextColor()}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: getTextColor(),
                                fontSize: getFontSize(),
                            },
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
});
