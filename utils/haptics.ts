import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Trigger haptic feedback in a platform-safe manner.
 * On web, haptics are not supported, so we silently skip.
 */
export const triggerHaptic = async (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
) => {
    if (Platform.OS === 'web') {
        // Haptics not supported on web
        return;
    }

    try {
        await Haptics.impactAsync(style);
    } catch (error) {
        // Silently fail if haptics are not available
        console.warn('Haptics not available:', error);
    }
};

/**
 * Trigger selection haptic feedback (for switches, checkboxes, etc.)
 */
export const triggerSelectionHaptic = async () => {
    if (Platform.OS === 'web') return;

    try {
        await Haptics.selectionAsync();
    } catch (error) {
        console.warn('Haptics not available:', error);
    }
};

/**
 * Trigger notification haptic feedback
 */
export const triggerNotificationHaptic = async (
    type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
) => {
    if (Platform.OS === 'web') return;

    try {
        await Haptics.notificationAsync(type);
    } catch (error) {
        console.warn('Haptics not available:', error);
    }
};
