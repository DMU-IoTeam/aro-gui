import { Colors } from "@/constants/Colors";
import { Image, ImageSourcePropType, Text, View } from "react-native";

type HeaderProps = {
  imageUrl: ImageSourcePropType;
  title: string;
  contents: string;
};

function CommonHeader({
  imageUrl,
  title,
  contents,
}: HeaderProps) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Image source={imageUrl} />
        <Text style={{ fontSize: 36, fontWeight: 700 }}>{title}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: Colors.font.gray,
            fontWeight: 700,
            fontSize: 24,
            backgroundColor: "white",
            padding: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "gray",
          }}
        >
          {contents}
        </Text>
      </View>
    </View>
  );
}

export default CommonHeader