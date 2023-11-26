import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

import { Icon } from '@rneui/themed';

import { ref, onValue, remove, getDatabase } from 'firebase/database';
import { initializeApp } from "firebase/app";

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
const databaseHomeScreen = getDatabase(app);

export default function HomeScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [medicationData, setMedicationData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const renderCalendar = () => {
        const startOfCurrentWeek = startOfWeek(currentDate);

        const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = addDays(startOfCurrentWeek, i);
            const dayNumber = format(day, 'd');
            const isCurrentDay = isSameDay(day, currentDate);
            days.push(
                <TouchableOpacity key={i} onPress={() => onDatePress(day)}
                    style={[
                        styles.dayCell,
                        isCurrentDay && styles.currentDayCell,
                        isSameDay(day, selectedDate) && { backgroundColor: 'limegreen' },
                    ]}
                >
                    <Text style={[isSameDay(day, selectedDate) && { color: 'white' }]}>
                        {dayNumber}
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.calendar}>
                <View style={styles.daysOfWeek}>
                    {daysOfWeek.map((day, index) => (
                        <Text key={index} style={styles.dayOfWeekCell}>
                            {day}
                        </Text>
                    ))}
                </View>
                <View style={styles.days}>{days}</View>
                <Text style={styles.monthYear}>
                    {format(startOfCurrentWeek, 'MMMM yyyy')}
                </Text>
            </View>
        );
    };

    const filterMedicationData = (selectedDate, allData) => {
        const filteredData = allData.filter((item) => {
            const startDate = new Date(item.startDate);
            const endDate = addDays(startDate, item.duration - 1);
            return isSameDay(selectedDate, startDate) || (selectedDate >= startDate && selectedDate <= endDate);
        });
        return filteredData;
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={{ fontSize: 25, fontFamily: 'Futura-CondensedMedium', color: 'seagreen' }}>
                {`${item.medicineName}  ${item.amount} ${item.medicineUnits} - ${item.frequency} - ${item.selectedTime}`}
            </Text>
        </View>
    );

    const renderSchedule = () => {
        if (medicationData.length === 0) {
            return (
                <View style={{ paddingTop: 150 }}>
                    <Icon name="today" color="seagreen" size={70} />
                    <Text style={styles.noScheduleText}>No scheduled events...</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={medicationData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        );
    };

    const onDatePress = (selectedDate) => {
        setSelectedDate(selectedDate);

    };

    useEffect(() => {
        const medicinesRef = ref(databaseHomeScreen, 'medicines');

        onValue(medicinesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const medicineItems = Object.keys(data).map((key) => ({
                    id: key,
                    medicineName: data[key].medicineName,
                    amount: data[key].amount,
                    startDate: data[key].startDate,
                    duration: data[key].duration,
                    medicineUnits: data[key].medicineUnits,
                    frequency: data[key].frequency,
                    selectedTime: data[key].selectedTime,
                }));
                const filteredData = filterMedicationData(selectedDate, medicineItems);

                setMedicationData(filteredData);
            } else {
                setMedicationData([]);
            }
        });
    }, [selectedDate]);

    useFocusEffect(
        React.useCallback(() => {
            setSelectedDate(new Date());
        }, [])
    );

    return (
        <>
            <View style={styles.container}>
                {renderCalendar()}
                {renderSchedule()}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'palegreen'
    },
    calendar: {
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 4,
        marginTop: 20,
        padding: 10,
    },
    dayCell: {
        borderRadius: 50,
        padding: 18,
        textAlign: 'center',
    },
    monthYear: {
        textAlign: 'center',
        fontWeight: 'bold',
        padding: 10,
        color: 'dimgray'
    },
    daysOfWeek: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    dayOfWeekCell: {
        flex: 1,
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    days: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemContainer: {
        alignItems: 'center',
        padding: 20,
        marginTop: 15,
        borderRadius: 15,
        borderBottomWidth: 3,
        borderBottomColor: 'limegreen',
        backgroundColor: 'white',
        width: 385,
    },
    noScheduleText: {
        alignItems: 'center',
        marginTop: 20,
        fontSize: 30,
        color: 'seagreen',
        fontFamily: 'Futura-CondensedMedium'
    },

});
