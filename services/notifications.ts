import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure foreground presentation behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
} catch {
  // Handler setup fallback for unsupported platforms
}

let activeNotificationId: string | null = null;
let hasRequestedPermission = false;

/**
 * Requests local notification permission if not already determined.
 * Does not repeatedly prompt or nag if denied.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) {
      return true;
    }

    if (!hasRequestedPermission) {
      hasRequestedPermission = true;
      const requestResult = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
        },
      });
      return (
        requestResult.granted ||
        requestResult.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
      );
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Schedules a local notification for rest completion.
 * Cancels any existing scheduled rest notification first.
 */
export async function scheduleRestCompleteNotification(
  seconds: number,
  workoutId?: string,
  exerciseName?: string
): Promise<string | null> {
  if (Platform.OS === 'web' || seconds <= 0) return null;

  try {
    // Cancel previous scheduled notification if any
    await cancelRestNotification();

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const body = exerciseName
      ? `Ready for your next set of ${exerciseName}?`
      : 'Ready for your next set?';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest complete',
        body,
        data: {
          workoutId: workoutId || null,
          type: 'rest_complete',
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(seconds)),
      },
    });

    activeNotificationId = id;
    return id;
  } catch (error) {
    console.warn('Failed to schedule rest notification:', error);
    return null;
  }
}

/**
 * Cancels any active rest timer notification.
 */
export async function cancelRestNotification(): Promise<void> {
  if (Platform.OS === 'web' || !activeNotificationId) return;

  try {
    const idToCancel = activeNotificationId;
    activeNotificationId = null;
    await Notifications.cancelScheduledNotificationAsync(idToCancel);
  } catch {
    // Silent fail if already fired or cancelled
  }
}

/**
 * Registers listener for when user taps the notification.
 */
export function addNotificationResponseListener(
  onWorkoutTap: (workoutId: string) => void
): () => void {
  if (Platform.OS === 'web') return () => {};

  try {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data && data.workoutId) {
        onWorkoutTap(data.workoutId as string);
      }
    });

    return () => {
      subscription.remove();
    };
  } catch {
    return () => {};
  }
}
