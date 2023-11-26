import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';

import { update, ref, getDatabase } from 'firebase/database';
import { initializeApp } from "firebase/app";

import { Button, Icon } from '@rneui/themed';

import { schedulePushNotification } from '../push_notification/NotificationService';

const firebaseConfig = {
    apiKey: "AIzaSyDPUwnSw_YCPLjBKkvzuniKfYguI7_xI9M",
    authDomain: "pharmacare-e6abe.firebaseapp.com",
    databaseURL: "https://pharmacare-e6abe-default-rtdb.firebaseio.com",
    projectId: "pharmacare-e6abe",
    storageBucket: "pharmacare-e6abe.appspot.com",
    messagingSenderId: "235251869091",
    appId: "1:235251869091:web:843f4beefd3602d5142616",
    measurementId: "G-GH9MBVPHE4"
};

const app = initializeApp(firebaseConfig);
const databaseEditScreen = getDatabase(app);

export default function EditScreen({ navigation, route }) {
    const { item = {} } = route.params;
    const [medicineName, setMedicineName] = useState(item.medicineName);
    const [amount, setAmount] = useState(item.amount);
    const [startDate, setStartDate] = useState(new Date());
    const [duration, setDuration] = useState(item.duration);
    const [medicineUnits, setMedicineUnits] = useState(item.medicineUnits);
    const [frequency, setFrequency] = useState(item.frequency);
    const [selectedTime, setSelectedTime] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const showTimePicker = () => {
        setTimePickerVisible(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisible(false);
    };

    const handleDateChange = (date) => {
        if (date !== undefined) {
            setStartDate(date);
            hideDatePicker();
        }
    };

    const handleTimeChange = (time) => {
        if (time !== undefined) {
            const selectedDateTime = new Date(startDate);
            selectedDateTime.setHours(time.getHours());
            selectedDateTime.setMinutes(time.getMinutes());
            setSelectedTime(selectedDateTime);
            hideTimePicker();
        }
    };

    const handleSave = () => {
        if (medicineName.trim() === '') {
            setErrorMessage('Please enter a medicine name.');
            return;
        }

        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedSelectedTime = selectedTime ? selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null;

        const medicinesRef = ref(databaseEditScreen, `medicines/${item.id}`);

        const updatedData = {
            medicineName, amount,
            startDate: formattedStartDate,
            duration, medicineUnits, frequency,
            selectedTime: formattedSelectedTime
        };

        update(medicinesRef, updatedData)
            .then(() => {
                // Update successful
                console.log('Data updated successfully');
                // Optionally, you can navigate back to the previous screen or perform any other actions
            })
            .catch((error) => {
                // Handle the error
                console.error('Error updating data:', error);
            });

        schedulePushNotification(
            medicineName,
            amount,
            medicineUnits,
            formattedStartDate,
            duration,
            frequency,
            formattedSelectedTime
        );

        setMedicineName('');
        setAmount('');
        setStartDate(new Date());
        setDuration('');
        setMedicineUnits('');
        setFrequency('Once a day');
        setSelectedTime(null);

        setErrorMessage('');

        navigation.navigate('HOME');

    };

    const handleCancel = () => {
        setMedicineName('');
        setAmount('');
        setStartDate(new Date());
        setDuration('');
        setMedicineUnits('');
        setFrequency('Once a day');
        setSelectedTime(null);

        setErrorMessage('');

        navigation.navigate('MEDICINE LIST');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Medicine </Text>
            <TextInput
                style={styles.input}
                value={medicineName}
                returnKeyType="done"
                onChangeText={(text) => setMedicineName(text)}
                placeholder='Type your medicine...'
                placeholderTextColor='lightgray'
            />
            <Text>{errorMessage}</Text>
            <Text style={styles.text}>Amount </Text>
            <TextInput
                style={styles.input}
                value={amount}
                keyboardType="numeric"
                returnKeyType="done"
                onChangeText={(text) => setAmount(text)}
            />
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.text}>Medicine Units </Text>
                <RNPickerSelect
                    value={medicineUnits}
                    onValueChange={(value) => setMedicineUnits(value)}
                    items={[
                        { label: 'pill/s', value: 'pill/s' },
                        { label: 'ml', value: 'ml' },
                        { label: 'gr', value: 'gr' },
                        { label: 'mg', value: 'mg' },
                        { label: 'drops', value: 'drops' },
                    ]}
                    style={pickerSelectStyles}
                />
            </View>
            <Text style={styles.text}>Starting Date </Text>
            <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                <Text style={{ fontSize: 18 }}>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                onConfirm={(date) => {
                    handleDateChange(date);
                }}
                onCancel={hideDatePicker}
                headerTextConfirm="Confirm"
                headerTextCancel="Cancel"
            />
            <Text style={styles.text}>Duration (in days)</Text>
            <TextInput
                style={styles.input}
                value={duration}
                keyboardType="numeric"
                returnKeyType="done"
                onChangeText={(text) => setDuration(text)}
            />
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.text}>Frequency: </Text>
                <RNPickerSelect
                    value={frequency}
                    onValueChange={(value) => setFrequency(value)}
                    items={[
                        { label: 'Once a day', value: 'Once a day' },
                        { label: 'Twice a day', value: 'Twice a day' },
                        { label: 'Thrice a day', value: 'Thrice a day' },
                    ]}
                    style={pickerSelectStyles}
                />
            </View>
            <Text style={styles.text}>Notification Time </Text>
            <TouchableOpacity style={styles.input} onPress={showTimePicker}>
                <Text style={{ fontSize: 18, }}>
                    {selectedTime
                        ? selectedTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                        : 'Select time...'}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal
                value={selectedTime}
                isVisible={timePickerVisible}
                mode="time"
                onConfirm={(time) => {
                    handleTimeChange(time);
                }}
                onCancel={hideTimePicker}
                headerTextConfirm="Confirm"
                headerTextCancel="Cancel"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 40 }}>
                <Button raised radius={"sm"} onPress={handleSave} style={{ width: 120 }}>
                    SAVE
                    <Icon name="save" color="white" />
                </Button>
                <Button raised color="error" onPress={handleCancel} style={{ width: 120 }}>
                    CANCEL
                    <Icon name="cancel" color="white" />
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'palegreen',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    text: {
        fontSize: 20,
        color: 'seagreen',
        fontFamily: 'Futura-CondensedMedium',
        fontWeight: 'bold',
        marginTop: 10
    },
    input: {
        fontSize: 18,
        width: 300,
        marginBottom: 10,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 10,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 18,
        width: 300,
        borderColor: 'gray',
        marginBottom: 10,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 10,

    },
    inputAndroid: {
        fontSize: 18,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 8,
    },
});
