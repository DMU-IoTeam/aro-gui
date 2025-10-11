import { Colors } from '@/constants/Colors';
import { Image, StyleSheet, Text, View } from 'react-native';

interface Props {
  name: string;
  loading: boolean;
}

const Profile = ({ name, loading }: Props) => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 60,
        marginBottom: 50,
      }}
    >
      <Image
        source={require('@/assets/images/senior-female.jpg')}
        style={{
          width: 160,
          height: 160,
          borderRadius: 9999,
          overflow: 'hidden',
        }}
        resizeMode="cover"
      />
      {loading ? (
        <Text
          style={{ fontSize: 40, fontWeight: 700, color: Colors.font.default }}
        >
          로딩 중...
        </Text>
      ) : (
        <Text
          style={{ fontSize: 40, fontWeight: 700, color: Colors.font.default }}
        >
          안녕하세요, {name}님!
        </Text>
      )}
      <Text style={{ fontSize: 26, color: Colors.font.gray }}>
        오늘도 건강한 하루 되세요
      </Text>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
