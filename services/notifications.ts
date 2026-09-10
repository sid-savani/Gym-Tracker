import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const ANDROID_CHANNEL_ID = 'rest-timer';

// Configure foreground presentation behavior
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
} catch {
  // Handler setup fallback for unsupported platforms
}

let activeNotificationId: string | null = null;
let hasRequestedPermission = false;
let hasConfiguredChannel = false;

/**
 * Creates/configures the dedicated Android notification channel.
 * Must happen before permission requests or notification scheduling on Android 13+.
 */
export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android' || hasConfiguredChannel) return;

  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Rest Timer',
      description: 'Alerts when your workout rest period is complete',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      enableVibrate: true,
      showBadge: false,
    });
    hasConfiguredChannel = true;
  } catch (error) {
    console.warn('Failed to set Android notification channel:', error);
  }
}

/**
 * Requests local notification permission if not already determined.
 * Ensures Android notification channel is configured first.
 * Does not repeatedly prompt or nag if denied.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    if (Platform.OS === 'android') {
      await setupAndroidNotificationChannel();
    }

    const settings = await Notifications.getPermissionsAsync();
    if (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
    ) {
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
 * Associates explicitly with the 'rest-timer' Android channel.
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

    if (Platform.OS === 'android') {
      await setupAndroidNotificationChannel();
    }

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
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(seconds)),
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
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
 * Retrieves the initial notification response if the app was launched by tapping a notification (cold launch).
 */
export async function getInitialNotificationWorkoutId(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      const data = response.notification?.request?.content?.data;
      if (data && data.workoutId) {
        return data.workoutId as string;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Registers listener for when user taps the notification while app is running/backgrounded.
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
