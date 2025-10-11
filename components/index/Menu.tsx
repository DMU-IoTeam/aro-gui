import React from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/Colors";

const MENU_ITEMS = [
  {
    imageUrl: require("@/assets/images/game.png"),
    title: "게임하기",
    contents: "재미있는 두뇌게임",
    path: "Game",
  },
  {
    imageUrl: require("@/assets/images/health.png"),
    title: "건강확인",
    contents: "오늘의 건강을 체크해요",
    path: "Health",
  },
  {
    imageUrl: require("@/assets/images/medicine.png"),
    title: "복약확인",
    contents: "약 복용 시간 알림",
    path: "Medicine",
  },
  {
    imageUrl: require("@/assets/images/notification.png"),
    title: "일정확인",
    contents: "약 복용 시간 알림",
    path: "Schedule",
  },
];

const Menu = () => {
  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item) => (
        <MenuItem
          key={item.path}
          imageUrl={item.imageUrl}
          title={item.title}
          contents={item.contents}
          path={item.path}
        />
      ))}
    </View>
  );
};

type MenuItemProps = {
  imageUrl: ImageSourcePropType;
  title: string;
  contents: string;
  path: string;
};

const MenuItem = ({ imageUrl, title, contents, path }: MenuItemProps) => {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.navigate(path as never)}
      style={styles.card}
    >
      <View style={styles.iconWrapper}>
        <Image source={imageUrl} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{contents}</Text>
    </Pressable>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    gap: 16,
    flexWrap: "wrap",
  },
  card: {
    width: "48%",
    minWidth: 0,
    backgroundColor: "white",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 42,
    height: 42,
  },
  title: {
    color: Colors.font.default,
    fontWeight: "700",
    fontSize: 22,
  },
  subtitle: {
    color: Colors.font.gray,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 18,
  },
});
