import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Title } from '@/components/ui/Typography';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Layout } from '@/constants/Layout';

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
                    size={Layout.sizes.iconLg}
                    color={palette.primary}
                    style={styles.icon}
                />
            )}
            <Title style={[styles.title, { color: palette.text }]}>
                {title}
            </Title>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: Layout.spacing.md,
        marginTop: Layout.spacing.sm,
    },
    icon: {
        marginRight: Layout.spacing.sm,
    },
    title: {
        marginBottom: 0,
        textAlign: 'left',
        flexShrink: 1,
    },
});
