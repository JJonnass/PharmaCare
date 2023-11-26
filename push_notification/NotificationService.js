import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export default function NotificationService() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);

    const notificationListener = useRef();
    const responseListener = useRef();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        if (notificationsEnabled) {
            registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                setNotification(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log(response);
            });
        }

        return () => {
            if (notificationsEnabled) {
                Notifications.removeNotificationSubscription(notificationListener.current);
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [notificationsEnabled]);

    return (
        null
    );
}

export async function schedulePushNotification({
    medicineName, amount, medicineUnits, startDate, duration, frequency, selectedTime, notificationEnabled
}) {
    console.log(notificationEnabled);
    if (!notificationEnabled) {
        console.log('Notifications are disabled. Notification will not be scheduled.');
        return null;
    }

    const timeDifferenceInSeconds = calculateTimeDifference(startDate, selectedTime);

    if (timeDifferenceInSeconds === null) {
        // Handle case where scheduled time is in the past
        console.warn('Scheduled time is in the past. Notification will not be scheduled.');
        return null;
    }

    const notificationTitle = `Take ${amount} ${medicineUnits} of ${medicineName}`;
    const notificationBody = `Starting from ${startDate}, for ${duration} days, (${frequency.toLowerCase()})`;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: notificationTitle,
            body: notificationBody,
        },
        trigger: {
            seconds: timeDifferenceInSeconds,
        },
    });
}

function calculateTimeDifference(startDate, selectedTime) {
    const now = new Date();
    const scheduledTime = new Date(startDate);
    console.log(scheduledTime);

    if (selectedTime) {

        const currentDate = new Date();
        const [hours, minutes] = selectedTime.split(':');
        const selectedTimeDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            parseInt(hours),
            parseInt(minutes)
        );

        const timeZoneOffset = selectedTimeDate.getTimezoneOffset();
        const adjustedTime = new Date(selectedTimeDate.getTime() - timeZoneOffset * 60000);

        console.log(adjustedTime.toISOString());
        scheduledTime.setHours(selectedTimeDate.getHours());
        scheduledTime.setMinutes(selectedTimeDate.getMinutes());
        scheduledTime.setSeconds(0);
        scheduledTime.setMilliseconds(0);
    }
    const timeDifferenceInMilliseconds = scheduledTime - now;

    if (timeDifferenceInMilliseconds <= 0) {
        // Scheduled time is in the past
        return null;
    }
    // Convert milliseconds to seconds
    return Math.floor(timeDifferenceInMilliseconds / 1000);
}


export async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}