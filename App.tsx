import React, {useEffect} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

// Import screens
import HomeScreen from './screen/index';
import ChatScreen from './screen/ChatScreen';
import GameScreen from './screen/GameScreen';
import GameResultScreen from './screen/GameResultScreen';
import HealthScreen from './screen/HealthScreen';
import MedicineScreen from './screen/MedicineScreen';
import ResisterScreen from './screen/ResisterScreen';
import ScheduleScreen from './screen/ScheduleScreen';

type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  Game: undefined;
  GameResult: undefined;
  Health: undefined;
  Medicine: undefined;
  Resister: undefined;
  Schedule: undefined;
};

const navigationRef = createNavigationContainerRef<RootStackParamList>();
let pendingRoute: keyof RootStackParamList | null = null;

const flushPendingRoute = () => {
  if (pendingRoute && navigationRef.isReady()) {
    navigationRef.navigate(pendingRoute);
    pendingRoute = null;
  }
};

const findRouteFromMessage = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): keyof RootStackParamList | null => {
  const notificationText = [
    remoteMessage.notification?.title ?? '',
    remoteMessage.notification?.body ?? '',
  ]
    .concat(Object.values(remoteMessage.data ?? {}))
    .join(' ');

  if (!notificationText.trim()) {
    return null;
  }

  if (notificationText.includes('일정')) {
    return 'Schedule';
  }

  if (notificationText.includes('약')) {
    return 'Medicine';
  }

  return null;
};

const handleNavigationForMessage = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const targetRoute = findRouteFromMessage(remoteMessage);

  if (!targetRoute) {
    return;
  }

  if (navigationRef.isReady()) {
    navigationRef.navigate(targetRoute);
  } else {
    pendingRoute = targetRoute;
  }
};

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

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

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
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

      handleNavigationForMessage(remoteMessage);
    });

    const unsubscribeOnNotificationOpened =
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background:', remoteMessage);
        handleNavigationForMessage(remoteMessage);
      });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          handleNavigationForMessage(remoteMessage);
          flushPendingRoute();
        }
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={flushPendingRoute}>
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
