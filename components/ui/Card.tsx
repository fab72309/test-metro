import React, { useEffect } from 'react';
import { StyleSheet, ViewProps, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

interface CardProps extends ViewProps {
    variant?: 'elevated' | 'outlined' | 'filled';
    animated?: boolean;
}

export function Card({ variant = 'elevated', animated = true, style, children, ...rest }: CardProps) {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const opacity = useSharedValue(animated ? 0 : 1);
    const translateY = useSharedValue(animated ? 10 : 0);

    useEffect(() => {
        if (animated) {
            opacity.value = withTiming(1, {
                duration: 400,
                easing: Easing.out(Easing.quad),
            });
            translateY.value = withTiming(0, {
                duration: 400,
                easing: Easing.out(Easing.quad),
            });
        }
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    const getBackgroundColor = () => {
        if (variant === 'filled') return colors.inputBackground;
        return colors.card;
    };

    const getBorderWidth = () => {
        if (variant === 'outlined') return 1;
        return 0;
    };

    const getShadowStyle = () => {
        if (variant === 'elevated') {
            // Ombres adaptées au thème
            if (theme === 'dark') {
                // Dark mode : Ombre subtile pour créer de la profondeur
                return Platform.select({
                    ios: {
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                    },
                    android: {
                        elevation: 6,
                    },
                    web: {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    },
                    default: {},
                });
            } else {
                // Light mode : Ombre douce et élégante
                return Platform.select({
                    ios: {
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                    },
                    android: {
                        elevation: 3,
                    },
                    web: {
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                    default: {},
                });
            }
        }
        return {};
    };

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: colors.border,
                    borderWidth: getBorderWidth(),
                },
                getShadowStyle(),
                style,
                animated && animatedStyle,
            ]}
            {...rest}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
    },
});
