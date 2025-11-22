import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

interface ScreenHeaderProps {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export function ScreenHeader({ title, icon, style }: ScreenHeaderProps) {
    const { theme } = useThemeContext();
    const palette = Colors[theme];

    return (
        <View style={[styles.container, style]}>
            {icon && (
                <Ionicons
                    name={icon}
                    size={32}
                    color={palette.primary}
                    style={styles.icon}
                />
            )}
            <Title style={[styles.title, { color: palette.primary }]}>
                {title}
            </Title>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    icon: {
        marginRight: 8,
    },
    title: {
        marginBottom: 0,
        textAlign: 'center',
    },
});
