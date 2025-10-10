import React, { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

const Header = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // 1초마다 현재 시간을 업데이트하기 위한 타이머 설정
    const timerId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    // 컴포넌트가 언마운트될 때 타이머를 정리(clean-up)합니다.
    // 이렇게 하지 않으면 메모리 누수가 발생할 수 있습니다.
    return () => clearInterval(timerId);
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 마운트될 때 한 번만 실행되도록 설정

  // 날짜 포맷 설정 (예: 2025년 9월 11일 목요일)
  const formattedDate = currentDate.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 시간 포맷 설정 (예: 오후 8:46:26)
  const formattedTime = currentDate.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 오전/오후를 표시하려면 true, 24시간 표기는 false
  });

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>

      <View style={styles.imageWrapper}>
        <Image source={require("@/assets/images/notification.png")} />
        <Image source={require("@/assets/images/setting.png")} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    // iOS의 그림자 효과
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
      },
      // Android의 입체감 효과
      android: {
        elevation: 4,
      },
    }),

    // 레이아웃
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#121212",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: "#555555",
  },

  imageWrapper: {
    flexDirection: "row",
    gap: 8,
  }
});

export default Header;
