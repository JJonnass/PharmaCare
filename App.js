// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddScreen from './screens/AddScreen';
import MedicineListScreen from './screens/MedicineListScreen';
import EditScreen from './screens/EditScreen';

import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
const database = getDatabase(app);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'palegreen',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: 'seagreen',
          fontFamily: 'Futura-CondensedExtraBold'
        },
      }}>
      <Stack.Screen name="Settings Stack" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MEDICINE LIST" component={MedicineListScreen} />
      <Stack.Screen name="EDIT SCHEDULE" component={EditScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default function App() {

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'HOME') {
              iconName = focused
                ? 'home'
                : 'home-outline';
            } else if (route.name === 'SETTINGS') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'ADD') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'limegreen',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { paddingTop: 12 },
          headerTitleStyle: { fontWeight: 'bold', fontFamily: 'Futura-CondensedExtraBold', fontSize: 30, color: 'limegreen' }
        })}
      >
        <Tab.Screen name="HOME" component={HomeScreen} options={{ headerTitle: 'PharmaCare', }} />
        <Tab.Screen name="SETTINGS" component={SettingsStack} options={{ headerTitle: 'Settings', }} />
        <Tab.Screen name="ADD" component={AddScreen} options={{ headerTitle: 'ADD', }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}