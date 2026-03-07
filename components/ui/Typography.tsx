import React from 'react';
import { StyleSheet, TextProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Layout } from '@/constants/Layout';
import { Typography as TypographyTokens } from '@/constants/Typography';

export function Title({ style, ...rest }: TextProps) {
    return <ThemedText type="title" style={[styles.title, style]} {...rest} />;
}

export function Subtitle({ style, ...rest }: TextProps) {
    return <ThemedText type="subtitle" style={[styles.subtitle, style]} {...rest} />;
}

export function Label({ style, ...rest }: TextProps) {
    const labelColor = useThemeColor({}, 'secondaryText');
    return (
        <ThemedText
            type="defaultSemiBold"
            style={[styles.label, { color: labelColor }, style]}
            {...rest}
        />
    );
}

export function Body({ style, ...rest }: TextProps) {
    return <ThemedText type="default" style={[styles.body, style]} {...rest} />;
}

export function Caption({ style, ...rest }: TextProps) {
    const captionColor = useThemeColor({}, 'secondaryText');
    return (
        <ThemedText
            style={[styles.caption, { color: captionColor }, style]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    title: {
        marginBottom: Layout.spacing.sm,
    },
    subtitle: {
        marginBottom: Layout.spacing.xs,
    },
    label: {
        marginBottom: Layout.spacing.xs,
    },
    body: {
        marginBottom: 0,
    },
    caption: {
        ...TypographyTokens.caption,
    },
});
