import SafeAreaContainer from "@/components/Common/SafeAreaContainer";
import Header from "@/components/index/Header";
import Menu from "@/components/index/Menu";
import Profile from "@/components/index/Profile";
import { getMe, User } from "@/api/user";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from "react-native";

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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
  }, [navigation]);

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
      <Header />
      <Profile name={userInfo?.name || ""} loading={loading} />
      <Menu />
    </SafeAreaContainer>
  );
}