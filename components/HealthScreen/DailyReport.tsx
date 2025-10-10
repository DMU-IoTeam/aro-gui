import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type menuItem = {
  imageUrl: ImageSourcePropType;
  title: string;
  contents: string;
};

type reportProps = {
  title: string;
  contents: menuItem[];
};

export default function DailyReport({ title, contents }: reportProps) {
  const [selections, setSelections] = useState<{
    [key: number]: string | null;
  }>({});

  const handleSelect = (index: number, selection: string) => {
    setSelections((prev) => {
      const newSelections = { ...prev };
      if (newSelections[index] === selection) {
        newSelections[index] = null;
      } else {
        newSelections[index] = selection;
      }
      return newSelections;
    });
  };

  return (
    <View style={{ paddingHorizontal: 40, marginTop: 20, gap: 20 }}>
      <Text
        style={{ color: Colors.font.default, fontSize: 28, fontWeight: "700" }}
      >
        {title}
      </Text>
      {contents.map((value, index) => {
        const selectedOption = selections[index];
        const isGoodActive = selectedOption === "좋음";
        const isBadActive = selectedOption === "나쁨";

        return (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#eee"
            }}
          >
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <Image source={value.imageUrl}></Image>
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <Text
                  style={{
                    color: Colors.font.default,
                    fontWeight: "700",
                    fontSize: 24,
                  }}
                >
                  {value.title}
                </Text>
                <Text
                  style={{
                    color: Colors.font.gray,
                    fontSize: 24,
                    flexWrap: "wrap",
                  }}
                >
                  {value.contents}
                </Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", gap: 20, marginTop: 10, flex1: 1 }}
            >
              <ReportButton
                onPress={() => handleSelect(index, "좋음")}
                imageUrl={
                  isGoodActive
                    ? require("assets/images/check-white.png")
                    : require("assets/images/check-green.png")
                }
                text="좋음"
                style={{
                  backgroundColor: isGoodActive ? "#10B981" : "#F3F4F6",
                  borderColor: "#10B981",
                  borderWidth: 1,
                }}
                textStyle={{ color: isGoodActive ? "white" : "#10B981" }}
              />
              <ReportButton
                onPress={() => handleSelect(index, "나쁨")}
                imageUrl={
                  isBadActive
                    ? require("assets/images/close.png")
                    : require("assets/images/close-red.png")
                }
                text="나쁨"
                style={{
                  backgroundColor: isBadActive ? "#EF4444" : "#F3F4F6",
                  borderColor: "#EF4444",
                  borderWidth: 1,
                }}
                textStyle={{ color: isBadActive ? "white" : "#EF4444" }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

type buttonProps = {
  imageUrl: ImageSourcePropType;
  text: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
};

const ReportButton = ({
  imageUrl,
  text,
  style,
  textStyle,
  onPress,
}: buttonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 10,
          paddingVertical: 20,
          minWidth: 100,
        },
        style,
      ]}
    >
      <Image source={imageUrl} />
      <Text style={[{ fontSize: 20 }, textStyle]}>{text}</Text>
    </Pressable>
  );
};
