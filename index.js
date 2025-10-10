/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {getMessaging} from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native'

// background에서 적용
getMessaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);

  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? '제목 없음',
    body: remoteMessage.notification?.body ?? '내용 없음',
    android: {
      channelId: 'default',
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
