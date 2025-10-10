import { setAccessToken } from "@/api";
import { loginSenior, registerFcmToken } from "@/api/user";
import SafeAreaContainer from "@/components/Common/SafeAreaContainer";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import messaging from "@react-native-firebase/messaging";

export default function ResisterScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await loginSenior(email);
      await setAccessToken(response.accessToken);

      // Register FCM Token
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log("Registering FCM token:", fcmToken);
          await registerFcmToken(fcmToken);
        }
      } catch (fcmError) {
        console.error("Failed to register FCM token:", fcmError);
      }

      navigation.reset({ index: 0, routes: [{ name: 'Home' as never }] });
    } catch (err) {
      setError("로그인에 실패했습니다. 이메일을 확인해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaContainer>
      <View
        style={{
          flex: 1,
          padding: 20,
        }}
      >
        <View
          style={{
            marginBottom: 60,
            flexDirection: "row",
            gap: 20,
            justifyContent: "center",
          }}
        >
          <Image source={require("@/assets/images/guardian.png")}></Image>
          <View>
            <Text style={{ fontSize: 32, fontWeight: "bold", marginTop: 10 }}>
              보호자 등록
            </Text>
            <Text style={{ fontSize: 22, color: "#6B7280" }}>
              Aro를 관리할 보호자를 등록해주세요.
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <View
            style={{
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 28 }}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="보호자의 이메일을 입력해주세요."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Pressable
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white", fontSize: 24 }}>입력</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 4,
    fontSize: 22,
  },
  button: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 100,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
