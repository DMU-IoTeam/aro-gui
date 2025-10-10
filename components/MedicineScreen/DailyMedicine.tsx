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
  Alert,
} from "react-native";
import { recordMedicationStatus } from "@/api/medication";

type menuItem = {
  imageUrl: ImageSourcePropType;
  title: string;
  contents: string;
  scheduleId?: number;
  itemId?: number;
};

type reportProps = {
  title: string;
  contents: menuItem[];
};

export default function DailyMedicine({ title, contents }: reportProps) {
  const [selections, setSelections] = useState<{
    [key: number]: string | null;
  }>({});

  const handleSelect = async (index: number, selection: string) => {
    const item = contents[index];
    
    // UI 상태 업데이트
    setSelections((prev) => {
      const newSelections = { ...prev };
      if (newSelections[index] === selection) {
        newSelections[index] = null;
      } else {
        newSelections[index] = selection;
      }
      return newSelections;
    });

    // API에 복약 상태 저장 (scheduleId와 itemId가 있는 경우에만)
    if (item.scheduleId && item.itemId) {
      try {
        const status = selection === "먹음" ? "taken" : "not_taken";
        const timestamp = new Date().toISOString();
        
        await recordMedicationStatus({
          scheduleId: item.scheduleId,
          itemId: item.itemId,
          status: status,
          timestamp: timestamp,
        });
        
        console.log(`복약 상태가 저장되었습니다: ${item.title} - ${selection}`);
      } catch (error) {
        console.error('복약 상태 저장 실패:', error);
        Alert.alert(
          '저장 실패',
          '복약 상태를 저장하는데 실패했습니다. 다시 시도해주세요.',
          [{ text: '확인' }]
        );
        
        // 저장 실패 시 UI 상태 되돌리기
        setSelections((prev) => {
          const newSelections = { ...prev };
          newSelections[index] = null;
          return newSelections;
        });
      }
    }
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
        const isGoodActive = selectedOption === "먹음";
        const isBadActive = selectedOption === "안먹음";

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
                onPress={() => handleSelect(index, "먹음")}
                imageUrl={
                  isGoodActive
                    ? require("assets/images/check-white.png")
                    : require("assets/images/check-green.png")
                }
                text="먹음"
                style={{
                  backgroundColor: isGoodActive ? "#10B981" : "#F3F4F6",
                  borderColor: "#10B981",
                  borderWidth: 1,
                }}
                textStyle={{ color: isGoodActive ? "white" : "#10B981" }}
              />
              <ReportButton
                onPress={() => handleSelect(index, "안먹음")}
                imageUrl={
                  isBadActive
                    ? require("assets/images/close.png")
                    : require("assets/images/close-red.png")
                }
                text="안먹음"
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
