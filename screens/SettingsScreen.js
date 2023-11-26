import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { schedulePushNotification } from '../push_notification/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const [notificationEnabled, setNotificationEnabled] = useState(true);

    const handleMedicinesClick = () => {
        navigation.navigate('MEDICINE LIST');
    };

    const handleNotificationToggle = () => {
        const newNotificationState = !notificationEnabled;
        setNotificationEnabled(newNotificationState);
        AsyncStorage.setItem('notificationsEnabled', String(newNotificationState));
        console.log({ notificationEnabled: newNotificationState })
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.textContainer} onPress={handleMedicinesClick}>
                <Text style={styles.thisText}>MEDICINE SCHEDULES</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.textContainer}>
                <Text style={styles.thisText}>NOTIFICATION</Text>
                <Switch
                    value={notificationEnabled}
                    onValueChange={handleNotificationToggle}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'palegreen',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    thisText: {
        fontSize: 20,
        color: 'seagreen',
        fontWeight: 'bold',
        fontFamily: 'Futura-CondensedMedium'
    },
    textContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginTop: 30,
        borderRadius: 15,
        width: 380,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});

export default SettingsScreen;
