import React from 'react';
import { Pressable, Text, StyleSheet, PressableProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { triggerHaptic } from '@/utils/haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChipProps extends PressableProps {
    label: string;
    selected?: boolean;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
}

export function Chip({ label, selected = false, icon, onPress, style, ...rest }: ChipProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = () => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <AnimatedPressable
            style={[
                styles.chip,
                {
                    backgroundColor: selected ? colors.primary : colors.inputBackground,
                    borderColor: selected ? colors.primary : colors.border,
                },
                style,
                animatedStyle,
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            {...rest}
        >
            {icon && (
                <MaterialCommunityIcons
                    name={icon}
                    size={16}
                    color={selected ? '#fff' : colors.text}
                    style={{ marginRight: 6 }}
                />
            )}
            <Text
                style={[
                    styles.text,
                    {
                        color: selected ? '#fff' : colors.text,
                        fontWeight: selected ? '600' : '400',
                    },
                ]}
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
    },
});
