import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// View가 받을 수 있는 모든 props를 받을 수 있도록 ViewProps를 확장합니다.
interface SafeAreaContainerProps extends ViewProps {
  children: React.ReactNode;
}

function SafeAreaContainer({ children, style, ...props }: SafeAreaContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    // 일반 View를 사용합니다.
    <View
      {...props} // style, ...etc
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style, // 외부에서 전달받은 style을 추가로 적용합니다.
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 화면 전체를 차지하도록 설정
  },
});

export default SafeAreaContainer;