import React from 'react';
import { StyleSheet, TextProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export function Title({ style, ...rest }: TextProps) {
    return <ThemedText type="title" style={[styles.title, style]} {...rest} />;
}

export function Subtitle({ style, ...rest }: TextProps) {
    return <ThemedText type="subtitle" style={[styles.subtitle, style]} {...rest} />;
}

export function Label({ style, ...rest }: TextProps) {
    return <ThemedText type="defaultSemiBold" style={[styles.label, style]} {...rest} />;
}

export function Body({ style, ...rest }: TextProps) {
    return <ThemedText type="default" style={[styles.body, style]} {...rest} />;
}

export function Caption({ style, ...rest }: TextProps) {
    return <ThemedText style={[styles.caption, style]} {...rest} />;
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 8,
    },
    subtitle: {
        marginBottom: 6,
    },
    label: {
        marginBottom: 4,
    },
    body: {
        marginBottom: 2,
    },
    caption: {
        fontSize: 12,
        opacity: 0.7,
    },
});
