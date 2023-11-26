import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { ref, onValue, remove, getDatabase } from 'firebase/database';
import { initializeApp } from "firebase/app";

import { useNavigation } from '@react-navigation/native';

import { Button, Icon } from '@rneui/themed';

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
const databaseMedicineListScreen = getDatabase(app);

const MedicineListScreen = () => {
    const [medicines, setMedicines] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const medicinesRef = ref(databaseMedicineListScreen, 'medicines');

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
                setMedicines(medicineItems);
            } else {
                setMedicines([]);
            }
        });
    }, []);

    const handleDelete = (id) => {
        const medicinesRef = ref(databaseMedicineListScreen, `medicines/${id}`);
        remove(medicinesRef).catch((error) => {
            console.error("Error deleting medicine from the database:", error);
        });
    };
    const handleEdit = (item) => {
        if (item) {
            navigation.navigate('EDIT SCHEDULE', { item });
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.item}>{item.medicineName}</Text>
            <View style={{ flexDirection: 'row' }}>
                <Button raised radius={"sm"} onPress={() => handleEdit(item)}>
                    <Icon name="edit" color="white" />
                </Button>
                <Button raised color="error" radius={"sm"} onPress={() => handleDelete(item.id)}>
                    <Icon name="cancel" color="white" />
                </Button>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <FlatList
                data={medicines}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'palegreen',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: 'white',
        borderBottomWidth: 2,
        borderBottomColor: 'limegreen',
        marginTop: 15,
        borderRadius: 10,
        width: 350
    },
    item: {
        fontSize: 20,
        fontFamily: 'Futura-CondensedMedium',
        fontWeight: 'bold',
        color: 'seagreen'

    },
    deleteButton: {
        color: 'red',
        marginLeft: 10,
    },
});

export default MedicineListScreen;
