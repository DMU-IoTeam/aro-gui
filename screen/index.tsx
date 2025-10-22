import SafeAreaContainer from "@/components/Common/SafeAreaContainer";
import Header from "@/components/index/Header";
import Menu from "@/components/index/Menu";
import Profile from "@/components/index/Profile";
import IdleEyesModal from "@/components/Common/IdleEyesModal";
import { getMe, User } from "@/api/user";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from "react-native";

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idleVisible, setIdleVisible] = useState(false);
  const navigation = useNavigation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const idleTimeoutMs = useMemo(() => 10_000, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIdleVisible(true);
    }, idleTimeoutMs);
  }, [clearTimer, idleTimeoutMs]);

  const handleInteraction = useCallback(() => {
    if (idleVisible) {
      setIdleVisible(false);
    }
    scheduleTimer();
  }, [idleVisible, scheduleTimer]);

  useEffect(() => {
    const checkAuth = async () => {
      // await AsyncStorage.clear();
      const token = await AsyncStorage.getItem('accessToken');
      console.log("Retrieved access token:", token);
      if (!token) {
        navigation.navigate('Resister' as never);
        return;
      }

      try {
        const data = await getMe();
        setUserInfo(data);
      } catch (err) {
        navigation.navigate('Resister' as never);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    scheduleTimer();
    return clearTimer;
  }, [clearTimer, navigation, scheduleTimer]);

  if (loading) {
    return (
      <SafeAreaContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer>
      <View
        style={{ flex: 1 }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleInteraction}
      >
        <Header />
        <Profile name={userInfo?.name || ""} loading={loading} />
        <Menu />
      </View>
      <IdleEyesModal
        visible={idleVisible}
        onRequestClose={handleInteraction}
      />
    </SafeAreaContainer>
  );
}
