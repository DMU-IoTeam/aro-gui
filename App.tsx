import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

// Import screens
import HomeScreen from './screen/index';
import ChatScreen from './screen/ChatScreen';
import GameScreen from './screen/GameScreen';
import GameResultScreen from './screen/GameResultScreen';
import HealthScreen from './screen/HealthScreen';
import MedicineScreen from './screen/MedicineScreen';
import ResisterScreen from './screen/ResisterScreen';
import ScheduleScreen from './screen/ScheduleScreen';

// Create the stack navigator
const Stack = createNativeStackNavigator();

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

function App() {
  useEffect(() => {
    requestUserPermission();
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token:', token);
      });

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);

      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      // Display a notification
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
      });
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Game" component={GameScreen} options={{headerShown: false}} />
        <Stack.Screen name="GameResult" component={GameResultScreen} options={{headerShown: false}} />
        <Stack.Screen name="Health" component={HealthScreen} options={{headerShown: false}} />
        <Stack.Screen name="Medicine" component={MedicineScreen} options={{headerShown: false}} />
        <Stack.Screen name="Resister" component={ResisterScreen} options={{title: '보호자 연동'}}/>
        <Stack.Screen name="Schedule" component={ScheduleScreen} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
