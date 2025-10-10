import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
} from "react-native";

const menueData = [
  {
    imageUrl: require("@/assets/images/chat.png"),
    title: "대화하기",
    contents: "ARO와 편하게 대화해요",
    path: "Chat",
  },
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
];

const Menu = () => {
  return (
    <FlatList
      data={menueData}
      renderItem={({ item }) => (
        <MenuItem
          imageUrl={item.imageUrl}
          title={item.title}
          contents={item.contents}
          path={item.path}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: "center",
        gap: 16,
        marginBottom: 16,
      }}
    />
  );
};

type MenueItemProps = {
  imageUrl: ImageSourcePropType;
  title: string;
  contents: string;
  path: string;
};

const MenuItem = ({ imageUrl, title, contents, path }: MenueItemProps) => {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.navigate(path as never)}
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 20,
        width: "40%",
        aspectRatio: 1,
      }}
    >
      <Image source={imageUrl} />
      <Text
        style={{ color: Colors.font.default, fontWeight: "700", fontSize: 32 }}
      >
        {title}
      </Text>
      <Text style={{ color: Colors.font.gray, fontSize: 16 }}>{contents}</Text>
    </Pressable>
  );
};

export default Menu;
